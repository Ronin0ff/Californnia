"""Тесты хранилища (атомарные записи, round-trip моделей)."""

from __future__ import annotations

from pathlib import Path

from byrds_vpn.core.models import Profile, Settings, StreamSettings, Subscription
from byrds_vpn.core.storage import Storage


def test_settings_round_trip(tmp_path: Path) -> None:
    storage = Storage(tmp_path)
    s = Settings(
        socks_port=20080,
        http_port=20081,
        enable_mux=True,
        mux_concurrency=12,
        routing_mode="gaming",
        direct_domains=["localhost"],
        proxy_domains=["geosite:netflix"],
        block_domains=["ad.example.com"],
    )
    storage.save_settings(s)
    loaded = storage.load_settings()
    assert loaded.socks_port == 20080
    assert loaded.enable_mux is True
    assert loaded.mux_concurrency == 12
    assert loaded.routing_mode == "gaming"
    assert loaded.direct_domains == ["localhost"]


def test_profiles_round_trip(tmp_path: Path) -> None:
    storage = Storage(tmp_path)
    p = Profile(
        protocol="vless",
        address="example.com",
        port=443,
        uuid_or_password="uid",
        remark="тест",
        flow="xtls-rprx-vision",
        stream=StreamSettings(network="tcp", security="reality", sni="x", public_key="p", short_id="s"),
    )
    storage.save_profiles([p])
    loaded = storage.load_profiles()
    assert len(loaded) == 1
    assert loaded[0].id == p.id
    assert loaded[0].remark == "тест"
    assert loaded[0].stream.security == "reality"
    assert loaded[0].stream.public_key == "p"


def test_load_missing_returns_defaults(tmp_path: Path) -> None:
    storage = Storage(tmp_path)
    assert storage.load_profiles() == []
    assert storage.load_subscriptions() == []
    assert storage.load_settings().socks_port == 10808


def test_subscriptions_round_trip(tmp_path: Path) -> None:
    storage = Storage(tmp_path)
    sub = Subscription(name="prod", url="https://example.com/sub", auto_update_hours=6)
    storage.save_subscriptions([sub])
    got = storage.load_subscriptions()
    assert len(got) == 1
    assert got[0].name == "prod"
    assert got[0].auto_update_hours == 6


def test_atomic_rewrite(tmp_path: Path) -> None:
    storage = Storage(tmp_path)
    storage.save_settings(Settings(socks_port=1234))
    storage.save_settings(Settings(socks_port=5678))
    # Только settings.json должен остаться, без tmp-файлов.
    tmp_leftovers = [p for p in tmp_path.iterdir() if p.name.startswith(".settings.json")]
    assert tmp_leftovers == []
    assert storage.load_settings().socks_port == 5678
