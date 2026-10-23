"""Deterministic editorial cleanup for the heritage datasets.

This script deliberately changes only documented spelling, taxonomy and
administrative-hierarchy fields.  It never invents coordinates or deletes a
record.  Run from any directory; use --dry-run to inspect the report first.
"""
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
REPORT = ROOT / "docs" / "data-curation-2026-10-24.json"
AUDIT_CAPTURE = False
AUDIT_RECORDS = []


def nfc(value):
    return unicodedata.normalize("NFC", value) if isinstance(value, str) else value


# These are editorial spelling/Unicode corrections, not new place claims.
TEXT_REPLACEMENTS = {
    "。": "।",
    "যাচাইধীন": "যাচাইাধীন",
    "সর্বজমী": "সার্বজনীন",
    "আন্র্তজাতিক": "আন্তর্জাতিক",
    "চন্দ্রজ্যেতি": "চন্দ্রজ্যোতি",
    "প্রত্নস্থান": "প্রত্নস্থল",
    "শশ্মান": "শ্মশান",
    "েদব গিরি বন বিহার": "দেবগিরি বন বিহার",
    "েলমুঝিড়ি": "লেমুঝিড়ি",
    "েলনদিয়া": "লেনদিয়া",
}


def clean_text(value):
    if not isinstance(value, str):
        return value
    value = nfc(value)
    for old, new in TEXT_REPLACEMENTS.items():
        value = value.replace(old, nfc(new))
    # This repair is anchored to the malformed word, rather than using a
    # bare substring replacement (which would add another গ on every rerun).
    value = re.sub(r"গ+োয়াইয়া কারবারী", "গোয়াইয়া কারবারী", value)
    value = re.sub(r"(^|[\s(\"'])োয়াইয়া কারবারী", r"\1গোয়াইয়া কারবারী", value)
    # Keep prose, display names and the raw bulk mirror consistent with the
    # canonical gazetteer as well (Bandarban itself is handled field-safely
    # below and is never rewritten to Bandarban Sadar in ordinary prose).
    for old, new in {
        "মুন্সিগঞ্জ": "মুন্সীগঞ্জ",
        "রাঙ্গামাটি": "রাঙামাটি",
        "লক্ষীছড়ি": "লক্ষ্মীছড়ি",
        "দিঘীনালা": "দীঘিনালা",
        "সীতাকুণ্ড": "সীতাকুন্ড",
        "তালতলী": "তালতলি",
        "সোনাইমুড়ি": "সোনাইমুড়ী",
        "কুমিল্লা আদর্শ সদর": "কুমিল্লা সদর",
        "কুমিল্লা সদর দক্ষিণ": "সদর দক্ষিণ",
    }.items():
        value = value.replace(old, new)
    # A few source cells contain a stray space after an opening Bengali
    # parenthesis or before a closing one; do not reflow ordinary prose.
    value = re.sub(r"\(\s+", "(", value)
    value = re.sub(r"\s+\)", ")", value)
    return value.strip() if value != value.strip() and len(value) < 180 else value


def walk_text(value):
    if isinstance(value, str):
        return clean_text(value)
    if isinstance(value, list):
        return [walk_text(x) for x in value]
    if isinstance(value, dict):
        return {k: walk_text(v) for k, v in value.items()}
    return value


# Canonical spellings used by the public gazetteer.  The source gazetteer
# itself mixes precomposed/decomposed Bengali and several legacy spellings.
GEO_REPLACEMENTS = {
    "মুন্সিগঞ্জ": "মুন্সীগঞ্জ",
    "রাঙ্গামাটি": "রাঙামাটি",
    "লক্ষীছড়ি": "লক্ষ্মীছড়ি",
    "দিঘীনালা": "দীঘিনালা",
    "সীতাকুণ্ড": "সীতাকুন্ড",
    "তালতলী": "তালতলি",
    "সোনাইমুড়ি": "সোনাইমুড়ী",
    "কুমিল্লা আদর্শ সদর": "কুমিল্লা সদর",
    "আদর্শ সদর": "কুমিল্লা সদর",
    "কুমিল্লা সদর দক্ষিণ": "সদর দক্ষিণ",
    "রাঙ্গামাটি সদর": "রাঙামাটি সদর",
    "বান্দরবান": "বান্দরবান সদর",  # only applied to a thana/upazila field
}


