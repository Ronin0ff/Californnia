# by RDS VPN

**Профессиональный Windows-клиент для VPN-ссылок VLESS / VMess / Trojan**
на базе [Xray-core](https://github.com/XTLS/Xray-core), с тёмным дизайном
в стиле *Nightfall* и полной поддержкой русского языка.

![by RDS VPN — dashboard](docs/screenshots/dashboard.png)

---

## Ключевые возможности

### Протоколы и транспорт
- **VLESS** — REALITY, XTLS-Vision, TLS, WS, gRPC, TCP, H2
- **VMess** — стандартные v2rayN base64-ссылки, TLS/none, все транспорты
- **Trojan** — TLS и REALITY
- Полный разбор URI: `sni`, `pbk`, `sid`, `spx`, `fp`, `flow`, `alpn`, `path`, `host`, `serviceName` и др.

### Управление серверами
- Импорт: вставка из буфера, `.txt`-файлы, HTTP(S)-подписки (включая base64)
- Авто-дедупликация по `(протокол, адрес, порт, UUID/password)`
- Поиск, группировка, избранное, тэги
- Контекстное меню: редактировать, удалить, копировать ссылку, дублировать
- Экспорт всех серверов в `.txt`

### Диагностика
- **TCP-пинг** всех серверов параллельно (50 потоков)
- **Тест скорости** загрузки через активный SOCKS5-прокси (Cloudflare Speed endpoint)
- **История метрик**: real-time график трафика + буфер ping (60 точек)
- Лог-терминал с цветовой подсветкой уровней + экспорт

### Маршрутизация
- Белый список (Direct) — домены и IP обходят VPN
- Чёрный список (Block) — полностью блокируются
- Proxy-домены — принудительно через VPN
- Наборы `geosite:*` (ru / cn / private / category-ads-all)
- Наборы `geoip:*` (private, cn, ru)
- **Split Tunneling по процессам** (Windows, через routing + WFP-совместимый маркер)
- Режимы маршрутизации: обычный, Gaming (низкая латентность), Streaming, Bypass-China

### Защита
- **Kill Switch** — автоматически блокирует всё, кроме Xray, через Windows Firewall
- **Auto-reconnect** — восстановление соединения при обрыве
- **DNS Leak Protection** — DNS-запросы внутри туннеля (system / Cloudflare / AdGuard / Google / custom DoH)
- **MUX** — мультиплексирование потоков (настраиваемая concurrency)

### Интеграция с Windows
- Автозапуск при старте системы (через `HKCU\...\Run`)
- Системный прокси Windows (WinINet: SOCKS/HTTP)
- Иконка в трее с меню подключения
- Сворачивание в трей при закрытии
- Запуск в свёрнутом виде (`--minimized`)

### Дизайн
- Полностью тёмная палитра **Nightfall**: глубокий сине-чёрный фон, акцент *royal violet* `#7C5CFF`
- Собственный логотип (QPainter-рендер, без внешних изображений)
- Анимированная power-кнопка с пульсацией при подключении
- Сворачиваемая боковая панель (rail-mode)
- Полностью русский интерфейс (+ английская локаль)

---

## Установка (пользователь)

Скачайте готовый `byRDS-VPN.exe` из раздела [Releases](../../releases) — он уже содержит `xray.exe`, `geoip.dat`, `geosite.dat`.

## Сборка `.exe` (Windows)

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
python scripts/download_xray.py          # скачивает xray.exe + geo*.dat в vendor/
pyinstaller --clean --noconfirm byrds.spec
# результат: dist\byRDS-VPN\byRDS-VPN.exe
```

## Разработка (Linux / macOS / Windows)

```bash
python -m venv .venv
source .venv/bin/activate        # на Windows: .venv\Scripts\activate
pip install -e ".[dev]"
pytest                            # юнит-тесты (парсеры, config-builder, storage)
ruff check .                      # линтер
python -m byrds_vpn               # UI (Qt)
```

На не-Windows системах Windows-specific функции (system proxy, autostart, kill switch) автоматически отключаются — для разработки и тестов UI это не проблема.

---

## Архитектура

```
byrds_vpn/
├── app.py, __main__.py          — точка входа
├── core/
│   ├── models.py                — Profile, StreamSettings, Settings (dataclass)
│   ├── parsers/{vless,vmess,trojan}.py
│   ├── config_builder.py        — Profile + Settings → Xray JSON
│   ├── xray_manager.py          — запуск / остановка subprocess
│   ├── storage.py               — profiles.json / settings.json (атомарные записи)
│   ├── subscription.py          — импорт из текста / файла / URL
│   ├── ping.py, speedtest.py
│   ├── autostart.py, system_proxy.py, kill_switch.py  — Windows-интеграция
│   ├── logs.py                  — буфер + экспорт
│   └── controller.py            — связывает UI <-> core
├── ui/
│   ├── theme.py                 — палитра Nightfall + Qt stylesheet
│   ├── icons.py                 — QPainter-рендер логотипа / иконок
│   ├── main_window.py           — QMainWindow + трей
│   ├── pages/{dashboard,servers,routing,settings,logs,about}.py
│   └── widgets/{power_toggle,traffic_chart,sidebar,topbar,metric_card,dialogs}.py
└── i18n/                        — ru / en

tests/                           — pytest (парсеры, config_builder, subscription, storage)
scripts/download_xray.py         — CI: скачивает xray + geo-assets
.github/workflows/               — ci.yml (Linux tests), windows-build.yml (PyInstaller)
byrds.spec                       — PyInstaller (onedir)
```

---

## Лицензия

[MIT](LICENSE). by RDS · 2026.
