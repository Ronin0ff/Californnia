"""Контроллер приложения: связывает UI с ядром (storage + xray + settings)."""

from __future__ import annotations

import logging
from collections.abc import Callable

from PySide6.QtCore import QObject, QThread, QTimer, Signal

from byrds_vpn.core import autostart, kill_switch, system_proxy
from byrds_vpn.core.config_builder import build_xray_config
from byrds_vpn.core.logs import LogBuffer
from byrds_vpn.core.models import Profile, Settings
from byrds_vpn.core.ping import ping_profile
from byrds_vpn.core.speedtest import measure_download_mbps
from byrds_vpn.core.stats import sample_traffic
from byrds_vpn.core.storage import Storage
from byrds_vpn.core.xray_manager import XrayManager

log = logging.getLogger(__name__)


class _BackgroundWorker(QThread):
    done = Signal(object)

    def __init__(self, fn: Callable[[], object]) -> None:
        super().__init__()
        self._fn = fn

    def run(self) -> None:
        try:
            result = self._fn()
        except Exception as exc:  # noqa: BLE001 — отдаём наверх через сигнал
            result = exc
        self.done.emit(result)


class AppController(QObject):
    """Единый фасад для UI: хранит состояние и оркестрирует I/O-задачи."""

    state_changed = Signal(str)                     # 'disconnected' | 'connecting' | 'connected' | 'error'
    profiles_changed = Signal()
    settings_changed = Signal()
    log_added = Signal(object)                      # LogEntry
    metrics_sampled = Signal(float, float, int)     # down_mbps, up_mbps, ping_ms
    error_raised = Signal(str)
    ping_updated = Signal(str, object)              # profile_id, ms|None

    def __init__(self, storage: Storage | None = None) -> None:
        super().__init__()
        self.storage = storage or Storage()
        self.settings: Settings = self.storage.load_settings()
        self.profiles: list[Profile] = self.storage.load_profiles()
        self.log = LogBuffer()
        self.log.subscribe(lambda entry: self.log_added.emit(entry))

        self.xray = XrayManager(log_sink=self._log_sink)
        self._state = "disconnected"
        self._active_profile: Profile | None = None

        self._workers: list[_BackgroundWorker] = []
        self._metrics_timer = QTimer(self)
        self._metrics_timer.setInterval(1000)
        self._metrics_timer.timeout.connect(self._sample_metrics)

        if self.settings.active_profile_id:
            self._active_profile = next(
                (p for p in self.profiles if p.id == self.settings.active_profile_id),
                None,
            )

    # ---------- log plumbing ----------

    def _log_sink(self, level: str, message: str) -> None:
        lvl = level.upper() if level.upper() in {"INFO", "WARN", "OK", "READY", "ERROR", "DEBUG"} else "INFO"
        self.log.add(lvl, message)  # type: ignore[arg-type]

    # ---------- state ----------

    @property
    def state(self) -> str:
        return self._state

    def _set_state(self, s: str) -> None:
        if self._state == s:
            return
        self._state = s
        self.state_changed.emit(s)

    @property
    def active_profile(self) -> Profile | None:
        return self._active_profile

    def set_active_profile(self, profile_id: str) -> None:
        self._active_profile = next((p for p in self.profiles if p.id == profile_id), None)
        self.settings.active_profile_id = profile_id if self._active_profile else ""
        self.save_settings()

    # ---------- profiles ----------

    def add_profiles(self, profiles: list[Profile], *, group: str = "") -> int:
        """Добавить профили, пропуская дубликаты. Возвращает число добавленных."""
        seen = {p.identity_key() for p in self.profiles}
        added = 0
        for p in profiles:
            key = p.identity_key()
            if key in seen:
                continue
            if group:
                p.group = group
            self.profiles.append(p)
            seen.add(key)
            added += 1
        if added:
            self.save_profiles()
            self.profiles_changed.emit()
        return added

    def remove_profile(self, profile_id: str) -> None:
        self.profiles = [p for p in self.profiles if p.id != profile_id]
        if self.settings.active_profile_id == profile_id:
            self.settings.active_profile_id = ""
            self._active_profile = None
        self.save_profiles()
        self.save_settings()
        self.profiles_changed.emit()

    def clear_profiles(self) -> None:
        self.profiles = []
        self.settings.active_profile_id = ""
        self._active_profile = None
        self.save_profiles()
        self.save_settings()
        self.profiles_changed.emit()

    def toggle_favorite(self, profile_id: str) -> None:
        for p in self.profiles:
            if p.id == profile_id:
                p.favorite = not p.favorite
                self.save_profiles()
                self.profiles_changed.emit()
                return

    def save_profiles(self) -> None:
        self.storage.save_profiles(self.profiles)

    def save_settings(self) -> None:
        self.storage.save_settings(self.settings)
        self.settings_changed.emit()

    # ---------- connection ----------

    def connect(self) -> None:
        if self._state in {"connecting", "connected"}:
            return
        if self._active_profile is None:
            self.error_raised.emit("error.no_profile")
            self._log_sink("ERROR", "нет активного сервера")
            return
        self._set_state("connecting")
        self._log_sink(
            "INFO",
            f"подготовка подключения к {self._active_profile.short_label()}",
        )
        config = build_xray_config(self._active_profile, self.settings)

        def _start() -> None:
            try:
                self.xray.start(config)
            except FileNotFoundError:
                self.error_raised.emit("error.xray_missing")
                self._set_state("error")
                return
            except OSError as exc:
                self._log_sink("ERROR", f"xray не запустился: {exc}")
                self._set_state("error")
                return

            if self.settings.system_proxy_on_connect and system_proxy.is_supported():
                system_proxy.set_windows_proxy("127.0.0.1", self.settings.http_port)
            if self.settings.enable_kill_switch and kill_switch.is_supported():
                kill_switch.enable()
            self._set_state("connected")
            self._metrics_timer.start()

        QTimer.singleShot(0, _start)

    def disconnect(self) -> None:
        if self._state == "disconnected":
            return
        self._metrics_timer.stop()
        try:
            self.xray.stop()
        finally:
            if system_proxy.is_supported():
                system_proxy.clear_windows_proxy()
            if kill_switch.is_supported():
                kill_switch.disable()
            self._set_state("disconnected")

    def toggle(self) -> None:
        if self._state in {"connecting", "connected"}:
            self.disconnect()
        else:
            self.connect()

    # ---------- metrics ----------

    def _sample_metrics(self) -> None:
        prof = self._active_profile
        if prof is None:
            return
        # Сэмпл трафика (за последнюю секунду — Xray reset-режим).
        traffic = sample_traffic(self.settings.api_port, reset=True)
        # Байт/с → Мбит/с. Интервал таймера = 1 с.
        down_mbps = (traffic.downlink_bytes * 8) / 1_000_000
        up_mbps = (traffic.uplink_bytes * 8) / 1_000_000
        # Пинг — TCP до удалённого узла (не через xray, но показатель качества канала).
        ms = ping_profile(prof, timeout=2.0) or 0
        self.metrics_sampled.emit(round(down_mbps, 2), round(up_mbps, 2), ms)

    # ---------- async tasks ----------

    def run_async(self, fn: Callable[[], object], on_done: Callable[[object], None]) -> None:
        worker = _BackgroundWorker(fn)
        worker.done.connect(on_done)
        worker.finished.connect(lambda w=worker: self._workers.remove(w))
        self._workers.append(worker)
        worker.start()

    def measure_speed(self, on_done: Callable[[float], None]) -> None:
        proxy = f"socks5://127.0.0.1:{self.settings.socks_port}"

        def _task() -> float:
            return measure_download_mbps(proxy)

        def _cb(result: object) -> None:
            if isinstance(result, Exception):
                log.error("ошибка speedtest: %s", result)
                on_done(0.0)
                return
            on_done(float(result))

        self.run_async(_task, _cb)

    def update_ping(self, profile_id: str, ms: int | None) -> None:
        for p in self.profiles:
            if p.id == profile_id:
                p.last_ping_ms = ms
                self.save_profiles()
                self.ping_updated.emit(profile_id, ms)
                return

    # ---------- system settings ----------

    def apply_system_settings(self) -> None:
        if autostart.is_supported():
            autostart.set_autostart(self.settings.autostart)

    def shutdown(self) -> None:
        try:
            self.disconnect()
        except Exception:  # noqa: BLE001 — best-effort
            log.exception("ошибка при disconnect()")
        for w in list(self._workers):
            w.quit()
            w.wait(500)
