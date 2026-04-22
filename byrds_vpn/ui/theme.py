"""Палитра ``Nightfall`` + глобальный Qt-stylesheet.

Собственный тёмный дизайн для by RDS VPN:
  * глубокий сине-чёрный фон ``#07090F``
  * акцент royal-violet ``#7C5CFF`` + мягкое свечение ``#A889FF``
  * семантика: success ``#2EE6A6``, warning ``#FFB84D``, danger ``#FF5F6D``
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Palette:
    # Поверхности (от глубины к возвышению)
    bg_deep: str = "#07090F"
    bg_base: str = "#0B0E18"
    bg_elevated: str = "#0F1320"
    bg_higher: str = "#171B2E"
    bg_highest: str = "#1E2338"
    # Контуры
    border_subtle: str = "#1E2338"
    border_strong: str = "#2C3250"
    # Текст
    text_primary: str = "#E5E9FF"
    text_secondary: str = "#8B93B8"
    text_muted: str = "#4E5680"
    text_on_accent: str = "#0B0E18"
    # Бренд
    accent: str = "#7C5CFF"
    accent_glow: str = "#A889FF"
    accent_deep: str = "#4B2FC2"
    accent_soft: str = "#201638"
    # Семантика
    success: str = "#2EE6A6"
    success_soft: str = "#133728"
    warning: str = "#FFB84D"
    warning_soft: str = "#3B2A12"
    danger: str = "#FF5F6D"
    danger_soft: str = "#3D141A"


PALETTE = Palette()


def qss() -> str:
    """Глобальный QSS, применяется один раз в ``QApplication.setStyleSheet``."""
    p = PALETTE
    return f"""
* {{
    font-family: "Inter", "Segoe UI Variable", "Segoe UI", "Helvetica Neue", sans-serif;
    color: {p.text_primary};
}}
QMainWindow, QWidget#RootWidget {{
    background: {p.bg_deep};
}}
QWidget {{
    background: transparent;
}}
QToolTip {{
    background: {p.bg_highest};
    color: {p.text_primary};
    border: 1px solid {p.border_strong};
    padding: 6px 10px;
    border-radius: 4px;
}}

/* ===== Sidebar ===== */
QWidget#Sidebar {{
    background: {p.bg_base};
    border-right: 1px solid {p.border_subtle};
}}
QLabel#BrandLabel {{
    color: {p.text_primary};
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
}}
QLabel#VersionLabel {{
    color: {p.text_muted};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
}}
QPushButton#NavButton {{
    text-align: left;
    padding: 11px 18px 11px 16px;
    color: {p.text_secondary};
    background: transparent;
    border: none;
    border-left: 3px solid transparent;
    font-size: 13.5px;
    font-weight: 500;
}}
QPushButton#NavButton:hover {{
    background: {p.bg_elevated};
    color: {p.text_primary};
}}
QPushButton#NavButton:checked {{
    background: {p.bg_elevated};
    color: {p.accent_glow};
    border-left: 3px solid {p.accent};
}}
QPushButton#CollapseButton {{
    border: none;
    background: transparent;
    color: {p.text_muted};
    padding: 8px;
}}
QPushButton#CollapseButton:hover {{
    color: {p.accent};
}}

/* ===== TopBar ===== */
QWidget#TopBar {{
    background: {p.bg_base};
    border-bottom: 1px solid {p.border_subtle};
}}
QLabel#TopBarLabel {{
    color: {p.accent_glow};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3.5px;
}}
QLabel#TopBarStatus {{
    color: {p.text_secondary};
    font-size: 12px;
    font-weight: 500;
}}

