"""Собственный логотип и иконки, отрисовываемые через QPainter.

Логотип представляет собой шестиугольный щит с монограммой «R» и
лёгким градиентом в акцентном цвете — без внешних ассетов.
"""

from __future__ import annotations

from PySide6.QtCore import QPointF, QRectF, QSize, Qt
from PySide6.QtGui import (
    QBrush,
    QColor,
    QFont,
    QIcon,
    QLinearGradient,
    QPainter,
    QPainterPath,
    QPen,
    QPixmap,
)

from byrds_vpn.ui.theme import PALETTE


def _hex_shield_path(rect: QRectF) -> QPainterPath:
    """Построить путь в форме «щита» (шестиугольник с закруглёнными углами)."""
    w = rect.width()
    h = rect.height()
    cx = rect.left() + w / 2
    top = rect.top()
    # Пропорции: верх округлённый, низ заострён
    path = QPainterPath()
    path.moveTo(cx - w * 0.42, top + h * 0.12)
    path.quadTo(cx, top, cx + w * 0.42, top + h * 0.12)
    path.lineTo(cx + w * 0.46, top + h * 0.55)
    path.quadTo(cx + w * 0.46, top + h * 0.75, cx, top + h)
    path.quadTo(cx - w * 0.46, top + h * 0.75, cx - w * 0.46, top + h * 0.55)
    path.closeSubpath()
    return path


def render_logo_pixmap(size: int = 64, with_glow: bool = True) -> QPixmap:
    """Отрисовать логотип by RDS заданного размера."""
    pm = QPixmap(size, size)
    pm.fill(Qt.transparent)

    p = QPainter(pm)
    p.setRenderHint(QPainter.Antialiasing, True)
    p.setRenderHint(QPainter.SmoothPixmapTransform, True)

    margin = size * 0.08
    shield_rect = QRectF(margin, margin, size - 2 * margin, size - 2 * margin)
    shield = _hex_shield_path(shield_rect)

    # Внешнее свечение.
    if with_glow:
        for i, alpha in enumerate((30, 22, 14)):
            off = (i + 1) * (size * 0.02)
            glow_rect = shield_rect.adjusted(-off, -off, off, off)
            glow_path = _hex_shield_path(glow_rect)
            p.fillPath(glow_path, QColor(PALETTE.accent_glow).lighter(110) if False else QColor.fromRgb(
                QColor(PALETTE.accent_glow).red(),
                QColor(PALETTE.accent_glow).green(),
                QColor(PALETTE.accent_glow).blue(),
                alpha,
            ))

    # Градиентная заливка щита.
    grad = QLinearGradient(QPointF(shield_rect.topLeft()), QPointF(shield_rect.bottomRight()))
    grad.setColorAt(0.0, QColor(PALETTE.accent_deep))
    grad.setColorAt(0.6, QColor(PALETTE.accent))
    grad.setColorAt(1.0, QColor(PALETTE.accent_glow))
    p.setBrush(QBrush(grad))
    p.setPen(QPen(QColor(PALETTE.accent_glow), max(1.0, size * 0.02)))
    p.drawPath(shield)

    # Внутренний контур.
    inner_rect = shield_rect.adjusted(size * 0.08, size * 0.08, -size * 0.08, -size * 0.08)
    inner = _hex_shield_path(inner_rect)
    p.setPen(QPen(QColor(0, 0, 0, 80), max(1.0, size * 0.015)))
    p.setBrush(Qt.NoBrush)
    p.drawPath(inner)

    # Монограмма «R».
    p.setPen(QPen(QColor(PALETTE.bg_deep)))
    font = QFont("Inter", int(size * 0.48), QFont.Bold)
    font.setLetterSpacing(QFont.AbsoluteSpacing, -1.0)
    p.setFont(font)
    glyph_rect = shield_rect.adjusted(0, size * 0.02, 0, -size * 0.04)
    p.drawText(glyph_rect, Qt.AlignCenter, "R")

    p.end()
    return pm


def app_icon() -> QIcon:
    icon = QIcon()
    for size in (16, 24, 32, 48, 64, 96, 128, 256):
        icon.addPixmap(render_logo_pixmap(size))
    return icon


