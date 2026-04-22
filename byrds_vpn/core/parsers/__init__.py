"""Парсеры прокси-ссылок VLESS / VMess / Trojan."""

from __future__ import annotations

from byrds_vpn.core.models import ParseError, Profile
from byrds_vpn.core.parsers.trojan import parse_trojan
from byrds_vpn.core.parsers.vless import parse_vless
from byrds_vpn.core.parsers.vmess import parse_vmess

SCHEME_PARSERS = {
    "vless": parse_vless,
    "vmess": parse_vmess,
    "trojan": parse_trojan,
}


def parse_uri(uri: str) -> Profile:
    """Определить протокол по префиксу и разобрать ссылку в Profile."""
    uri = uri.strip()
    if not uri:
        raise ParseError("пустая строка")
    scheme, _, _ = uri.partition("://")
    parser = SCHEME_PARSERS.get(scheme.lower())
    if parser is None:
        raise ParseError(f"неподдерживаемый протокол: {scheme!r}")
    return parser(uri)


def parse_many(text: str) -> tuple[list[Profile], list[tuple[str, str]]]:
    """Разобрать много ссылок из текста (одна на строку).

    Возвращает: (удачные_профили, [(строка, сообщение_об_ошибке), ...]).
    """
    profiles: list[Profile] = []
    errors: list[tuple[str, str]] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        try:
            profiles.append(parse_uri(line))
        except ParseError as exc:
            errors.append((line, str(exc)))
    return profiles, errors


__all__ = [
    "ParseError",
    "Profile",
    "SCHEME_PARSERS",
    "parse_many",
    "parse_trojan",
    "parse_uri",
    "parse_vless",
    "parse_vmess",
]
