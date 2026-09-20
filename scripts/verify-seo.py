#!/usr/bin/env python3
"""Verify the generated bilingual SEO metadata and sitemap contract."""

from __future__ import annotations

import struct
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from html import unescape
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
BASE = "https://yangtaomijian.github.io/password-fvn-guide"
ZH_ROOT = f"{BASE}/"
EN_ROOT = f"{BASE}/en/"
ZH_IMAGE = f"{BASE}/assets/social/password-fvn-guide-zh.png"
EN_IMAGE = f"{BASE}/en/assets/social/password-fvn-guide-en.png"
ZH_SITE_NAME = "Password b0.85 中文攻略与机制资料库"
EN_SITE_NAME = "Password b0.85 Guide & Mechanics Reference"
ZH_HOME_TITLE = "Password b0.85 中文攻略与机制资料库"
EN_HOME_TITLE = "Password b0.85 Guide & Mechanics Reference"
EN_HOME_DESCRIPTION = "An unofficial guide and walkthrough reference for Password, Grizz’s furry visual novel (FVN), covering b0.85 routes, endings, password hints, medals, Gallery completion, mechanics, and version differences."
PAIRED = {
    "index.html",
    "guide/route-overview.html",
    "guide/path-system.html",
    "guide/password-hints.html",
    "guide/faq.html",
    "collectibles/medals.html",
    "collectibles/gallery.html",
    "collectibles/compendium.html",
    "mechanics/password-checks.html",
    "mechanics/medal-persistence.html",
    "mechanics/affection.html",
    "mechanics/affection-differences.html",
    "versions/b085-changes.html",
    "versions/legacy-routes.html",
    "versions/legacy-passwords.html",
    "versions/legacy-mechanics.html",
    "extras/easter-eggs.html",
}
VERSIONS = {
    "versions/b085-changes.html",
    "versions/legacy-routes.html",
    "versions/legacy-passwords.html",
    "versions/legacy-mechanics.html",
}
EXPECTED_ZH_PAGES = PAIRED
EXPECTED_EN_PAGES = PAIRED
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.html_attrs: dict[str, str] = {}
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.title = ""
        self.h1: list[str] = []
        self._capture: str | None = None
        self._capture_tag: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if tag == "html":
            self.html_attrs = data
        elif tag == "meta":
            self.meta.append(data)
        elif tag == "link":
            self.links.append(data)
        elif tag == "title":
            self._capture = "title"
            self._capture_tag = "title"
            self._buffer = []
        elif tag == "h1":
            self._capture = "h1"
            self._capture_tag = "h1"
            self._buffer = []

    def handle_endtag(self, tag: str) -> None:
        if self._capture and tag == self._capture_tag:
            value = unescape(" ".join("".join(self._buffer).split()))
            if self._capture == "title":
                self.title = value
            else:
                self.h1.append(value)
            self._capture = None
            self._capture_tag = None
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)


def parse_html(path: Path) -> tuple[PageParser, dict[str, list[str]]]:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    metadata: dict[str, list[str]] = {}
    for item in parser.meta:
        key = item.get("name") or item.get("property")
        if key:
            metadata.setdefault(key, []).append(item.get("content", ""))
    return parser, metadata


def one(values: dict[str, list[str]], key: str, path: Path) -> str:
    if len(values.get(key, [])) != 1:
        raise AssertionError(f"{path}: expected exactly one {key}")
    return values[key][0]


def page_url(root: str, relative: str) -> str:
    return root if relative == "index.html" else root + relative


def check_url(url: str, expected: str, label: str, path: Path) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise AssertionError(f"{path}: {label} is not absolute HTTPS: {url}")
    if url != expected:
        raise AssertionError(f"{path}: {label} mismatch: {url} != {expected}")


def html_pages(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*.html")
        if "site_libs" not in path.parts
        and not (
            path.parent == SITE
            and path.match("google*.html")
        )
    )


