#!/usr/bin/env python3
"""Build a single self-contained copy of the Buddha-vamsa page.

The deployed site loads 14 JSON files with fetch(); inside a sandboxed preview
(no network) that fails. This script inlines the CSS, the data and the page
script into one HTML file so the page can be reviewed offline:

    python tools/build_buddha_vamsa_standalone.py
    -> buddha-vamsa-preview.html

Remote Commons images stay as absolute https URLs: offline they simply fall
back to the "ছবি লোড হয়নি" placeholder, which is the same behaviour the live
site has when an image is unavailable.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "buddha-vamsa"
CSS_FILES = ["charyabhumi.css", "mega.css", "history.css", "buddha-vamsa.css"]
DATA_FILES = [
    "meta", "dynasties", "kings", "lineage", "jatakas", "quotes",
    "inscriptions", "places", "sculptures", "culture", "archives", "media", "images", "riddhi",
]


def main() -> int:
    html = (ROOT / "buddha-vamsa.html").read_text(encoding="utf-8")

    # 1) inline every stylesheet the page references.
    #    The cache-busting ?v=... token changes often, so match it with a regex
    #    instead of hard-coding each version (a stale literal silently skipped
    #    the inlining and produced a data-less preview).
    for name in CSS_FILES:
        css = (ROOT / name).read_text(encoding="utf-8")
        html = re.sub(r'<link rel="stylesheet" href="' + re.escape(name) + r'(\?v=[^"]*)?">\s*', "", html)
        html = html.replace("</head>", f"<style>\n{css}\n</style>\n</head>", 1)

    # 2) drop the shared shell scripts (they fetch site JSON we do not inline)
    html = re.sub(r'<script src="(?:language|brand)\.js(?:\?v=[^"]*)?\" defer></script>\s*', "", html)

    # 3) inline the data + page script
    payload = {key: json.loads((DATA / f"{key}.json").read_text(encoding="utf-8")) for key in DATA_FILES}
    script = (ROOT / "buddha-vamsa.js").read_text(encoding="utf-8")
    inline = (
        "<script>window.__BV_DATA__=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";</script>\n"
        "<script>" + script + "</script>\n"
    )
    assert re.search(r'<script src="buddha-vamsa\.js(\?v=[^"]*)?\" defer></script>', html), "page script tag not found"
    html = re.sub(r'<script src="buddha-vamsa\.js(\?v=[^"]*)?\" defer></script>', lambda _m: inline, html)

    banner = (
        '<p style="margin:0;padding:10px 16px;background:#123f39;color:#fff4ce;'
        'font:600 13px/1.6 system-ui,sans-serif;text-align:center">'
        "প্রিভিউ সংস্করণ — ডেটা ও স্টাইল ফাইলের ভেতরেই বসানো। ছবিগুলো ইন্টারনেট থেকে আসে, "
        "তাই নেটওয়ার্ক ছাড়া ‘ছবি লোড হয়নি’ দেখাবে।</p>\n"
    )
    html = html.replace("<body class=\"cb bv\">", "<body class=\"cb bv\">\n" + banner, 1)

    out = ROOT / "buddha-vamsa-preview.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
