"""Страница управления серверами: список, импорт, ping, speedtest."""

from __future__ import annotations

from PySide6.QtCore import QPoint, Qt, Signal
from PySide6.QtGui import QAction
from PySide6.QtWidgets import (
    QAbstractItemView,
    QFileDialog,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QMenu,
    QMessageBox,
    QPushButton,
    QTableWidget,
    QTableWidgetItem,
    QToolButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.core.controller import AppController
from byrds_vpn.core.models import Profile
from byrds_vpn.core.ping import ping_many, ping_profile
from byrds_vpn.core.subscription import (
    fetch_subscription,
    import_file,
    import_text,
)
from byrds_vpn.i18n import tr
from byrds_vpn.ui.theme import PALETTE
from byrds_vpn.ui.widgets.dialogs import (
    ImportSubscriptionDialog,
    ImportTextDialog,
    show_import_result,
)

COLUMNS = [
    ("servers.col.status", 32),
    ("servers.col.name", 240),
    ("servers.col.protocol", 90),
    ("servers.col.address", 220),
    ("servers.col.ping", 100),
    ("servers.col.speed", 100),
    ("servers.col.security", 90),
]


class ServersPage(QWidget):
    activate_requested = Signal(str)

    def __init__(self, controller: AppController, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self._controller = controller
        self._filter_text = ""

        root = QVBoxLayout(self)
        root.setContentsMargins(36, 28, 36, 28)
        root.setSpacing(16)

        # Заголовок
        title = QLabel(tr("servers.title"))
        title.setObjectName("SectionTitle")
        root.addWidget(title)

        # Тулбар
        toolbar = QHBoxLayout()
        toolbar.setSpacing(10)

        self.search = QLineEdit()
        self.search.setPlaceholderText(tr("servers.search"))
        self.search.textChanged.connect(self._on_filter)
        toolbar.addWidget(self.search, 1)

        self.count_label = QLabel()
        self.count_label.setObjectName("LabelCaps")
        toolbar.addWidget(self.count_label)

        self.btn_ping_all = QPushButton("◐  " + tr("servers.test_all"))
        self.btn_ping_all.setCursor(Qt.PointingHandCursor)
        self.btn_ping_all.clicked.connect(self._ping_all)
        toolbar.addWidget(self.btn_ping_all)

        self.btn_import = QToolButton()
        self.btn_import.setText("↓  " + tr("servers.import"))
        self.btn_import.setPopupMode(QToolButton.InstantPopup)
        self.btn_import.setCursor(Qt.PointingHandCursor)
        self.btn_import.setStyleSheet(
            f"QToolButton {{ padding: 8px 16px; background: {PALETTE.accent}; "
            f"color: {PALETTE.bg_deep}; border: 1px solid {PALETTE.accent}; "
            f"border-radius: 6px; font-weight: 600; }} "
            f"QToolButton:hover {{ background: {PALETTE.accent_glow}; }} "
            f"QToolButton::menu-indicator {{ image: none; width: 0; }}"
        )
        menu = QMenu(self.btn_import)
        menu.addAction(tr("servers.import_text"), self._import_paste)
        menu.addAction(tr("servers.import_clipboard"), self._import_clipboard)
        menu.addAction(tr("servers.import_file"), self._import_file)
        menu.addAction(tr("servers.import_subscription"), self._import_subscription)
        self.btn_import.setMenu(menu)
        toolbar.addWidget(self.btn_import)

        self.btn_export = QPushButton("↑  " + tr("servers.export"))
        self.btn_export.setObjectName("GhostButton")
        self.btn_export.clicked.connect(self._export)
        self.btn_export.setCursor(Qt.PointingHandCursor)
        toolbar.addWidget(self.btn_export)

        self.btn_clear = QPushButton(tr("servers.clear_all"))
        self.btn_clear.setObjectName("DangerButton")
        self.btn_clear.clicked.connect(self._clear_all)
        self.btn_clear.setCursor(Qt.PointingHandCursor)
        toolbar.addWidget(self.btn_clear)

        root.addLayout(toolbar)

        # Таблица
        self.table = QTableWidget(0, len(COLUMNS))
        self.table.setHorizontalHeaderLabels([tr(k) for k, _ in COLUMNS])
        self.table.verticalHeader().setVisible(False)
        self.table.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SingleSelection)
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.table.setContextMenuPolicy(Qt.CustomContextMenu)
        self.table.customContextMenuRequested.connect(self._on_context)
        self.table.doubleClicked.connect(self._on_double_click)

        header = self.table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.Interactive)
        for i, (_, width) in enumerate(COLUMNS):
            self.table.setColumnWidth(i, width)
        header.setStretchLastSection(True)
        self.table.setAlternatingRowColors(False)

        root.addWidget(self.table, 1)

        controller.profiles_changed.connect(self._refresh)
        controller.settings_changed.connect(self._refresh)
        controller.ping_updated.connect(self._on_ping_updated)
        self._refresh()

    # ---------- refresh ----------

    def _refresh(self) -> None:
        profiles = list(self._controller.profiles)
        active_id = self._controller.settings.active_profile_id

        if self._filter_text:
            q = self._filter_text.lower()
            profiles = [
                p
                for p in profiles
                if q in p.address.lower()
                or q in p.remark.lower()
                or q in p.protocol.lower()
                or q in p.stream.sni.lower()
            ]

        self.count_label.setText(tr("servers.count", n=len(profiles)))
        self.table.setRowCount(len(profiles))
        for row, p in enumerate(profiles):
            self._fill_row(row, p, active_id)

    def _fill_row(self, row: int, p: Profile, active_id: str) -> None:
        active = p.id == active_id

        # Col 0: status dot / favorite star
        parts = []
        if active:
            parts.append("●")
        if p.favorite:
            parts.append("★")
        status = QTableWidgetItem("  ".join(parts))
        status.setTextAlignment(Qt.AlignCenter)
        if active:
            status.setForeground(Qt.GlobalColor.green)
        self.table.setItem(row, 0, status)

        # Col 1: name
        name_item = QTableWidgetItem(p.short_label())
        if active:
            font = name_item.font()
            font.setBold(True)
            name_item.setFont(font)
        name_item.setData(Qt.UserRole, p.id)
        self.table.setItem(row, 1, name_item)

        # Col 2: protocol
        prot_item = QTableWidgetItem(p.protocol.upper())
        prot_item.setTextAlignment(Qt.AlignCenter)
        self.table.setItem(row, 2, prot_item)

        # Col 3: address
        self.table.setItem(row, 3, QTableWidgetItem(f"{p.address}:{p.port}"))

        # Col 4: ping
        ping_text = f"{p.last_ping_ms}" if p.last_ping_ms is not None else "—"
        ping_item = QTableWidgetItem(ping_text)
        ping_item.setTextAlignment(Qt.AlignCenter)
        self.table.setItem(row, 4, ping_item)

        # Col 5: speed
        speed_text = f"{p.last_speed_mbps:.1f}" if p.last_speed_mbps else "—"
        speed_item = QTableWidgetItem(speed_text)
        speed_item.setTextAlignment(Qt.AlignCenter)
        self.table.setItem(row, 5, speed_item)

        # Col 6: security (tls, reality...)
        sec_item = QTableWidgetItem(p.stream.security.upper() if p.stream.security != "none" else "—")
        sec_item.setTextAlignment(Qt.AlignCenter)
        self.table.setItem(row, 6, sec_item)

    def _on_filter(self, text: str) -> None:
        self._filter_text = text.strip()
        self._refresh()

    def _selected_profile(self) -> Profile | None:
        row = self.table.currentRow()
        if row < 0:
            return None
        item = self.table.item(row, 1)
        if item is None:
            return None
        pid = item.data(Qt.UserRole)
        return next((p for p in self._controller.profiles if p.id == pid), None)

    # ---------- actions ----------

    def _on_double_click(self) -> None:
        prof = self._selected_profile()
        if prof is not None:
            self._controller.set_active_profile(prof.id)

    def _on_context(self, pos: QPoint) -> None:
        prof = self._selected_profile()
        if prof is None:
            return
        menu = QMenu(self)
        act_activate = QAction(tr("servers.ctx.activate"), self)
        act_activate.triggered.connect(lambda: self._controller.set_active_profile(prof.id))
        menu.addAction(act_activate)

        fav_label = "servers.ctx.unfavorite" if prof.favorite else "servers.ctx.favorite"
        act_fav = QAction(tr(fav_label), self)
        act_fav.triggered.connect(lambda: self._controller.toggle_favorite(prof.id))
        menu.addAction(act_fav)

        act_copy = QAction(tr("servers.ctx.copy_uri"), self)
        act_copy.triggered.connect(lambda: self._copy_uri(prof))
        menu.addAction(act_copy)

        menu.addSeparator()
        act_ping = QAction(tr("servers.ctx.test_ping"), self)
        act_ping.triggered.connect(lambda: self._ping_single(prof))
        menu.addAction(act_ping)

        menu.addSeparator()
        act_del = QAction(tr("servers.ctx.delete"), self)
        act_del.triggered.connect(lambda: self._controller.remove_profile(prof.id))
        menu.addAction(act_del)

        menu.exec(self.table.viewport().mapToGlobal(pos))

    def _copy_uri(self, prof: Profile) -> None:
        from PySide6.QtWidgets import QApplication

        QApplication.clipboard().setText(prof.source_uri or "")

    def _ping_single(self, prof: Profile) -> None:
        self._controller.run_async(
            lambda: ping_profile(prof, timeout=3.0),
            lambda res: self._controller.update_ping(prof.id, res if isinstance(res, int) else None),
        )

    def _ping_all(self) -> None:
        profiles = list(self._controller.profiles)
        if not profiles:
            return
        self.btn_ping_all.setEnabled(False)

        def worker() -> dict[str, int | None]:
            return ping_many(profiles, timeout=3.0, workers=30)

        def done(result: object) -> None:
            self.btn_ping_all.setEnabled(True)
            if isinstance(result, Exception):
                return
            if not isinstance(result, dict):
                return
            for pid, ms in result.items():
                self._controller.update_ping(pid, ms)

        self._controller.run_async(worker, done)

    def _on_ping_updated(self, _pid: str, _ms) -> None:
        self._refresh()

    # ---------- импорт / экспорт ----------

    def _handle_import_result(
        self, profiles: list[Profile], errors: list[tuple[str, str]]
    ) -> None:
        added = self._controller.add_profiles(profiles)
        show_import_result(self, added, errors)

    def _import_paste(self) -> None:
        dlg = ImportTextDialog(self)
        if dlg.exec() != ImportTextDialog.Accepted:
            return
        text = dlg.text()
        if not text.strip():
            return
        profiles, errors = import_text(text)
        self._handle_import_result(profiles, errors)

    def _import_clipboard(self) -> None:
        from PySide6.QtWidgets import QApplication

        text = QApplication.clipboard().text()
        if not text.strip():
            QMessageBox.warning(self, tr("servers.import"), tr("error.empty_input"))
            return
        profiles, errors = import_text(text)
        self._handle_import_result(profiles, errors)

    def _import_file(self) -> None:
        path, _ = QFileDialog.getOpenFileName(
            self,
            tr("servers.import_file"),
            "",
            "Text files (*.txt *.csv *.urls);;All files (*)",
        )
        if not path:
            return
        try:
            profiles, errors = import_file(path)
        except OSError as exc:
            QMessageBox.critical(
                self, tr("servers.import"), tr("error.import_failed", msg=str(exc))
            )
            return
        self._handle_import_result(profiles, errors)

    def _import_subscription(self) -> None:
        dlg = ImportSubscriptionDialog(self)
        if dlg.exec() != ImportSubscriptionDialog.Accepted:
            return
        url = dlg.url()
        if not url:
            QMessageBox.warning(self, tr("servers.import"), tr("error.invalid_url"))
            return
        self.btn_import.setEnabled(False)

        def worker() -> tuple[list[Profile], list[tuple[str, str]]]:
            return fetch_subscription(url)

        def done(res: object) -> None:
            self.btn_import.setEnabled(True)
            if isinstance(res, Exception):
                QMessageBox.critical(
                    self, tr("servers.import"), tr("error.import_failed", msg=str(res))
                )
                return
            profiles, errors = res  # type: ignore[misc]
            self._handle_import_result(profiles, errors)

        self._controller.run_async(worker, done)

    def _export(self) -> None:
        if not self._controller.profiles:
            return
        path, _ = QFileDialog.getSaveFileName(
            self, tr("servers.export"), "byrds-servers.txt", "Text files (*.txt)"
        )
        if not path:
            return
        from byrds_vpn.core.subscription import export_profiles

        try:
            with open(path, "w", encoding="utf-8") as fp:
                fp.write(export_profiles(self._controller.profiles))
        except OSError as exc:
            QMessageBox.critical(
                self, tr("servers.export"), tr("error.import_failed", msg=str(exc))
            )

    def _clear_all(self) -> None:
        if not self._controller.profiles:
            return
        btn = QMessageBox.question(
            self,
            tr("servers.clear_all"),
            tr("servers.clear_confirm"),
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )
        if btn == QMessageBox.Yes:
            self._controller.clear_profiles()
