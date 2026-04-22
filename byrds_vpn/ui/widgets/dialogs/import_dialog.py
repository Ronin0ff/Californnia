"""Диалоги импорта серверов."""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QDialog,
    QDialogButtonBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMessageBox,
    QPlainTextEdit,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from byrds_vpn.i18n import tr


class ImportTextDialog(QDialog):
    """Ввод набора URI-ссылок через textarea."""

    def __init__(self, parent: QWidget | None = None, initial: str = "") -> None:
        super().__init__(parent)
        self.setWindowTitle(tr("import.paste.title"))
        self.setModal(True)
        self.resize(600, 420)

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 20, 24, 20)
        root.setSpacing(12)

        title = QLabel(tr("import.paste.title"))
        title.setObjectName("DialogTitle")
        hint = QLabel(tr("import.paste.hint"))
        hint.setObjectName("DialogHint")
        hint.setWordWrap(True)
        root.addWidget(title)
        root.addWidget(hint)

        self.text_edit = QPlainTextEdit()
        self.text_edit.setPlaceholderText("vless://...\nvmess://...\ntrojan://...")
        if initial:
            self.text_edit.setPlainText(initial)
        root.addWidget(self.text_edit, 1)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.button(QDialogButtonBox.Ok).setObjectName("PrimaryButton")
        buttons.button(QDialogButtonBox.Ok).setText(tr("common.import"))
        buttons.button(QDialogButtonBox.Cancel).setText(tr("common.cancel"))
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        root.addWidget(buttons)

    def text(self) -> str:
        return self.text_edit.toPlainText()


class ImportSubscriptionDialog(QDialog):
    """Ввод URL HTTP(S)-подписки."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setWindowTitle(tr("import.subscription.title"))
        self.setModal(True)
        self.resize(520, 220)

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 20, 24, 20)
        root.setSpacing(10)

        title = QLabel(tr("import.subscription.title"))
        title.setObjectName("DialogTitle")
        hint = QLabel(tr("import.subscription.hint"))
        hint.setObjectName("DialogHint")
        hint.setWordWrap(True)
        root.addWidget(title)
        root.addWidget(hint)

        label = QLabel(tr("import.subscription.url"))
        self.url_edit = QLineEdit()
        self.url_edit.setPlaceholderText("https://example.com/sub")
        root.addWidget(label)
        root.addWidget(self.url_edit)

        row = QHBoxLayout()
        row.addStretch()
        cancel = QPushButton(tr("common.cancel"))
        ok = QPushButton(tr("common.import"))
        ok.setObjectName("PrimaryButton")
        ok.setDefault(True)
        cancel.clicked.connect(self.reject)
        ok.clicked.connect(self.accept)
        row.addWidget(cancel)
        row.addWidget(ok)
        root.addStretch()
        root.addLayout(row)

    def url(self) -> str:
        return self.url_edit.text().strip()


def show_import_result(
    parent: QWidget | None,
    added: int,
    errors: list[tuple[str, str]],
) -> None:
    if added <= 0 and not errors:
        QMessageBox.information(
            parent,
            tr("servers.import"),
            tr("servers.nothing_added"),
        )
        return
    body = tr("servers.added", n=added) + "\n"
    if errors:
        body += "\n" + tr("servers.errors_header") + "\n"
        body += "\n".join(f"• {uri[:60]}... — {msg}" for uri, msg in errors[:8])
        if len(errors) > 8:
            body += f"\n… ещё {len(errors) - 8}"
    box = QMessageBox(parent)
    box.setWindowTitle(tr("servers.import"))
    box.setText(body)
    box.setIcon(QMessageBox.Information if added > 0 else QMessageBox.Warning)
    box.setTextInteractionFlags(Qt.TextSelectableByMouse)
    box.exec()
