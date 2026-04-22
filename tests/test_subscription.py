"""Тесты ``subscription``: разбор текстов и base64-блоков."""

from __future__ import annotations

import base64

from byrds_vpn.core.subscription import import_text


def test_import_plain_text() -> None:
    text = (
        "vless://11111111-2222-3333-4444-555555555555@h.example:443"
        "?encryption=none&type=tcp#ok\n"
        "# comment\n"
        "\n"
        "trojan://secret@tj.example:443?security=tls&sni=tj.example#t\n"
    )
    profiles, errors = import_text(text)
    assert len(profiles) == 2
    assert errors == []


def test_import_base64_block() -> None:
    raw = (
        "vless://11111111-2222-3333-4444-555555555555@h.example:443?encryption=none&type=tcp#ok\n"
        "trojan://secret@tj.example:443?security=tls&sni=tj.example#t\n"
    )
    encoded = base64.b64encode(raw.encode("utf-8")).decode("ascii")
    profiles, errors = import_text(encoded)
    assert len(profiles) == 2
    assert errors == []


def test_empty_input() -> None:
    profiles, errors = import_text("")
    assert profiles == []
    assert errors == []
