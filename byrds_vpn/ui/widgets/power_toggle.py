"""Большая анимированная кнопка включения/отключения VPN.

Состояния:
    * off — серый ободок, символ питания
    * connecting — пульсирующий фиолетовый ободок
    * on — заполненный градиентный диск + мягкое свечение
"""

from __future__ import annotations

from PySide6.QtCore import (
    Property,
    QEasingCurve,
    QPointF,
    QPropertyAnimation,
    QRectF,
    Qt,
    Signal,
)
from PySide6.QtGui import (
    QBrush,
    QColor,
    QConicalGradient,
    QPainter,
    QPainterPath,
    QPen,
    QRadialGradient,
)
from PySide6.QtWidgets import QAbstractButton

from byrds_vpn.ui.theme import PALETTE


class PowerToggle(QAbstractButton):
    """Круглая кнопка-питание на всю ширину карточки."""

    toggled_state = Signal(str)  # 'off' | 'connecting' | 'on'

    DIAMETER = 180

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setCheckable(True)
        self.setFixedSize(self.DIAMETER, self.DIAMETER)
        self.setCursor(Qt.PointingHandCursor)

        self._state = "off"          # off / connecting / on
        self._angle = 0.0            # для crrpulse
        self._glow = 0.0             # 0..1

        self._rot_anim = QPropertyAnimation(self, b"angle", self)
        self._rot_anim.setDuration(2400)
        self._rot_anim.setStartValue(0.0)
        self._rot_anim.setEndValue(360.0)
        self._rot_anim.setLoopCount(-1)
        self._rot_anim.setEasingCurve(QEasingCurve.Linear)

        self._glow_anim = QPropertyAnimation(self, b"glow", self)
        self._glow_anim.setDuration(1800)
        self._glow_anim.setLoopCount(-1)
        self._glow_anim.setStartValue(0.35)
        self._glow_anim.setKeyValueAt(0.5, 1.0)
        self._glow_anim.setEndValue(0.35)
        self._glow_anim.setEasingCurve(QEasingCurve.InOutSine)

    # ---------- анимируемые свойства ----------

    def getAngle(self) -> float:  # noqa: N802 — Qt property
        return self._angle

    def setAngle(self, value: float) -> None:  # noqa: N802
        self._angle = value
        self.update()

    angle = Property(float, getAngle, setAngle)

    def getGlow(self) -> float:  # noqa: N802
        return self._glow

    def setGlow(self, value: float) -> None:  # noqa: N802
        self._glow = value
        self.update()

    glow = Property(float, getGlow, setGlow)

    # ---------- публичный API ----------

    def set_state(self, state: str) -> None:
        if state == self._state:
            return
        self._state = state
        self.blockSignals(True)
        self.setChecked(state == "on")
        self.blockSignals(False)

        self._rot_anim.stop()
        self._glow_anim.stop()
        if state == "connecting":
            self._rot_anim.start()
        elif state == "on":
            self._glow_anim.start()
        else:
            self._glow = 0.0
            self._angle = 0.0
        self.update()
        self.toggled_state.emit(state)

    def current_state(self) -> str:
        return self._state

    # ---------- отрисовка ----------

    def paintEvent(self, _event) -> None:  # noqa: N802
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, True)

        side = min(self.width(), self.height())
        inset = side * 0.08
        rect = QRectF(
            (self.width() - side) / 2 + inset,
            (self.height() - side) / 2 + inset,
            side - 2 * inset,
            side - 2 * inset,
        )

        # Фон-свечение при «on»
        if self._state == "on":
            self._draw_glow(p, rect, intensity=self._glow)

        # Внешний ободок
        pen_width = side * 0.025
        p.setBrush(Qt.NoBrush)
        if self._state == "connecting":
            grad = QConicalGradient(rect.center(), -self._angle)
            grad.setColorAt(0.0, QColor(PALETTE.accent))
            grad.setColorAt(0.35, QColor(PALETTE.accent_glow))
            grad.setColorAt(0.4, QColor(0, 0, 0, 0))
            grad.setColorAt(1.0, QColor(0, 0, 0, 0))
            pen = QPen(QBrush(grad), pen_width)
            pen.setCapStyle(Qt.RoundCap)
            p.setPen(pen)
            p.drawEllipse(rect)
        else:
            ring_color = QColor(PALETTE.accent) if self._state == "on" else QColor(PALETTE.border_strong)
            p.setPen(QPen(ring_color, pen_width, Qt.SolidLine, Qt.RoundCap))
            p.drawEllipse(rect)

        # Внутренний диск
        inner = rect.adjusted(side * 0.08, side * 0.08, -side * 0.08, -side * 0.08)
        if self._state == "on":
            radial = QRadialGradient(inner.center(), inner.width() / 2)
            radial.setColorAt(0.0, QColor(PALETTE.accent_glow))
            radial.setColorAt(0.7, QColor(PALETTE.accent))
            radial.setColorAt(1.0, QColor(PALETTE.accent_deep))
            p.setBrush(QBrush(radial))
            p.setPen(Qt.NoPen)
            p.drawEllipse(inner)
        else:
            p.setBrush(QColor(PALETTE.bg_elevated))
            p.setPen(Qt.NoPen)
            p.drawEllipse(inner)

        # Символ «power»
        self._draw_power_glyph(p, inner)

        p.end()

    def _draw_glow(self, p: QPainter, rect: QRectF, intensity: float) -> None:
        for i, alpha in enumerate((int(70 * intensity), int(40 * intensity), int(22 * intensity))):
            if alpha <= 0:
                continue
            off = (i + 1) * rect.width() * 0.06
            glow_rect = rect.adjusted(-off, -off, off, off)
            p.setPen(Qt.NoPen)
            p.setBrush(QColor(
                QColor(PALETTE.accent_glow).red(),
                QColor(PALETTE.accent_glow).green(),
                QColor(PALETTE.accent_glow).blue(),
                alpha,
            ))
            p.drawEllipse(glow_rect)

    def _draw_power_glyph(self, p: QPainter, rect: QRectF) -> None:
        center = rect.center()
        r = rect.width() * 0.22
        color = QColor(PALETTE.bg_deep) if self._state == "on" else QColor(PALETTE.text_secondary)
        pen = QPen(color, rect.width() * 0.06, Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin)
        p.setPen(pen)
        p.setBrush(Qt.NoBrush)

        # Арка ~280° вокруг центра.
        arc_rect = QRectF(center.x() - r, center.y() - r + rect.width() * 0.02, 2 * r, 2 * r)
        p.drawArc(arc_rect, int(130 * 16), int(280 * 16))

        # Вертикальная линия сверху
        path = QPainterPath()
        path.moveTo(QPointF(center.x(), center.y() - r - rect.width() * 0.04))
        path.lineTo(QPointF(center.x(), center.y() - r * 0.25))
        p.drawPath(path)
