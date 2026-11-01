#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""শিশু ও শিক্ষা তালিকার বাইরের লিংক যাচাই (মৃত লিংক ধরা)।

ব্যবহার:
    python3 tools/check_kids_links.py            # সব লিংক
    python3 tools/check_kids_links.py --only video
    python3 tools/check_kids_links.py --report docs/kids-link-report.md
"""
import argparse, json, sys, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {'User-Agent': 'Mozilla/5.0 (compatible; CharyabhumiLinkCheck/1.0)'}
IGNORE = ('align=',)  # ভবিষ্যতের জন্য


def head(url, timeout=20):
    """HEAD; ব্যর্থ হলে GET (কিছু সাইট HEAD বন্ধ রাখে)। অ-ইংরেজি অক্ষর URL-এ শতাংশ-এনকোড করা হয়।"""
    safe = urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%~-._")
    for method in ('HEAD', 'GET'):
        req = urllib.request.Request(safe, method=method, headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, ''
        except urllib.error.HTTPError as e:
            if method == 'GET':
                return e.code, e.reason
        except Exception as e:  # noqa: BLE001
            if method == 'GET':
                return 0, str(e)[:70]
    return 0, 'unknown'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', help='শুধু এই ধরনের আইটেম (video/ack/film/...)')
    ap.add_argument('--report', help='মার্কডাউন রিপোর্ট লেখার পথ')
    args = ap.parse_args()

    data = json.loads((ROOT / 'data/kids-media.json').read_text(encoding='utf-8'))
    items = [i for i in data['items'] if not args.only or i['type'] == args.only]

    seen, rows = {}, []
    for item in items:
        for field in ('sourceUrl', 'watchUrl', 'buyUrl', 'readUrl', 'licenceUrl', 'infoUrl'):
            url = item.get(field)
            if not url or not url.startswith('http'):
                continue
            if url not in seen:
                seen[url] = head(url)
            code, note = seen[url]
            rows.append((item['id'], field, url, code, note))

    bad = [r for r in rows if r[3] == 0 or r[3] >= 400]
    print(f'যাচাই করা লিংক: {len(rows)} (অনন্য {len(seen)}) · সমস্যা: {len(bad)}')
    for item_id, field, url, code, note in bad:
        print(f'  ✗ {code:<4} {item_id} [{field}] {url} — {note}')

    if args.report:
        p = ROOT / args.report
        lines = ['# শিশু ও শিক্ষা — লিংক যাচাই রিপোর্ট', '',
                 f'- যাচাই করা: {len(rows)} লিংক (অনন্য {len(seen)})',
                 f'- সমস্যা: {len(bad)}', '']
        if bad:
            lines += ['| আইটেম | ক্ষেত্র | লিংক | কোড |', '|---|---|---|---|']
            lines += [f'| {i} | {f} | {u} | {c} |' for i, f, u, c, _ in bad]
        else:
            lines.append('সব লিংক সাড়া দিচ্ছে ✅')
        p.write_text('\n'.join(lines) + '\n', encoding='utf-8')
        print('রিপোর্ট:', p.relative_to(ROOT))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
