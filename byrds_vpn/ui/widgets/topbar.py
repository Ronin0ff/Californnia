"""Верхняя узкая строка с текущим статусом соединения."""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtGui import QColor, QPainter
from PySide6.QtWidgets import QHBoxLayout, QLabel, QWidget

from byrds_vpn.i18n import tr
from byrds_vpn.ui.theme import PALETTE


class StatusDot(QWidget):
    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setFixedSize(10, 10)
        self._color = PALETTE.text_muted

    def set_color(self, hex_color: str) -> None:
        self._color = hex_color
        self.update()

    def paintEvent(self, _event) -> None:  # noqa: N802
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, True)
        p.setBrush(QColor(self._color))
        p.setPen(Qt.NoPen)
        p.drawEllipse(0, 0, 9, 9)
        p.end()


class TopBar(QWidget):
    HEIGHT = 52

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setObjectName("TopBar")
        self.setFixedHeight(self.HEIGHT)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(28, 0, 28, 0)
        layout.setSpacing(14)

        self._dot = StatusDot()
        self._status_text = QLabel(tr("topbar.state.ready"))
        self._status_text.setObjectName("TopBarStatus")

        layout.addWidget(self._dot)
        layout.addWidget(self._status_text)
        layout.addStretch()

        badge = QLabel(tr("topbar.secure"))
        badge.setObjectName("TopBarLabel")
        layout.addWidget(badge)

    def set_state(self, state: str) -> None:
        """``state`` — 'ready' / 'connecting' / 'online' / 'error'."""
        mapping = {
            "ready": (PALETTE.text_muted, tr("topbar.state.ready")),
            "connecting": (PALETTE.warning, tr("topbar.state.connecting")),
            "online": (PALETTE.success, tr("topbar.state.online")),
            "error": (PALETTE.danger, tr("topbar.state.error")),
        }
        color, text = mapping.get(state, mapping["ready"])
        self._dot.set_color(color)
        self._status_text.setText(text)
