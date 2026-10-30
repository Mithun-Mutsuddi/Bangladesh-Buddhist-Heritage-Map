#!/usr/bin/env python3
"""Download the Buddha-vamsa images we actually show into assets/buddha-vamsa/.

Wikimedia's thumbnail servers answer 429 (rate limited) when a page asks for a
dozen images at once, which used to leave cards with "ছবি লোড হয়নি". Serving the
files from our own folder makes the page fast, offline-friendly and free of 429s.
Attribution is untouched: each record keeps credit + licence + source URL, and
the page prints them under the image.

Run: python tools/localize_buddha_vamsa_images.py [--all]
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "buddha-vamsa"
OUT = ROOT / "assets" / "buddha-vamsa"
UA = "CharyabhumiHeritageBot/1.0 (educational heritage site)"


def wanted() -> list[str]:
    keys: list[str] = []
    for name, field in (("archives.json", "archives"), ("media.json", "media")):
        payload = json.loads((DATA / name).read_text(encoding="utf-8"))
        for row in payload[field]:
            if row.get("imgKey"):
                keys.append(row["imgKey"])
    riddhi = json.loads((DATA / "riddhi.json").read_text(encoding="utf-8"))
    for row in riddhi.get("events", []):
        key = "riddhi-" + row["id"]
        keys.append(key)
    return keys


def fetch(url: str, dest: Path, retries: int = 8) -> bool:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if len(data) < 2000:
                raise RuntimeError("suspiciously small file")
            dest.write_bytes(data)
            return True
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                wait = 20 * (attempt + 1)
                print(f"    429, waiting {wait}s")
                time.sleep(wait)
                continue
            print(f"    HTTP {exc.code}")
            return False
        except Exception as exc:  # noqa: BLE001
            print(f"    {exc}")
            time.sleep(5)
    return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="also re-download files already present")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    path = DATA / "images.json"
    doc = json.loads(path.read_text(encoding="utf-8"))
    images = doc["images"]

    doc["schema_version"] = "2026-10-29.buddha-vamsa.images.v4"
    got = skipped = failed = 0
    for key in dict.fromkeys(wanted()):
        record = images.get(key)
        if not record or not record.get("remote"):
            if record and not record.get("remote"):
                record["remote"] = record.get("image", "")
        if not record or not record.get("remote"):
            print(f"  ! {key}: no image record")
            continue
        ext = ".jpg"
        lower = record["remote"].lower()
        for candidate in (".png", ".jpeg", ".gif", ".webp"):
            if candidate in lower:
                ext = ".png" if candidate == ".png" else ".jpg"
                break
        dest = OUT / f"{key}{ext}"
        if dest.exists() and not args.all and dest.stat().st_size > 2000:
            record["image"] = f"assets/buddha-vamsa/{dest.name}"
            skipped += 1
            continue
        print(f"[{key}] {record['remote'][:80]}", flush=True)
        if fetch(record["remote"], dest):
            record["image"] = f"assets/buddha-vamsa/{dest.name}"
            got += 1
        else:
            failed += 1
        doc["schema_version"] = "2026-10-29.buddha-vamsa.images.v4"
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
        time.sleep(3.0)

    doc["schema_version"] = "2026-10-29.buddha-vamsa.images.v4"
    doc["note"] = ("উইকিমিডিয়া কমন্স থেকে আনা ছবি; যেগুলো পাতা দেখায় সেগুলো "
                   "assets/buddha-vamsa/ ফোল্ডারে রাখা — দ্রুত ও ৪২৯-মুক্ত। প্রতিটির লেখক, "
                   "লাইসেন্স ও উৎস-লিংক সংরক্ষিত।")
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"downloaded {got}, already local {skipped}, failed {failed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