def verify_pages() -> None:
    pages = html_pages(SITE)
    zh_pages = [path for path in pages if "en" not in path.relative_to(SITE).parts]
    en_pages = [path for path in pages if path.relative_to(SITE).parts[:1] == ("en",)]
    if len(zh_pages) != 17 or len(en_pages) != 17 or len(pages) != 34:
        raise AssertionError(
            f"page counts are {len(zh_pages)}/{len(en_pages)}/{len(pages)}"
        )
    actual_zh = {str(path.relative_to(SITE)) for path in zh_pages}
    actual_en = {str(path.relative_to(SITE / "en")) for path in en_pages}
    if actual_zh != EXPECTED_ZH_PAGES:
        raise AssertionError(f"Chinese page set mismatch: {sorted(actual_zh)}")
    if actual_en != EXPECTED_EN_PAGES:
        raise AssertionError(f"English page set mismatch: {sorted(actual_en)}")

    for path in pages:
        relative = str(path.relative_to(SITE))
        is_en = relative.startswith("en/")
        logical = relative[3:] if is_en else relative
        site_root = EN_ROOT if is_en else ZH_ROOT
        expected_canonical = page_url(site_root, logical)
        expected_image = EN_IMAGE if is_en else ZH_IMAGE
        parser, values = parse_html(path)

        if not parser.title or len(parser.h1) != 1:
            raise AssertionError(f"{path}: title/H1 missing")
        if parser.html_attrs.get("lang") != ("en" if is_en else "zh-CN"):
            raise AssertionError(f"{path}: wrong html lang")
        description = one(values, "description", path)
        canonical = one(
            {"canonical": [link.get("href", "") for link in parser.links if "canonical" in link.get("rel", "").split()]},
            "canonical",
            path,
        )
        check_url(canonical, expected_canonical, "canonical", path)
        if "keywords" in values or "description-meta" in values:
            raise AssertionError(f"{path}: forbidden metadata present")

        if logical == "index.html":
            expected_title = EN_HOME_TITLE if is_en else ZH_HOME_TITLE
            if parser.title != expected_title:
                raise AssertionError(f"{path}: homepage title mismatch")
            if is_en and description != EN_HOME_DESCRIPTION:
                raise AssertionError(f"{path}: English homepage description mismatch")

        for key in ("og:type", "og:title", "og:description", "og:url", "og:site_name", "og:image"):
            value = one(values, key, path)
            if key == "og:type" and value != "website":
                raise AssertionError(f"{path}: og:type is not website")
            if key == "og:title" and value != parser.title:
                raise AssertionError(f"{path}: og:title mismatch")
            if key == "og:description" and value != description:
                raise AssertionError(f"{path}: og:description mismatch")
            if key == "og:url" and value != canonical:
                raise AssertionError(f"{path}: og:url mismatch")
            if key == "og:site_name" and value != (EN_SITE_NAME if is_en else ZH_SITE_NAME):
                raise AssertionError(f"{path}: og:site_name mismatch")
            if key == "og:image":
                check_url(value, expected_image, "og:image", path)

        for key in ("twitter:card", "twitter:title", "twitter:description", "twitter:image"):
            value = one(values, key, path)
            if key == "twitter:card" and value != "summary_large_image":
                raise AssertionError(f"{path}: twitter:card mismatch")
            if key == "twitter:title" and value != parser.title:
                raise AssertionError(f"{path}: twitter:title mismatch")
            if key == "twitter:description" and value != description:
                raise AssertionError(f"{path}: twitter:description mismatch")
            if key == "twitter:image" and value != expected_image:
                raise AssertionError(f"{path}: twitter:image mismatch")

        alternates = [
            link
            for link in parser.links
            if "alternate" in link.get("rel", "").split()
            and link.get("hreflang")
        ]
        if logical in PAIRED:
            if sorted(link.get("hreflang") for link in alternates) != ["en", "zh-CN"]:
                raise AssertionError(f"{path}: incomplete hreflang set")
            expected_alternates = {"zh-CN": page_url(ZH_ROOT, logical), "en": page_url(EN_ROOT, logical)}
            if {link["hreflang"]: link.get("href") for link in alternates} != expected_alternates:
                raise AssertionError(f"{path}: hreflang URLs are not reciprocal")


