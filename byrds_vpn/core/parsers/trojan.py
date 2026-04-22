"""Парсер ``trojan://`` URI (TLS / REALITY)."""

from __future__ import annotations

from urllib.parse import parse_qs, unquote, urlsplit

from byrds_vpn.core.models import ParseError, Profile, StreamSettings
from byrds_vpn.core.parsers._qs import as_bool, first, split_alpn

_VALID_SECURITY = {"none", "tls", "reality", "xtls"}


def parse_trojan(uri: str) -> Profile:
    """Разобрать Trojan-ссылку::

        trojan://<password>@<host>:<port>?security=tls&sni=<sni>&type=tcp#<remark>
    """
    if not uri.startswith("trojan://"):
        raise ParseError("не Trojan-URI")

    parts = urlsplit(uri)
    password = unquote(parts.username or "")
    if not password:
        raise ParseError("Trojan-URI: отсутствует пароль")
    if not parts.hostname:
        raise ParseError("Trojan-URI: отсутствует host")
    if parts.port is None:
        raise ParseError("Trojan-URI: отсутствует порт")

    qs = parse_qs(parts.query, keep_blank_values=True)

    network = first(qs, "type", "tcp").lower() or "tcp"
    if network == "h2":
        network = "http"

    # Trojan исторически подразумевает TLS; но REALITY / none тоже встречаются.
    security = first(qs, "security", "tls").lower() or "tls"
    if security not in _VALID_SECURITY:
        security = "tls"

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
        protocol="trojan",
        address=parts.hostname,
        port=parts.port,
        uuid_or_password=password,
        remark=remark,
        stream=stream,
        source_uri=uri,
    )
