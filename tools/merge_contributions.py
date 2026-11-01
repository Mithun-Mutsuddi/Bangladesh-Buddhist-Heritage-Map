#!/usr/bin/env python3
"""data/edits.json + data/contributions.json-কে মূল সংরক্ষণাগারে মিশিয়ে দেয়।

কেন: সাইটে চালু অবস্থায় ওভারলে-ফাইল দুটি পড়া হয় (নতুন করে বানানো লাগে না)।
কিন্তু আমি (বা CI) যখন পুরো সাইট আবার তৈরি করি, তখন এই স্ক্রিপ্ট সেগুলো
`data/historical-archive-partners.json`-এর ভেতরে স্থায়ীভাবে বসিয়ে দেয়,
আর data-URI ছবিগুলোকে `assets/archive/commons/`-এ আসল ফাইল হিসেবে লেখে।

চালানোর নিয়ম:
    python3 tools/merge_contributions.py            # মিশিয়ে দাও (মূল ফাইল বদলে যায়)
    python3 tools/merge_contributions.py --check    # শুধু যাচাই, কিছু লেখে না
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "historical-archive-partners.json"
EDITS = ROOT / "data" / "edits.json"
CONTRIB = ROOT / "data" / "contributions.json"
IMGDIR = ROOT / "assets" / "archive" / "commons"

EDITABLE = [
    "titleBn", "titleEn", "descBn", "descEn", "dateBn", "placeBn", "creatorBn",
    "imageUrl", "imageAltBn", "imageCreditBn", "licenceLabel", "licenceBn", "licenceUrl",
    "rights", "region", "period", "mediaType", "sourceUrl", "keywords", "accession",
    "language", "materialBn",
]
REQUIRED_CONTRIB = ["id", "titleBn", "descBn", "mediaType", "region", "period",
                    "licenceLabel", "imageCreditBn"]


def load(path: Path, fallback: dict) -> dict:
    if not path.exists():
        return fallback
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def write_data_uri(item: dict) -> str:
    """data:image/jpeg;base64,... → assets/archive/commons/<id>.jpg"""
    uri = item.get("imageUrl") or ""
    m = re.match(r"data:image/(jpeg|jpg|png|webp);base64,(.+)$", uri, re.S)
    if not m:
        return ""
    IMGDIR.mkdir(parents=True, exist_ok=True)
    ext = "png" if m.group(1) == "png" else "jpg"
    path = IMGDIR / f"{item['id']}.{ext}"
    path.write_bytes(base64.b64decode(m.group(2)))
    return f"assets/archive/commons/{path.name}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="শুধু যাচাই করো, কিছু লেখো না")
    args = ap.parse_args()

    doc = json.loads(DATA.read_text(encoding="utf-8"))
    items = doc["items"]
    by_id = {i["id"]: i for i in items}
    edits = load(EDITS, {"records": {}}).get("records") or {}
    contrib = load(CONTRIB, {"items": []}).get("items") or []

    problems: list[str] = []
    for cid in edits:
        if cid not in by_id:
            problems.append(f"edits.json: অজানা রেকর্ড id — {cid}")
    for c in contrib:
        for field in REQUIRED_CONTRIB:
            if not str(c.get(field) or "").strip():
                problems.append(f"contributions.json: {c.get('id', '?')} — '{field}' নেই")
        if c.get("id") in by_id and not by_id[c["id"]].get("community"):
            problems.append(f"contributions.json: {c.get('id')} — id আগেই আছে (দ্বৈত)")

    if args.check:
        for p in problems:
            print("সমস্যা:", p)
        print(f"যাচাই শেষ — সম্পাদনা {len(edits)} · অনুমোদিত জমা {len(contrib)} · সমস্যা {len(problems)}")
        return 1 if problems else 0

    if problems:
        for p in problems:
            print("সমস্যা:", p)
        print("মিশানো হয়নি — আগে সমস্যাগুলো ঠিক করুন।")
        return 1

    touched = 0
    for cid, patch in edits.items():
        item = by_id[cid]
        for key in EDITABLE:
            if key in patch:
                item[key] = patch[key]
        new_path = write_data_uri(item)
        if new_path:
            item["imageUrl"] = new_path
            item["imageSourceUrl"] = ""
        item["edited"] = True
        touched += 1

    added = 0
    skipped = 0
    for c in contrib:
        if c.get("id") in by_id and by_id[c["id"]].get("community"):
            skipped += 1  # আগেই মিশানো হয়েছে — করণীয় কিছু নেই
            continue
        item = dict(c)
        item.setdefault("titleEn", item.get("titleBn", ""))
        item.setdefault("dateBn", "তারিখ অনিশ্চিত")
        item.setdefault("imageAltBn", item.get("titleBn", ""))
        item.setdefault("imageSourceUrl", "")
        item.setdefault("accession", "সম্প্রদায়-জমা · অনুমোদিত")
        item.setdefault("language", "বাংলা")
        item.setdefault("submitter", {"name": "অজ্ঞাত জমাদানকারী", "contact": ""})
        item.setdefault("approvedAt", datetime.now(timezone.utc).isoformat(timespec="seconds"))
        item.setdefault("collection", "open")
        item.setdefault("rights", "open-license")
        item.setdefault("verification", "community-approved")
        item["community"] = True
        new_path = write_data_uri(item)
        if new_path:
            item["imageUrl"] = new_path
        items.append(item)
        by_id[item["id"]] = item
        added += 1

    doc["generated_at"] = datetime.now(timezone.utc).date().isoformat()
    DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"মিশানো হলো — সম্পাদনা {touched} · নতুন রেকর্ড {added} · আগেই মিশানো {skipped} · মোট {len(items)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
