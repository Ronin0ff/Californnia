"""Надёжное хранилище настроек и профилей на диске (JSON, атомарные записи)."""

from __future__ import annotations

import json
import logging
import os
import sys
import tempfile
from pathlib import Path
from typing import Any

from byrds_vpn.core.models import Profile, Settings, Subscription

log = logging.getLogger(__name__)


def app_data_dir() -> Path:
    """Каталог пользовательских данных (кросс-платформенный)."""
    if sys.platform == "win32":
        base = os.environ.get("APPDATA") or str(Path.home() / "AppData" / "Roaming")
        return Path(base) / "byRDS-VPN"
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "byRDS-VPN"
    xdg = os.environ.get("XDG_CONFIG_HOME") or str(Path.home() / ".config")
    return Path(xdg) / "byRDS-VPN"


class Storage:
    """JSON-хранилище настроек / профилей / подписок."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = Path(root) if root else app_data_dir()
        self.root.mkdir(parents=True, exist_ok=True)
        self.settings_path = self.root / "settings.json"
        self.profiles_path = self.root / "profiles.json"
        self.subscriptions_path = self.root / "subscriptions.json"
        self.logs_dir = self.root / "logs"
        self.logs_dir.mkdir(parents=True, exist_ok=True)

    # ---------- settings ----------

    def load_settings(self) -> Settings:
        if not self.settings_path.exists():
            return Settings()
        try:
            data = json.loads(self.settings_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            log.warning("settings.json не читается (%s), используем значения по умолчанию", exc)
            return Settings()
        try:
            return Settings.from_dict(data)
        except TypeError as exc:
            log.warning("settings.json сломан (%s), используем значения по умолчанию", exc)
            return Settings()

    def save_settings(self, settings: Settings) -> None:
        self._atomic_write(self.settings_path, settings.to_dict())

    # ---------- profiles ----------

    def load_profiles(self) -> list[Profile]:
        if not self.profiles_path.exists():
            return []
        try:
            raw = json.loads(self.profiles_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            log.warning("profiles.json не читается (%s), начинаем с пустого списка", exc)
            return []
        out: list[Profile] = []
        for item in raw:
            try:
                out.append(Profile.from_dict(item))
            except (TypeError, KeyError, ValueError) as exc:
                log.warning("пропущен повреждённый профиль %r: %s", item.get("id"), exc)
        return out

    def save_profiles(self, profiles: list[Profile]) -> None:
        self._atomic_write(
            self.profiles_path,
            [p.to_dict() for p in profiles],
        )

    # ---------- subscriptions ----------

    def load_subscriptions(self) -> list[Subscription]:
        if not self.subscriptions_path.exists():
            return []
        try:
            raw = json.loads(self.subscriptions_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            log.warning("subscriptions.json не читается (%s)", exc)
            return []
        out: list[Subscription] = []
        for item in raw:
            try:
                out.append(Subscription(**item))
            except (TypeError, KeyError) as exc:
                log.warning("пропущена повреждённая подписка: %s", exc)
        return out

    def save_subscriptions(self, subs: list[Subscription]) -> None:
        self._atomic_write(
            self.subscriptions_path,
            [s.to_dict() for s in subs],
        )

    # ---------- helpers ----------

    @staticmethod
    def _atomic_write(path: Path, data: Any) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        # Пишем в соседний файл во временной директории на том же устройстве и делаем rename.
        fd, tmp_path = tempfile.mkstemp(
            prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent)
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fp:
                json.dump(data, fp, indent=2, ensure_ascii=False)
                fp.flush()
                try:
                    os.fsync(fp.fileno())
                except OSError:
                    pass
            os.replace(tmp_path, path)
        except Exception:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise
