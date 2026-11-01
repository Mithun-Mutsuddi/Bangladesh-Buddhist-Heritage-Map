#!/usr/bin/env python3
"""buddha-vamsa-preview.html-এ গাঁথা base64 ছবিগুলো আলাদা ফাইলে বের করা।

সমস্যা: পাতায় ২২৫টি ছবি base64 আকারে ঢোকানো ছিল → HTML ১২ MB, gzip করার পরও
৯ MB নামত, ফলে ধীর নেটে পাতা খুলতেই অনেক দেরি হতো।

সমাধান: প্রতিটি ছবি assets/buddha-vamsa/<key>.jpg হিসেবে লেখা হয় (১২০০px,
JPEG q78), আর JSON-এ শুধু পথ থাকে। ছবি তারপর loading="lazy" দিয়ে দরকারমতো নামে।

চালান:  python3 tools/extract_inline_images.py
"""
from __future__ import annotations
import base64
import io
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGE = ROOT / 'buddha-vamsa-preview.html'
OUT = ROOT / 'assets' / 'buddha-vamsa'

PAT = re.compile(r'"([A-Za-z0-9_-]{3,60})":\{"image":"data:image/([a-z+]+);base64,([A-Za-z0-9+/=\\\\]+)"')


def main() -> None:
    from PIL import Image

    s = PAGE.read_text(encoding='utf-8')
    found = PAT.findall(s)
    print('গাঁথা ছবি পাওয়া গেল:', len(found))
    OUT.mkdir(parents=True, exist_ok=True)
    total_before = total_after = 0
    for key, kind, data in found:
        total_before += len(data)
        ext = 'jpg' if kind in ('jpeg', 'jpg') else kind.replace('+', '')
        dst = OUT / f'{key}.{ext}'
        rel = f'assets/buddha-vamsa/{key}.{ext}'
        if not dst.exists():
            try:
                raw = base64.b64decode(data.replace('\\\\', '\\'))
                im = Image.open(io.BytesIO(raw))
                if im.width > 1200:
                    im = im.convert('RGB').resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
                    im.save(dst, 'JPEG', quality=78, optimize=True, progressive=True)
                else:
                    dst.write_bytes(raw)  # যেমন ছিল তেমনই — আবার এনকোড করে আকার বাড়ানো নয়
                total_after += dst.stat().st_size
            except Exception as e:
                print('  ✗', key, str(e)[:60])
                continue
        else:
            total_after += dst.stat().st_size
        s = s.replace(f'"{key}":{{"image":"data:image/{kind};base64,{data}"',
                      f'"{key}":{{"image":"{rel}"', 1)
    PAGE.write_text(s, encoding='utf-8')
    print(f'HTML: {len(s) / 1048576:.2f} MB (আগে ১১.৯৬ MB)')
    print(f'ছবি: {total_before // 1024} KB base64 → {total_after // 1024} KB ফাইল')
    print('বাকি base64:', s.count('data:image/'))


if __name__ == '__main__':
    main()
