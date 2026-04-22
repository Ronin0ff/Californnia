"""Основные страницы интерфейса by RDS VPN."""

from byrds_vpn.ui.pages.about import AboutPage
from byrds_vpn.ui.pages.dashboard import DashboardPage
from byrds_vpn.ui.pages.logs import LogsPage
from byrds_vpn.ui.pages.routing import RoutingPage
from byrds_vpn.ui.pages.servers import ServersPage
from byrds_vpn.ui.pages.settings import SettingsPage

__all__ = [
    "AboutPage",
    "DashboardPage",
    "LogsPage",
    "RoutingPage",
    "ServersPage",
    "SettingsPage",
]
