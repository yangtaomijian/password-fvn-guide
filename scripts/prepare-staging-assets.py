#!/usr/bin/env python3
"""Convert a complete production-default bilingual build into staging assets."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
site = root / "_site"
pages = (
    "index.html",
    "guide/route-overview.html", "guide/path-system.html", "guide/password-hints.html", "guide/faq.html",
    "collectibles/medals.html", "collectibles/compendium.html", "collectibles/gallery.html",
    "mechanics/password-checks.html", "mechanics/medal-persistence.html", "mechanics/affection.html",
    "mechanics/affection-differences.html", "versions/b085-changes.html", "versions/legacy-routes.html",
    "versions/legacy-passwords.html", "versions/legacy-mechanics.html", "extras/easter-eggs.html",
)
production = (
    '<meta name="pw-discussion-environment" content="production">',
    '<meta name="pw-discussion-api" content="https://discussion.carambi.com">',
    '<meta name="pw-discussion-turnstile-sitekey" content="0x4AAAAAAFE9bmYvoR54zpRe">',
)
staging = (
    '<meta name="pw-discussion-environment" content="staging">',
    '<meta name="pw-discussion-api" content="https://discussion-staging.carambi.com">',
    '<meta name="pw-discussion-turnstile-sitekey" content="0x4AAAAAAFEW58ENHynCclX5">',
)

# Validate every input before changing any output file.
inputs = {}
for prefix in (site, site / "en"):
    for page in pages:
        path = prefix / page
        if not path.is_file():
            raise SystemExit(f"Missing bilingual build page: {path}")
        text = path.read_text(encoding="utf-8")
        if any(text.count(marker) != 1 for marker in production):
            raise SystemExit(f"Expected exactly one production Discussion config in {path}")
        if any(marker in text for marker in staging):
            raise SystemExit(f"Staging Discussion config already present in {path}")
        inputs[path] = text

for path, text in inputs.items():
    for old, new in zip(production, staging):
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")

(site / "_headers").write_text("/*\n  X-Robots-Tag: noindex, nofollow\n", encoding="utf-8")
(site / "_redirects").write_text(
    "/ /index.html 302\n/en/ /en/index.html 302\n/en /en/index.html 302\n", encoding="utf-8"
)
(site / ".assetsignore").write_text("**/.DS_Store\nsite-en/**\n", encoding="utf-8")
print("Prepared 34 Password staging HTML pages and staging asset controls")
