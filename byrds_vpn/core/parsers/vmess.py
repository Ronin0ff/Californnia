"""Парсер ``vmess://`` URI (v2rayN base64-JSON формат)."""

from __future__ import annotations

import base64
import binascii
import json

from byrds_vpn.core.models import ParseError, Profile, StreamSettings
from byrds_vpn.core.parsers._qs import split_alpn


def _decode_base64(payload: str) -> bytes:
    """Декодировать base64 (url-safe/standard, с/без паддинга)."""
    cleaned = "".join(payload.split())
    cleaned += "=" * (-len(cleaned) % 4)
    try:
        return base64.urlsafe_b64decode(cleaned)
    except binascii.Error:
        try:
            return base64.b64decode(cleaned)
        except binascii.Error as exc:
            raise ParseError(f"неверный base64: {exc}") from exc


def parse_vmess(uri: str) -> Profile:
    """Разобрать VMess-ссылку ``vmess://<base64(JSON)>``.

    Ожидаемые ключи JSON (схема v2rayN)::

        v, ps, add, port, id, aid, scy, net, type, host, path, tls, sni, alpn, fp
    """
    if not uri.startswith("vmess://"):
        raise ParseError("не VMess-URI")

    body = uri[len("vmess://"):].split("#", 1)[0]
    try:
        raw = _decode_base64(body).decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        raise ParseError(f"VMess base64 не UTF-8 JSON: {exc}") from exc

    try:
        data: dict = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ParseError(f"VMess payload не JSON: {exc}") from exc

    address = str(data.get("add") or "").strip()
    uid = str(data.get("id") or "").strip()
    port_raw = data.get("port")
    if not address or not uid or port_raw in (None, ""):
        raise ParseError("VMess JSON: отсутствует add/port/id")
    try:
        port = int(port_raw)
    except (TypeError, ValueError) as exc:
        raise ParseError(f"VMess: порт не целое число: {port_raw!r}") from exc

    network = str(data.get("net") or "tcp").lower() or "tcp"
    if network == "h2":
        network = "http"

    tls_value = str(data.get("tls") or "none").lower()
    if tls_value in {"", "none"}:
        security = "none"
    elif tls_value == "reality":
        security = "reality"
    else:
        security = "tls"

    stream = StreamSettings(
        network=network,  # type: ignore[arg-type]
        security=security,  # type: ignore[arg-type]
        sni=str(data.get("sni") or ""),
        alpn=split_alpn(str(data.get("alpn") or "")),
        fingerprint=str(data.get("fp") or ""),
        allow_insecure=str(data.get("insecure") or "0") in {"1", "true", "True"},
        public_key=str(data.get("pbk") or ""),
        short_id=str(data.get("sid") or ""),
        spider_x=str(data.get("spx") or ""),
        header_type=str(data.get("type") or "none") or "none",
        host=str(data.get("host") or ""),
        path=str(data.get("path") or ""),
        service_name=str(data.get("path") or "") if network == "grpc" else "",
        grpc_mode="",
    )

    try:
        aid = int(data.get("aid") or 0)
    except (TypeError, ValueError):
        aid = 0

    return Profile(
        protocol="vmess",
        address=address,
        port=port,
        uuid_or_password=uid,
        remark=str(data.get("ps") or ""),
        alter_id=aid,
        security_cipher=str(data.get("scy") or "auto"),
        stream=stream,
        source_uri=uri,
    )
