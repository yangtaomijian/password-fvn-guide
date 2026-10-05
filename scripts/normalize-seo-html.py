#!/usr/bin/env python3
"""Finalize title-bearing social tags after Quarto's HTML post-processing."""

from __future__ import annotations

import re
import sys
from html import escape, unescape
from pathlib import Path


EXPECTED_PAGES = 36
HEAD_RE = re.compile(r"(<head\b[^>]*>)(.*?)(</head\s*>)", re.IGNORECASE | re.DOTALL)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
OG_TITLE_RE = re.compile(
    r'(<meta\s+property="og:title"\s+content=")[^"]*(")', re.IGNORECASE
)
TWITTER_TITLE_RE = re.compile(
    r'(<meta\s+name="twitter:title"\s+content=")[^"]*(")', re.IGNORECASE
)


def replace_title(path: Path) -> None:
    source = path.read_text(encoding="utf-8")
    head_matches = list(HEAD_RE.finditer(source))
    if len(head_matches) != 1:
        raise ValueError(f"{path}: expected exactly one head element, found {len(head_matches)}")

    head_match = head_matches[0]
    head = head_match.group(2)
    title_match = TITLE_RE.search(head)
    if title_match is None:
        raise ValueError(f"{path}: missing title element in head")

    title = unescape(title_match.group(1))
    encoded_title = escape(title, quote=True)
    result_head = head

    for pattern, label in (
        (OG_TITLE_RE, "og:title"),
        (TWITTER_TITLE_RE, "twitter:title"),
    ):
        result_head, count = pattern.subn(
            rf"\g<1>{encoded_title}\g<2>", result_head
        )
        if count != 1:
            raise ValueError(f"{path}: expected exactly one {label}, found {count}")

    result = source[:head_match.start(2)] + result_head + source[head_match.end(2):]

    if result != source:
        path.write_text(result, encoding="utf-8")


def content_pages(site: Path) -> list[Path]:
    return sorted(
        path
        for path in site.rglob("*.html")
        if not (
            path.parent == site
            and path.match("google*.html")
        )
    )


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: normalize-seo-html.py SITE_DIR")

    site = Path(sys.argv[1])
    pages = content_pages(site)
    if len(pages) != EXPECTED_PAGES:
        raise ValueError(f"expected {EXPECTED_PAGES} HTML pages, found {len(pages)}")
    for path in pages:
        replace_title(path)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
