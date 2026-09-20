#!/usr/bin/env python3
"""Normalize only the two generated sitemap homepage locations."""

from __future__ import annotations

import sys
from pathlib import Path


EXPECTED = {
    "sitemap.xml": (
        "https://yangtaomijian.github.io/password-fvn-guide/index.html",
        "https://yangtaomijian.github.io/password-fvn-guide/",
    ),
    "en/sitemap.xml": (
        "https://yangtaomijian.github.io/password-fvn-guide/en/index.html",
        "https://yangtaomijian.github.io/password-fvn-guide/en/",
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


if __name__ == "__main__":
    main()
