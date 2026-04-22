"""Замер скорости загрузки через локальный SOCKS5-прокси."""

from __future__ import annotations

import logging
import time
from collections.abc import Callable

import httpx

log = logging.getLogger(__name__)

# Cloudflare Speed endpoint: поток нулей заданного размера.
DEFAULT_URL = "https://speed.cloudflare.com/__down?bytes=25000000"  # 25 МБ


def measure_download_mbps(
    proxy_url: str,
    url: str = DEFAULT_URL,
    budget_seconds: float = 8.0,
    progress: Callable[[float, float], None] | None = None,
) -> float:
    """Скачать ``url`` через ``proxy_url`` и вернуть наблюдаемую скорость в Мбит/с.

    ``proxy_url`` — httpx-proxy-строка, например ``socks5://127.0.0.1:10808``.
    Обрывает загрузку по истечении ``budget_seconds``.
    ``progress(mbps, elapsed)`` вызывается при каждом чанке.
    """
    transport_kwargs: dict = {"proxy": proxy_url} if proxy_url else {}
    total_bytes = 0
    start = time.perf_counter()
    try:
        with httpx.Client(
            timeout=budget_seconds + 2,
            verify=True,
            **transport_kwargs,
        ) as client:
            with client.stream("GET", url) as r:
                r.raise_for_status()
                for chunk in r.iter_bytes(chunk_size=64 * 1024):
                    total_bytes += len(chunk)
                    elapsed = time.perf_counter() - start
                    if progress is not None and elapsed > 0:
                        mbps = (total_bytes * 8) / (elapsed * 1_000_000)
                        try:
                            progress(mbps, elapsed)
                        except Exception:
                            log.exception("ошибка progress speedtest")
                    if elapsed >= budget_seconds:
                        break
    except httpx.HTTPError as exc:
        log.debug("speedtest via %s failed: %s", proxy_url, exc)
        return 0.0

    elapsed = max(time.perf_counter() - start, 1e-6)
    mbps = (total_bytes * 8) / (elapsed * 1_000_000)
    return round(mbps, 2)
