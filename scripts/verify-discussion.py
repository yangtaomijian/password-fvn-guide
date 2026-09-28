#!/usr/bin/env python3
"""Verify Password Discussion and Feedback in production or prepared staging output."""
from __future__ import annotations

import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
site = root / "_site"
staging = len(sys.argv) == 2 and sys.argv[1] == "--staging"
if len(sys.argv) not in (1, 2) or (len(sys.argv) == 2 and not staging):
    raise SystemExit("usage: verify-discussion.py [--staging]")

page_keys = {
    "guide/route-overview.html": "guide.route-overview",
    "guide/path-system.html": "guide.path-system",
    "guide/password-hints.html": "guide.password-hints",
    "guide/faq.html": "guide.faq",
    "collectibles/medals.html": "collectibles.medals",
    "collectibles/compendium.html": "collectibles.compendium",
    "collectibles/gallery.html": "collectibles.gallery",
    "mechanics/password-checks.html": "mechanics.password-checks",
    "mechanics/medal-persistence.html": "mechanics.medal-persistence",
    "mechanics/affection.html": "mechanics.affection",
    "mechanics/affection-differences.html": "mechanics.affection-differences",
    "versions/b085-changes.html": "versions.b085-changes",
    "versions/legacy-routes.html": "versions.legacy-routes",
    "versions/legacy-passwords.html": "versions.legacy-passwords",
    "versions/legacy-mechanics.html": "versions.legacy-mechanics",
    "extras/easter-eggs.html": "extras.easter-eggs",
}
assert len(page_keys) == 16
expected_pages = {"index.html", *page_keys}
expected = {f"{prefix}{page}" for prefix in ("", "en/") for page in expected_pages}
actual = {
    path.relative_to(site).as_posix() for path in site.rglob("*.html")
    if "assets" not in path.relative_to(site).parts
    and path.name != "googlef0776754787f4a8e.html"
}
assert actual == expected, f"bilingual page set differs: missing={sorted(expected-actual)}, extra={sorted(actual-expected)}"
assert len(actual) == 34

# Both language projects own the same runtime and page map.
asset_names = (
    "pw-discussion-config.html", "pw-discussion-fixtures.html", "pw-discussion-remote.html",
    "pw-discussion-runtime.html", "pw-discussion-ui.html", "pw-feedback-ui.html",
    "pw-discussion.css", "pw-feedback.css",
)
for name in asset_names:
    assert (root / "assets" / name).read_bytes() == (root / "site-en/assets" / name).read_bytes(), name
runtime = (root / "assets/pw-discussion-runtime.html").read_text(encoding="utf-8")
parsed = dict(re.findall(r"\n    '(/(?:en/)?[^']+\.html)': '([^']+)',", runtime))
wanted = {f"/{prefix}{page}": key for prefix in ("", "en/") for page, key in page_keys.items()}
assert parsed == wanted, "runtime page map differs from the 32-page contract"
assert "site: 'password'" in runtime and "const guideVersion = 'b0.85'" in runtime
assert "if (!context?.pageKey) return;" in runtime
assert "#quarto-content > main#quarto-document-content" in runtime
assert "main.after(mount)" in runtime
assert "'/index.html'" not in runtime and "'/en/index.html'" not in runtime
assert "pw-staging.carambi.com" in runtime and "password.carambi.com" in runtime

config = {
    "pw-discussion-environment": "staging" if staging else "production",
    "pw-discussion-api": "https://discussion-staging.carambi.com" if staging else "https://discussion.carambi.com",
    "pw-discussion-turnstile-sitekey": "0x4AAAAAAFEW58ENHynCclX5" if staging else "0x4AAAAAAFE9bmYvoR54zpRe",
}
for relative in sorted(expected):
    text = (site / relative).read_text(encoding="utf-8")
    for name, value in config.items():
        marker = f'<meta name="{name}" content="{value}">'
        assert text.count(marker) == 1, (relative, name)
    forbidden = (
        "https://discussion.carambi.com", "0x4AAAAAAFE9bmYvoR54zpRe"
    ) if staging else (
        "https://discussion-staging.carambi.com", "0x4AAAAAAFEW58ENHynCclX5"
    )
    assert all(value not in text for value in forbidden), f"mixed environment config in {relative}"
    assert text.count("if (window.__pwDiscussionRuntime) return;") == 1, relative
    assert text.count("const pageKeys = Object.freeze({") == 1, relative
    assert text.count("main.after(mount);") == 1, relative
    assert text.count("const runtime = window.__pwDiscussionRuntime;") == 2, relative
    assert text.count('class="pw-feedback-slot" type="button" disabled') == 1, relative
    assert text.count("trigger.disabled = false;") == 1, relative
    assert "https://giscus.app/client.js" not in text, f"active Giscus client in {relative}"
    assert 'id="giscus-base-theme"' not in text, f"active Giscus config in {relative}"
    assert 'class="giscus"' not in text, f"active Giscus container in {relative}"
    if relative.endswith("index.html"):
        assert relative in {"index.html", "en/index.html"}
    else:
        assert relative.removeprefix("en/") in page_keys

headers = site / "_headers"
if staging:
    assert headers.read_text(encoding="utf-8") == "/*\n  X-Robots-Tag: noindex, nofollow\n"
    assert (site / "_redirects").is_file()
    assert (site / ".assetsignore").is_file()
else:
    assert not headers.exists(), "production build unexpectedly contains staging X-Robots-Tag"
print(f"Password Discussion {'staging' if staging else 'production'} output: 17 ZH + 17 EN pages, 32 mounts, 34 feedback slots, no active Giscus")
