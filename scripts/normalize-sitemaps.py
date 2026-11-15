#!/usr/bin/env python3
"""Normalize sitemap homepages and declare both language sitemaps."""

from __future__ import annotations

import sys
from pathlib import Path


EXPECTED = {
    "sitemap.xml": (
        "https://password.carambi.com/index.html",
        "https://password.carambi.com/",
    ),
    "en/sitemap.xml": (
        "https://password.carambi.com/en/index.html",
        "https://password.carambi.com/en/",
    ),
}


def normalize(path: Path) -> None:
    key = str(path).split("_site/", 1)[-1]
    if key not in EXPECTED:
        raise SystemExit(f"unexpected sitemap path: {path}")

    old, new = EXPECTED[key]
    text = path.read_text(encoding="utf-8")
    old_marker = f"<loc>{old}</loc>"
    new_marker = f"<loc>{new}</loc>"
    old_count = text.count(old_marker)
    new_count = text.count(new_marker)

    if old_count == 1 and new_count == 0:
        path.write_text(text.replace(old_marker, new_marker, 1), encoding="utf-8")
        return
    if old_count == 0 and new_count == 1:
        return
    raise SystemExit(
        f"unexpected homepage URL state in {path}: "
        f"old_count={old_count}, new_count={new_count}"
    )


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: normalize-sitemaps.py ROOT_SITEMAP EN_SITEMAP")
    for argument in sys.argv[1:]:
        normalize(Path(argument))
    # Crawlers read only the host-root robots.txt, not /en/robots.txt.
    robots = Path(sys.argv[1]).parent / "robots.txt"
    text = robots.read_text(encoding="utf-8")
    declarations = {line.strip().lower() for line in text.splitlines()}
    for url in ("https://password.carambi.com/sitemap.xml", "https://password.carambi.com/en/sitemap.xml"):
        line = f"Sitemap: {url}"
        if line.lower() not in declarations:
            text = text.rstrip() + "\n" + line + "\n"
    robots.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
