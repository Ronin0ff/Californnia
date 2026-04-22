"""Минималистичный график трафика (downlink/uplink) без зависимости от pyqtgraph."""

from __future__ import annotations

from collections import deque

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import QColor, QLinearGradient, QPainter, QPainterPath, QPen
from PySide6.QtWidgets import QFrame, QHBoxLayout, QLabel, QVBoxLayout, QWidget

from byrds_vpn.i18n import tr
from byrds_vpn.ui.theme import PALETTE


class _Canvas(QWidget):
    def __init__(self, capacity: int = 60, parent=None) -> None:
        super().__init__(parent)
        self._down: deque[float] = deque([0.0] * capacity, maxlen=capacity)
        self._up: deque[float] = deque([0.0] * capacity, maxlen=capacity)
        self.setMinimumHeight(120)

    def push(self, down: float, up: float) -> None:
        self._down.append(max(0.0, down))
        self._up.append(max(0.0, up))
        self.update()

    def clear(self) -> None:
        for buf in (self._down, self._up):
            for _ in range(len(buf)):
                buf.append(0.0)
        self.update()

    # ---------- рисование ----------

    def paintEvent(self, _event) -> None:  # noqa: N802
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, True)
        rect = self.rect().adjusted(8, 8, -8, -8)

        # Сетка
        p.setPen(QPen(QColor(PALETTE.border_subtle), 1, Qt.DashLine))
        for i in range(1, 4):
            y = rect.top() + i * rect.height() / 4
            p.drawLine(rect.left(), y, rect.right(), y)

        peak = max(0.5, max(self._down), max(self._up))

        self._draw_series(p, rect, self._down, QColor(PALETTE.accent), peak, fill=True)
        self._draw_series(p, rect, self._up, QColor(PALETTE.success), peak, fill=False)

        p.end()

    def _draw_series(
        self,
        p: QPainter,
        rect: QRectF,
        data: deque[float],
        color: QColor,
        peak: float,
        fill: bool,
    ) -> None:
        n = len(data)
        if n < 2:
            return
        path = QPainterPath()
        step = rect.width() / (n - 1)
        for i, v in enumerate(data):
            x = rect.left() + i * step
            y = rect.bottom() - (v / peak) * rect.height()
            if i == 0:
                path.moveTo(QPointF(x, y))
            else:
                path.lineTo(QPointF(x, y))

        if fill:
            fill_path = QPainterPath(path)
            fill_path.lineTo(QPointF(rect.right(), rect.bottom()))
            fill_path.lineTo(QPointF(rect.left(), rect.bottom()))
            fill_path.closeSubpath()
            grad = QLinearGradient(0, rect.top(), 0, rect.bottom())
            c1 = QColor(color)
            c1.setAlpha(90)
            c2 = QColor(color)
            c2.setAlpha(0)
            grad.setColorAt(0.0, c1)
            grad.setColorAt(1.0, c2)
            p.fillPath(fill_path, grad)

        pen = QPen(color, 2.0)
        pen.setCapStyle(Qt.RoundCap)
        pen.setJoinStyle(Qt.RoundJoin)
        p.setPen(pen)
        p.setBrush(Qt.NoBrush)
        p.drawPath(path)


class TrafficChart(QFrame):
    """Карточка с графиком real-time трафика + компактные подписи."""

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setObjectName("Card")

        root = QVBoxLayout(self)
        root.setContentsMargins(20, 18, 20, 18)
        root.setSpacing(10)

        header = QHBoxLayout()
        title = QLabel(tr("dashboard.realtime"))
        title.setObjectName("CardTitle")
        header.addWidget(title)
        header.addStretch()

        legend = QHBoxLayout()
        legend.setSpacing(16)
        legend.addWidget(self._legend_item(PALETTE.accent, tr("dashboard.downlink")))
        legend.addWidget(self._legend_item(PALETTE.success, tr("dashboard.uplink")))
        header.addLayout(legend)
        root.addLayout(header)

        self._canvas = _Canvas()
        root.addWidget(self._canvas, 1)

        self._ping_label = QLabel("— мс")
        self._ping_label.setObjectName("CardSubtitle")
        self._ping_label.setAlignment(Qt.AlignRight)
        root.addWidget(self._ping_label)

    @staticmethod
    def _legend_item(color: str, text: str) -> QWidget:
        w = QWidget()
        hl = QHBoxLayout(w)
        hl.setContentsMargins(0, 0, 0, 0)
        hl.setSpacing(6)
        dot = QLabel("●")
        dot.setStyleSheet(f"color: {color}; font-size: 13px;")
        label = QLabel(text)
        label.setObjectName("CardSubtitle")
        hl.addWidget(dot)
        hl.addWidget(label)
        return w

    def push(self, down: float, up: float) -> None:
        self._canvas.push(down, up)

    def clear(self) -> None:
        self._canvas.clear()

    def set_ping(self, ms: int | None) -> None:
        if ms is None:
            self._ping_label.setText("— мс")
        else:
            self._ping_label.setText(f"{ms} мс")
