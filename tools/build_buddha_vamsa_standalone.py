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

import argparse
import base64
import hashlib
import io
import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".cache" / "bv-preview"
UA = "CharyabhumiHeritageBot/1.0 (offline preview build)"
DATA = ROOT / "data" / "buddha-vamsa"
CSS_FILES = ["charyabhumi.css", "mega.css", "history.css", "buddha-vamsa.css"]
DATA_FILES = [
    "meta", "dynasties", "kings", "lineage", "jatakas", "quotes",
    "inscriptions", "places", "sculptures", "culture", "archives", "media", "images", "riddhi",
    "communities",
]


def _thumb(url: str, width: str = "960px") -> str:
    """মূল ফাইল চাইলে উইকিমিডিয়া ৪২৯ দেয়; কুয়েরি প্যারামিটার দিলে ৪০০।"""
    url = url.split("?")[0]
    marker = "/wikipedia/commons/"
    if marker not in url or "/thumb/" in url:
        return url
    head, tail = url.split(marker, 1)
    parts = tail.split("/")
    if len(parts) < 3:
        return url
    return f"{head}{marker}thumb/{tail}/{width}-{parts[-1]}"


def _download(url: str, cache_file: Path, tries: int = 4) -> bytes | None:
    if cache_file.exists() and cache_file.stat().st_size > 2000:
        return cache_file.read_bytes()
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = resp.read()
            if len(data) < 2000:
                raise RuntimeError("small file")
            cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_file.write_bytes(data)
            return data
        except Exception as exc:  # noqa: BLE001
            code = getattr(exc, "code", None)
            if code == 429:
                time.sleep(8 * (attempt + 1))
            else:
                time.sleep(2)
    return None


def inline_image(source: str, fetch_remote: bool) -> str | None:
    """একটি ছবিকে data URI বানায় — লোকাল ফাইল হোক বা কমন্সের URL।"""
    raw = None
    if source.startswith("assets/"):
        path = ROOT / source
        if not path.exists():
            return None
        raw = path.read_bytes()
    elif fetch_remote and source.startswith("http"):
        key = hashlib.sha1(source.encode()).hexdigest()[:16]
        raw = _download(_thumb(source), CACHE / f"{key}.img")
        if raw is None:
            return None
    else:
        return None
    try:
        from PIL import Image  # প্রিভিউ হালকা রাখতে ছোট করি
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        img.thumbnail((560, 560))
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=68, optimize=True)
        raw = buf.getvalue()
    except Exception:  # noqa: BLE001
        pass
    return "data:image/jpeg;base64," + base64.b64encode(raw).decode("ascii")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-remote", action="store_true", help="কমন্সের ছবি নামাবে না (দ্রুত বিল্ড)")
    args = ap.parse_args()
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

    # 3a) সব ছবি data URI — লোকাল ফাইল + কমন্সের ছবি (ছোট করে নামিয়ে)
    inlined = skipped = 0
    total = 0
    for rec in payload.get("images", {}).get("images", {}).values():
        src = str(rec.get("image") or "")
        if not src:
            continue
        data_uri = inline_image(src, not args.no_remote)
        if data_uri is None:
            skipped += 1
            continue
        rec["origin"] = src
        rec["image"] = data_uri
        rec["inlined"] = True
        inlined += 1
        total += len(data_uri)
    print(f"inlined {inlined} images ({total / 1024 / 1024:.1f} MB), skipped {skipped}")

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
        "প্রিভিউ সংস্করণ — ডেটা, স্টাইল ও নিজের সার্ভারের ছবি ফাইলের ভেতরেই বসানো "
        "(তাই নেটওয়ার্ক ছাড়াও ছবি দেখা যায়)। কমন্সের বাকি ছবি ইন্টারনেট থেকে আসে।</p>\n"
    )
    html = html.replace("<body class=\"cb bv\">", "<body class=\"cb bv\">\n" + banner, 1)

    out = ROOT / "buddha-vamsa-preview.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
