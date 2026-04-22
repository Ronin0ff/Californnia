# PyInstaller-спек для сборки by RDS VPN (onedir).
# Использование:
#   python scripts/download_xray.py --platform windows-x86_64
#   pyinstaller --clean --noconfirm byrds.spec

from pathlib import Path

block_cipher = None

project_root = Path(SPEC).parent.resolve()

datas = []
vendor_dir = project_root / "vendor"
if vendor_dir.is_dir():
    for item in ("xray.exe", "xray", "geoip.dat", "geosite.dat"):
        src = vendor_dir / item
        if src.exists():
            datas.append((str(src), "vendor"))

hiddenimports = [
    "byrds_vpn.ui.pages.dashboard",
    "byrds_vpn.ui.pages.servers",
    "byrds_vpn.ui.pages.routing",
    "byrds_vpn.ui.pages.settings",
    "byrds_vpn.ui.pages.logs",
    "byrds_vpn.ui.pages.about",
]

a = Analysis(
    ["byrds_vpn/__main__.py"],
    pathex=[str(project_root)],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=["tests", "tkinter"],
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="byRDS-VPN",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="byRDS-VPN",
)
