#!/usr/bin/env python3
"""গল্পের AI ছবি থেকে রঙ করার পাতা (লাইন-আর্ট) বানায়।

প্রতিটি ছবিকে ধূসর করে, ঝাপসা করে, কিনারা (edge) তুলে সাদা কাগজে কালো রেখা বানানো হয় —
শিশুরা প্রিন্ট করে রঙ করবে।

চালান: python3 tools/build_coloring_lineart.py
"""
from __future__ import annotations
import json, pathlib
from PIL import Image, ImageFilter, ImageOps, ImageChops

ROOT = pathlib.Path(__file__).resolve().parents[1]
STORIES = ROOT / 'data' / 'ai-jataka-stories.json'
OUT = ROOT / 'assets' / 'kids' / 'coloring' / 'ai-jataka'
WIDTH = 1100


def lineart(src: pathlib.Path, dst: pathlib.Path) -> None:
    im = Image.open(src).convert('L')
    im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    smooth = im.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    edges = smooth.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges, cutoff=1)
    inv = ImageOps.invert(edges)
    # সাদা কাগজ, কালো রেখা — হালকা ধূসর অংশ বাদ
    lines = inv.point(lambda p: 0 if p < 205 else 255)
    # রেখা একটু মোটা করা (শিশুরা সহজে রঙ করবে)
    lines = lines.filter(ImageFilter.MinFilter(3))
    canvas = ImageChops.multiply(lines, Image.new('L', lines.size, 255))
    rgb = Image.merge('RGB', (canvas, canvas, canvas))
    rgb.save(dst, 'PNG', optimize=True)


def main() -> None:
    stories = json.loads(STORIES.read_text(encoding='utf-8'))['stories']
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    # মডেল দিয়ে বানানো পরিষ্কার পাতা আছে যেগুলোর, সেগুলো ছোঁব না
    KEEP = {'mouse-merchant', 'giant-dwarf', 'magic-chant', 'hidden-treasure', 'kesari-flying-thief',
            'shalivahana', 'stories-of-courage', 'acrobat', 'cowherd-of-alawi', 'prophecy',
            'kisa-gotami', 'celestial-necklace'}
    for st in stories:
        if st['slug'] in KEEP:
            continue
        src = ROOT / st['art']
        if not src.exists():
            print('⚠ ছবি নেই:', st['slug'])
            continue
        dst = OUT / (st['slug'] + '.png')
        lineart(src, dst)
        made += 1
        print('✓', dst.relative_to(ROOT), dst.stat().st_size // 1024, 'KB')
    print('তৈরি হলো:', made, 'টি রঙ করার পাতা')


if __name__ == '__main__':
    main()
