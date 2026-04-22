"""Управление системным HTTP-прокси Windows (через WinINet / Internet Options)."""

from __future__ import annotations

import logging
import sys

log = logging.getLogger(__name__)


def is_supported() -> bool:
    return sys.platform == "win32"


def set_windows_proxy(host: str, port: int) -> bool:
    """Задать глобальный HTTP-прокси Windows ``host:port``."""
    if not is_supported():
        return False
    try:
        import winreg  # type: ignore[import-not-found,import-untyped]
    except ImportError:  # pragma: no cover
        return False
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            0,
            winreg.KEY_SET_VALUE,
        )
    except OSError as exc:
        log.warning("не удалось открыть Internet Settings: %s", exc)
        return False
    try:
        winreg.SetValueEx(key, "ProxyEnable", 0, winreg.REG_DWORD, 1)
        winreg.SetValueEx(key, "ProxyServer", 0, winreg.REG_SZ, f"{host}:{port}")
        winreg.SetValueEx(
            key, "ProxyOverride", 0, winreg.REG_SZ, "localhost;127.0.0.1;<local>"
        )
    except OSError as exc:
        log.warning("ошибка записи ProxyServer: %s", exc)
        return False
    finally:
        winreg.CloseKey(key)
    _notify_wininet()
    return True


def clear_windows_proxy() -> bool:
    if not is_supported():
        return False
    try:
        import winreg  # type: ignore[import-not-found,import-untyped]
    except ImportError:
        return False
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            0,
            winreg.KEY_SET_VALUE,
        )
    except OSError:
        return False
    try:
        winreg.SetValueEx(key, "ProxyEnable", 0, winreg.REG_DWORD, 0)
    except OSError:
        return False
    finally:
        winreg.CloseKey(key)
    _notify_wininet()
    return True


def _notify_wininet() -> None:
    """Уведомить Internet Explorer / процессы WinINet о смене настроек."""
    if not is_supported():
        return
    try:
        import ctypes  # type: ignore[import-not-found]

        INTERNET_OPTION_SETTINGS_CHANGED = 39
        INTERNET_OPTION_REFRESH = 37
        wininet = ctypes.windll.wininet  # type: ignore[attr-defined]
        wininet.InternetSetOptionW(0, INTERNET_OPTION_SETTINGS_CHANGED, 0, 0)
        wininet.InternetSetOptionW(0, INTERNET_OPTION_REFRESH, 0, 0)
    except Exception:  # pragma: no cover — best-effort
        log.debug("не удалось уведомить WinINet", exc_info=True)
