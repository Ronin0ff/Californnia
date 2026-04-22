"""Русско-английская локализация UI."""

from __future__ import annotations

from byrds_vpn.i18n.strings import STRINGS

_current_lang = "ru"


def set_language(lang: str) -> None:
    global _current_lang
    if lang in STRINGS:
        _current_lang = lang


def current_language() -> str:
    return _current_lang


def tr(key: str, **kwargs: object) -> str:
    """Перевести ключ на активный язык, с подстановкой ``{placeholders}``."""
    lang = STRINGS.get(_current_lang) or STRINGS["ru"]
    text = lang.get(key) or STRINGS["ru"].get(key) or key
    if kwargs:
        try:
            return text.format(**kwargs)
        except (KeyError, IndexError, ValueError):
            return text
    return text


__all__ = ["current_language", "set_language", "tr"]
