"""Общие типы данных приложения: профиль сервера и пользовательские настройки."""

from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass, field, fields
from typing import Any, Literal

Protocol = Literal["vless", "vmess", "trojan"]
Network = Literal["tcp", "kcp", "ws", "http", "h2", "grpc", "quic"]
Security = Literal["none", "tls", "reality", "xtls"]
RoutingMode = Literal["standard", "gaming", "streaming", "bypass_cn", "bypass_ru", "global"]


class ParseError(ValueError):
    """Ошибка разбора прокси-URI."""


@dataclass(slots=True)
class StreamSettings:
    """Транспортные настройки одного outbound-подключения."""

    network: Network = "tcp"
    security: Security = "none"
    # TLS / REALITY
    sni: str = ""
    alpn: list[str] = field(default_factory=list)
    fingerprint: str = ""          # fp=chrome / firefox / ios / edge / ...
    allow_insecure: bool = False
    public_key: str = ""           # pbk (REALITY)
    short_id: str = ""             # sid (REALITY)
    spider_x: str = ""             # spx (REALITY)
    # Транспортные детали
    header_type: str = "none"      # "none" / "http" (TCP obfs)
    host: str = ""                 # Host header (ws/h2) / TCP-http host
    path: str = ""                 # ws / h2 path
    service_name: str = ""         # gRPC
    grpc_mode: str = ""            # "multi" / "gun"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class Profile:
    """Разобранная ссылка на сервер."""

    protocol: Protocol
    address: str
    port: int
    uuid_or_password: str          # uuid для vless/vmess, password для trojan
    remark: str = ""

    # VLESS
    encryption: str = "none"
    flow: str = ""

    # VMess
    alter_id: int = 0
    security_cipher: str = "auto"  # auto / aes-128-gcm / chacha20-poly1305 / none

    stream: StreamSettings = field(default_factory=StreamSettings)

    # Бухгалтерия
    id: str = field(default_factory=lambda: uuid.uuid4().hex)
    source_uri: str = ""
    group: str = ""
    favorite: bool = False
    tags: list[str] = field(default_factory=list)

    last_ping_ms: int | None = None
    last_speed_mbps: float | None = None

    @property
    def endpoint(self) -> str:
        return f"{self.address}:{self.port}"

    def short_label(self) -> str:
        """Короткая подпись для UI / логов."""
        if self.remark:
            return self.remark
        return f"{self.protocol}://{self.endpoint}"

    def identity_key(self) -> tuple[str, str, int, str]:
        """Ключ для дедупликации."""
        return (self.protocol, self.address, self.port, self.uuid_or_password)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Profile:
        stream_data = data.get("stream") or {}
        stream_kwargs = {
            k: v
            for k, v in stream_data.items()
            if k in {f.name for f in fields(StreamSettings)}
        }
        prof_kwargs = {
            k: v for k, v in data.items() if k in {f.name for f in fields(cls)}
        }
        prof_kwargs["stream"] = StreamSettings(**stream_kwargs)
        return cls(**prof_kwargs)


@dataclass(slots=True)
class Subscription:
    """URL-подписка, из которой периодически обновляются профили."""

    id: str = field(default_factory=lambda: uuid.uuid4().hex)
    name: str = ""
    url: str = ""
    auto_update_hours: int = 24
    last_updated_iso: str = ""
    last_error: str = ""
    profile_ids: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class Settings:
    """Пользовательские настройки приложения."""

    # --- Сеть / локальные прокси ---
    socks_port: int = 10808
    http_port: int = 10809
    api_port: int = 10085
    allow_lan: bool = False

    # --- DNS ---
    dns_mode: str = "system"  # system / cloudflare / adguard / google / custom
    custom_dns: list[str] = field(default_factory=lambda: ["1.1.1.1", "8.8.8.8"])

    # --- Защита / поведение ---
    enable_kill_switch: bool = False
    enable_mux: bool = False
    mux_concurrency: int = 8
    system_proxy_on_connect: bool = True
    auto_reconnect: bool = True
    tun_mode: bool = False  # зарезервировано (Wintun)

    # --- Маршрутизация ---
    routing_mode: RoutingMode = "standard"
    direct_domains: list[str] = field(default_factory=lambda: ["localhost", "*.local"])
    proxy_domains: list[str] = field(default_factory=list)
    block_domains: list[str] = field(default_factory=list)
    direct_ips: list[str] = field(default_factory=lambda: ["geoip:private"])
    geosite_direct: list[str] = field(default_factory=list)
    geosite_proxy: list[str] = field(default_factory=list)
    geosite_block: list[str] = field(default_factory=lambda: ["category-ads-all"])
    split_tunnel_apps: list[dict[str, str]] = field(default_factory=list)
    # [{"name": "firefox.exe", "path": "C:/Program Files/Firefox/firefox.exe", "mode": "proxy|direct|block"}]

    # --- Поведение приложения ---
    autostart: bool = False
    minimize_to_tray: bool = True
    start_minimized: bool = False
    auto_connect: bool = False
    language: str = "ru"  # ru / en
    theme: str = "nightfall"  # всегда тёмная; оставлено для будущих тем
    sidebar_collapsed: bool = False

    # --- Последнее состояние ---
    active_profile_id: str = ""
    last_window_geometry_b64: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Settings:
        kwargs: dict[str, Any] = {}
        for f in fields(cls):
            if f.name in data:
                kwargs[f.name] = data[f.name]
        return cls(**kwargs)


ROUTING_MODE_PRESETS: dict[RoutingMode, dict[str, list[str]]] = {
    "standard": {
        "direct_ips": ["geoip:private"],
        "geosite_direct": [],
        "geosite_proxy": [],
        "geosite_block": ["category-ads-all"],
    },
    "gaming": {
        "direct_ips": ["geoip:private"],
        "geosite_direct": ["geosite:gaming"],
        "geosite_proxy": [],
        "geosite_block": [],
    },
    "streaming": {
        "direct_ips": ["geoip:private"],
        "geosite_direct": [],
        "geosite_proxy": ["geosite:netflix", "geosite:youtube"],
        "geosite_block": ["category-ads-all"],
    },
    "bypass_cn": {
        "direct_ips": ["geoip:private", "geoip:cn"],
        "geosite_direct": ["geosite:cn"],
        "geosite_proxy": [],
        "geosite_block": ["category-ads-all"],
    },
    "bypass_ru": {
        "direct_ips": ["geoip:private", "geoip:ru"],
        "geosite_direct": ["geosite:category-gov-ru", "geosite:yandex", "geosite:mail-ru"],
        "geosite_proxy": [],
        "geosite_block": ["category-ads-all"],
    },
    "global": {
        "direct_ips": [],
        "geosite_direct": [],
        "geosite_proxy": [],
        "geosite_block": [],
    },
}
