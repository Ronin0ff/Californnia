"""TCP-пинг эндпоинтов серверов (handshake RTT)."""

from __future__ import annotations

import logging
import socket
import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed

from byrds_vpn.core.models import Profile

log = logging.getLogger(__name__)


def tcp_ping(host: str, port: int, timeout: float = 3.0) -> int:
    """Открыть TCP-соединение и вернуть RTT handshake в мс.

    Бросает :class:`OSError` при неудаче.
    """
    start = time.perf_counter()
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        s.connect((host, port))
    return max(0, int((time.perf_counter() - start) * 1000))


def ping_profile(profile: Profile, timeout: float = 3.0) -> int | None:
    try:
        return tcp_ping(profile.address, profile.port, timeout=timeout)
    except OSError as exc:
        log.debug("ping failed for %s:%s — %s", profile.address, profile.port, exc)
        return None


def ping_many(
    profiles: list[Profile],
    timeout: float = 3.0,
    workers: int = 50,
    progress: Callable[[str, int | None], None] | None = None,
) -> dict[str, int | None]:
    """Параллельный пинг. Возвращает ``{profile.id: ms | None}``.

    ``progress(profile_id, ms)`` вызывается по мере готовности каждого замера.
    """
    if not profiles:
        return {}
    results: dict[str, int | None] = {}
    with ThreadPoolExecutor(max_workers=workers) as ex:
        future_to_id = {ex.submit(ping_profile, p, timeout): p.id for p in profiles}
        for fut in as_completed(future_to_id):
            pid = future_to_id[fut]
            try:
                ms = fut.result()
            except (OSError, RuntimeError) as exc:
                log.debug("ping worker error: %s", exc)
                ms = None
            results[pid] = ms
            if progress is not None:
                try:
                    progress(pid, ms)
                except Exception:
                    log.exception("ошибка callback прогресса ping")
    return results
