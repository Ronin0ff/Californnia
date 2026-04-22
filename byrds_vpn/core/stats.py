"""Запрос статистики Xray через API (dokodemo-door + GRPC stats service).

На Windows достаточно httpx-совместимого клиента к локальному API-inbound?
Нет: api-inbound — это dokodemo-door над GRPC-сервером Xray. Проще — вызывать
``xray api statsquery`` CLI, это работает везде и не требует зависимостей.
"""

from __future__ import annotations

import json
import logging
import re
import subprocess
import sys
from dataclasses import dataclass

from byrds_vpn.core.xray_manager import locate_xray_binary

log = logging.getLogger(__name__)


@dataclass(slots=True)
class TrafficSample:
    uplink_bytes: int = 0
    downlink_bytes: int = 0


_PATTERN_LINK = re.compile(r'^(?P<name>[^\s:]+)[\s:]+(?P<value>\d+)')


def sample_traffic(api_port: int, reset: bool = True, timeout: float = 2.0) -> TrafficSample:
    """Запросить суммарный трафик inbound=socks + inbound=http.

    Возвращает дельту (если reset=True, Xray сбрасывает счётчики после запроса).
    """
    binary = locate_xray_binary()
    if binary is None:
        return TrafficSample()
    cmd = [
        str(binary),
        "api",
        "statsquery",
        f"--server=127.0.0.1:{api_port}",
    ]
    if reset:
        cmd.append("-reset")
    try:
        proc = subprocess.run(  # noqa: S603
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            creationflags=(
                subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0  # type: ignore[attr-defined]
            ),
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        log.debug("xray stats query failed: %s", exc)
        return TrafficSample()

    up = down = 0
    # Формат вывода CLI может быть JSON (новые версии) или набор строк.
    text = proc.stdout or ""
    try:
        data = json.loads(text)
        for entry in data.get("stat", []):
            name = entry.get("name", "")
            value = int(entry.get("value", 0) or 0)
            if "user" in name:
                continue
            if "uplink" in name:
                up += value
            elif "downlink" in name:
                down += value
        return TrafficSample(uplink_bytes=up, downlink_bytes=down)
    except (json.JSONDecodeError, ValueError):
        pass

    # Fallback: парсим текст.
    for raw in text.splitlines():
        m = _PATTERN_LINK.match(raw.strip())
        if not m:
            continue
        name = m.group("name")
        try:
            value = int(m.group("value"))
        except ValueError:
            continue
        if "uplink" in name:
            up += value
        elif "downlink" in name:
            down += value
    return TrafficSample(uplink_bytes=up, downlink_bytes=down)
