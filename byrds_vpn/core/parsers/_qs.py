"""Утилиты для разбора query-string параметров прокси-URI."""

from __future__ import annotations


def first(qs: dict[str, list[str]], key: str, default: str = "") -> str:
    """Первое значение query-параметра или default."""
    values = qs.get(key)
    if not values:
        return default
    return values[0]


def as_bool(value: str) -> bool:
    return value.lower() in {"1", "true", "yes", "on"}


def split_alpn(raw: str) -> list[str]:
    if not raw:
        return []
    return [p for p in (x.strip() for x in raw.split(",")) if p]