def sitemap_urls(path: Path) -> list[str]:
    root = ET.parse(path).getroot()
    return [node.find("sm:loc", NS).text or "" for node in root.findall("sm:url", NS)]


def verify_sitemaps() -> None:
    for relative, expected_count, home, html_root, exclude_english in (
        ("sitemap.xml", 17, ZH_ROOT, SITE, True),
        ("en/sitemap.xml", 17, EN_ROOT, SITE / "en", False),
    ):
        urls = sitemap_urls(SITE / relative)
        if len(urls) != expected_count or home not in urls:
            raise AssertionError(f"{relative}: count/home mismatch")
        if home.replace(BASE, BASE) + "index.html" in urls:
            raise AssertionError(f"{relative}: homepage index.html remains")
        page_paths = html_pages(html_root)
        if exclude_english:
            page_paths = [
                path
                for path in page_paths
                if path.relative_to(SITE).parts[:1] != ("en",)
            ]
        expected = {
            page_url(home, str(path.relative_to(html_root)))
            for path in page_paths
        }
        if set(urls) != expected:
            raise AssertionError(f"{relative}: URL set does not match generated pages")

    if (SITE / "robots.txt").read_text(encoding="utf-8").strip() != f"Sitemap: {BASE}/sitemap.xml":
        raise AssertionError("Chinese robots.txt mismatch")
    if (SITE / "en/robots.txt").read_text(encoding="utf-8").strip() != f"Sitemap: {BASE}/en/sitemap.xml":
        raise AssertionError("English robots.txt mismatch")


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise AssertionError(f"{path}: not a PNG")
    return struct.unpack(">II", data[16:24])


def verify_images() -> None:
    for path in (
        ROOT / "assets/social/password-fvn-guide-zh.png",
        ROOT / "site-en/assets/social/password-fvn-guide-en.png",
        SITE / "assets/social/password-fvn-guide-zh.png",
        SITE / "en/assets/social/password-fvn-guide-en.png",
    ):
        if not path.exists():
            raise AssertionError(f"missing social image: {path}")
        if png_size(path) != (1200, 630):
            raise AssertionError(f"{path}: expected 1200x630, got {png_size(path)}")
        if path.stat().st_size >= 5_000_000:
            raise AssertionError(f"{path}: unnecessarily large file")


def verify_search_indexes() -> None:
    import json

    for path, expected in (
        (SITE / "search.json", EXPECTED_ZH_PAGES),
        (SITE / "en/search.json", EXPECTED_EN_PAGES),
    ):
        records = json.loads(path.read_text(encoding="utf-8"))
        pages = {record["href"].split("#", 1)[0] for record in records}
        if pages != expected:
            raise AssertionError(f"{path}: search page set mismatch: {sorted(pages)}")


def main() -> None:
    verify_pages()
    verify_sitemaps()
    verify_images()
    verify_search_indexes()
    print("HTML pages: 34/34")
    print("Descriptions, canonicals, lang, OG, Twitter: 34/34")
    print("Chinese hreflang pages: 17/17")
    print("English hreflang pages: 17/17")
    print("Reciprocal language pairs: 17/17")
    print("Bilingual Versions pairs: 4/4")
    print("Chinese sitemap URLs: 17")
    print("English sitemap URLs: 17")
    print("Normalized sitemap home URLs: 2/2")
    print("Search index page sets: 17/17 + 17/17")
    print("Social images present and 1200x630: 4/4 source/output")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, ET.ParseError, OSError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
