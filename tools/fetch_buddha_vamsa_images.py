#!/usr/bin/env python3
"""Fetch one freely licensed Wikimedia Commons image per Buddha-vamsa entry.

Writes data/buddha-vamsa/images.json keyed by entry id (or a slug of the query).
Every image carries author + licence + source URL so the page can credit it.
Run: python tools/fetch_buddha_vamsa_images.py
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "buddha-vamsa"
API = "https://commons.wikimedia.org/w/api.php"
UA = "CharyabhumiHeritageBot/1.0 (educational heritage site; contact: site owner)"


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def api(params: dict, retries: int = 4) -> dict:
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            if exc.code != 429:
                raise
            wait = 8 * (attempt + 1)
            print(f"    429, waiting {wait}s")
            time.sleep(wait)
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(3)
    raise RuntimeError("rate limited")


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", value or "").strip()


def lookup(query: str) -> dict | None:
    try:
        data = api({
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": f"{query} filetype:bitmap", "gsrnamespace": "6", "gsrlimit": "3",
            "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "900",
        })
    except Exception as exc:  # noqa: BLE001 - network problems should not break the build
        print(f"  ! {query}: {exc}")
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        thumb = info.get("thumburl")
        if not thumb:
            continue
        meta = info.get("extmetadata") or {}
        return {
            "image": thumb,
            "title": page.get("title", ""),
            "credit": strip_tags((meta.get("Artist") or {}).get("value", "")) or "Wikimedia Commons contributor",
            "license": strip_tags((meta.get("LicenseShortName") or {}).get("value", "")) or "see source",
            "source": info.get("descriptionurl", ""),
        }
    return None


def main() -> int:
    out_path = DATA / "images.json"
    existing = {}
    if out_path.exists():
        existing = json.loads(out_path.read_text(encoding="utf-8")).get("images", {})

    targets: list[tuple[str, str]] = []

    def add(key: str, query: str | None):
        if not query or key in existing:
            return
        targets.append((key, query))

    for name, key_name in (("places.json", "places"), ("sculptures.json", "sculptures")):
        payload = json.loads((DATA / name).read_text(encoding="utf-8"))
        for row in payload[key_name]:
            add(("place-" if key_name == "places" else "sculpt-") + row["id"], row.get("imgQuery"))

    culture = json.loads((DATA / "culture.json").read_text(encoding="utf-8"))
    for section in ("artStyles", "music", "dance", "dress", "poetry", "stories", "myths", "creatures"):
        for row in culture.get(section, []):
            add(f"{section}-{row['id']}", row.get("imgQuery"))

    riddhi_path = DATA / "riddhi.json"
    if riddhi_path.exists():
        riddhi = json.loads(riddhi_path.read_text(encoding="utf-8"))
        for row in riddhi.get("events", []):
            add("riddhi-" + row["id"], row.get("img"))

    # archives.json carries a few manually verified Commons search terms
    # (stamp / first-day-cover / matchbox / calendar) - only resolve ones not yet cached.
    arch = json.loads((DATA / "archives.json").read_text(encoding="utf-8"))
    for row in arch.get("archives", []):
        if row.get("imgQuery"):
            add(row.get("imgKey") or "arch-" + row["id"], row["imgQuery"])

    print(f"{len(targets)} images to resolve")
    for i, (key, query) in enumerate(targets, 1):
        hit = lookup(query)
        if hit:
            existing[key] = hit
            print(f"[{i}/{len(targets)}] {key} <- {hit['title']}")
        else:
            print(f"[{i}/{len(targets)}] {key} : nothing found for {query!r}")
        time.sleep(2.0)

    out_path.write_text(json.dumps(
        {"schema_version": "2026-10-29.buddha-vamsa.images.v1",
         "note": "উইকিমিডিয়া কমন্স থেকে স্বয়ংক্রিয়ভাবে আনা ছবি; প্রতিটির লেখক ও লাইসেন্স সংরক্ষিত।",
         "images": existing}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {len(existing)} images -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
