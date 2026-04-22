"""Страница маршрутизации: пресеты, списки доменов, split-tunneling."""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QComboBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QPlainTextEdit,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.core.controller import AppController
from byrds_vpn.core.models import ROUTING_MODE_PRESETS
from byrds_vpn.i18n import tr

MODE_KEYS = [
    ("standard", "routing.mode.standard"),
    ("gaming", "routing.mode.gaming"),
    ("streaming", "routing.mode.streaming"),
    ("bypass_cn", "routing.mode.bypass_cn"),
    ("bypass_ru", "routing.mode.bypass_ru"),
    ("global", "routing.mode.global"),
]

APP_MODES = [
    ("proxy", "routing.app_mode.proxy"),
    ("direct", "routing.app_mode.direct"),
    ("block", "routing.app_mode.block"),
]


class _DomainsEditor(QFrame):
    """Виджет редактирования списка доменов (title + hint + textarea)."""

    def __init__(self, title_key: str, hint_key: str, parent=None) -> None:
        super().__init__(parent)
        self.setObjectName("Card")
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 16, 20, 16)
        layout.setSpacing(6)
        title = QLabel(tr(title_key))
        title.setObjectName("CardTitle")
        hint = QLabel(tr(hint_key))
        hint.setObjectName("CardSubtitle")
        hint.setWordWrap(True)
        layout.addWidget(title)
        layout.addWidget(hint)
        self.text = QPlainTextEdit()
        self.text.setPlaceholderText("example.com\n*.gov.ru\ngeosite:ru\n1.2.3.0/24")
        layout.addWidget(self.text, 1)

    def setLines(self, lines: list[str]) -> None:  # noqa: N802
        self.text.setPlainText("\n".join(lines))

    def lines(self) -> list[str]:
        return [
            line.strip()
            for line in self.text.toPlainText().splitlines()
            if line.strip() and not line.strip().startswith("#")
        ]