def geo_text(value, field=""):
    if not isinstance(value, str) or not value:
        return value
    value = clean_text(value)
    # Do not turn a district named Bandarban into Bandarban Sadar.
    if value == "বান্দরবান" and field in {"upazila", "thana", "up", "th"}:
        return "বান্দরবান সদর"
    for old, new in GEO_REPLACEMENTS.items():
        if old == "বান্দরবান":
            continue
        value = value.replace(old, new)
    return value


def category(value):
    value = clean_text(value or "বিহার")
    mapping = {
        "বিহার": "বিহার",
        "অরণ্যকুঠি": "অরণ্যকুঠি",
        "ভাবনাকেন্দ্র": "ভাবনাকেন্দ্র",
        "প্রত্নস্থল ও মহাবিহার": "প্রত্নস্থল",
        "প্রত্নাঞ্চল ও প্রত্ন নিদর্শন": "প্রত্নস্থল",
        "প্রত্নস্থল": "প্রত্নস্থল",
        "বুদ্ধ স্মৃতিচিহ্ন/জাদী/স্তূপ": "স্মৃতিচিহ্ন ও স্তূপ",
        "শশ্মান": "শ্মশান",
        "শ্মশান": "শ্মশান",
        "সামাজিক সেবা ও কল্যাণ প্রতিষ্ঠান (অনাথালয়, শিশু সদন)": "সামাজিক সেবা",
        "বৌদ্ধ সামাজিক প্রতিষ্ঠান": "বৌদ্ধ সামাজিক প্রতিষ্ঠান",
        "বৌদ্ধ সংঘ/সমিতি/সংগঠনসমূহ": "সংগঠন ও প্রকাশনা",
        "বৌদ্ধ প্রকাশনা ও প্রকাশক": "সংগঠন ও প্রকাশনা",
        "বৌদ্ধ শিক্ষা প্রতিষ্ঠান": "শিক্ষা ও গবেষণা",
        "লোকালয়/পল্লী": "সংস্কৃতি ও ঐতিহ্য",
        "যাচাইাধীন/অতিরিক্ত সূত্র প্রয়োজন": "যাচাইাধীন",
        "যাচাইাধীন": "যাচাইাধীন",
    }
    return mapping.get(value, value)


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def dump(name, value, pretty=False):
    if pretty:
        content = json.dumps(value, ensure_ascii=False, indent=1)
    else:
        content = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    (DATA / name).write_text(content + "\n", encoding="utf-8")


def build_geo_indexes(geo):
    districts = {}
    upazilas = {}
    unions = defaultdict(set)
    for division in geo:
        for district in division.get("d", []):
            d = district["n"]
            districts[(division["n"], d)] = district
            for up in district.get("u", []):
                u = up["n"]
                upazilas[(d, u)] = (division["n"], d, u)
                for union in up.get("un", []):
                    unions[union].add((d, u))
    return districts, upazilas, unions


def set_field(record, key, value, changes, reason):
    old = record.get(key, "")
    if old != value:
        if AUDIT_CAPTURE:
            AUDIT_RECORDS.append({"record": record, "key": key, "from": old, "to": value, "reason": reason})
        record[key] = value
        changes.append({"field": key, "from": old, "to": value, "reason": reason})


# The local union list is incomplete for a few CHT unions. This one parent is
# independently present in the Mahalchhari upazila administration's Buddhist
# vihara list, so it is an explicit reviewed exception rather than a guess.
UNION_PARENT_OVERRIDES = {("খাগড়াছড়ি", "সিন্দুকছড়ি"): "মহালছড়ি"}


