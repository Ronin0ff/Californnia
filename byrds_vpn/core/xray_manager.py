"""Управление жизненным циклом внешнего процесса ``xray``."""

from __future__ import annotations

import json
import logging
import os
import shutil
import subprocess
import sys
import tempfile
import threading
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)

LogCallback = Callable[[str, str], None]  # (level, message)


def _frozen_base_dir() -> Path | None:
    """Путь к ``_MEIPASS``, если приложение запущено из PyInstaller-бандла."""
    meipass = getattr(sys, "_MEIPASS", None)
    return Path(meipass) if meipass else None


def locate_xray_binary() -> Path | None:
    """Найти бинарник xray: в vendor/, _MEIPASS/ или в $PATH."""
    exe = "xray.exe" if sys.platform == "win32" else "xray"
    candidates: list[Path] = []
    frozen = _frozen_base_dir()
    if frozen is not None:
        candidates.append(frozen / "vendor" / exe)
        candidates.append(frozen / exe)
    repo_root = Path(__file__).resolve().parents[2]
    candidates.append(repo_root / "vendor" / exe)

    path_entry = shutil.which(exe)
    if path_entry:
        candidates.append(Path(path_entry))

    for c in candidates:
        try:
            if c.is_file() and (sys.platform == "win32" or os.access(c, os.X_OK)):
                return c
        except OSError:
            continue
    return None


def geo_assets_dir() -> Path | None:
    """Каталог c ``geoip.dat`` / ``geosite.dat`` (для ``XRAY_LOCATION_ASSET``)."""
    frozen = _frozen_base_dir()
    if frozen is not None and (frozen / "vendor" / "geoip.dat").is_file():
        return frozen / "vendor"
    repo_vendor = Path(__file__).resolve().parents[2] / "vendor"
    if (repo_vendor / "geoip.dat").is_file():
        return repo_vendor
    return None


@dataclass(slots=True)
class XrayStatus:
    running: bool
    pid: int | None
    binary: Path | None
    last_error: str = ""


class XrayManager:
    """Старт / стоп / restart процесса ``xray run -c <config>``."""

    def __init__(self, log_sink: LogCallback | None = None) -> None:
        self._log_sink: LogCallback = log_sink or (lambda _l, _m: None)
        self._proc: subprocess.Popen[str] | None = None
        self._config_path: Path | None = None
        self._tmp_dir: Path | None = None
        self._reader_thread: threading.Thread | None = None
        self._stop_reader = threading.Event()
        self._lock = threading.RLock()
        self.last_error: str = ""

    # ---------- public API ----------

    def status(self) -> XrayStatus:
        with self._lock:
            binary = locate_xray_binary()
            running = self._proc is not None and self._proc.poll() is None
            pid = self._proc.pid if running and self._proc is not None else None
            return XrayStatus(
                running=running,
                pid=pid,
                binary=binary,
                last_error=self.last_error,
            )

    def start(self, config: dict[str, Any]) -> None:
        """Запустить xray с заданным конфигом (перезапуская при необходимости)."""
        with self._lock:
            self.stop()
            binary = locate_xray_binary()
            if binary is None:
                self.last_error = "xray не найден (ожидался vendor/xray[.exe])"
                self._log_sink("ERROR", self.last_error)
                raise FileNotFoundError(self.last_error)

            self._tmp_dir = Path(tempfile.mkdtemp(prefix="byrds-vpn-"))
            self._config_path = self._tmp_dir / "config.json"
            self._config_path.write_text(
                json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            self._log_sink("INFO", f"записан конфиг → {self._config_path}")

            env = os.environ.copy()
            assets = geo_assets_dir()
            if assets is not None:
                env["XRAY_LOCATION_ASSET"] = str(assets)

            cmd = [str(binary), "run", "-c", str(self._config_path)]
            self._log_sink("INFO", f"запуск {' '.join(cmd)}")
            try:
                self._proc = subprocess.Popen(  # noqa: S603 — доверенный локальный бинарник
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                    env=env,
                    creationflags=(
                        subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0  # type: ignore[attr-defined]
                    ),
                )
            except OSError as exc:
                self.last_error = f"не удалось запустить xray: {exc}"
                self._log_sink("ERROR", self.last_error)
                raise

            self._stop_reader.clear()
            self._reader_thread = threading.Thread(
                target=self._pump_output, name="xray-log", daemon=True
            )
            self._reader_thread.start()
            self._log_sink("READY", f"xray запущен (pid={self._proc.pid})")

    def stop(self, timeout: float = 5.0) -> None:
        with self._lock:
            if self._proc is None:
                return
            proc = self._proc
            try:
                if proc.poll() is None:
                    proc.terminate()
                    try:
                        proc.wait(timeout=timeout)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                        try:
                            proc.wait(timeout=2.0)
                        except subprocess.TimeoutExpired:
                            pass
            finally:
                self._stop_reader.set()
                if self._reader_thread is not None:
                    self._reader_thread.join(timeout=1.0)
                self._reader_thread = None
                self._proc = None
                # Удаляем temp-директорию с конфигом.
                if self._tmp_dir is not None:
                    try:
                        shutil.rmtree(self._tmp_dir, ignore_errors=True)
                    except OSError:
                        pass
                self._tmp_dir = None
                self._config_path = None
                self._log_sink("INFO", "xray остановлен")

    def restart(self, config: dict[str, Any]) -> None:
        self.stop()
        self.start(config)

    # ---------- internal ----------

    def _pump_output(self) -> None:
        proc = self._proc
        if proc is None or proc.stdout is None:
            return
        try:
            for raw_line in iter(proc.stdout.readline, ""):
                if self._stop_reader.is_set():
                    break
                line = raw_line.rstrip("\n").rstrip("\r")
                if not line:
                    continue
                level = self._guess_level(line)
                self._log_sink(level, line)
        except (OSError, ValueError):
            return

    @staticmethod
    def _guess_level(line: str) -> str:
        lower = line.lower()
        if "error" in lower or "failed" in lower:
            return "ERROR"
        if "warn" in lower:
            return "WARN"
        if "ready" in lower or "started" in lower:
            return "READY"
        return "INFO"
