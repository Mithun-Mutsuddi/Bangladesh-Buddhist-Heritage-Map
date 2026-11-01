#!/usr/bin/env python3
"""ফন্ট WOFF2-তে রূপান্তর (পাতা দ্রুত খোলার জন্য)।

সমস্যা: বাংলা/দেবনাগরী ফন্ট TTF আকারে ১৩৯–৬৪২ KB; ধীর মোবাইল নেটে পৃষ্ঠা খুলতে
অনেক সময় লাগে (jatak-golpo পাতায় ফন্ট ৮৯৮ KB নামছিল)।

সমাধান: একই ফন্টের WOFF2 (Brotli-সংকুচিত) সংস্করণ পাশে রেখে CSS-এ আগে সেটি,
তারপর TTF ফলব্যাক দেওয়া হয়। পুরোনো ব্রাউজারেও কিছু ভাঙে না।

চালান:  python3 tools/build_woff2.py      (দরকার: fonttools, brotli)
"""
from __future__ import annotations
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]

FONTS = [
    ROOT / 'assets' / 'tracker' / 'fonts' / 'font-4.ttf',
    ROOT / 'assets' / 'tracker' / 'fonts' / 'font-5.ttf',
    ROOT / 'assets' / 'tracker' / 'fonts' / 'font-6.ttf',
    ROOT / 'assets' / 'fonts' / 'NotoSansDevanagari-var.ttf',
]

CSS_FILES = [ROOT / 'charyabhumi.css', ROOT / 'styles.css', ROOT / 'assets' / 'tracker' / 'fonts.css']


def convert(p: pathlib.Path) -> tuple[int, int] | None:
    from fontTools.ttLib import TTFont
    if not p.exists():
        print('  ✗ নেই:', p.name)
        return None
    out = p.with_suffix('.woff2')
    f = TTFont(str(p))
    f.flavor = 'woff2'
    f.save(str(out))
    return p.stat().st_size // 1024, out.stat().st_size // 1024


def patch_css() -> None:
    import re
    for css in CSS_FILES:
        if not css.exists():
            continue
        s = css.read_text(encoding='utf-8')
        orig = s
        # url(...ttf) → url(...woff2) format('woff2'), url(...ttf) format('truetype')
        def repl(m: re.Match) -> str:
            url = m.group(1)
            if 'woff2' in url:
                return m.group(0)
            stem = url[:-4]
            return f"url({stem}.woff2) format('woff2'), url({url}) format('truetype')"
        s = re.sub(r"url\(([^)]+\.ttf)\)\s*format\('truetype'\)", repl, s)
        if s != orig:
            css.write_text(s, encoding='utf-8')
            print('  ✓ CSS আপডেট:', css.name)


def main() -> None:
    total_before = total_after = 0
    for p in FONTS:
        r = convert(p)
        if r:
            total_before += r[0]
            total_after += r[1]
            print(f'  ✓ {p.name:34s} {r[0]:4d} KB → {r[1]:4d} KB')
    patch_css()
    if total_before:
        print(f'মোট: {total_before} KB → {total_after} KB ({total_after * 100 // total_before}%)')


if __name__ == '__main__':
    main()
