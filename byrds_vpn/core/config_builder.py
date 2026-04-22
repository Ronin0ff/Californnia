"""Сборка JSON-конфига Xray-core из :class:`Profile` + :class:`Settings`."""

from __future__ import annotations

import logging
from typing import Any

from byrds_vpn.core.models import (
    ROUTING_MODE_PRESETS,
    Profile,
    Settings,
    StreamSettings,
)

log = logging.getLogger(__name__)

# Наборы DoH-резолверов для режимов DNS. Xray поддерживает «https://…» как DoH-endpoint.
DNS_PROFILES: dict[str, list[str]] = {
    "cloudflare": ["https://1.1.1.1/dns-query", "https://1.0.0.1/dns-query"],
    "adguard": ["https://dns.adguard-dns.com/dns-query"],
    "google": ["https://dns.google/dns-query"],
}


# ---------- stream settings ----------

def build_stream_settings(stream: StreamSettings) -> dict[str, Any]:
    """Преобразовать внутренние транспортные настройки в Xray-блок ``streamSettings``."""
    net = stream.network
    result: dict[str, Any] = {
        "network": "http" if net == "h2" else net,
        "security": stream.security if stream.security != "none" else "none",
    }

    if stream.security == "tls":
        tls: dict[str, Any] = {}
        if stream.sni:
            tls["serverName"] = stream.sni
        if stream.alpn:
            tls["alpn"] = stream.alpn
        if stream.allow_insecure:
            tls["allowInsecure"] = True
        if stream.fingerprint:
            tls["fingerprint"] = stream.fingerprint
        result["tlsSettings"] = tls
    elif stream.security == "reality":
        reality: dict[str, Any] = {
            "fingerprint": stream.fingerprint or "chrome",
            "serverName": stream.sni,
            "publicKey": stream.public_key,
            "shortId": stream.short_id,
            "spiderX": stream.spider_x or "/",
        }
        result["realitySettings"] = {k: v for k, v in reality.items() if v}
    elif stream.security == "xtls":
        # Устаревшая для новых версий Xray «xtls» — передаём как TLS.
        tls = {}
        if stream.sni:
            tls["serverName"] = stream.sni
        if stream.fingerprint:
            tls["fingerprint"] = stream.fingerprint
        if stream.alpn:
            tls["alpn"] = stream.alpn
        if stream.allow_insecure:
            tls["allowInsecure"] = True
        result["tlsSettings"] = tls
        result["security"] = "tls"

    if net == "tcp":
        header: dict[str, Any] = {"type": stream.header_type or "none"}
        if stream.header_type == "http" and stream.host:
            header["request"] = {
                "version": "1.1",
                "method": "GET",
                "path": [stream.path or "/"],
                "headers": {"Host": [stream.host]},
            }
        result["tcpSettings"] = {"header": header}
    elif net == "ws":
        ws: dict[str, Any] = {"path": stream.path or "/"}
        if stream.host:
            ws["headers"] = {"Host": stream.host}
        result["wsSettings"] = ws
    elif net == "http":
        h2: dict[str, Any] = {}
        if stream.path:
            h2["path"] = stream.path
        if stream.host:
            h2["host"] = [h for h in (x.strip() for x in stream.host.split(",")) if h]
        result["httpSettings"] = h2
    elif net == "grpc":
        grpc: dict[str, Any] = {"serviceName": stream.service_name or stream.path or ""}
        if stream.grpc_mode == "multi":
            grpc["multiMode"] = True
        result["grpcSettings"] = grpc
    elif net == "kcp":
        result["kcpSettings"] = {
            "header": {"type": stream.header_type or "none"},
        }
    elif net == "quic":
        result["quicSettings"] = {
            "security": "none",
            "key": "",
            "header": {"type": stream.header_type or "none"},
        }

    return result


# ---------- outbounds per-protocol ----------

def _vless_outbound(profile: Profile) -> dict[str, Any]:
    user: dict[str, Any] = {
        "id": profile.uuid_or_password,
        "encryption": profile.encryption or "none",
    }
    if profile.flow:
        user["flow"] = profile.flow
    return {
        "protocol": "vless",
        "settings": {
            "vnext": [
                {
                    "address": profile.address,
                    "port": profile.port,
                    "users": [user],
                }
            ]
        },
        "streamSettings": build_stream_settings(profile.stream),
        "tag": "proxy",
    }


def _vmess_outbound(profile: Profile) -> dict[str, Any]:
    return {
        "protocol": "vmess",
        "settings": {
            "vnext": [
                {
                    "address": profile.address,
                    "port": profile.port,
                    "users": [
                        {
                            "id": profile.uuid_or_password,
                            "alterId": profile.alter_id,
                            "security": profile.security_cipher or "auto",
                        }
                    ],
                }
            ]
        },
        "streamSettings": build_stream_settings(profile.stream),
        "tag": "proxy",
    }


def _trojan_outbound(profile: Profile) -> dict[str, Any]:
    return {
        "protocol": "trojan",
        "settings": {
            "servers": [
                {
                    "address": profile.address,
                    "port": profile.port,
                    "password": profile.uuid_or_password,
                }
            ]
        },
        "streamSettings": build_stream_settings(profile.stream),
        "tag": "proxy",
    }


OUTBOUND_BUILDERS = {
    "vless": _vless_outbound,
    "vmess": _vmess_outbound,
    "trojan": _trojan_outbound,
}


# ---------- inbounds / dns / routing ----------

