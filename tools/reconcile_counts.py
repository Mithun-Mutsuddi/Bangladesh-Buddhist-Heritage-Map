#!/usr/bin/env python3
"""একটি সংখ্যা, একটি সূত্র — সাইটের সব গণনা এক জায়গায়।

সমস্যা: পাতায় লেখা সংখ্যা (রাজা ১১১, তীর্থ ৪৩, আর্কাইভ ২৬ …) আর ডেটা ফাইলের
সংখ্যা আলাদা হয়ে যেতে পারে — README, চার্ট ও ইউজারের দেখা সংখ্যা তখন মেলে না।

সমাধান: এই টুল সব ডেটা ফাইল গুনে data/counts.json লেখে; tests/data-counts.test.mjs
যাচাই করে ফাইলটা পুরোনো হয়ে গেলে (ডেটা বদলে টুল চালানো হয়নি) টেস্ট ফেল করে।

Run: python tools/reconcile_counts.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
BV = DATA / "buddha-vamsa"
OUT = DATA / "counts.json"


def jload(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def count(path: Path, field: str) -> int:
    return len(jload(path).get(field) or [])


def build() -> dict:
    bv = {
        "dynasties": count(BV / "dynasties.json", "dynasties"),
        "kings": count(BV / "kings.json", "kings"),
        "linked_kings": count(BV / "kings.json", "linkedProfiles"),
        "jatakas": count(BV / "jatakas.json", "jatakas"),
        "quotes": count(BV / "quotes.json", "quotes"),
        "inscriptions": count(BV / "inscriptions.json", "inscriptions"),
        "places": count(BV / "places.json", "places"),
        "sculptures": count(BV / "sculptures.json", "sculptures"),
        "archives": count(BV / "archives.json", "archives"),
        "media": count(BV / "media.json", "media"),
        "communities": count(BV / "communities.json", "groups"),
        "riddhi_powers": count(BV / "riddhi.json", "powers"),
        "riddhi_events": count(BV / "riddhi.json", "events"),
        "images": len(jload(BV / "images.json").get("images") or {}),
    }
    culture = jload(BV / "culture.json")
    bv["culture"] = sum(
        len(culture.get(key) or [])
        for key in ("artStyles", "music", "dance", "dress", "poetry", "stories", "myths", "creatures", "festivals")
    )
    archives = jload(BV / "archives.json").get("archives") or []
    bv["archives_with_image"] = sum(1 for row in archives if row.get("imgKey"))
    media = jload(BV / "media.json").get("media") or []
    bv["media_with_image"] = sum(1 for row in media if row.get("imgKey"))

    site = {
        "heritage_kings": count(DATA / "heritage-kings.json", "kings"),
        "heritage_sites": len(jload(DATA / "heritage-sites.json").get("records") or []),
        "heritage_sites_declared": jload(DATA / "heritage-sites.json").get("record_count"),
        "tracker_places": count(DATA / "tracker-places.json", "places"),
        "nav_items": sum(
            len(group.get("items") or [])
            for group in jload(DATA / "site-structure.json").get("groups") or []
        ),
    }
    return {
        "schema_version": "2026-10-30.counts.v1",
        "note": "সব সংখ্যা ডেটা ফাইল থেকে গোনা। ডেটা বদলালে `python tools/reconcile_counts.py` চালিয়ে এই ফাইল হালনাগাদ করুন — টেস্ট এটা পাহারা দেয়।",
        "buddha_vamsa": bv,
        "site": site,
    }


def main() -> int:
    payload = build()
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    width = max(len(k) for k in list(payload["buddha_vamsa"]) + list(payload["site"]))
    for group in ("buddha_vamsa", "site"):
        print(f"[{group}]")
        for key, value in payload[group].items():
            print(f"  {key.ljust(width)} {value}")
    print(f"wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
