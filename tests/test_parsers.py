"""Юнит-тесты парсеров VLESS / VMess / Trojan."""

from __future__ import annotations

from pathlib import Path

import pytest

from byrds_vpn.core.models import ParseError
from byrds_vpn.core.parsers import parse_many, parse_uri, parse_vless, parse_vmess
from byrds_vpn.core.parsers.trojan import parse_trojan

SAMPLE = Path(__file__).parent / "data" / "sample_uris.txt"


def test_parse_vless_reality_vision() -> None:
    uri = (
        "vless://aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee@example.com:443"
        "?encryption=none&flow=xtls-rprx-vision&security=reality"
        "&sni=www.cloudflare.com&fp=chrome&pbk=PBK&sid=SID&spx=%2F&type=tcp#Remark"
    )
    p = parse_vless(uri)
    assert p.protocol == "vless"
    assert p.address == "example.com"
    assert p.port == 443
    assert p.uuid_or_password == "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    assert p.flow == "xtls-rprx-vision"
    assert p.remark == "Remark"
    assert p.stream.security == "reality"
    assert p.stream.sni == "www.cloudflare.com"
    assert p.stream.fingerprint == "chrome"
    assert p.stream.public_key == "PBK"
    assert p.stream.short_id == "SID"
    assert p.stream.spider_x == "/"
    assert p.stream.network == "tcp"


def test_parse_vless_ws_tls() -> None:
    uri = (
        "vless://11111111-2222-3333-4444-555555555555@ws.example.com:443"
        "?encryption=none&security=tls&sni=ws.example.com&type=ws"
        "&host=ws.example.com&path=%2Fchat#WS"
    )
    p = parse_vless(uri)
    assert p.stream.network == "ws"
    assert p.stream.security == "tls"
    assert p.stream.host == "ws.example.com"
    assert p.stream.path == "/chat"


def test_parse_vless_grpc_multi() -> None:
    uri = (
        "vless://33333333-4444-5555-6666-777777777777@g.example.com:443"
        "?encryption=none&security=tls&sni=g.example.com&type=grpc"
        "&serviceName=svc&mode=multi#G"
    )
    p = parse_vless(uri)
    assert p.stream.network == "grpc"
    assert p.stream.service_name == "svc"
    assert p.stream.grpc_mode == "multi"


def test_parse_vless_errors() -> None:
    with pytest.raises(ParseError):
        parse_vless("http://example.com")
    with pytest.raises(ParseError):
        parse_vless("vless://example.com:443")  # no UUID


def test_parse_trojan_tls() -> None:
    uri = (
        "trojan://pass%21word@tj.example.com:443?security=tls&sni=tj.example.com"
        "&type=tcp&allowInsecure=0#T"
    )
    p = parse_trojan(uri)
    assert p.protocol == "trojan"
    assert p.uuid_or_password == "pass!word"
    assert p.address == "tj.example.com"
    assert p.port == 443
    assert p.stream.security == "tls"
    assert p.stream.sni == "tj.example.com"
    assert p.remark == "T"


def test_parse_vmess_base64_json() -> None:
    # {"add":"example.com","aid":"0","host":"example.com","id":"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    #  "net":"ws","path":"/","port":"443","ps":"Test-VMess","scy":"auto","sni":"example.com",
    #  "tls":"tls","type":"none","v":"2"}
    uri = (
        "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsImFpZCI6IjAiLCJob3N0IjoiZXhhbXBsZS5jb20iLCJpZCI6ImFh"
        "YWFhYWFhLWJiYmItY2NjYy1kZGRkLWVlZWVlZWVlZWVlZSIsIm5ldCI6IndzIiwicGF0aCI6Ii8iLCJwb3J0Ijoi"
        "NDQzIiwicHMiOiJUZXN0LVZNZXNzIiwic2N5IjoiYXV0byIsInNuaSI6ImV4YW1wbGUuY29tIiwidGxzIjoidGxz"
        "IiwidHlwZSI6Im5vbmUiLCJ2IjoiMiJ9"
    )
    p = parse_vmess(uri)
    assert p.protocol == "vmess"
    assert p.address == "example.com"
    assert p.port == 443
    assert p.remark == "Test-VMess"
    assert p.uuid_or_password == "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    assert p.stream.network == "ws"
    assert p.stream.security == "tls"


def test_parse_uri_dispatch() -> None:
    p = parse_uri("trojan://p@h:1#r")
    assert p.protocol == "trojan"
    with pytest.raises(ParseError):
        parse_uri("ssh://user@host:22")
    with pytest.raises(ParseError):
        parse_uri("")


def test_parse_many_sample_file() -> None:
    profiles, errors = parse_many(SAMPLE.read_text(encoding="utf-8"))
    # В файле 5 валидных URI (без учёта пустых и комментариев).
    assert len(profiles) == 5
    assert errors == []
    kinds = {p.protocol for p in profiles}
    assert kinds == {"vless", "vmess", "trojan"}


def test_parse_many_with_bad_line() -> None:
    text = "vless://bad-line\nvless://11111111-2222-3333-4444-555555555555@h:443?encryption=none&type=tcp#ok"
    profiles, errors = parse_many(text)
    assert len(profiles) == 1
    assert len(errors) == 1


def test_round_trip_profile_to_dict() -> None:
    p = parse_uri(
        "vless://11111111-2222-3333-4444-555555555555@h.example:443"
        "?encryption=none&security=reality&sni=x.y&pbk=abc&sid=de&spx=%2F&type=tcp#R"
    )
    d = p.to_dict()
    assert d["stream"]["security"] == "reality"
    assert d["remark"] == "R"