def _inbounds(settings: Settings) -> list[dict[str, Any]]:
    listen = "0.0.0.0" if settings.allow_lan else "127.0.0.1"
    inbounds: list[dict[str, Any]] = [
        {
            "tag": "socks",
            "listen": listen,
            "port": settings.socks_port,
            "protocol": "socks",
            "settings": {"auth": "noauth", "udp": True},
            "sniffing": {
                "enabled": True,
                "destOverride": ["http", "tls", "quic"],
                "routeOnly": False,
            },
        },
        {
            "tag": "http",
            "listen": listen,
            "port": settings.http_port,
            "protocol": "http",
            "settings": {"allowTransparent": False},
            "sniffing": {
                "enabled": True,
                "destOverride": ["http", "tls"],
                "routeOnly": False,
            },
        },
    ]
    return inbounds


def _dns(settings: Settings) -> dict[str, Any]:
    if settings.dns_mode == "system":
        return {"servers": ["localhost"]}
    if settings.dns_mode == "custom":
        servers: list[str | dict[str, Any]] = list(settings.custom_dns) or ["1.1.1.1"]
        return {"servers": servers}
    profile = DNS_PROFILES.get(settings.dns_mode)
    if profile is None:
        log.warning("Неизвестный DNS-режим %r, используем system", settings.dns_mode)
        return {"servers": ["localhost"]}
    return {"servers": list(profile)}


def _routing(settings: Settings) -> dict[str, Any]:
    preset = ROUTING_MODE_PRESETS.get(settings.routing_mode, {})
    rules: list[dict[str, Any]] = []

    # Блокировка — первой (блок всегда важнее)
    block_domains = list(settings.block_domains) + [
        f"geosite:{s}" if not s.startswith("geosite:") else s
        for s in (preset.get("geosite_block", []) or settings.geosite_block)
    ]
    if block_domains:
        rules.append(
            {
                "type": "field",
                "outboundTag": "block",
                "domain": block_domains,
            }
        )

    # Direct по доменам
    direct_domains = list(settings.direct_domains) + [
        f"geosite:{s}" if not s.startswith("geosite:") else s
        for s in (preset.get("geosite_direct", []) or settings.geosite_direct)
    ]
    if direct_domains:
        rules.append(
            {"type": "field", "outboundTag": "direct", "domain": direct_domains}
        )

    # Direct по IP
    direct_ips = list(settings.direct_ips) + list(preset.get("direct_ips", []))
    # Удалить дубликаты, сохраняя порядок
    seen: set[str] = set()
    direct_ips = [x for x in direct_ips if not (x in seen or seen.add(x))]
    if direct_ips:
        rules.append({"type": "field", "outboundTag": "direct", "ip": direct_ips})

    # Proxy-домены (форсировать через VPN)
    proxy_domains = list(settings.proxy_domains) + [
        f"geosite:{s}" if not s.startswith("geosite:") else s
        for s in (preset.get("geosite_proxy", []) or settings.geosite_proxy)
    ]
    if proxy_domains:
        rules.append(
            {"type": "field", "outboundTag": "proxy", "domain": proxy_domains}
        )

    # Split tunneling по процессам
    for entry in settings.split_tunnel_apps:
        name = (entry.get("name") or "").strip()
        mode = (entry.get("mode") or "proxy").strip()
        if not name:
            continue
        tag = {
            "proxy": "proxy",
            "direct": "direct",
            "block": "block",
        }.get(mode)
        if not tag:
            continue
        rules.append(
            {"type": "field", "outboundTag": tag, "process": [name]}
        )

    # Всё остальное — через прокси
    rules.append({"type": "field", "outboundTag": "proxy", "port": "0-65535"})

    return {"domainStrategy": "IPIfNonMatch", "rules": rules}


def build_xray_config(profile: Profile, settings: Settings) -> dict[str, Any]:
    """Собрать полный JSON-конфиг Xray для заданного профиля и пользовательских настроек."""
    builder = OUTBOUND_BUILDERS.get(profile.protocol)
    if builder is None:
        raise ValueError(f"неподдерживаемый протокол: {profile.protocol}")

    outbound = builder(profile)

    # MUX: несовместим с xtls-rprx-vision flow.
    xtls_flow = profile.protocol == "vless" and bool(profile.flow)
    if settings.enable_mux and not xtls_flow:
        outbound["mux"] = {
            "enabled": True,
            "concurrency": max(1, min(64, settings.mux_concurrency)),
        }

    config: dict[str, Any] = {
        "log": {"loglevel": "info"},
        "dns": _dns(settings),
        "inbounds": _inbounds(settings),
        "outbounds": [
            outbound,
            {"protocol": "freedom", "tag": "direct"},
            {"protocol": "blackhole", "tag": "block"},
        ],
        "routing": _routing(settings),
        "policy": {
            "levels": {"0": {"statsUserUplink": True, "statsUserDownlink": True}},
            "system": {
                "statsInboundUplink": True,
                "statsInboundDownlink": True,
                "statsOutboundUplink": True,
                "statsOutboundDownlink": True,
            },
        },
        "stats": {},
        "api": {"tag": "api", "services": ["StatsService"]},
    }

    # Локальный api-inbound для статистики (Xray stats).
    config["inbounds"].append(
        {
            "tag": "api",
            "listen": "127.0.0.1",
            "port": settings.api_port,
            "protocol": "dokodemo-door",
            "settings": {"address": "127.0.0.1"},
        }
    )
    # Api-inbound маршрутизируется строго в api-outbound.
    config["routing"]["rules"].insert(
        0, {"type": "field", "inboundTag": ["api"], "outboundTag": "api"}
    )
    return config