/* ===== Cards ===== */
QFrame#Card {{
    background: {p.bg_elevated};
    border: 1px solid {p.border_subtle};
    border-radius: 12px;
}}
QFrame#CardAccent {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
        stop:0 {p.bg_elevated}, stop:1 {p.bg_higher});
    border: 1px solid {p.border_strong};
    border-radius: 14px;
}}
QFrame#CardMuted {{
    background: {p.bg_base};
    border: 1px solid {p.border_subtle};
    border-radius: 10px;
}}
QLabel#SectionTitle {{
    color: {p.text_primary};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.4px;
}}
QLabel#SectionSubtitle {{
    color: {p.text_secondary};
    font-size: 13px;
}}
QLabel#CardTitle {{
    color: {p.text_primary};
    font-size: 15px;
    font-weight: 600;
}}
QLabel#CardSubtitle {{
    color: {p.text_secondary};
    font-size: 12.5px;
}}
QLabel#LabelCaps {{
    color: {p.text_muted};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
}}
QLabel#MonoData {{
    color: {p.text_primary};
    font-family: "JetBrains Mono", "Consolas", "Menlo", monospace;
    font-size: 13px;
}}
QLabel#BigMetric {{
    color: {p.text_primary};
    font-size: 40px;
    font-weight: 300;
    letter-spacing: -1.2px;
}}
QLabel#BigMetricDim {{
    color: {p.text_muted};
    font-size: 40px;
    font-weight: 300;
    letter-spacing: -1.2px;
}}
QLabel#MetricUnit {{
    color: {p.text_muted};
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
}}

/* ===== Buttons ===== */
QPushButton {{
    background: {p.bg_higher};
    border: 1px solid {p.border_strong};
    padding: 8px 16px;
    color: {p.text_primary};
    font-weight: 600;
    border-radius: 6px;
    font-size: 13px;
}}
QPushButton:hover {{
    border-color: {p.accent};
    color: {p.accent_glow};
    background: {p.bg_highest};
}}
QPushButton:pressed {{
    background: {p.bg_elevated};
}}
QPushButton:disabled {{
    color: {p.text_muted};
    background: {p.bg_elevated};
    border-color: {p.border_subtle};
}}
QPushButton#PrimaryButton {{
    background: {p.accent};
    color: {p.text_on_accent};
    border: 1px solid {p.accent};
}}
QPushButton#PrimaryButton:hover {{
    background: {p.accent_glow};
    border-color: {p.accent_glow};
    color: {p.bg_deep};
}}
QPushButton#PrimaryButton:disabled {{
    background: {p.accent_deep};
    border-color: {p.accent_deep};
    color: {p.text_muted};
}}
QPushButton#DangerButton {{
    color: {p.danger};
    background: {p.danger_soft};
    border: 1px solid {p.danger};
}}
QPushButton#DangerButton:hover {{
    background: {p.danger};
    color: {p.bg_deep};
}}
QPushButton#IconOnly {{
    border: none;
    background: transparent;
    padding: 6px;
    color: {p.text_muted};
}}
QPushButton#IconOnly:hover {{
    color: {p.accent_glow};
}}
QPushButton#GhostButton {{
    background: transparent;
    border: 1px solid {p.border_strong};
    color: {p.text_secondary};
}}
QPushButton#GhostButton:hover {{
    color: {p.accent_glow};
    border-color: {p.accent};
}}

/* ===== Inputs ===== */
QLineEdit, QPlainTextEdit, QTextEdit, QSpinBox, QComboBox {{
    background: {p.bg_base};
    border: 1px solid {p.border_subtle};
    padding: 8px 12px;
    selection-background-color: {p.accent_deep};
    border-radius: 6px;
    color: {p.text_primary};
    font-size: 13px;
}}
QLineEdit:hover, QPlainTextEdit:hover, QTextEdit:hover, QSpinBox:hover, QComboBox:hover {{
    border-color: {p.border_strong};
}}
QLineEdit:focus, QPlainTextEdit:focus, QTextEdit:focus, QSpinBox:focus, QComboBox:focus {{
    border-color: {p.accent};
}}
QComboBox::drop-down {{
    border: none;
    width: 22px;
}}
QComboBox::down-arrow {{
    width: 10px;
    height: 10px;
}}
QComboBox QAbstractItemView {{
    background: {p.bg_higher};
    border: 1px solid {p.border_strong};
    selection-background-color: {p.accent_soft};
    selection-color: {p.accent_glow};
    padding: 4px;
    color: {p.text_primary};
}}
QSpinBox::up-button, QSpinBox::down-button {{
    background: transparent;
    border: none;
    width: 16px;
}}
QCheckBox {{
    color: {p.text_primary};
    spacing: 8px;
    font-size: 13px;
}}
QCheckBox::indicator {{
    width: 18px;
    height: 18px;
    border: 1px solid {p.border_strong};
    border-radius: 4px;
    background: {p.bg_base};
}}
QCheckBox::indicator:hover {{
    border-color: {p.accent};
}}
QCheckBox::indicator:checked {{
    background: {p.accent};
    border-color: {p.accent};
    image: none;
}}

