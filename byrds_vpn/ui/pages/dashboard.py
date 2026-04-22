"""Главная страница: управление подключением, активный сервер, метрики."""

from __future__ import annotations

import time

from PySide6.QtCore import Qt, QTimer, Signal
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.core.controller import AppController
from byrds_vpn.i18n import tr
from byrds_vpn.ui.theme import PALETTE
from byrds_vpn.ui.widgets.metric_card import MetricCard
from byrds_vpn.ui.widgets.power_toggle import PowerToggle
from byrds_vpn.ui.widgets.traffic_chart import TrafficChart


class DashboardPage(QWidget):
    nav_servers_requested = Signal()

    def __init__(self, controller: AppController, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._controller = controller
        self._session_start: float | None = None

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 28, 36, 28)
        root.setSpacing(18)

        # Заголовок страницы
        title_row = QVBoxLayout()
        title_row.setSpacing(2)
        title = QLabel(tr("dashboard.title"))
        title.setObjectName("SectionTitle")
        subtitle = QLabel(tr("dashboard.subtitle"))
        subtitle.setObjectName("SectionSubtitle")
        title_row.addWidget(title)
        title_row.addWidget(subtitle)
        root.addLayout(title_row)

        # Главная карточка: кнопка + статус + активный сервер
        top_card = QFrame()
        top_card.setObjectName("CardAccent")
        top_layout = QHBoxLayout(top_card)
        top_layout.setContentsMargins(30, 26, 30, 26)
        top_layout.setSpacing(30)

        # Левая колонка: кнопка power
        left = QVBoxLayout()
        left.setSpacing(14)
        left.setAlignment(Qt.AlignCenter)
        self.power = PowerToggle()
        self.power.clicked.connect(self._on_power_clicked)
        left.addWidget(self.power, 0, Qt.AlignHCenter)

        self.power_state_label = QLabel(tr("dashboard.disconnected"))
        self.power_state_label.setObjectName("PowerState")
        self.power_state_label.setAlignment(Qt.AlignCenter)
        left.addWidget(self.power_state_label)

        self.power_hint_label = QLabel(tr("dashboard.press_connect"))
        self.power_hint_label.setObjectName("PowerHint")
        self.power_hint_label.setAlignment(Qt.AlignCenter)
        left.addWidget(self.power_hint_label)
        top_layout.addLayout(left)

        # Правая колонка: active node card + info table
        right = QVBoxLayout()
        right.setSpacing(14)
        right.setAlignment(Qt.AlignVCenter)

        node_card = QFrame()
        node_card.setObjectName("CardMuted")
        node_layout = QVBoxLayout(node_card)
        node_layout.setContentsMargins(18, 14, 18, 14)
        node_layout.setSpacing(6)
        node_head = QHBoxLayout()
        node_caption = QLabel(tr("dashboard.selected_node"))
        node_caption.setObjectName("LabelCaps")
        node_head.addWidget(node_caption)
        node_head.addStretch()
        change_btn = QPushButton(tr("dashboard.change"))
        change_btn.setObjectName("GhostButton")
        change_btn.setCursor(Qt.PointingHandCursor)
        change_btn.clicked.connect(self.nav_servers_requested.emit)
        node_head.addWidget(change_btn)
        node_layout.addLayout(node_head)

        self.node_title = QLabel(tr("dashboard.no_node"))
        self.node_title.setObjectName("CardTitle")
        node_layout.addWidget(self.node_title)

        grid = QGridLayout()
        grid.setColumnStretch(1, 1)
        grid.setHorizontalSpacing(14)
        grid.setVerticalSpacing(6)

        row_labels = [
            ("dashboard.target_ip", "—"),
            ("dashboard.protocol", "—"),
            ("dashboard.session_time", "00:00:00"),
        ]
        self._info_values: dict[str, QLabel] = {}
        for i, (key, default) in enumerate(row_labels):
            caption = QLabel(tr(key))
            caption.setObjectName("LabelCaps")
            value = QLabel(default)
            value.setObjectName("MonoData")
            grid.addWidget(caption, i, 0)
            grid.addWidget(value, i, 1)
            self._info_values[key] = value
        node_layout.addLayout(grid)
        right.addWidget(node_card)

        top_layout.addLayout(right, 1)
        root.addWidget(top_card)

        # Метрики row
        metrics_row = QHBoxLayout()
        metrics_row.setSpacing(14)
        self.metric_down = MetricCard("▼", tr("dashboard.downlink"))
        self.metric_up = MetricCard("▲", tr("dashboard.uplink"))
        self.metric_ping = MetricCard("◐", tr("dashboard.ping"), unit="мс")
        metrics_row.addWidget(self.metric_down)
        metrics_row.addWidget(self.metric_up)
        metrics_row.addWidget(self.metric_ping)
        root.addLayout(metrics_row)

        # График
        self.chart = TrafficChart()
        root.addWidget(self.chart, 1)

        # Таймер uptime
        self._uptime_timer = QTimer(self)
        self._uptime_timer.setInterval(1000)
        self._uptime_timer.timeout.connect(self._refresh_uptime)

        # Контроллер -> UI
        controller.state_changed.connect(self._on_state)
        controller.metrics_sampled.connect(self._on_metrics)
        controller.profiles_changed.connect(self._refresh_active_profile)
        controller.settings_changed.connect(self._refresh_active_profile)

        self._refresh_active_profile()
        self._on_state(controller.state)

    # ---------- обработчики ----------

    def _on_power_clicked(self) -> None:
        self._controller.toggle()

    def _on_state(self, state: str) -> None:
        if state == "connected":
            self.power.set_state("on")
            self.power_state_label.setText(tr("dashboard.connected"))
            self.power_hint_label.setText(tr("dashboard.press_disconnect"))
            if self._session_start is None:
                self._session_start = time.monotonic()
                self._uptime_timer.start()
        elif state == "connecting":
            self.power.set_state("connecting")
            self.power_state_label.setText(tr("topbar.state.connecting"))
            self.power_hint_label.setText("")
        elif state == "error":
            self.power.set_state("off")
            self.power_state_label.setText(tr("topbar.state.error"))
            self.power_hint_label.setText("")
            self._uptime_timer.stop()
            self._session_start = None
        else:
            self.power.set_state("off")
            self.power_state_label.setText(tr("dashboard.disconnected"))
            self.power_hint_label.setText(tr("dashboard.press_connect"))
            self._uptime_timer.stop()
            self._session_start = None
            self._info_values["dashboard.session_time"].setText("00:00:00")
            self.metric_down.setValue(0, False)
            self.metric_up.setValue(0, False)
            self.metric_ping.setValue(0, False)
            self.chart.clear()
            self.chart.set_ping(None)

    def _on_metrics(self, down_mbps: float, up_mbps: float, ping_ms: int) -> None:
        self.metric_down.setValue(down_mbps, True)
        self.metric_up.setValue(up_mbps, True)
        self.metric_ping.setValue(float(ping_ms), True)
        self.chart.push(down_mbps, up_mbps)
        self.chart.set_ping(ping_ms if ping_ms > 0 else None)

    def _refresh_active_profile(self) -> None:
        prof = self._controller.active_profile
        if prof is None:
            self.node_title.setText(tr("dashboard.no_node"))
            self._info_values["dashboard.target_ip"].setText("—")
            self._info_values["dashboard.protocol"].setText("—")
            self.node_title.setStyleSheet(f"color: {PALETTE.text_muted};")
            return
        self.node_title.setText(prof.short_label())
        self.node_title.setStyleSheet("")
        self._info_values["dashboard.target_ip"].setText(f"{prof.address}:{prof.port}")
        sec = prof.stream.security if prof.stream.security != "none" else "—"
        self._info_values["dashboard.protocol"].setText(
            f"{prof.protocol.upper()} / {prof.stream.network.upper()} / {sec.upper()}"
        )

    def _refresh_uptime(self) -> None:
        if self._session_start is None:
            self._info_values["dashboard.session_time"].setText("00:00:00")
            return
        total = int(time.monotonic() - self._session_start)
        h, rem = divmod(total, 3600)
        m, s = divmod(rem, 60)
        self._info_values["dashboard.session_time"].setText(
            tr("dashboard.uptime", h=h, m=m, s=s)
        )
