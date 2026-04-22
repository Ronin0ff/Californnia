"""Страница настроек приложения (Общие / Сеть / Дополнительно)."""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QFormLayout,
    QFrame,
    QHBoxLayout,
    QLabel,
    QPlainTextEdit,
    QPushButton,
    QSpinBox,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.core.controller import AppController
from byrds_vpn.i18n import tr

DNS_MODES = [
    ("system", "settings.dns.system"),
    ("cloudflare", "settings.dns.cloudflare"),
    ("adguard", "settings.dns.adguard"),
    ("google", "settings.dns.google"),
    ("custom", "settings.dns.custom"),
]


def _card(title_key: str | None = None) -> tuple[QFrame, QVBoxLayout]:
    card = QFrame()
    card.setObjectName("Card")
    layout = QVBoxLayout(card)
    layout.setContentsMargins(24, 20, 24, 20)
    layout.setSpacing(12)
    if title_key:
        title = QLabel(tr(title_key))
        title.setObjectName("CardTitle")
        layout.addWidget(title)
    return card, layout


class SettingsPage(QWidget):
    def __init__(self, controller: AppController, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._controller = controller

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 28, 36, 24)
        root.setSpacing(14)

        title = QLabel(tr("settings.title"))
        title.setObjectName("SectionTitle")
        root.addWidget(title)

        self.tabs = QTabWidget()
        self.tabs.addTab(self._build_general_tab(), tr("settings.tab_general"))
        self.tabs.addTab(self._build_network_tab(), tr("settings.tab_network"))
        self.tabs.addTab(self._build_advanced_tab(), tr("settings.tab_advanced"))
        root.addWidget(self.tabs, 1)

        footer = QHBoxLayout()
        footer.addStretch()
        reset_btn = QPushButton(tr("common.reset"))
        reset_btn.setObjectName("GhostButton")
        reset_btn.clicked.connect(self._reload)
        footer.addWidget(reset_btn)
        save_btn = QPushButton(tr("common.save"))
        save_btn.setObjectName("PrimaryButton")
        save_btn.clicked.connect(self._save)
        footer.addWidget(save_btn)
        root.addLayout(footer)

        controller.settings_changed.connect(self._reload)
        self._reload()

    # ---------- Tab: General ----------

    def _build_general_tab(self) -> QWidget:
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(14)

        card, form_layout = _card()
        form = QFormLayout()
        form.setSpacing(10)
        form.setLabelAlignment(Qt.AlignLeft)

        self.cb_autostart = QCheckBox(tr("settings.autostart"))
        self.cb_start_min = QCheckBox(tr("settings.start_minimized"))
        self.cb_tray = QCheckBox(tr("settings.minimize_to_tray"))
        self.cb_auto_connect = QCheckBox(tr("settings.auto_connect"))
        self.cb_auto_reconnect = QCheckBox(tr("settings.auto_reconnect"))
        self.cb_sidebar = QCheckBox(tr("settings.sidebar_collapsed"))
        for cb in (
            self.cb_autostart,
            self.cb_start_min,
            self.cb_tray,
            self.cb_auto_connect,
            self.cb_auto_reconnect,
            self.cb_sidebar,
        ):
            form.addRow("", cb)

        self.cb_system_proxy = QCheckBox(tr("settings.system_proxy"))
        self.cb_allow_lan = QCheckBox(tr("settings.allow_lan"))
        form.addRow("", self.cb_system_proxy)
        form.addRow("", self.cb_allow_lan)

        self.combo_lang = QComboBox()
        self.combo_lang.addItem("Русский", "ru")
        self.combo_lang.addItem("English", "en")
        form.addRow(tr("settings.language") + ":", self.combo_lang)

        form_layout.addLayout(form)
        layout.addWidget(card)
        layout.addStretch()
        return tab

    # ---------- Tab: Network ----------

    def _build_network_tab(self) -> QWidget:
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(14)

        card, card_layout = _card()
        form = QFormLayout()
        form.setSpacing(10)

        self.sb_socks = QSpinBox()
        self.sb_socks.setRange(1024, 65535)
        self.sb_http = QSpinBox()
        self.sb_http.setRange(1024, 65535)
        self.sb_api = QSpinBox()
        self.sb_api.setRange(1024, 65535)

        form.addRow(tr("settings.socks_port") + ":", self.sb_socks)
        form.addRow(tr("settings.http_port") + ":", self.sb_http)
        form.addRow(tr("settings.api_port") + ":", self.sb_api)

        self.combo_dns = QComboBox()
        for key, label_key in DNS_MODES:
            self.combo_dns.addItem(tr(label_key), key)
        self.combo_dns.currentIndexChanged.connect(self._dns_mode_changed)
        form.addRow(tr("settings.dns") + ":", self.combo_dns)

        card_layout.addLayout(form)
        self.dns_custom_label = QLabel(tr("settings.custom_dns"))
        self.dns_custom = QPlainTextEdit()
        self.dns_custom.setPlaceholderText("1.1.1.1\n8.8.8.8")
        self.dns_custom.setFixedHeight(80)
        card_layout.addWidget(self.dns_custom_label)
        card_layout.addWidget(self.dns_custom)
        layout.addWidget(card)
        layout.addStretch()
        return tab

    # ---------- Tab: Advanced ----------

    def _build_advanced_tab(self) -> QWidget:
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(14)

        # Kill Switch
        ks_card, ks_layout = _card("settings.kill_switch")
        self.cb_kill_switch = QCheckBox(tr("settings.kill_switch"))
        ks_hint = QLabel(tr("settings.kill_switch.hint"))
        ks_hint.setObjectName("CardSubtitle")
        ks_hint.setWordWrap(True)
        ks_layout.addWidget(ks_hint)
        ks_layout.addWidget(self.cb_kill_switch)
        layout.addWidget(ks_card)

        # MUX
        mux_card, mux_layout = _card("settings.mux")
        mux_hint = QLabel(tr("settings.mux.hint"))
        mux_hint.setObjectName("CardSubtitle")
        mux_hint.setWordWrap(True)
        mux_layout.addWidget(mux_hint)
        self.cb_mux = QCheckBox(tr("settings.mux"))
        mux_form = QFormLayout()
        self.sb_mux_conc = QSpinBox()
        self.sb_mux_conc.setRange(1, 64)
        mux_form.addRow(tr("settings.mux_concurrency") + ":", self.sb_mux_conc)
        mux_layout.addWidget(self.cb_mux)
        mux_layout.addLayout(mux_form)
        layout.addWidget(mux_card)

        layout.addStretch()
        return tab

    # ---------- Data binding ----------

    def _reload(self) -> None:
        s = self._controller.settings

        self.cb_autostart.setChecked(s.autostart)
        self.cb_start_min.setChecked(s.start_minimized)
        self.cb_tray.setChecked(s.minimize_to_tray)
        self.cb_auto_connect.setChecked(s.auto_connect)
        self.cb_auto_reconnect.setChecked(s.auto_reconnect)
        self.cb_sidebar.setChecked(s.sidebar_collapsed)
        self.cb_system_proxy.setChecked(s.system_proxy_on_connect)
        self.cb_allow_lan.setChecked(s.allow_lan)
        lang_idx = self.combo_lang.findData(s.language)
        if lang_idx >= 0:
            self.combo_lang.setCurrentIndex(lang_idx)

        self.sb_socks.setValue(s.socks_port)
        self.sb_http.setValue(s.http_port)
        self.sb_api.setValue(s.api_port)

        idx = next((i for i, (k, _) in enumerate(DNS_MODES) if k == s.dns_mode), 0)
        self.combo_dns.setCurrentIndex(idx)
        self.dns_custom.setPlainText("\n".join(s.custom_dns))
        self._dns_mode_changed(self.combo_dns.currentIndex())

        self.cb_kill_switch.setChecked(s.enable_kill_switch)
        self.cb_mux.setChecked(s.enable_mux)
        self.sb_mux_conc.setValue(max(1, s.mux_concurrency))

    def _dns_mode_changed(self, idx: int) -> None:
        key = self.combo_dns.itemData(idx)
        is_custom = key == "custom"
        self.dns_custom_label.setEnabled(is_custom)
        self.dns_custom.setEnabled(is_custom)

    def _save(self) -> None:
        s = self._controller.settings
        s.autostart = self.cb_autostart.isChecked()
        s.start_minimized = self.cb_start_min.isChecked()
        s.minimize_to_tray = self.cb_tray.isChecked()
        s.auto_connect = self.cb_auto_connect.isChecked()
        s.auto_reconnect = self.cb_auto_reconnect.isChecked()
        s.sidebar_collapsed = self.cb_sidebar.isChecked()
        s.system_proxy_on_connect = self.cb_system_proxy.isChecked()
        s.allow_lan = self.cb_allow_lan.isChecked()
        new_lang = self.combo_lang.currentData() or "ru"
        lang_changed = new_lang != s.language
        s.language = new_lang

        s.socks_port = int(self.sb_socks.value())
        s.http_port = int(self.sb_http.value())
        s.api_port = int(self.sb_api.value())
        s.dns_mode = self.combo_dns.currentData() or "system"
        s.custom_dns = [
            line.strip()
            for line in self.dns_custom.toPlainText().splitlines()
            if line.strip()
        ]

        s.enable_kill_switch = self.cb_kill_switch.isChecked()
        s.enable_mux = self.cb_mux.isChecked()
        s.mux_concurrency = int(self.sb_mux_conc.value())

        self._controller.save_settings()
        self._controller.apply_system_settings()
        if lang_changed:
            from byrds_vpn.i18n import set_language

            set_language(new_lang)
