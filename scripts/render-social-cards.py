#!/usr/bin/env python3
"""Regenerate the approved bilingual cards with Pillow (python3 -m pip install Pillow).

Run from any directory: python3 scripts/render-social-cards.py
Edit scripts/social-cards/cards.json to change the captions. The shared artwork
and English label layer preserve the approved branding, diagrams and summary
pixels. Unchanged caption prefixes also retain their original glyphs. The clean
label backgrounds were recovered from the archived text-free artwork, not painted
over. Caption font subsets and their licenses are bundled beside the source.

This manual export workflow does not change Quarto or page SEO metadata.
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts/social-cards"


def main():
    spec = json.loads((SOURCE / "cards.json").read_text(encoding="utf-8"))
    artwork = Image.open(SOURCE / spec["artwork"]).convert("RGBA")
    assert artwork.size == tuple(spec["canvas"]) == (1200, 630)
    for locale, card in spec["cards"].items():
        image = artwork.copy()
        if "labels" in card:
            labels = Image.open(SOURCE / card["labels"]).convert("RGBA")
            assert labels.size == image.size
            image.alpha_composite(labels)
        prefix = card["preserved_prefix"]
        assert card["caption"].startswith(prefix)
        suffix = card["caption"][len(prefix):]
        font = ImageFont.truetype(
            str(SOURCE / card["font"]), card["font_size"],
            layout_engine=ImageFont.Layout.BASIC,
        )
        ImageDraw.Draw(image).text(
            tuple(card["append_position"]), suffix, font=font,
            fill=tuple(spec["caption_color"]),
        )
        output = ROOT / card["output"]
        image.convert("RGB").save(output, optimize=True)
        print(f"{locale}: {output.relative_to(ROOT)} — 1200×630")


if __name__ == "__main__":
    main()
