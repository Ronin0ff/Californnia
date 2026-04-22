"""Главное окно приложения (QMainWindow) + трей."""

from __future__ import annotations

import logging

from PySide6.QtCore import QSize
from PySide6.QtGui import QAction, QCloseEvent
from PySide6.QtWidgets import (
    QHBoxLayout,
    QMainWindow,
    QMenu,
    QMessageBox,
    QStackedWidget,
    QSystemTrayIcon,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.core.controller import AppController
from byrds_vpn.i18n import tr
from byrds_vpn.ui.icons import app_icon
from byrds_vpn.ui.pages import (
    AboutPage,
    DashboardPage,
    LogsPage,
    RoutingPage,
    ServersPage,
    SettingsPage,
)
from byrds_vpn.ui.widgets.sidebar import Sidebar
from byrds_vpn.ui.widgets.topbar import TopBar

log = logging.getLogger(__name__)

PAGE_ORDER = ["dashboard", "servers", "routing", "settings", "logs", "about"]


class MainWindow(QMainWindow):
    def __init__(self, controller: AppController) -> None:
        super().__init__()
        self._controller = controller

        self.setWindowTitle(tr("app.brand"))
        self.setWindowIcon(app_icon())
        self.resize(QSize(1200, 780))
        self.setMinimumSize(QSize(960, 620))

        # Центральный контейнер: sidebar + (topbar + stack)
        root = QWidget()
        root.setObjectName("RootWidget")
        root_layout = QHBoxLayout(root)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        self.sidebar = Sidebar(self)
        self.sidebar.navigated.connect(self._navigate)
        self.sidebar.collapsed_changed.connect(self._on_sidebar_collapsed)
        root_layout.addWidget(self.sidebar)

        right_container = QWidget()
        right_layout = QVBoxLayout(right_container)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(0)
        self.topbar = TopBar(self)
        right_layout.addWidget(self.topbar)

        self.stack = QStackedWidget(self)
        self.pages: dict[str, QWidget] = {
            "dashboard": DashboardPage(controller),
            "servers": ServersPage(controller),
            "routing": RoutingPage(controller),
            "settings": SettingsPage(controller),
            "logs": LogsPage(controller),
            "about": AboutPage(),
        }
        for key in PAGE_ORDER:
            self.stack.addWidget(self.pages[key])
        right_layout.addWidget(self.stack, 1)
        root_layout.addWidget(right_container, 1)

        self.setCentralWidget(root)

        # Cross-page
        self.pages["dashboard"].nav_servers_requested.connect(
            lambda: self._navigate("servers")
        )

        # Контроллер
        controller.state_changed.connect(self._on_state_changed)
        controller.error_raised.connect(self._on_error)

        # Трей
        self.tray: QSystemTrayIcon | None = None
        if QSystemTrayIcon.isSystemTrayAvailable():
            self._setup_tray()

        # Начальное состояние
        if controller.settings.sidebar_collapsed:
            self.sidebar.set_collapsed(True)
        self._navigate("dashboard")
        self._on_state_changed(controller.state)

    # ---------- навигация ----------

    def _navigate(self, page_id: str) -> None:
        if page_id not in self.pages:
            return
        idx = PAGE_ORDER.index(page_id)
        self.stack.setCurrentIndex(idx)
        self.sidebar.select(page_id)

    def _on_sidebar_collapsed(self, collapsed: bool) -> None:
        self._controller.settings.sidebar_collapsed = collapsed
        self._controller.save_settings()

    # ---------- state ----------

    def _on_state_changed(self, state: str) -> None:
        mapping = {
            "disconnected": "ready",
            "connecting": "connecting",
            "connected": "online",
            "error": "error",
        }
        self.topbar.set_state(mapping.get(state, "ready"))
        if self.tray is not None:
            tip = tr("app.brand") + " · " + mapping.get(state, "ready")
            self.tray.setToolTip(tip)
            self._sync_tray_actions(state)

    def _on_error(self, key: str) -> None:
        QMessageBox.warning(self, tr("app.brand"), tr(key))

    # ---------- трей ----------

    def _setup_tray(self) -> None:
        self.tray = QSystemTrayIcon(app_icon(), self)
        self.tray.setToolTip(tr("app.brand"))
        menu = QMenu()
        self._tray_show = QAction(tr("tray.show"), self)
        self._tray_show.triggered.connect(self._show_foreground)
        self._tray_connect = QAction(tr("tray.connect"), self)
        self._tray_connect.triggered.connect(self._controller.connect)
        self._tray_disconnect = QAction(tr("tray.disconnect"), self)
        self._tray_disconnect.triggered.connect(self._controller.disconnect)
        self._tray_quit = QAction(tr("tray.quit"), self)
        self._tray_quit.triggered.connect(self._quit_app)

        menu.addAction(self._tray_show)
        menu.addSeparator()
        menu.addAction(self._tray_connect)
        menu.addAction(self._tray_disconnect)
        menu.addSeparator()
        menu.addAction(self._tray_quit)
        self.tray.setContextMenu(menu)
        self.tray.activated.connect(self._on_tray_activated)
        self.tray.show()

    def _sync_tray_actions(self, state: str) -> None:
        if self.tray is None:
            return
        is_on = state in {"connected", "connecting"}
        self._tray_connect.setEnabled(not is_on)
        self._tray_disconnect.setEnabled(is_on)

    def _on_tray_activated(self, reason: QSystemTrayIcon.ActivationReason) -> None:
        if reason in {QSystemTrayIcon.Trigger, QSystemTrayIcon.DoubleClick}:
            self._show_foreground()

    def _show_foreground(self) -> None:
        self.showNormal()
        self.raise_()
        self.activateWindow()

    def _quit_app(self) -> None:
        self._controller.shutdown()
        from PySide6.QtWidgets import QApplication

        QApplication.quit()

    # ---------- close-event ----------

    def closeEvent(self, event: QCloseEvent) -> None:  # noqa: N802
        if self._controller.settings.minimize_to_tray and self.tray is not None:
            self.hide()
            event.ignore()
            return
        self._controller.shutdown()
        super().closeEvent(event)
