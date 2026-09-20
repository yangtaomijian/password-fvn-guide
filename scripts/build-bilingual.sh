#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

remove_generated_dir() {
  local directory="$1"
  if ! rm -rf "$directory" 2>/dev/null; then
    find "$directory" -type f -name '.DS_Store' -delete
    rm -rf "$directory"
  fi
}

remove_generated_dir "$ROOT/_site"
remove_generated_dir "$ROOT/site-en/_site"

cd "$ROOT"
quarto render

cd "$ROOT/site-en"
quarto render

mkdir -p "$ROOT/_site/en"
cp -a "$ROOT/site-en/_site/." "$ROOT/_site/en/"

mkdir -p "$ROOT/_site/assets/social" "$ROOT/_site/en/assets/social"
cp "$ROOT/assets/social/password-fvn-guide-zh.png" "$ROOT/_site/assets/social/password-fvn-guide-zh.png"
cp "$ROOT/site-en/assets/social/password-fvn-guide-en.png" "$ROOT/_site/en/assets/social/password-fvn-guide-en.png"

python3 "$ROOT/scripts/normalize-sitemaps.py" "$ROOT/_site/sitemap.xml" "$ROOT/_site/en/sitemap.xml"
python3 "$ROOT/scripts/normalize-seo-html.py" "$ROOT/_site"
