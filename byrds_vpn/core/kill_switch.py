"""Kill Switch — блокирует исходящий трафик при падении VPN через Windows Firewall."""

from __future__ import annotations

import logging
import subprocess
import sys

log = logging.getLogger(__name__)

_RULE_OUT = "byRDS-VPN_KillSwitch_BlockOutbound"
_RULE_LOOPBACK = "byRDS-VPN_KillSwitch_AllowLoopback"


def is_supported() -> bool:
    return sys.platform == "win32"


def _run(args: list[str]) -> bool:
    try:
        proc = subprocess.run(  # noqa: S603
            args,
            capture_output=True,
            text=True,
            timeout=6.0,
            creationflags=(
                subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0  # type: ignore[attr-defined]
            ),
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        log.warning("netsh error: %s", exc)
        return False
    if proc.returncode != 0:
        log.warning("netsh %s failed: %s", args[-1], proc.stderr.strip())
        return False
    return True


def enable() -> bool:
    """Включить Kill Switch: блокирует весь исходящий трафик кроме loopback."""
    if not is_supported():
        return False
    ok_out = _run(
        [
            "netsh",
            "advfirewall",
            "firewall",
            "add",
            "rule",
            f"name={_RULE_OUT}",
            "dir=out",
            "action=block",
            "enable=yes",
            "remoteip=any",
        ]
    )
    ok_loop = _run(
        [
            "netsh",
            "advfirewall",
            "firewall",
            "add",
            "rule",
            f"name={_RULE_LOOPBACK}",
            "dir=out",
            "action=allow",
            "enable=yes",
            "remoteip=127.0.0.1,::1",
            "priority=1",
        ]
    )
    return ok_out and ok_loop


def disable() -> bool:
    if not is_supported():
        return False
    a = _run(
        ["netsh", "advfirewall", "firewall", "delete", "rule", f"name={_RULE_OUT}"]
    )
    b = _run(
        [
            "netsh",
            "advfirewall",
            "firewall",
            "delete",
            "rule",
            f"name={_RULE_LOOPBACK}",
        ]
    )
    return a or b