class RoutingPage(QWidget):
    def __init__(self, controller: AppController, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._controller = controller

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 28, 36, 24)
        root.setSpacing(14)

        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        t = QLabel(tr("routing.title"))
        t.setObjectName("SectionTitle")
        s = QLabel(tr("routing.subtitle"))
        s.setObjectName("SectionSubtitle")
        s.setWordWrap(True)
        title_box.addWidget(t)
        title_box.addWidget(s)
        root.addLayout(title_box)

        # Режим
        mode_row = QHBoxLayout()
        mode_row.setSpacing(12)
        mode_label = QLabel(tr("routing.mode"))
        mode_label.setObjectName("LabelCaps")
        self.mode_combo = QComboBox()
        for key, label_key in MODE_KEYS:
            self.mode_combo.addItem(tr(label_key), key)
        self.mode_combo.currentIndexChanged.connect(self._on_mode_changed)
        mode_row.addWidget(mode_label)
        mode_row.addWidget(self.mode_combo, 1)
        mode_row.addStretch()
        save_btn = QPushButton(tr("common.save"))
        save_btn.setObjectName("PrimaryButton")
        save_btn.clicked.connect(self._save)
        mode_row.addWidget(save_btn)
        root.addLayout(mode_row)

        # Три редактора
        editors_row = QHBoxLayout()
        editors_row.setSpacing(14)
        self.direct_editor = _DomainsEditor(
            "routing.direct_domains", "routing.direct_domains.hint"
        )
        self.proxy_editor = _DomainsEditor(
            "routing.proxy_domains", "routing.proxy_domains.hint"
        )
        self.block_editor = _DomainsEditor(
            "routing.block_domains", "routing.block_domains.hint"
        )
        editors_row.addWidget(self.direct_editor)
        editors_row.addWidget(self.proxy_editor)
        editors_row.addWidget(self.block_editor)
        root.addLayout(editors_row, 1)

        # Split tunneling
        split_card = QFrame()
        split_card.setObjectName("Card")
        split_layout = QVBoxLayout(split_card)
        split_layout.setContentsMargins(20, 16, 20, 16)
        split_layout.setSpacing(8)
        head = QHBoxLayout()
        st_title = QLabel(tr("routing.split_tunnel"))
        st_title.setObjectName("CardTitle")
        head.addWidget(st_title)
        head.addStretch()
        self.app_name_edit = QLineEdit()
        self.app_name_edit.setPlaceholderText("firefox.exe")
        self.app_name_edit.setFixedWidth(180)
        self.app_mode_combo = QComboBox()
        for key, label_key in APP_MODES:
            self.app_mode_combo.addItem(tr(label_key), key)
        self.app_mode_combo.setFixedWidth(150)
        add_btn = QPushButton("＋  " + tr("routing.add_app"))
        add_btn.setObjectName("GhostButton")
        add_btn.clicked.connect(self._add_app)
        head.addWidget(self.app_name_edit)
        head.addWidget(self.app_mode_combo)
        head.addWidget(add_btn)
        split_layout.addLayout(head)

        hint = QLabel(tr("routing.split_tunnel.hint"))
        hint.setObjectName("CardSubtitle")
        hint.setWordWrap(True)
        split_layout.addWidget(hint)

        self.apps_list = QListWidget()
        self.apps_list.setMaximumHeight(140)
        split_layout.addWidget(self.apps_list)

        remove_btn = QPushButton(tr("common.remove"))
        remove_btn.setObjectName("DangerButton")
        remove_btn.clicked.connect(self._remove_app)
        split_layout.addWidget(remove_btn, 0, Qt.AlignRight)
        root.addWidget(split_card)

        controller.settings_changed.connect(self._reload_from_settings)
        self._reload_from_settings()

    # ---------- helpers ----------

    def _reload_from_settings(self) -> None:
        s = self._controller.settings
        idx = next((i for i, (k, _) in enumerate(MODE_KEYS) if k == s.routing_mode), 0)
        self.mode_combo.blockSignals(True)
        self.mode_combo.setCurrentIndex(idx)
        self.mode_combo.blockSignals(False)
        self.direct_editor.setLines(list(s.direct_domains) + list(s.direct_ips))
        self.proxy_editor.setLines(list(s.proxy_domains))
        self.block_editor.setLines(list(s.block_domains))
        self._reload_apps()

    def _reload_apps(self) -> None:
        self.apps_list.clear()
        for entry in self._controller.settings.split_tunnel_apps:
            name = entry.get("name", "")
            mode = entry.get("mode", "proxy")
            label = {
                "proxy": tr("routing.app_mode.proxy"),
                "direct": tr("routing.app_mode.direct"),
                "block": tr("routing.app_mode.block"),
            }.get(mode, mode)
            item = QListWidgetItem(f"{name}   →   {label}")
            item.setData(Qt.UserRole, entry)
            self.apps_list.addItem(item)

    # ---------- actions ----------

    def _on_mode_changed(self, index: int) -> None:
        key = self.mode_combo.itemData(index)
        if key is None:
            return
        # Показать пользователю, какие geosite-наборы подтянет пресет.
        preset = ROUTING_MODE_PRESETS.get(key, {})
        extra = []
        if preset.get("geosite_direct"):
            extra.append("direct: " + ", ".join(preset["geosite_direct"]))
        if preset.get("geosite_proxy"):
            extra.append("proxy: " + ", ".join(preset["geosite_proxy"]))
        if preset.get("geosite_block"):
            extra.append("block: " + ", ".join(preset["geosite_block"]))
        # Это просто справочная подсказка, не перезаписываем пользовательские списки.
        if extra:
            self.mode_combo.setToolTip("\n".join(extra))
        else:
            self.mode_combo.setToolTip("")

    def _save(self) -> None:
        s = self._controller.settings
        s.routing_mode = self.mode_combo.currentData() or "standard"

        direct_lines = self.direct_editor.lines()
        s.direct_domains = [
            x for x in direct_lines if not self._looks_like_ip(x) and not x.startswith("geoip:")
        ]
        s.direct_ips = [
            x for x in direct_lines if self._looks_like_ip(x) or x.startswith("geoip:")
        ]
        s.proxy_domains = self.proxy_editor.lines()
        s.block_domains = self.block_editor.lines()
        self._controller.save_settings()

    def _add_app(self) -> None:
        name = self.app_name_edit.text().strip()
        if not name:
            return
        mode = self.app_mode_combo.currentData() or "proxy"
        self._controller.settings.split_tunnel_apps.append({"name": name, "mode": mode})
        self._controller.save_settings()
        self.app_name_edit.clear()
        self._reload_apps()

    def _remove_app(self) -> None:
        item = self.apps_list.currentItem()
        if item is None:
            return
        entry = item.data(Qt.UserRole)
        self._controller.settings.split_tunnel_apps = [
            e for e in self._controller.settings.split_tunnel_apps if e != entry
        ]
        self._controller.save_settings()
        self._reload_apps()

    @staticmethod
    def _looks_like_ip(value: str) -> bool:
        if not value:
            return False
        if "/" in value:
            return True
        parts = value.split(".")
        return len(parts) == 4 and all(p.isdigit() for p in parts)
