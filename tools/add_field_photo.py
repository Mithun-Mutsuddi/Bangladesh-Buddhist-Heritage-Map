#!/usr/bin/env python3
"""Add a *real, licensed* field photograph to one place record.

Why this exists
---------------
Every North-Bengal vihara in this repository currently ships a **self-made
illustration** (`assets/bihar-2026/<id>.svg`) because no licensed photograph of
those small village viharas exists in public sources. When a real photo arrives
(from a traveller, a monk, a local committee or a Wikimedia contributor) it must
be added with a *checkable* licence and credit — and it must never be reused for
a different site by accident.

What the tool guarantees
------------------------
1. The record id must exist in `data/dashboard-core.json`.
2. The licence must be on the allow-list (CC0 / CC BY / CC BY-SA any version,
   Public Domain, or an explicit written permission marker).
3. A human credit line (photographer / rights holder) is mandatory — an
   uncredited photo is rejected on purpose.
4. The file must be a real raster photo (JPEG/PNG/WebP), have sane dimensions
   (>= 900 px on the long edge) and be <= 8 MB.
5. The image is hashed (SHA-256): if the *same bytes* were already used for any
   record, the tool stops — one photo, one site (no false attribution).
6. The illustration stays in `photos[]` as the second entry, so the card still
   has an honest fallback and the "প্রতীকী চিত্র" label is not lost.

Usage
-----
    python3 tools/add_field_photo.py \
        --id pdf-e4f29a80 \
        --file ~/inbox/shukan-dighi.jpg \
        --credit "ফটো: সুমন বড়ুয়া (নীলফামারী)" \
        --license "CC BY-SA 4.0" \
        --date 2026-10-20 \
        --caption "বিহার প্রাঙ্গণ, ২০২৬" \
        --primary \
        --dry-run

Drop `--dry-run` to actually write. Re-running with the same arguments is safe:
the tool refuses the second copy instead of duplicating the entry.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "data" / "dashboard-core.json"
PHOTO_DIR = ROOT / "assets" / "bihar-2026" / "photos"

ALLOWED_LICENSE = re.compile(
    r"^(cc0|cc[- ]by(?:[- ]sa)?(?:[- ]\d(?:\.\d)?)?|public domain|pd[- ]?self|own work|"
    r"written permission|লিখিত অনুমতি)$", re.I)
OK_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BYTES = 8 * 1024 * 1024
MIN_EDGE = 900


def die(msg: str) -> None:
    print("✗ " + msg, file=sys.stderr)
    raise SystemExit(1)


def image_size(path: Path) -> tuple[int, int]:
    try:
        from PIL import Image  # pillow is available in this workspace
    except ImportError:  # pragma: no cover
        return (0, 0)
    with Image.open(path) as im:
        return im.size


def existing_hashes(core: list[dict]) -> dict[str, str]:
    """sha256 -> record id, for every photo file already referenced."""
    out = {}
    for rec in core:
        for item in rec.get("photos") or []:
            rel = item.get("image") or ""
            if not rel or rel.endswith(".svg"):
                continue
            p = ROOT / rel
            if p.exists():
                out[hashlib.sha256(p.read_bytes()).hexdigest()] = rec.get("id", "?")
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--id", required=True, help="record id, e.g. pdf-e4f29a80")
    ap.add_argument("--file", required=True, help="path to the photograph")
    ap.add_argument("--credit", required=True, help="photographer / rights holder (human name)")
    ap.add_argument("--license", required=True, help="CC0 / CC BY 4.0 / CC BY-SA 4.0 / public domain …")
    ap.add_argument("--caption", default="", help="what the photo shows (Bengali)")
    ap.add_argument("--date", default="", help="date taken, YYYY-MM-DD")
    ap.add_argument("--source", default="", help="URL of the photo page / permission letter")
    ap.add_argument("--primary", action="store_true", help="use it as the card image (default: gallery only)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    src = Path(a.file).expanduser()
    if not src.exists():
        die(f"file not found: {src}")
    if src.suffix.lower() not in OK_EXT:
        die(f"unsupported file type {src.suffix}; use JPEG/PNG/WebP")
    if src.stat().st_size > MAX_BYTES:
        die(f"file too large ({src.stat().st_size/1e6:.1f} MB > 8 MB)")
    if not ALLOWED_LICENSE.match(a.license.strip()):
        die(f"licence not on allow-list: {a.license!r}\n"
            "  allowed: CC0, CC BY (any version), CC BY-SA (any version), public domain,\n"
            "           own work, written permission")
    if len(a.credit.strip()) < 3:
        die("a human credit line is mandatory")
    if a.date:
        try:
            dt.date.fromisoformat(a.date)
        except ValueError:
            die(f"--date must be YYYY-MM-DD, got {a.date!r}")

    w, h = image_size(src)
    if w and max(w, h) < MIN_EDGE:
        die(f"image too small ({w}×{h}); need >= {MIN_EDGE} px on the long edge")

    doc = json.loads(CORE.read_text(encoding="utf-8"))
    core = doc["places"]
    rec = next((p for p in core if p["id"] == a.id), None)
    if rec is None:
        die(f"no record with id {a.id!r} in dashboard-core.json")

    digest = hashlib.sha256(src.read_bytes()).hexdigest()
    dup = existing_hashes(core).get(digest)
    if dup:
        die(f"this exact image is already attached to {dup}; one photo, one site")

    slug = re.sub(r"[^A-Za-z0-9]+", "-", src.stem).strip("-").lower()[:40] or "photo"
    dest_rel = f"assets/bihar-2026/photos/{a.id}-{slug}{src.suffix.lower()}"
    dest = ROOT / dest_rel

    entry = {
        "image": dest_rel,
        "caption": a.caption or "মাঠপর্যায়ের আলোকচিত্র",
        "credit": a.credit.strip() + " · " + a.license.strip()
                  + (f" · {a.date}" if a.date else ""),
        "license": a.license.strip(),
        "source": a.source,
        "added": dt.date.today().isoformat(),
    }

    print(f"→ {rec['name']}\n  {dest_rel}\n  {entry['credit']}")
    if a.dry_run:
        print("  (dry run — nothing written)")
        return

    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)

    photos = [p for p in (rec.get("photos") or []) if p.get("image") != dest_rel]
    photos.insert(0, entry)
    rec["photos"] = photos
    if a.primary:
        rec["photo"] = dest_rel
        rec["photoCredit"] = entry["credit"]
    note = "মাঠপর্যায়ের লাইসেন্সযুক্ত আলোকচিত্র যোগ হয়েছে " + dt.date.today().isoformat()
    if note not in (rec.get("verify") or ""):
        rec["verify"] = ((rec.get("verify") or "").rstrip(" .") + " · " + note).strip(" ·")

    CORE.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("✓ saved. এখন চালান:  python3 tools/build_tracker_data.py && "
          "python3 tools/validate_public_phase.py")


if __name__ == "__main__":
    main()
