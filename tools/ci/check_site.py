#!/usr/bin/env python3
"""Site integrity gate — রিপোজিটরির ভেতরের সব ফাইলের স্থির-বিশ্লেষণ।

কী যাচাই হয়:
  1. প্রতিটি HTML-এর local href/src/formaction আর CSS-এর url() সত্যিই আছে কি না
     (external https:, data:, mailto:, tel:, #hash, javascript: বাদ)।
  2. একই পাতায় duplicate id আছে কি না (getElementById ভাঙার কারণ)।
  3. <img> / <svg role=img>-এ alt বা aria-label আছে কি না।
  4. প্রতিটি <meta name="viewport"> আছে কি না (মোবাইল রেন্ডারের শর্ত)।
  5. data/*.json সব parse হয় কি না এবং পরিচিত তালিকায় duplicate id নেই কি না।
  6. HTML-এ http:// (mixed-content ঝুঁকি) লিংক নেই কি না — সতর্কতা হিসেবে।

ব্যবহার:  python tools/ci/check_site.py [--json]
ব্যর্থ হলে exit code 1; শুধু সতর্কতা হলে 0।
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]

SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", "test-results", "playwright-report",
    ".venv", "venv", "dist", "build", "coverage", ".next", ".cache",
}
SKIP_FILES = {"buddha-vamsa-preview.html"}  # ১২ MB inlined bundle, নিজস্ব build script দিয়ে যাচাই হয়

EXTERNAL_PREFIXES = ("http://", "https://", "//", "data:", "mailto:", "tel:", "sms:", "javascript:", "blob:", "about:", "chrome:")
ASSET_ATTRS = {"href", "src", "poster", "data-src", "formaction"}
CSS_URL = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", re.I)


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: dict[str, int] = {}
        self.refs: list[tuple[str, str, int]] = []       # (tag, value, line)
        self.images: list[tuple[bool, int]] = []         # (has_alt, line)
        self.hidden_depth = 0                             # aria-hidden="true" সাবট্রি
        self.has_viewport = False
        self.inline_ids: set[str] = set()

    def handle_starttag(self, tag, attrs):  # noqa: D102
        a = dict(attrs)
        line = self.getpos()[0]
        if (a.get("aria-hidden") or "").lower() == "true" and tag not in {"img", "br", "hr", "input", "meta", "link"}:
            self.hidden_depth += 1
        el_id = (a.get("id") or "").strip()
        if el_id:
            self.ids[el_id] = self.ids.get(el_id, 0) + 1
        for name, value in attrs:
            if name in ASSET_ATTRS and value:
                self.refs.append((tag, value, line))
        if tag == "meta" and (a.get("name") or "").lower() == "viewport":
            self.has_viewport = True
        if tag == "img":
            # alt="" ইচ্ছাকৃত সাজসজ্জার ছবি — বৈধ; alt অ্যাট্রিবিউটই না থাকলে সমস্যা
            self.images.append((("alt" in a and (a.get("alt") is not None)), line))
        if tag in {"svg", "canvas"} and (a.get("role") or "") == "img" and self.hidden_depth == 0:
            labelled = (a.get("aria-label") or a.get("aria-labelledby") or a.get("title") or "").strip()
            self.images.append((bool(labelled), line))

    def handle_endtag(self, tag):  # noqa: D102
        if self.hidden_depth and tag not in {"img", "br", "hr", "input", "meta", "link"}:
            self.hidden_depth = max(0, self.hidden_depth - 1)


def iter_files(suffixes: tuple[str, ...]):
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in suffixes:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        yield path


def local_target(value: str, base: Path) -> Path | None:
    """লোকাল রেফারেন্স হলে ফাইল-পাথ ফেরত দেয়, নাহলে None।"""
    value = value.strip()
    if not value or value.startswith("#") or value.lower().startswith(EXTERNAL_PREFIXES):
        return None
    split = urlsplit(value)
    if split.scheme or split.netloc:
        return None
    path = unquote(split.path)
    if not path:
        return None
    if path.startswith("/"):
        return ROOT / path.lstrip("/")
    return (base.parent / path)


def check_html(path: Path, errors: list[str], warnings: list[str]) -> int:
    text = path.read_text(encoding="utf-8", errors="replace")
    parser = PageParser()
    parser.feed(text)
    rel = path.relative_to(ROOT)

    for el_id, count in parser.ids.items():
        if count > 1:
            errors.append(f"{rel}: duplicate id #{el_id} ×{count}")

    for tag, value, line in parser.refs:
        target = local_target(value, path)
        if target is None:
            if value.lower().startswith("http://"):
                warnings.append(f"{rel}:{line}: insecure http:// link → {value}")
            continue
        if not target.exists():
            errors.append(f"{rel}:{line}: missing local {tag} target → {value}")

    for has_alt, line in parser.images:
        if not has_alt:
            errors.append(f"{rel}:{line}: image without alt/aria-label")

    if not parser.has_viewport:
        errors.append(f"{rel}: missing <meta name=viewport>")
    return 0


def check_css(path: Path, errors: list[str]) -> None:
    text = path.read_text(encoding="utf-8", errors="replace")
    rel = path.relative_to(ROOT)
    for raw in CSS_URL.findall(text):
        target = local_target(raw, path)
        if target is None:
            continue
        if not target.exists():
            errors.append(f"{rel}: missing url() asset → {raw}")


def check_json(path: Path, errors: list[str]) -> None:
    rel = path.relative_to(ROOT)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{rel}: invalid JSON ({exc.lineno}:{exc.colno} {exc.msg})")
        return
    # পরিচিত তালিকাগুলোর duplicate id/slug
    for key in ("kings", "dynasties", "places", "records", "items", "profiles", "sites", "entries", "features"):
        block = data.get(key) if isinstance(data, dict) else None
        if not isinstance(block, list):
            continue
        seen: dict[str, int] = {}
        for row in block:
            if not isinstance(row, dict):
                continue
            ident = row.get("id") or row.get("slug") or row.get("key")
            if isinstance(ident, str) and ident:
                seen[ident] = seen.get(ident, 0) + 1
        for ident, count in seen.items():
            if count > 1:
                errors.append(f"{rel}: duplicate {key} id '{ident}' ×{count}")


def main(argv: list[str]) -> int:
    errors: list[str] = []
    warnings: list[str] = []
    pages = list(iter_files((".html",)))
    styles = list(iter_files((".css",)))
    data = list(iter_files((".json",)))

    for page in pages:
        check_html(page, errors, warnings)
    for style in styles:
        check_css(style, errors)
    for doc in data:
        check_json(doc, errors)

    summary = {
        "pages": len(pages),
        "stylesheets": len(styles),
        "json": len(data),
        "errors": len(errors),
        "warnings": len(warnings),
    }
    if "--json" in argv:
        print(json.dumps({"summary": summary, "errors": errors, "warnings": warnings}, ensure_ascii=False, indent=2))
    else:
        for err in errors:
            print(f"ERROR  {err}")
        for warn in warnings:
            print(f"WARN   {warn}")
        print(
            f"\n{summary['pages']} HTML · {summary['stylesheets']} CSS · {summary['json']} JSON — "
            f"{summary['errors']} error, {summary['warnings']} warning"
        )
        if not errors:
            print("PASS: local links, ids, alt text, viewport and JSON structure are clean.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
