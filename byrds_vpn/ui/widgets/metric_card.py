"""Карточка метрики: большое значение, единица, подпись."""

from __future__ import annotations

from PySide6.QtWidgets import QFrame, QHBoxLayout, QLabel, QVBoxLayout

from byrds_vpn.ui.theme import PALETTE


class MetricCard(QFrame):
    """Карточка-контейнер для большого числового значения."""

    def __init__(self, icon: str, caption: str, unit: str = "Мбит/с", parent=None) -> None:
        super().__init__(parent)
        self.setObjectName("Card")
        self._active = False

        root = QVBoxLayout(self)
        root.setContentsMargins(18, 16, 18, 16)
        root.setSpacing(6)

        top = QHBoxLayout()
        top.setSpacing(8)
        self._icon = QLabel(icon)
        self._icon.setStyleSheet(
            f"color: {PALETTE.text_muted}; font-size: 16px; font-weight: 700;"
        )
        self._caption = QLabel(caption)
        self._caption.setObjectName("LabelCaps")
        top.addWidget(self._icon)
        top.addWidget(self._caption)
        top.addStretch()
        root.addLayout(top)

        value_row = QHBoxLayout()
        value_row.setSpacing(6)
        value_row.setContentsMargins(0, 4, 0, 0)
        self._value = QLabel("0.0")
        self._value.setObjectName("BigMetricDim")
        self._unit = QLabel(unit)
        self._unit.setObjectName("MetricUnit")
        value_row.addWidget(self._value)
        value_row.addWidget(self._unit)
        value_row.addStretch()
        root.addLayout(value_row)

    def setValue(self, value: float, active: bool) -> None:  # noqa: N802 — Qt camelCase
        if active != self._active:
            self._active = active
            self._value.setObjectName("BigMetric" if active else "BigMetricDim")
            self._value.style().unpolish(self._value)
            self._value.style().polish(self._value)
        self._value.setText(f"{value:.2f}" if value > 0 else "0.00")
