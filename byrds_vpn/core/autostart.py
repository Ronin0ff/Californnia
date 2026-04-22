"""Автозапуск приложения при старте Windows (через HKCU\\...\\Run)."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

from byrds_vpn import __app_id__

log = logging.getLogger(__name__)


def is_supported() -> bool:
    return sys.platform == "win32"


def _exe_command() -> str:
    if getattr(sys, "frozen", False):
        exe = Path(sys.executable).resolve()
        return f'"{exe}" --minimized'
    python = Path(sys.executable).resolve()
    return f'"{python}" -m byrds_vpn --minimized'


def set_autostart(enabled: bool) -> bool:
    """Включить/выключить автозапуск. Возвращает True при успехе."""
    if not is_supported():
        return False
    try:
        import winreg  # type: ignore[import-not-found,import-untyped]
    except ImportError:  # pragma: no cover — только на не-Windows
        return False

    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Run",
            0,
            winreg.KEY_SET_VALUE,
        )
    except OSError as exc:
        log.warning("не удалось открыть Run-ключ реестра: %s", exc)
        return False

    try:
        if enabled:
            winreg.SetValueEx(key, __app_id__, 0, winreg.REG_SZ, _exe_command())
        else:
            try:
                winreg.DeleteValue(key, __app_id__)
            except FileNotFoundError:
                pass
        return True
    except OSError as exc:
        log.warning("ошибка записи Run-ключа: %s", exc)
        return False
    finally:
        winreg.CloseKey(key)


def is_autostart_enabled() -> bool:
    if not is_supported():
        return False
    try:
        import winreg  # type: ignore[import-not-found,import-untyped]
    except ImportError:
        return False
    try:
        with winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Run",
            0,
            winreg.KEY_QUERY_VALUE,
        ) as key:
            winreg.QueryValueEx(key, __app_id__)
            return True
    except FileNotFoundError:
        return False
    except OSError:
        return False
