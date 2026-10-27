#!/usr/bin/env python3
"""Regression checks for the 2026-10-24 public archive/geography phase."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def main():
    errors = []
    core_doc = load("dashboard-core.json")
    directory_doc = load("dashboard-directory.json")
    tracker_doc = load("tracker-places.json")
    geo = load("bd-geo.json")
    archive = load("historical-archive.json")
    library = load("heritage-library.json")
    creators = load("heritage-creators.json")
    core = core_doc["places"]
    directory = [dict(zip(directory_doc["fields"], row)) for row in directory_doc["places"]]
    tracker = tracker_doc["places"]

    if len(core) != 386 or len(directory) != 2832 or len(core) + len(directory) != 3218:
        errors.append(f"record totals changed: {len(core)} + {len(directory)}")
    if len(tracker) != 3218:
        errors.append(f"tracker total changed: {len(tracker)}")

    ids = [p["id"] for p in core + directory]
    if len(set(ids)) != len(ids):
        errors.append("duplicate IDs across core/directory")
    if {p["id"] for p in tracker} != set(ids):
        errors.append("tracker IDs do not match core + directory")

    divisions = len(geo)
    districts = sum(len(v.get("d", [])) for v in geo)
    upazilas = sum(len(d.get("u", [])) for v in geo for d in v.get("d", []))
    unions = sum(len(u.get("un", [])) for v in geo for d in v.get("d", []) for u in d.get("u", []))
    if (divisions, districts, upazilas, unions) != (8, 64, 495, 4540):
        errors.append(f"gazetteer totals changed: {(divisions, districts, upazilas, unions)}")
    division_for = {d["n"]: v["n"] for v in geo for d in v.get("d", [])}
    valid_upazilas = {(d["n"], u["n"]) for v in geo for d in v.get("d", []) for u in d.get("u", [])}

    def check_records(records, label, compact=False):
        for p in records:
            get = lambda key, alt: p.get(alt if compact else key, p.get(key, ""))
            district = get("district", "ds")
            division = get("division", "dv")
            upazila = get("upazila", "up")
            thana = get("thana", "th")
            name = get("name", "n")
            if district in division_for and division != division_for[district]:
                errors.append(f"{label} {p.get('id')}: division/district mismatch")
            if upazila and (district, upazila) not in valid_upazilas:
                errors.append(f"{label} {p.get('id')}: upazila not in district gazetteer: {district}/{upazila}")
            if upazila and thana and (district, upazila) in valid_upazilas and (district, thana) in valid_upazilas and upazila != thana:
                errors.append(f"{label} {p.get('id')}: rural upazila/thana conflict")
            for field in (name, get("village", "vi")):
                if isinstance(field, str) and re.match(r"^[েৈোৌ]", field):
                    errors.append(f"{label} {p.get('id')}: leading dependent vowel sign")

    check_records(core, "core")
    check_records(directory, "directory", compact=True)
    check_records(tracker, "tracker")

    # The compiled tracker must retain corrected administrative fields and
    # post-office metadata (both post_office and postOffice occur upstream).
    source_by_id = {}
    for p in core:
        source_by_id[p["id"]] = (p.get("upazila", ""), p.get("thana", ""), p.get("union", ""), p.get("post", ""))
    for p in directory:
        source_by_id[p["id"]] = (p.get("up", ""), p.get("th", ""), p.get("un", ""), p.get("po", ""))
    # build_tracker_data.py overlays the richer editorial source records on
    # core. Mirror that effective-source rule in this regression check.
    for p in load("heritage-sites.json")["records"]:
        if p["id"] in source_by_id:
            old = source_by_id[p["id"]]
            source_by_id[p["id"]] = (
                p.get("upazila", old[0]), p.get("thana", old[1]), p.get("union", old[2]),
                p.get("post_office") or p.get("postOffice") or old[3],
            )
    for p in tracker:
        expected = source_by_id.get(p["id"])
        actual = (p.get("upazila", ""), p.get("thana", ""), p.get("union", ""), p.get("post", ""))
        if expected != actual:
            errors.append(f"tracker {p['id']}: administrative/post fields are stale")

    banned = ["যাচাইধীন", "শশ্মান", "প্রত্নস্থান", "রাঙ্গামাটি", "লক্ষীছড়ি", "সীতাকুণ্ড", "তালতলী", "সোনাইমুড়ি"]
    for name in ["dashboard-core.json", "dashboard-directory.json", "heritage-sites.json", "heritage-sites-additions.json", "bd-geo.json"]:
        text = (DATA / name).read_text(encoding="utf-8")
        for word in banned:
            if word in text:
                errors.append(f"{name}: non-canonical spelling remains: {word}")

    items = archive.get("items", [])
    if len(items) != archive.get("stats", {}).get("gateways"):
        errors.append("archive gateway stat does not match item count")
    if archive.get("stats", {}).get("libraryItems") != len(library.get("items", [])):
        errors.append("archive library stat is stale")
    if archive.get("stats", {}).get("creatorEntries") != len(creators.get("records", [])):
        errors.append("archive creator stat is stale")
    archive_ids = [p.get("id") for p in items]
    if len(set(archive_ids)) != len(archive_ids):
        errors.append("duplicate archive item IDs")
    for item in items:
        for field in ["titleBn", "titleEn", "summaryBn", "summaryEn", "source", "sourceUrl", "rights", "verification"]:
            if not item.get(field):
                errors.append(f"archive {item.get('id')}: missing {field}")
        if item.get("verification") not in archive.get("verificationLabels", {}):
            errors.append(f"archive {item.get('id')}: unknown verification state")
        if item.get("rights") not in archive.get("rightsLabels", {}):
            errors.append(f"archive {item.get('id')}: unknown rights state")

    dashboard = (ROOT / "dashboard.js").read_text(encoding="utf-8")
    language = (ROOT / "language.js").read_text(encoding="utf-8")
    if "upazilaFilter" not in dashboard or "bd-geo.json" not in dashboard:
        errors.append("active dashboard lacks the gazetteer-backed upazila path")
    for code in ["ccp", "rmz", "bn", "en"]:
        if code not in language:
            errors.append(f"language control lacks {code}")

    print(f"Core: {len(core)}; directory: {len(directory)}; tracker: {len(tracker)}; total: {len(core) + len(directory)}")
    print(f"Gazetteer: {divisions} divisions / {districts} districts / {upazilas} upazilas / {unions} unions")
    print(f"Archive gateways: {len(items)}; linked library items: {archive['stats']['libraryItems']}; creator entries: {archive['stats']['creatorEntries']}")
    if errors:
        for error in errors[:80]:
            print("ERROR:", error)
        if len(errors) > 80:
            print(f"ERROR: {len(errors) - 80} more")
        return 1
    print("PASS: totals, IDs, geography, spelling guards, tracker sync, archive metadata and language hooks.")
    print("NOTE: historical claims and external media still require human source/licence review; this is not an internet-wide verification claim.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
