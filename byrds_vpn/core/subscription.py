"""Импорт профилей: из текста / файла / HTTP(S)-подписки (включая base64)."""

from __future__ import annotations

import base64
import binascii
import logging
from pathlib import Path
from urllib.parse import urlparse

import httpx

from byrds_vpn.core.models import ParseError, Profile
from byrds_vpn.core.parsers import parse_many, parse_uri

log = logging.getLogger(__name__)


def _looks_like_uri_list(text: str) -> bool:
    return any(
        scheme in text for scheme in ("vless://", "vmess://", "trojan://")
    )


def _decode_subscription(raw: str) -> str:
    """Подписки часто отдают base64 блок со списком URI. Возвращаем plain text."""
    candidate = raw.strip()
    if _looks_like_uri_list(candidate):
        return candidate
    cleaned = "".join(candidate.split())
    if not cleaned:
        return candidate
    cleaned += "=" * (-len(cleaned) % 4)
    for decoder in (base64.urlsafe_b64decode, base64.b64decode):
        try:
            decoded = decoder(cleaned).decode("utf-8", errors="strict")
        except (binascii.Error, UnicodeDecodeError):
            continue
        if _looks_like_uri_list(decoded):
            return decoded
    return candidate


def import_text(text: str) -> tuple[list[Profile], list[tuple[str, str]]]:
    """Разобрать все URI из блока текста (с поддержкой base64-подписок)."""
    text = _decode_subscription(text)
    return parse_many(text)


def import_file(path: str | Path) -> tuple[list[Profile], list[tuple[str, str]]]:
    data = Path(path).read_text(encoding="utf-8")
    return import_text(data)


def import_single(uri: str) -> Profile:
    return parse_uri(uri)


def fetch_subscription(
    url: str,
    timeout: float = 15.0,
    user_agent: str = "byRDS-VPN/1.0 (Windows; x64)",
) -> tuple[list[Profile], list[tuple[str, str]]]:
    """Скачать подписку и разобрать её содержимое."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise ParseError(f"неверная схема URL подписки: {parsed.scheme!r}")
    try:
        with httpx.Client(
            timeout=timeout,
            follow_redirects=True,
            headers={"User-Agent": user_agent},
        ) as client:
            res = client.get(url)
            res.raise_for_status()
            body = res.text
    except httpx.HTTPError as exc:
        raise ParseError(f"не удалось загрузить подписку: {exc}") from exc
    return import_text(body)


def export_profiles(profiles: list[Profile]) -> str:
    """Сериализовать профили обратно в список URI (по одному в строке)."""
    return "\n".join(p.source_uri for p in profiles if p.source_uri)