def nav_icon(name: str, size: int = 20, color: str | None = None) -> QIcon:
    """Простые геометрические навигационные иконки, нарисованные на лету."""
    pm = QPixmap(size, size)
    pm.fill(Qt.transparent)
    col = QColor(color or PALETTE.text_secondary)

    p = QPainter(pm)
    p.setRenderHint(QPainter.Antialiasing, True)
    pen = QPen(col, max(1.2, size * 0.08))
    pen.setCapStyle(Qt.RoundCap)
    pen.setJoinStyle(Qt.RoundJoin)
    p.setPen(pen)
    p.setBrush(Qt.NoBrush)

    s = size
    m = s * 0.2
    rect = QRectF(m, m, s - 2 * m, s - 2 * m)

    if name == "dashboard":
        # Четыре «плитки»
        w = (rect.width() - s * 0.05) / 2
        h = (rect.height() - s * 0.05) / 2
        p.drawRoundedRect(QRectF(rect.left(), rect.top(), w, h * 1.2), 2, 2)
        p.drawRoundedRect(QRectF(rect.left() + w + s * 0.05, rect.top(), w, h * 0.8), 2, 2)
        p.drawRoundedRect(
            QRectF(rect.left(), rect.top() + h * 1.2 + s * 0.05, w, rect.height() - h * 1.2 - s * 0.05),
            2, 2,
        )
        p.drawRoundedRect(
            QRectF(rect.left() + w + s * 0.05, rect.top() + h * 0.8 + s * 0.05, w, rect.height() - h * 0.8 - s * 0.05),
            2, 2,
        )
    elif name == "servers":
        # Три горизонтальных слота (стек серверов)
        h = rect.height() / 3.4
        for i in range(3):
            r = QRectF(rect.left(), rect.top() + i * (h + s * 0.04), rect.width(), h)
            p.drawRoundedRect(r, 2, 2)
            p.drawEllipse(QPointF(r.right() - h * 0.5, r.center().y()), h * 0.15, h * 0.15)
    elif name == "routing":
        # Развилка / routing graph
        cx = rect.center().x()
        p.drawLine(QPointF(cx, rect.top()), QPointF(cx, rect.center().y()))
        p.drawLine(QPointF(cx, rect.center().y()), QPointF(rect.left(), rect.bottom()))
        p.drawLine(QPointF(cx, rect.center().y()), QPointF(rect.right(), rect.bottom()))
        p.setBrush(QBrush(col))
        for pt in (
            QPointF(cx, rect.top()),
            QPointF(rect.left(), rect.bottom()),
            QPointF(rect.right(), rect.bottom()),
        ):
            p.drawEllipse(pt, s * 0.08, s * 0.08)
    elif name == "settings":
        # Простая шестерня — звёздочка 8 лучей + центр
        cx = rect.center().x()
        cy = rect.center().y()
        r1 = rect.width() * 0.4
        r2 = rect.width() * 0.22
        import math

        for i in range(8):
            a = math.radians(i * 45)
            p.drawLine(
                QPointF(cx + r2 * math.cos(a), cy + r2 * math.sin(a)),
                QPointF(cx + r1 * math.cos(a), cy + r1 * math.sin(a)),
            )
        p.setBrush(Qt.NoBrush)
        p.drawEllipse(QPointF(cx, cy), r2, r2)
    elif name == "logs":
        # Три строки «текста»
        for i, w_ratio in enumerate((1.0, 0.75, 0.9)):
            y = rect.top() + (i + 0.5) * (rect.height() / 3)
            p.drawLine(
                QPointF(rect.left(), y),
                QPointF(rect.left() + rect.width() * w_ratio, y),
            )
    elif name == "about":
        # Круг с «i»
        p.drawEllipse(rect)
        cx = rect.center().x()
        p.drawLine(QPointF(cx, rect.top() + rect.height() * 0.3),
                   QPointF(cx, rect.top() + rect.height() * 0.36))
        p.drawLine(QPointF(cx, rect.top() + rect.height() * 0.45),
                   QPointF(cx, rect.bottom() - rect.height() * 0.2))
    elif name == "chevron_left":
        cx = rect.center().x()
        cy = rect.center().y()
        w = rect.width() * 0.3
        p.drawLine(QPointF(cx + w / 2, cy - w), QPointF(cx - w / 2, cy))
        p.drawLine(QPointF(cx - w / 2, cy), QPointF(cx + w / 2, cy + w))
    elif name == "chevron_right":
        cx = rect.center().x()
        cy = rect.center().y()
        w = rect.width() * 0.3
        p.drawLine(QPointF(cx - w / 2, cy - w), QPointF(cx + w / 2, cy))
        p.drawLine(QPointF(cx + w / 2, cy), QPointF(cx - w / 2, cy + w))

    p.end()
    return QIcon(pm)


def render_text_icon(char: str, size: int = 18, color: str | None = None) -> QIcon:
    """Мелкая иконка из одного символа (fallback)."""
    pm = QPixmap(size, size)
    pm.fill(Qt.transparent)
    p = QPainter(pm)
    p.setRenderHint(QPainter.Antialiasing, True)
    p.setPen(QColor(color or PALETTE.text_secondary))
    font = QFont("Inter", int(size * 0.7), QFont.Bold)
    p.setFont(font)
    p.drawText(pm.rect(), Qt.AlignCenter, char)
    p.end()
    return QIcon(pm)


def status_pixmap(color: str, size: int = 10) -> QPixmap:
    pm = QPixmap(QSize(size, size))
    pm.fill(Qt.transparent)
    p = QPainter(pm)
    p.setRenderHint(QPainter.Antialiasing, True)
    p.setBrush(QColor(color))
    p.setPen(Qt.NoPen)
    p.drawEllipse(0, 0, size - 1, size - 1)
    p.end()
    return pm
