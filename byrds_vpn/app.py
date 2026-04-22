"""Точка входа приложения ``by RDS VPN``."""

from __future__ import annotations

import argparse
import logging
import signal
import sys

from PySide6.QtCore import QCoreApplication, Qt
from PySide6.QtWidgets import QApplication

from byrds_vpn import __app_id__, __brand__
from byrds_vpn.core.controller import AppController
from byrds_vpn.core.storage import Storage
from byrds_vpn.i18n import set_language
from byrds_vpn.ui.icons import app_icon
from byrds_vpn.ui.main_window import MainWindow
from byrds_vpn.ui.theme import qss

log = logging.getLogger(__name__)


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="byrds-vpn", description=__brand__)
    parser.add_argument("--minimized", action="store_true", help="запустить свёрнутым")
    parser.add_argument(
        "--data-dir",
        default=None,
        help="папка данных (по умолчанию %%APPDATA%%/byRDS-VPN)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    _configure_logging()
    args = _parse_args(sys.argv[1:] if argv is None else argv)

    QCoreApplication.setApplicationName(__app_id__)
    QCoreApplication.setOrganizationName("RDS")
    QCoreApplication.setApplicationVersion("1.0.0")
    try:
        QApplication.setAttribute(Qt.AA_EnableHighDpiScaling)
        QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps)
    except AttributeError:  # pragma: no cover — старые версии Qt
        pass

    app = QApplication(sys.argv if argv is None else argv)
    app.setApplicationDisplayName(__brand__)
    app.setWindowIcon(app_icon())
    app.setStyleSheet(qss())

    storage = Storage(args.data_dir) if args.data_dir else Storage()
    controller = AppController(storage)
    set_language(controller.settings.language or "ru")

    # Ctrl+C в консоли (dev-режим)
    signal.signal(signal.SIGINT, lambda *_: app.quit())

    window = MainWindow(controller)
    controller.apply_system_settings()

    if args.minimized or controller.settings.start_minimized:
        window.showMinimized()
        if controller.settings.minimize_to_tray and window.tray is not None:
            window.hide()
    else:
        window.show()

    if controller.settings.auto_connect and controller.active_profile is not None:
        controller.connect()

    exit_code = app.exec()
    controller.shutdown()
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
