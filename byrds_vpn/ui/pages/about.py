"""Страница 'О программе'."""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtGui import QDesktopServices
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn import __version__
from byrds_vpn.i18n import tr
from byrds_vpn.ui.icons import render_logo_pixmap
from byrds_vpn.ui.theme import PALETTE


class AboutPage(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 28, 36, 24)
        root.setSpacing(14)

        title = QLabel(tr("about.title"))
        title.setObjectName("SectionTitle")
        root.addWidget(title)

        card = QFrame()
        card.setObjectName("CardAccent")
        c_layout = QHBoxLayout(card)
        c_layout.setContentsMargins(32, 28, 32, 28)
        c_layout.setSpacing(28)

        logo = QLabel()
        logo.setPixmap(render_logo_pixmap(128))
        logo.setFixedSize(128, 128)
        c_layout.addWidget(logo, 0, Qt.AlignTop)

        right = QVBoxLayout()
        right.setSpacing(6)

        brand = QLabel(tr("app.brand"))
        brand.setStyleSheet(
            f"color: {PALETTE.text_primary}; font-size: 28px; font-weight: 700; letter-spacing: -0.6px;"
        )
        right.addWidget(brand)

        version = QLabel(tr("about.version", version=__version__))
        version.setObjectName("LabelCaps")
        right.addWidget(version)

        desc = QLabel(tr("about.description"))
        desc.setObjectName("CardSubtitle")
        desc.setWordWrap(True)
        desc.setStyleSheet(f"color: {PALETTE.text_secondary}; font-size: 13px; line-height: 160%;")
        right.addWidget(desc)

        right.addSpacing(6)
        author = QLabel(tr("about.author"))
        author.setObjectName("CardSubtitle")
        right.addWidget(author)

        lic = QLabel(tr("about.license"))
        lic.setObjectName("CardSubtitle")
        right.addWidget(lic)

        right.addSpacing(10)
        btn_row = QHBoxLayout()
        gh_btn = QPushButton("🌐  " + tr("about.github"))
        gh_btn.setObjectName("PrimaryButton")
        gh_btn.setCursor(Qt.PointingHandCursor)
        gh_btn.clicked.connect(self._open_github)
        btn_row.addWidget(gh_btn)
        btn_row.addStretch()
        right.addLayout(btn_row)

        c_layout.addLayout(right, 1)
        root.addWidget(card)
        root.addStretch()

    @staticmethod
    def _open_github() -> None:
        from PySide6.QtCore import QUrl

        QDesktopServices.openUrl(QUrl("https://github.com/Ronin0ff"))
