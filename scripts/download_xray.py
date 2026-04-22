#!/usr/bin/env python3
"""Скачать xray-core + geoip/geosite в vendor/ для сборки."""

from __future__ import annotations

import argparse
import hashlib
import io
import platform
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path

XRAY_LATEST = (
    "https://github.com/XTLS/Xray-core/releases/latest/download/"
    "Xray-{platform}.zip"
)
GEOIP_URL = "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat"
GEOSITE_URL = "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat"

PLATFORMS = {
    "windows-x86_64": ("windows-64", "xray.exe"),
    "windows-aarch64": ("windows-arm64-v8a", "xray.exe"),
    "linux-x86_64": ("linux-64", "xray"),
    "linux-aarch64": ("linux-arm64-v8a", "xray"),
    "macos-x86_64": ("macos-64", "xray"),
    "macos-aarch64": ("macos-arm64-v8a", "xray"),
}


def detect_platform() -> str:
    system = platform.system().lower()
    machine = platform.machine().lower()
    if system == "windows":
        return "windows-aarch64" if "arm" in machine or "aarch" in machine else "windows-x86_64"
    if system == "linux":
        return "linux-aarch64" if "aarch" in machine or "arm64" in machine else "linux-x86_64"
    if system == "darwin":
        return "macos-aarch64" if "arm64" in machine or "aarch" in machine else "macos-x86_64"
    raise SystemExit(f"unsupported platform: {system} {machine}")


def download(url: str) -> bytes:
    print(f"  -> {url}", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "byRDS-VPN build script"})
    with urllib.request.urlopen(req, timeout=120) as resp:  # noqa: S310 — releases only
        return resp.read()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--platform",
        default=None,
        help="windows-x86_64 | linux-x86_64 | macos-x86_64 ... (default: auto)",
    )
    ap.add_argument("--out", default="vendor", help="output folder")
    args = ap.parse_args()

    plat_key = args.platform or detect_platform()
    if plat_key not in PLATFORMS:
        raise SystemExit(f"unknown platform: {plat_key}")
    xray_asset, xray_exe = PLATFORMS[plat_key]

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Xray
    print(f"[xray] downloading {xray_asset}...")
    zip_bytes = download(XRAY_LATEST.format(platform=xray_asset))
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        for member in zf.namelist():
            if member.lower().endswith(xray_exe):
                with zf.open(member) as src, (out_dir / xray_exe).open("wb") as dst:
                    shutil.copyfileobj(src, dst)
                break
    target_path = out_dir / xray_exe
    if not target_path.exists():
        raise SystemExit(f"xray binary not found inside zip (expected {xray_exe})")
    if not plat_key.startswith("windows"):
        target_path.chmod(0o755)
    print(f"[xray] -> {target_path}  ({target_path.stat().st_size:,} bytes)")

    # Geo assets
    for label, url in (("geoip.dat", GEOIP_URL), ("geosite.dat", GEOSITE_URL)):
        print(f"[{label}] downloading...")
        data = download(url)
        (out_dir / label).write_bytes(data)
        h = hashlib.sha256(data).hexdigest()[:16]
        print(f"[{label}] -> {out_dir / label} (sha256={h}..., {len(data):,} bytes)")

    print("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
