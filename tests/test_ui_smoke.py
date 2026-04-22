"""UI-смоук: проверить, что окно создаётся и отображает все страницы (offscreen Qt)."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

pytest.importorskip("PySide6")

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")


@pytest.fixture(scope="module")
def qt_app():
    from PySide6.QtWidgets import QApplication

    app = QApplication.instance() or QApplication([])
    yield app


def test_theme_compiles() -> None:
    from byrds_vpn.ui.theme import qss

    s = qss()
    assert "QMainWindow" in s
    assert "#7C5CFF" in s  # акцентный цвет


def test_logo_pixmap_rendered(qt_app) -> None:
    from byrds_vpn.ui.icons import render_logo_pixmap

    pm = render_logo_pixmap(96)
    assert pm.width() == 96
    assert pm.height() == 96
    assert not pm.isNull()


def test_mainwindow_creates_all_pages(tmp_path: Path, qt_app) -> None:
    from byrds_vpn.core.controller import AppController
    from byrds_vpn.core.storage import Storage
    from byrds_vpn.ui.main_window import PAGE_ORDER, MainWindow

    storage = Storage(tmp_path)
    ctrl = AppController(storage)
    win = MainWindow(ctrl)
    try:
        win.show()
        qt_app.processEvents()
        assert set(win.pages.keys()) == set(PAGE_ORDER)
        # Навигация по всем страницам без ошибок.
        for pid in PAGE_ORDER:
            win._navigate(pid)  # noqa: SLF001 — smoke test
            qt_app.processEvents()
    finally:
        ctrl.shutdown()
        win.close()


def test_import_clipboard_flow(tmp_path: Path, qt_app) -> None:
    from PySide6.QtWidgets import QApplication

    from byrds_vpn.core.controller import AppController
    from byrds_vpn.core.storage import Storage

    ctrl = AppController(Storage(tmp_path))
    sample = (
        "vless://11111111-2222-3333-4444-555555555555@h.example:443"
        "?encryption=none&security=tls&sni=h.example&type=ws&host=h.example&path=%2Fws#ws-tls\n"
        "trojan://secret@tj.example:443?security=tls&sni=tj.example#t"
    )
    QApplication.clipboard().setText(sample)
    from byrds_vpn.core.subscription import import_text

    profiles, _ = import_text(sample)
    assert ctrl.add_profiles(profiles) == 2
    ctrl.shutdown()
