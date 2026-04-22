"""Парсер ``vless://`` URI (VLESS + REALITY / XTLS / TLS / WS / gRPC / TCP)."""

from __future__ import annotations

from urllib.parse import parse_qs, unquote, urlsplit

from byrds_vpn.core.models import ParseError, Profile, StreamSettings
from byrds_vpn.core.parsers._qs import as_bool, first, split_alpn

_VALID_SECURITY = {"none", "tls", "reality", "xtls"}


def parse_vless(uri: str) -> Profile:
    """Разобрать VLESS-ссылку в :class:`Profile`.

    Пример ссылки::

        vless://<uuid>@<host>:<port>?encryption=none&flow=xtls-rprx-vision
            &security=reality&sni=www.intel.com&fp=chrome
            &pbk=<pbk>&sid=<sid>&spx=%2F&type=tcp#<remark>
    """
    if not uri.startswith("vless://"):
        raise ParseError("не VLESS-URI")

    parts = urlsplit(uri)
    if not parts.username:
        raise ParseError("VLESS-URI: отсутствует UUID (user-info)")
    if not parts.hostname:
        raise ParseError("VLESS-URI: отсутствует host")
    if parts.port is None:
        raise ParseError("VLESS-URI: отсутствует порт")

    qs = parse_qs(parts.query, keep_blank_values=True)

    network = first(qs, "type", "tcp").lower() or "tcp"
    if network == "h2":
        network = "http"

    security = first(qs, "security", "none").lower() or "none"
    if security not in _VALID_SECURITY:
        security = "none"

    stream = StreamSettings(
        network=network,  # type: ignore[arg-type]
        security=security,  # type: ignore[arg-type]
        sni=first(qs, "sni") or first(qs, "peer"),
        alpn=split_alpn(first(qs, "alpn")),
        fingerprint=first(qs, "fp"),
        allow_insecure=as_bool(first(qs, "allowInsecure", "0")),
        public_key=first(qs, "pbk"),
        short_id=first(qs, "sid"),
        spider_x=unquote(first(qs, "spx")),
        header_type=first(qs, "headerType", "none") or "none",
        host=first(qs, "host"),
        path=unquote(first(qs, "path")),
        service_name=unquote(first(qs, "serviceName")),
        grpc_mode=first(qs, "mode"),
    )

    remark = unquote(parts.fragment) if parts.fragment else ""

    return Profile(
        protocol="vless",
        address=parts.hostname,
        port=parts.port,
        uuid_or_password=parts.username,
        remark=remark,
        encryption=first(qs, "encryption", "none") or "none",
        flow=first(qs, "flow"),
        stream=stream,
        source_uri=uri,
    )
