#!/usr/bin/env python3
"""Validate the static heritage directory before publishing."""
from __future__ import annotations

import json
import sys
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"ERROR: required file is missing: {path.relative_to(ROOT)}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"ERROR: invalid JSON in {path.relative_to(ROOT)}: {exc}")

def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    sites_data = read_json(ROOT / "data" / "heritage-sites.json")
    sites = sites_data.get("records", []) if isinstance(sites_data, dict) else sites_data
    if not isinstance(sites, list):
        raise SystemExit("ERROR: data/heritage-sites.json must contain a records array")

    ids: set[str] = set()
    coord_count = 0
    approximate_count = 0
    for index, site in enumerate(sites):
        label = f"heritage_sites[{index}]"
        if not isinstance(site, dict):
            errors.append(f"{label} is not an object")
            continue
        site_id = site.get("id")
        if not isinstance(site_id, str) or not site_id.strip():
            errors.append(f"{label} has no valid id")
        elif site_id in ids:
            errors.append(f"duplicate site id: {site_id}")
        else:
            ids.add(site_id)
        name = site.get("name")
        if not isinstance(name, str) or not name.strip():
            errors.append(f"{label} has no name")
        loc = site.get("location_lat_long")
        if loc is not None:
            if not isinstance(loc, dict):
                errors.append(f"{label} location_lat_long should be an object or null")
            else:
                lat, lon = loc.get("latitude"), loc.get("longitude")
                try:
                    lat, lon = float(lat), float(lon)
                except (TypeError, ValueError):
                    errors.append(f"{label} has non-numeric coordinates")
                else:
                    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                        errors.append(f"{label} coordinates outside valid range")
                    coord_count += 1
        if site.get("pin_approximate") or site.get("verification_status") in {
            "approximate-coordinates", "needs-verification"
        }:
            approximate_count += 1
        if not site.get("source_url"):
            warnings.append(f"{site_id or label}: missing source_url")
    if isinstance(sites_data, dict) and sites_data.get("record_count") not in (None, len(sites)):
        errors.append("record_count does not match records length")

    events_data = read_json(ROOT / "data" / "events.json")
    events = events_data.get("events", []) if isinstance(events_data, dict) else events_data
    if not isinstance(events, list):
        errors.append("data/events.json must contain an events array")
        events = []
    event_ids: set[str] = set()
    for index, event in enumerate(events):
        event_id = event.get("id") if isinstance(event, dict) else None
        if not event_id:
            errors.append(f"events[{index}] has no id")
        elif event_id in event_ids:
            errors.append(f"duplicate event id: {event_id}")
        else:
            event_ids.add(event_id)

    seo_data = read_json(ROOT / "data" / "heritage-seo-bn.json")
    articles = seo_data.get("articles", []) if isinstance(seo_data, dict) else []
    if not isinstance(articles, list):
        errors.append("data/heritage-seo-bn.json must contain an articles array")
        articles = []
    article_ids: set[str] = set()
    under_target: list[str] = []
    for article in articles:
        if not isinstance(article, dict):
            errors.append("SEO article is not an object")
            continue
        article_id = article.get("id")
        if not article_id:
            errors.append("SEO article has no id")
        elif article_id in article_ids:
            errors.append(f"duplicate SEO article id: {article_id}")
        else:
            article_ids.add(article_id)
        words = len(str(article.get("content", "")).split())
        if words < 200:
            under_target.append(f"{article_id}: {words} whitespace-separated words")
    if under_target:
        errors.append("SEO content under 200 words: " + "; ".join(under_target[:10]))
    additions_data = read_json(ROOT / "data" / "heritage-sites-additions.json")
    additions_raw = additions_data.get("records", []) if isinstance(additions_data, dict) else []
    if not isinstance(additions_raw, list):
        errors.append("data/heritage-sites-additions.json must contain a records array")
        additions_raw = []
    bulk_fields = additions_data.get("bulk_fields", []) if isinstance(additions_data, dict) else []
    bulk_rows = additions_data.get("bulk", []) if isinstance(additions_data, dict) else []
    if bulk_rows and not isinstance(bulk_fields, list):
        errors.append("bulk_fields must be a list when bulk rows are present")
        bulk_fields = []
    additions: list[dict[str, Any]] = list(additions_raw)
    for index, row in enumerate(bulk_rows):
        if not isinstance(row, list) or len(row) > len(bulk_fields):
            errors.append(f"bulk[{index}] does not match bulk_fields")
            continue
        additions.append(dict(zip(bulk_fields, row)))
    if isinstance(additions_data, dict) and additions_data.get("addition_count") not in (None, len(additions)):
        errors.append("addition_count does not match heritage-sites-additions (bulk + records) length")
    addition_ids: set[str] = set()
    for index, addition in enumerate(additions):
        add_id = addition.get("id") if isinstance(addition, dict) else None
        if not add_id:
            errors.append(f"heritage_additions[{index}] has no id")
            continue
        if add_id in addition_ids:
            errors.append(f"duplicate heritage addition id: {add_id}")
            continue
        addition_ids.add(add_id)
        if not addition.get("name"):
            errors.append(f"heritage addition {add_id} has no name")
        if add_id in ids and not addition.get("in_base"):
            errors.append(f"heritage addition {add_id} duplicates a base record id")
    def normalized_place_name(value: Any) -> str:
        normalized = unicodedata.normalize("NFKC", str(value or "")).casefold()
        normalized = normalized.replace("\u09af\u09bc", "\u09df").replace("\u09a1\u09bc", "\u09dc")
        return "".join(ch for ch in normalized if ch.isalnum())
    def district_of(site: dict[str, Any]) -> str:
        return normalized_place_name(site.get("district"))

    def locality_of(site: dict[str, Any]) -> str:
        return normalized_place_name(site.get("village") or site.get("thana") or site.get("upazila"))
    base_names: dict[tuple[str, str], str] = {}
    for site in sites:
        if not isinstance(site, dict):
            continue
        normalized = normalized_place_name(site.get("name"))
        if normalized:
            base_names[(normalized, district_of(site), locality_of(site))] = str(site.get("name"))
    seen_addition_names: dict[tuple[str, str], str] = {}
    for addition in additions:
        if not isinstance(addition, dict):
            continue
        label = addition.get("name")
        key = (normalized_place_name(label), district_of(addition), locality_of(addition))
        if addition.get("in_base"):
            continue
        if key in base_names and str(label) == str(base_names[key]):
            errors.append(f"duplicate heritage addition name: {label} matches existing {base_names[key]} in the same locality")
        elif key in base_names:
            warnings.append(f"possible duplicate (human review): {label} ≈ {base_names[key]} in the same locality")
        elif key in seen_addition_names and str(label) == str(seen_addition_names[key]):
            errors.append(f"duplicate heritage addition name: {label} matches {seen_addition_names[key]} in the same locality")
        elif key in seen_addition_names:
            warnings.append(f"possible duplicate (human review): {label} ≈ {seen_addition_names[key]} in the same locality")
        elif key[0]:
            seen_addition_names[key] = str(label)
    normalized_canonical: dict[str, str] = {}
    for site in sites:
        if not isinstance(site, dict):
            continue
        label = site.get("name")
        normalized = normalized_place_name(label)
        if normalized in normalized_canonical and normalized:
            errors.append(f"duplicate normalized canonical name: {label} matches {normalized_canonical[normalized]}")
        elif normalized:
            normalized_canonical[normalized] = str(label)
    missing_articles = ids - article_ids - addition_ids
    if missing_articles:
        errors.append(f"{len(missing_articles)} heritage site(s) have no SEO article: {', '.join(sorted(missing_articles)[:10])}")

    schema = read_json(ROOT / "docs" / "firestore-schema.json")
    if not isinstance(schema, dict) or "collections" not in schema:
        errors.append("Firestore schema is missing its collections definition")
    rules = ROOT / "firestore.rules"
    if not rules.exists():
        errors.append("firestore.rules is missing")

    print(f"Sites: {len(sites)} (unique IDs: {len(ids)}; with coordinates: {coord_count})")
    print(f"Approximate or verification-pending map records: {approximate_count}")
    print(f"Additional records (heritage-sites-additions): {len(additions)}; with mobile: {sum(1 for a in additions if isinstance(a, dict) and a.get('mobile'))}")
    print(f"Festival/event records: {len(events)}")
    print(f"SEO drafts: {len(articles)}; shortest article: {min((len(str(a.get('content','')).split()) for a in articles if isinstance(a,dict)), default=0)} words")
    print(f"Firestore schema: {'present' if isinstance(schema,dict) else 'invalid'}")
    for warning in warnings[:20]:
        print("WARNING:", warning)
    if len(warnings) > 20:
        print(f"WARNING: {len(warnings)-20} additional records without source URLs")
    if errors:
        for error in errors:
            print("ERROR:", error)
        return 1
    print("PASS: structural checks completed. Human historical/coordinate review is still required.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
