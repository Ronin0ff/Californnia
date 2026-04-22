"""Thread-safe кольцевой буфер лог-записей + экспорт в текст."""

from __future__ import annotations

import datetime as _dt
import threading
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass
from typing import Literal

Level = Literal["INFO", "WARN", "OK", "READY", "ERROR", "DEBUG"]


@dataclass(slots=True)
class LogEntry:
    timestamp: _dt.datetime
    level: Level
    message: str

    def format_line(self) -> str:
        return f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] [{self.level:<5}] {self.message}"


class LogBuffer:
    """Thread-safe in-memory буфер (кольцевой, maxlen=2000)."""

    def __init__(self, maxlen: int = 2000) -> None:
        self._entries: deque[LogEntry] = deque(maxlen=maxlen)
        self._lock = threading.RLock()
        self._subs: list[Callable[[LogEntry], None]] = []

    def subscribe(self, callback: Callable[[LogEntry], None]) -> None:
        with self._lock:
            self._subs.append(callback)

    def snapshot(self) -> list[LogEntry]:
        with self._lock:
            return list(self._entries)

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()

    def add(self, level: Level, message: str) -> LogEntry:
        entry = LogEntry(
            timestamp=_dt.datetime.now(),
            level=level,
            message=message,
        )
        with self._lock:
            self._entries.append(entry)
            subs = list(self._subs)
        for cb in subs:
            try:
                cb(entry)
            except Exception:
                # Не падаем в лог-пайплайне.
                pass
        return entry

    def export(self) -> str:
        with self._lock:
            return "\n".join(e.format_line() for e in self._entries)
