"""Страница журнала событий."""

from __future__ import annotations

from PySide6.QtGui import QColor, QTextCharFormat, QTextCursor
from PySide6.QtWidgets import (
    QFileDialog,
    QHBoxLayout,
    QLabel,
    QPlainTextEdit,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.core.controller import AppController
from byrds_vpn.core.logs import LogEntry
from byrds_vpn.i18n import tr
from byrds_vpn.ui.theme import PALETTE

LEVEL_COLORS = {
    "INFO": PALETTE.text_secondary,
    "WARN": PALETTE.warning,
    "OK": PALETTE.success,
    "READY": PALETTE.success,
    "ERROR": PALETTE.danger,
    "DEBUG": PALETTE.text_muted,
}


class LogsPage(QWidget):
    def __init__(self, controller: AppController, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._controller = controller

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 28, 36, 24)
        root.setSpacing(14)

        header = QHBoxLayout()
        title = QLabel(tr("logs.title"))
        title.setObjectName("SectionTitle")
        header.addWidget(title)
        header.addStretch()

        live_badge = QLabel("◉ " + tr("logs.live"))
        live_badge.setStyleSheet(
            f"color: {PALETTE.success}; font-size: 11px; font-weight: 700; letter-spacing: 2px;"
        )
        header.addWidget(live_badge)

        clear_btn = QPushButton(tr("logs.clear"))
        clear_btn.setObjectName("GhostButton")
        clear_btn.clicked.connect(self._clear)
        header.addWidget(clear_btn)

        export_btn = QPushButton(tr("logs.export"))
        export_btn.clicked.connect(self._export)
        header.addWidget(export_btn)
        root.addLayout(header)

        self.view = QPlainTextEdit()
        self.view.setReadOnly(True)
        self.view.setObjectName("LogsView")
        self.view.setStyleSheet(
            f"QPlainTextEdit {{ background: {PALETTE.bg_base}; "
            f"border: 1px solid {PALETTE.border_subtle}; border-radius: 10px; "
            f"padding: 14px; color: {PALETTE.text_primary}; "
            f"font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 12px; }}"
        )
        root.addWidget(self.view, 1)

        # Дозаливка существующих строк.
        for e in controller.log.snapshot():
            self._append(e)
        controller.log_added.connect(self._append)

    def _append(self, entry: LogEntry) -> None:
        color = LEVEL_COLORS.get(entry.level, PALETTE.text_secondary)
        cursor = self.view.textCursor()
        cursor.movePosition(QTextCursor.End)

        ts = entry.timestamp.strftime("%H:%M:%S")
        fmt_ts = QTextCharFormat()
        fmt_ts.setForeground(QColor(PALETTE.text_muted))
        cursor.insertText(f"[{ts}] ", fmt_ts)

        fmt_lvl = QTextCharFormat()
        fmt_lvl.setForeground(QColor(color))
        fmt_lvl.setFontWeight(700)
        cursor.insertText(f"{entry.level:<5} ", fmt_lvl)

        fmt_msg = QTextCharFormat()
        fmt_msg.setForeground(QColor(PALETTE.text_primary))
        cursor.insertText(f"│ {entry.message}\n", fmt_msg)

        # автоскролл
        sb = self.view.verticalScrollBar()
        sb.setValue(sb.maximum())

    def _clear(self) -> None:
        self._controller.log.clear()
        self.view.clear()

    def _export(self) -> None:
        path, _ = QFileDialog.getSaveFileName(
            self, tr("logs.export"), "byrds-vpn.log", "Log files (*.log *.txt)"
        )
        if not path:
            return
        try:
            with open(path, "w", encoding="utf-8") as fp:
                fp.write(self._controller.log.export())
        except OSError:
            pass