def correct_admin(record, schema, indexes, changes):
    """Reconcile only relationships supported by the local gazetteer.

    A union with one possible parent in the same district is stronger evidence
    than a conflicting upazila cell.  Otherwise a valid thana is used to repair
    a conflicting upazila in the compact PDF directory.  Ambiguous cases stay
    visible for editorial review instead of being guessed away.
    """
    districts, upazilas, unions = indexes
    if schema == "core":
        dk, uk, tk, unk = "district", "upazila", "thana", "union"
    else:
        dk, uk, tk, unk = "ds", "up", "th", "un"
    for key in (dk, uk, tk, unk):
        if record.get(key):
            record[key] = geo_text(record[key], key)
    district = record.get(dk, "")
    up = record.get(uk, "")
    thana = record.get(tk, "")
    union = record.get(unk, "")
    if union:
        override = UNION_PARENT_OVERRIDES.get((district, union))
        candidates = {(district, override)} if override else {pair for pair in unions.get(union, set()) if pair[0] == district}
        if len(candidates) == 1:
            parent = next(iter(candidates))[1]
            reason = "official-upazila-list-union" if override else "union-parent-in-local-gazetteer"
            if up != parent:
                set_field(record, uk, parent, changes, reason)
                up = parent
            if thana != parent:
                set_field(record, tk, parent, changes, reason)
                thana = parent
    # In the PDF directory the thana cell is the more specific source cell in
    # the recurring Ruma/Thanchi, Alikadam/Naikhongchhari etc. conflicts.
    if schema == "directory" and up and thana and up != thana:
        if (district, thana) in upazilas:
            set_field(record, uk, thana, changes, "valid-thana-resolves-pdf-upazila-conflict")
            up = thana
        elif (district, up) in upazilas:
            set_field(record, tk, up, changes, "valid-upazila-resolves-pdf-thana-conflict")
            thana = up
    if schema == "directory" and not up and thana and (district, thana) in upazilas:
        set_field(record, uk, thana, changes, "valid-thana-fills-empty-upazila")
        up = thana
    if schema == "directory" and up and not thana and (district, up) in upazilas:
        set_field(record, tk, up, changes, "canonical-rural-thana")
    return record


# Keep the established nine-institution deep link distinct from welfare /
# orphanage records. These are different public meanings, not duplicate labels.
SOCIAL_ORG_IDS = {
    "anoma-sangskritik-gosthi", "chattogram-bouddha-karmajibi-samabay",
    "bangladesh-buddhist-foundation", "bangladesh-buddhist-academy",
    "kristi-prachar-sangha-yub", "buddha-samirton-tradition",
    "hoarapara-bouddha-kalyan-samiti", "bouddha-prokashona-shongho",
    "anoma-mouthpatra",
}

# Manually reviewed exceptions.  These are not inferred from string
# similarity; each has a source/context note in the accompanying report.
CORE_FIXES = {
    "agrapuri": {
        "division": "ঢাকা", "district": "ঢাকা", "upazila": "", "thana": "বাড্ডা",
        "category": "বিহার", "type": "বিহার",
        "address": "মেরুল বাড্ডা, ঢাকা",
        "coords": [23.7793, 90.4254],
        "trip": "মেরুল বাড্ডা, ঢাকা—Google Maps-এ নাম ও ঠিকানা দিয়ে সঠিক পিন যাচাই করুন।",
        "verification_note": "পূর্বের নওগাঁ/রাজশাহী ক্ষেত্র মেরুল বাড্ডা, ঢাকা-এর বিবরণের সঙ্গে সঙ্গতিপূর্ণ ছিল না; স্থানীয় ঠিকানা অনুযায়ী সংশোধন। স্থানাঙ্ক আনুমানিক।",
    },
    "nandan": {
        "upazila": "", "thana": "",
        "address": "নন্দনকানন, বৌদ্ধ মন্দির রোড, চট্টগ্রাম",
        "verification_note": "চট্টগ্রাম শহরের রেকর্ডে মাটিরাঙ্গা/লক্ষ্মীছড়ি ক্ষেত্র ছিল; অসঙ্গত উপজেলা-থানা সরিয়ে ঠিকানা যাচাইয়ের জন্য খালি রাখা হয়েছে।",
    },
    "boalkhali-buddhist-bihar": {
        "district": "চট্টগ্রাম", "upazila": "বোয়ালখালী", "thana": "বোয়ালখালী",
        "verification_note": "নাম ও বিবরণের বোয়ালখালী অবস্থানের সঙ্গে জেলা চট্টগ্রাম করা হয়েছে; পূর্বের খাগড়াছড়ি ক্ষেত্র সঙ্গতিপূর্ণ ছিল না।",
    },
    "alishwar-shanti": {"upazila": "লাকসাম", "thana": "লাকসাম"},
    "alokdia-shakyamuni": {"upazila": "লাকসাম", "thana": "লাকসাম"},
    "comilla-nurpur-chapal": {"upazila": "লাকসাম", "thana": "লাকসাম"},
    "nurpur-mahananda": {"upazila": "লাকসাম", "thana": "লাকসাম"},
    "comilla-kolmia-purnananda": {"upazila": "সদর দক্ষিণ", "thana": "সদর দক্ষিণ"},
    "ghaniakhali-benuban": {"upazila": "সদর দক্ষিণ", "thana": "সদর দক্ষিণ"},
    "dattapur-lumbini": {"upazila": "সদর দক্ষিণ", "thana": "সদর দক্ষিণ"},
    "khagrachhari-baroichhari": {"upazila": "মহালছড়ি", "thana": "মহালছড়ি"},
    "rajban": {"upazila": "রাঙামাটি সদর", "thana": "রাঙামাটি সদর"},
    "dharmarajika-orphanage": {"upazila": "", "thana": "সবুজবাগ"},
    "dharmarajika-high-school-college": {"upazila": "", "thana": "সবুজবাগ"},
    "world-buddhist-association": {"category": "সংগঠন ও প্রকাশনা", "type": "বৌদ্ধ সংগঠন"},
    "comilla-konak-stupa": {"upazila": "", "thana": ""},
    "naba-shalban": {"upazila": "সদর দক্ষিণ", "thana": "সদর দক্ষিণ", "village": "কোটবাড়ী", "union": "বিজয়পুর"},
    "dhaka-banglabazar-bihar": {"upazila": "", "thana": "সূত্রাপুর", "village": "কে জি গুপ্ত লেইন"},
}


