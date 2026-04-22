"""Тесты сборки Xray-конфига из Profile + Settings."""

from __future__ import annotations

from byrds_vpn.core.config_builder import build_xray_config
from byrds_vpn.core.models import Settings
from byrds_vpn.core.parsers import parse_uri


def _parse(uri: str):
    return parse_uri(uri)


def test_vless_reality_config_shape() -> None:
    prof = _parse(
        "vless://aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee@host:443"
        "?encryption=none&flow=xtls-rprx-vision&security=reality"
        "&sni=www.cloudflare.com&fp=chrome&pbk=PBK&sid=SID&spx=%2F&type=tcp#R"
    )
    s = Settings()
    cfg = build_xray_config(prof, s)
    # Inbounds: socks, http, api
    inbound_tags = {i["tag"] for i in cfg["inbounds"]}
    assert {"socks", "http", "api"}.issubset(inbound_tags)
    # Outbound: proxy + freedom + blackhole
    tags = [o["tag"] for o in cfg["outbounds"]]
    assert tags[0] == "proxy"
    assert "direct" in tags and "block" in tags
    # REALITY settings
    stream = cfg["outbounds"][0]["streamSettings"]
    assert stream["security"] == "reality"
    assert stream["realitySettings"]["publicKey"] == "PBK"
    assert stream["realitySettings"]["shortId"] == "SID"
    assert stream["realitySettings"]["serverName"] == "www.cloudflare.com"
    # VLESS user flow
    user = cfg["outbounds"][0]["settings"]["vnext"][0]["users"][0]
    assert user["flow"] == "xtls-rprx-vision"
    assert user["id"] == "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"


def test_vmess_tls_ws() -> None:
    uri = (
        "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsImFpZCI6IjAiLCJob3N0IjoiZXhhbXBsZS5jb20iLCJpZCI6ImFh"
        "YWFhYWFhLWJiYmItY2NjYy1kZGRkLWVlZWVlZWVlZWVlZSIsIm5ldCI6IndzIiwicGF0aCI6Ii8iLCJwb3J0Ijoi"
        "NDQzIiwicHMiOiJUZXN0LVZNZXNzIiwic2N5IjoiYXV0byIsInNuaSI6ImV4YW1wbGUuY29tIiwidGxzIjoidGxz"
        "IiwidHlwZSI6Im5vbmUiLCJ2IjoiMiJ9"
    )
    cfg = build_xray_config(_parse(uri), Settings())
    stream = cfg["outbounds"][0]["streamSettings"]
    assert stream["network"] == "ws"
    assert stream["security"] == "tls"
    assert stream["wsSettings"]["path"] == "/"
    assert stream["wsSettings"]["headers"]["Host"] == "example.com"


def test_trojan_routing_rules_block_first() -> None:
    prof = _parse("trojan://secret@tj.example.com:443?security=tls&sni=tj.example.com#T")
    s = Settings()
    s.block_domains = ["ad.example.com"]
    s.direct_domains = ["local.example.com"]
    s.proxy_domains = ["vpn.example.com"]
    cfg = build_xray_config(prof, s)
    rules = cfg["routing"]["rules"]
    # api-rule первая, затем block-правило, затем direct, затем proxy, затем catch-all.
    assert rules[0]["inboundTag"] == ["api"]
    assert rules[1]["outboundTag"] == "block"
    outtags = [r["outboundTag"] for r in rules]
    assert outtags[-1] == "proxy"


def test_mux_not_applied_with_xtls_flow() -> None:
    prof = _parse(
        "vless://aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee@h:443"
        "?encryption=none&flow=xtls-rprx-vision&security=reality&sni=x&pbk=p&sid=s&type=tcp#R"
    )
    s = Settings(enable_mux=True, mux_concurrency=8)
    cfg = build_xray_config(prof, s)
    assert "mux" not in cfg["outbounds"][0]


def test_mux_applied_with_plain_tls() -> None:
    prof = _parse(
        "vless://11111111-2222-3333-4444-555555555555@h:443"
        "?encryption=none&security=tls&sni=x&type=ws&path=/ws#W"
    )
    s = Settings(enable_mux=True, mux_concurrency=16)
    cfg = build_xray_config(prof, s)
    assert cfg["outbounds"][0]["mux"] == {"enabled": True, "concurrency": 16}


def test_allow_lan_switches_listen() -> None:
    prof = _parse("trojan://p@h:1#r")
    cfg = build_xray_config(prof, Settings(allow_lan=False))
    assert any(i.get("listen") == "127.0.0.1" for i in cfg["inbounds"] if i["tag"] == "socks")
    cfg_lan = build_xray_config(prof, Settings(allow_lan=True))
    assert any(i.get("listen") == "0.0.0.0" for i in cfg_lan["inbounds"] if i["tag"] == "socks")