/* ===== Lists / Tables ===== */
QListWidget, QTableWidget, QTreeWidget {{
    background: {p.bg_elevated};
    border: 1px solid {p.border_subtle};
    border-radius: 10px;
    color: {p.text_primary};
    gridline-color: {p.border_subtle};
    outline: 0;
    font-size: 13px;
}}
QListWidget::item, QTableWidget::item {{
    padding: 6px 8px;
    border-bottom: 1px solid {p.border_subtle};
}}
QListWidget::item:selected, QTableWidget::item:selected {{
    background: {p.accent_soft};
    color: {p.accent_glow};
}}
QListWidget::item:hover, QTableWidget::item:hover {{
    background: {p.bg_higher};
}}
QHeaderView::section {{
    background: {p.bg_base};
    color: {p.text_muted};
    border: none;
    border-bottom: 1px solid {p.border_subtle};
    padding: 10px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
}}

/* ===== Tabs ===== */
QTabWidget::pane {{
    border: 1px solid {p.border_subtle};
    border-radius: 10px;
    background: {p.bg_elevated};
    top: -1px;
}}
QTabBar::tab {{
    background: transparent;
    color: {p.text_secondary};
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    border: none;
}}
QTabBar::tab:hover {{
    color: {p.text_primary};
}}
QTabBar::tab:selected {{
    color: {p.accent_glow};
    border-bottom: 2px solid {p.accent};
}}

/* ===== ScrollBars ===== */
QScrollBar:vertical {{
    background: transparent;
    width: 10px;
    margin: 0;
}}
QScrollBar::handle:vertical {{
    background: {p.border_strong};
    border-radius: 5px;
    min-height: 30px;
}}
QScrollBar::handle:vertical:hover {{
    background: {p.accent_deep};
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
    height: 0;
    background: transparent;
}}
QScrollBar:horizontal {{
    background: transparent;
    height: 10px;
    margin: 0;
}}
QScrollBar::handle:horizontal {{
    background: {p.border_strong};
    border-radius: 5px;
    min-width: 30px;
}}
QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
    width: 0;
    background: transparent;
}}

/* ===== Menus ===== */
QMenu {{
    background: {p.bg_higher};
    border: 1px solid {p.border_strong};
    padding: 6px;
    color: {p.text_primary};
    border-radius: 8px;
}}
QMenu::item {{
    padding: 8px 18px;
    border-radius: 4px;
}}
QMenu::item:selected {{
    background: {p.accent_soft};
    color: {p.accent_glow};
}}
QMenu::separator {{
    height: 1px;
    background: {p.border_subtle};
    margin: 4px 0;
}}

/* ===== Dialogs ===== */
QDialog {{
    background: {p.bg_base};
}}
QLabel#DialogTitle {{
    color: {p.text_primary};
    font-size: 16px;
    font-weight: 700;
}}
QLabel#DialogHint {{
    color: {p.text_secondary};
    font-size: 12px;
}}

/* ===== Power status text ===== */
QLabel#PowerState {{
    color: {p.text_primary};
    font-size: 18px;
    font-weight: 500;
}}
QLabel#PowerHint {{
    color: {p.text_muted};
    font-size: 12px;
}}

/* ===== StatusDot ===== */
QLabel#StatusText {{
    color: {p.text_secondary};
    font-size: 12px;
    letter-spacing: 0.5px;
}}
"""
