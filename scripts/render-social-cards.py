#!/usr/bin/env python3
"""Export the approved bilingual raster masters and preserve historical share URLs.

Run: python3 scripts/render-social-cards.py
The approved card composition is baked into scripts/social-cards/approved-*.png.
Replace those masters after approving a new composition. This exporter does not
redraw text or art, so exports are byte-identical on every operating system.
"""
import json
import shutil
import struct
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts/social-cards"
def main():
    spec = json.loads((SOURCE / "cards.json").read_text())
    for language, card in spec["cards"].items():
        source = SOURCE / card["master"]
        data = source.read_bytes()
        assert data[:8] == b"\x89PNG\r\n\x1a\n"
        assert struct.unpack(">II", data[16:24]) == tuple(spec["canvas"])
        for output in [card["output"], *card.get("aliases", [])]:
            target = ROOT / output
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            print(f"{language}: {output}")
if __name__ == "__main__":
    main()