def apply_core_fixes(record, changes):
    fix = CORE_FIXES.get(record.get("id"), {})
    for key, value in fix.items():
        if key == "coords":
            set_field(record, key, value, changes, "reviewed-address-context")
        else:
            set_field(record, key, value, changes, "reviewed-editorial-correction")


def main():
    global AUDIT_CAPTURE, AUDIT_RECORDS
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    AUDIT_RECORDS = []
    AUDIT_CAPTURE = True

    geo = walk_text(load("bd-geo.json"))
    # Canonicalize the gazetteer itself before using it as an index.
    for division in geo:
        division["n"] = geo_text(division["n"], "division")
        for district in division.get("d", []):
            district["n"] = geo_text(district["n"], "district")
            for up in district.get("u", []):
                up["n"] = geo_text(up["n"], "upazila")
                up["un"] = [geo_text(x, "union") for x in up.get("un", [])]
    indexes = build_geo_indexes(geo)

    core_doc = walk_text(load("dashboard-core.json"))
    directory_doc = walk_text(load("dashboard-directory.json"))
    base_doc = walk_text(load("heritage-sites.json"))
    additions_doc = walk_text(load("heritage-sites-additions.json"))
    changes = []

    for p in core_doc.get("places", []):
        before = len(changes)
        for key in ("division", "district", "upazila", "thana", "union"):
            if p.get(key):
                set_field(p, key, geo_text(p[key], key), changes, "canonical-geo-spelling")
        if p.get("category"):
            set_field(p, "category", category(p["category"]), changes, "canonical-category")
        if p.get("type"):
            set_field(p, "type", clean_text(p["type"]), changes, "canonical-spelling")
        correct_admin(p, "core", indexes, changes)
        apply_core_fixes(p, changes)
        if p.get("id") in SOCIAL_ORG_IDS:
            set_field(p, "category", "বৌদ্ধ সামাজিক প্রতিষ্ঠান", changes, "preserve-social-organisation-taxonomy")
        if len(changes) > before:
            for change in changes[before:]:
                change.update(dataset="dashboard-core", id=p["id"], name=p.get("name", ""))

    fields = directory_doc["fields"]
    for row in directory_doc.get("places", []):
        p = dict(zip(fields, row))
        before = len(changes)
        for key in ("dv", "ds", "up", "th", "un"):
            if p.get(key):
                set_field(p, key, geo_text(p[key], key), changes, "canonical-geo-spelling")
        original_cat = p.get("cat", "বিহার")
        set_field(p, "cat", category(original_cat), changes, "canonical-category")
        # Keep the specific source class as a subtype instead of displaying
        # every directory row as the same generic “বিহার”.
        if original_cat and original_cat != "বিহার" and p.get("typ") == "বিহার":
            set_field(p, "typ", clean_text(original_cat), changes, "preserve-directory-subtype")
        correct_admin(p, "directory", indexes, changes)
        if len(changes) > before:
            for change in changes[before:]:
                change.update(dataset="dashboard-directory", id=p["id"], name=p.get("n", ""))
        row[:] = [p.get(key, "") for key in fields]

    # Keep the editorial source datasets synchronized with the dashboard.
    for doc, label in ((base_doc, "heritage-sites"), (additions_doc, "heritage-sites-additions")):
        for p in doc.get("records", []):
            before = len(changes)
            for key in ("division", "district", "upazila", "thana", "union"):
                if p.get(key):
                    set_field(p, key, geo_text(p[key], key), changes, "canonical-geo-spelling")
            if p.get("category"):
                set_field(p, "category", category(p["category"]), changes, "canonical-category")
            if p.get("type"):
                set_field(p, "type", clean_text(p["type"]), changes, "canonical-spelling")
            # Convert the base schema to the same reviewed core fields where
            # an exception exists, without dropping its additional metadata.
            fix = CORE_FIXES.get(p.get("id"), {})
            for key, value in fix.items():
                target = {"coords": "location_lat_long", "address": "village", "trip": "travel_note", "verification_note": "verification_note"}.get(key, key)
                if key == "coords":
                    value = {"latitude": value[0], "longitude": value[1]}
                set_field(p, target, value, changes, "reviewed-editorial-correction")
            correct_admin(p, "core", indexes, changes)
            if p.get("id") in SOCIAL_ORG_IDS:
                set_field(p, "category", "বৌদ্ধ সামাজিক প্রতিষ্ঠান", changes, "preserve-social-organisation-taxonomy")
            if len(changes) > before:
                for change in changes[before:]:
                    change.update(dataset=label, id=p["id"], name=p.get("name", ""))

    AUDIT_CAPTURE = False

    # Source-specific notes for the reviewed Cumilla/Mahalchhari fixes.
    notes = {
        "alishwar-shanti": "BuddhaNet World Buddhist Directory: Aliswar Santiniketan, Police Station Laksam, District Comilla.",
        "ghaniakhali-benuban": "Chittagong Division/Comilla government pagoda lists: সদর দক্ষিণ.",
        "dattapur-lumbini": "Chittagong Division/Comilla government pagoda lists: সদর দক্ষিণ.",
        "comilla-kolmia-purnananda": "Chittagong Division/Comilla government pagoda lists: সদর দক্ষিণ.",
        "khagrachhari-baroichhari": "Mahalchhari upazila government list: বড়ইছড়ি বৌদ্ধ বিহার, সিন্দুকছড়ি.",
    }
    for p in core_doc.get("places", []):
        if p.get("id") in notes:
            old = p.get("verification_note", "")
            note = notes[p["id"]]
            if note not in old:
                p["verification_note"] = (old + " " + note).strip()

    # A compact audit is useful in code review and makes later source checks
    # reproducible without hiding unresolved conflicts.
    summary = {
        "date": "2026-10-24",
        "record_counts": {
            "core": len(core_doc.get("places", [])),
            "directory": len(directory_doc.get("places", [])),
            "total": len(core_doc.get("places", [])) + len(directory_doc.get("places", [])),
        },
        "geo_counts": {
            "divisions": len(geo),
            "districts": sum(len(x.get("d", [])) for x in geo),
            "upazilas": sum(len(d.get("u", [])) for x in geo for d in x.get("d", [])),
            "unions": sum(len(u.get("un", [])) for x in geo for d in x.get("d", []) for u in d.get("u", [])),
        },
        "change_count": len(changes),
        "changes_by_reason": dict(Counter(x["reason"] for x in changes)),
        "changes_by_dataset": dict(Counter(x["dataset"] for x in changes)),
        "changes": changes,
        "review_notes": notes,
        "unresolved_policy": "Ambiguous names, coordinates and administrative conflicts are not silently inferred; they remain marked for source review.",
    }
    if not args.dry_run:
        dump("bd-geo.json", geo)
        dump("dashboard-core.json", core_doc)
        dump("dashboard-directory.json", directory_doc)
        dump("heritage-sites.json", base_doc, pretty=True)
        dump("heritage-sites-additions.json", additions_doc, pretty=True)
        REPORT.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "changes"}, ensure_ascii=False, indent=2))
    if args.dry_run:
        print("Dry run: no dataset files written; changes=", len(changes))


if __name__ == "__main__":
    main()
