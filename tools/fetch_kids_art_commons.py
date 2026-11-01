#!/usr/bin/env python3
"""উইকিমিডিয়া কমন্স থেকে মুক্ত (PD/CC) বৌদ্ধ-জাতক চিত্রকলা নামিয়ে আনে।

    python3 tools/fetch_kids_art_commons.py            # নতুন ছবি খোঁজে ও নামায়
    python3 tools/fetch_kids_art_commons.py --dry-run   # শুধু দেখায়

ফলাফল: assets/kids/art/<slug>.jpg  ও  data/kids-art-extra.json
(JSON ফাইলটি tools/build_kids_media.py পড়ে কার্ড বানায়।)
শুধু পাবলিক ডোমেইন / CC0 / CC BY / CC BY-SA ছবি নেওয়া হয় — কপিরাইটযুক্ত কিছু নয়।
"""
from __future__ import annotations
import argparse, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
from io import BytesIO

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'assets' / 'kids' / 'art'
OUT = ROOT / 'data' / 'kids-art-extra.json'
UA = 'charyabhumi-kids-archive/1.0 (educational, contact: site owner)'
OK_LIC = {'public domain', 'cc0', 'cc by 2.0', 'cc by 3.0', 'cc by 4.0',
          'cc by-sa 2.0', 'cc by-sa 2.5', 'cc by-sa 3.0', 'cc by-sa 4.0'}

QUERIES = [
    ('jataka-painting', 'Jataka tales painting', 'jataka', 'জাতক পল্ল'),
    ('jataka-mural', 'Ajanta Jataka mural', 'jataka', 'জাতক পল্ল'),
    ('jataka-sanchi', 'Sanchi Jataka sculpture', 'jataka', 'জাতক পল্ল'),
    ('buddha-life-art', 'Buddha life painting', 'buddha-life', 'বুদ্ধের জীবন'),
    ('buddha-birth', 'Queen Maya birth Buddha art', 'buddha-life', 'বুদ্ধের জীবন'),
    ('buddha-enlightenment', 'Buddha enlightenment painting', 'buddha-life', 'বুদ্ধের জীবন'),
    ('sujata-offering', 'Sujata offering Buddha', 'sujata', 'সুজাতা'),
    ('angulimala-art', 'Angulimala Buddha', 'angulimala', 'অঙ্গুলিমাল'),
    ('ashoka-art', 'Ashoka pillar painting', 'general', 'সাধারণ শিক্ষা'),
    ('bodhi-tree-art', 'Bodhi tree Bodh Gaya art', 'buddha-life', 'বুদ্ধের জীবন'),
]


def api(params: dict):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    return json.load(urllib.request.urlopen(req, timeout=40))


def lic_ok(meta: dict) -> tuple[bool, str]:
    short = (meta.get('LicenseShortName', {}).get('value') or '').strip()
    return short.lower() in OK_LIC, short


def strip_html(t: str) -> str:
    return re.sub(r'<[^>]+>', '', re.sub(r'\s+', ' ', t or '')).strip()


def fetch(limit_per_query: int, dry: bool):
    from PIL import Image
    ART.mkdir(parents=True, exist_ok=True)
    doc = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {
        'schema': 'charyabhumi-kids-art-extra-v1',
        'source': 'Wikimedia Commons — শুধু PD/CC',
        'items': []
    }
    have = {i['slug'] for i in doc['items']}
    added = 0
    for slug, q, topic, topicBn in QUERIES:
        if slug in have:
            print('… আগেই আছে:', slug); continue
        try:
            d = api({'action': 'query', 'format': 'json', 'generator': 'search',
                     'gsrsearch': q + ' filetype:bitmap', 'gsrlimit': str(limit_per_query),
                     'gsrnamespace': '6', 'prop': 'imageinfo',
                     'iiprop': 'url|size|extmetadata|mime', 'iiurlwidth': '1400'})
        except Exception as e:
            print('✗ খোঁজ ব্যর্থ', slug, e); continue
        pages = list((d.get('query', {}) or {}).get('pages', {}).values())
        picked = False
        for p in pages:
            if picked: break
            ii = (p.get('imageinfo') or [{}])[0]
            if not ii or ii.get('mime') not in ('image/jpeg', 'image/png'):
                continue
            meta = ii.get('extmetadata', {})
            ok, short = lic_ok(meta)
            if not ok or (ii.get('width') or 0) < 900:
                continue
            artist = strip_html(meta.get('Artist', {}).get('value', ''))[:120] or 'অজ্ঞাত'
            title = p['title'].replace('File:', '')
            url = ii.get('thumburl') or ii.get('url')
            page = ii.get('descriptionurl') or ('https://commons.wikimedia.org/wiki/' + p['title'].replace(' ', '_'))
            if dry:
                print('· হবে:', slug, '|', title[:60], '|', short, '|', artist[:40]); picked = True; continue
            try:
                req = urllib.request.Request(url, headers={'User-Agent': UA})
                raw = urllib.request.urlopen(req, timeout=60).read()
                im = Image.open(BytesIO(raw)).convert('RGB')
                if im.width > 1400:
                    im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
                dest = ART / f'{slug}.jpg'
                im.save(dest, 'JPEG', quality=82, optimize=True)
                kb = dest.stat().st_size // 1024
                if kb > 900:
                    im.save(dest, 'JPEG', quality=68, optimize=True); kb = dest.stat().st_size // 1024
                doc['items'].append({
                    'slug': slug, 'file': f'assets/kids/art/{slug}.jpg',
                    'titleEn': title.replace('_', ' ')[:110],
                    'artist': artist, 'licence': short, 'commonsPage': page,
                    'topic': topic, 'kb': kb, 'fetched_at': time.strftime('%Y-%m-%d')
                })
                print(f'✔ {slug}: {title[:52]} · {short} · {kb} KB')
                added += 1; picked = True
            except Exception as e:
                print('✗ নামানো গেল না', slug, e)
        time.sleep(0.4)
    if not dry:
        OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'\nমোট নতুন: {added} · তালিকায়: {len(doc["items"])} · ফাইল: {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--per-query', type=int, default=6)
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    fetch(a.per_query, a.dry_run)
