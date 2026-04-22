"""Левая навигационная панель с логотипом + сворачивание в rail-режим."""

from __future__ import annotations

from PySide6.QtCore import (
    QEasingCurve,
    QPropertyAnimation,
    QSize,
    Qt,
    Signal,
)
from PySide6.QtWidgets import (
    QButtonGroup,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn import __version__
from byrds_vpn.i18n import tr
from byrds_vpn.ui.icons import nav_icon, render_logo_pixmap


class Sidebar(QWidget):
    navigated = Signal(str)
    collapsed_changed = Signal(bool)

    EXPANDED_WIDTH = 232
    COLLAPSED_WIDTH = 72

    PAGES = [
        ("dashboard", "dashboard", "nav.dashboard"),
        ("servers", "servers", "nav.servers"),
        ("routing", "routing", "nav.routing"),
        ("settings", "settings", "nav.settings"),
        ("logs", "logs", "nav.logs"),
        ("about", "about", "nav.about"),
    ]

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("Sidebar")
        self.setFixedWidth(self.EXPANDED_WIDTH)
        self._collapsed = False

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 20, 0, 12)
        root.setSpacing(0)

        # --- Brand block ---
        self._brand_widget = QWidget()
        brand_layout = QHBoxLayout(self._brand_widget)
        brand_layout.setContentsMargins(18, 0, 10, 18)
        brand_layout.setSpacing(12)
        logo = QLabel()
        logo.setPixmap(render_logo_pixmap(40))
        logo.setFixedSize(QSize(40, 40))
        brand_layout.addWidget(logo, 0, Qt.AlignVCenter)

        labels = QVBoxLayout()
        labels.setContentsMargins(0, 0, 0, 0)
        labels.setSpacing(2)
        self._brand_label = QLabel(tr("app.brand"))
        self._brand_label.setObjectName("BrandLabel")
        self._version_label = QLabel(f"v{__version__}")
        self._version_label.setObjectName("VersionLabel")
        labels.addWidget(self._brand_label)
        labels.addWidget(self._version_label)
        brand_layout.addLayout(labels)
        brand_layout.addStretch()
        root.addWidget(self._brand_widget)

        # --- Nav buttons ---
        self._group = QButtonGroup(self)
        self._group.setExclusive(True)
        self._buttons: dict[str, QPushButton] = {}
        self._button_labels: dict[str, str] = {}

        for page_id, icon_name, label_key in self.PAGES:
            btn = QPushButton()
            btn.setObjectName("NavButton")
            btn.setCheckable(True)
            btn.setCursor(Qt.PointingHandCursor)
            btn.setIcon(nav_icon(icon_name, 22))
            btn.setIconSize(QSize(22, 22))
            text = tr(label_key)
            btn.setText("  " + text)
            btn.clicked.connect(lambda _=False, p=page_id: self.navigated.emit(p))
            self._group.addButton(btn)
            self._buttons[page_id] = btn
            self._button_labels[page_id] = text
            root.addWidget(btn)

        root.addStretch()

        # --- Collapse toggle ---
        footer_wrap = QWidget()
        footer_layout = QHBoxLayout(footer_wrap)
        footer_layout.setContentsMargins(14, 0, 14, 0)
        footer_layout.setSpacing(0)
        self._collapse_btn = QPushButton()
        self._collapse_btn.setObjectName("CollapseButton")
        self._collapse_btn.setCursor(Qt.PointingHandCursor)
        self._collapse_btn.setIcon(nav_icon("chevron_left", 18))
        self._collapse_btn.setIconSize(QSize(18, 18))
        self._collapse_btn.setToolTip(tr("nav.collapse"))
        self._collapse_btn.clicked.connect(self.toggle_collapsed)
        footer_layout.addStretch()
        footer_layout.addWidget(self._collapse_btn)
        root.addWidget(footer_wrap)

        # Animation for width change.
        self._anim = QPropertyAnimation(self, b"minimumWidth", self)
        self._anim.setDuration(180)
        self._anim.setEasingCurve(QEasingCurve.InOutCubic)
        self._anim2 = QPropertyAnimation(self, b"maximumWidth", self)
        self._anim2.setDuration(180)
        self._anim2.setEasingCurve(QEasingCurve.InOutCubic)

        self.select("dashboard")

    # ---------- public ----------

    def select(self, page_id: str) -> None:
        btn = self._buttons.get(page_id)
        if btn is not None and not btn.isChecked():
            btn.setChecked(True)

    def toggle_collapsed(self) -> None:
        self.set_collapsed(not self._collapsed)

    def set_collapsed(self, collapsed: bool) -> None:
        if self._collapsed == collapsed:
            return
        self._collapsed = collapsed
        target = self.COLLAPSED_WIDTH if collapsed else self.EXPANDED_WIDTH

        # Плавная анимация ширины.
        for anim in (self._anim, self._anim2):
            anim.stop()
            anim.setStartValue(self.width())
            anim.setEndValue(target)
        self._anim.start()
        self._anim2.start()

        self._brand_label.setVisible(not collapsed)
        self._version_label.setVisible(not collapsed)
        for pid, btn in self._buttons.items():
            if collapsed:
                btn.setText("")
                btn.setToolTip(self._button_labels[pid])
            else:
                btn.setText("  " + self._button_labels[pid])
                btn.setToolTip("")

        self._collapse_btn.setIcon(
            nav_icon("chevron_right" if collapsed else "chevron_left", 18)
        )
        self._collapse_btn.setToolTip(
            tr("nav.expand" if collapsed else "nav.collapse")
        )
        self.collapsed_changed.emit(collapsed)

    def is_collapsed(self) -> bool:
        return self._collapsed
