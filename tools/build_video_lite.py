#!/usr/bin/env python3
"""ভিডিওর হালকা সংস্করণ (ওয়েবে চালানোর জন্য)।

সমস্যা: ৭২০p মূল ভিডিও ৩–৪ MB; স্কুলের ধীর মোবাইল নেটে (৪০০ kbps) বাফার হতে
১ মিনিটের বেশি লাগে, ফলে প্লেয়ার "চলছেই না" মনে হয়।

সমাধান: একই ভিডিওর ৪৮০p / কম-বিটরেট সংস্করণ `assets/kids/video/bn/lite/<slug>.mp4`
(সাধারণত ০.৭–০.৯ MB, মূলের প্রায় ২০%), যা প্লেয়ারে চলে; ডাউনলোড বোতামে মূল ৭২০p ফাইলই থাকে।

চালান:  python3 tools/build_video_lite.py [slug ...]
"""
from __future__ import annotations
import pathlib
import subprocess
import sys

try:
    import imageio_ffmpeg

    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:  # pragma: no cover
    FFMPEG = 'ffmpeg'

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets' / 'kids' / 'video' / 'bn'
DST = SRC / 'lite'


def build(slug: str) -> int | None:
    src = SRC / (slug + '.mp4')
    if not src.exists():
        print('  ✗ নেই:', src.name)
        return None
    DST.mkdir(parents=True, exist_ok=True)
    dst = DST / (slug + '.mp4')
    cmd = [FFMPEG, '-y', '-loglevel', 'error', '-i', str(src),
           '-vf', 'scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:-1:-1',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '36', '-r', '20', '-tune', 'stillimage',
           '-c:a', 'aac', '-b:a', '40k', '-ac', '1',
           '-movflags', '+faststart', str(dst)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('  ✗', slug, r.stderr.strip()[:160])
        return None
    return dst.stat().st_size // 1024


def main() -> None:
    slugs = sys.argv[1:] or sorted(p.stem for p in SRC.glob('*.mp4'))
    total_before = total_after = 0
    for slug in slugs:
        kb = build(slug)
        if kb:
            before = (SRC / (slug + '.mp4')).stat().st_size // 1024
            total_before += before
            total_after += kb
            print(f'  ✓ {slug:26s} {before:5d} KB → {kb:5d} KB  ({kb * 100 // max(before, 1)}%)')
    if total_before:
        print(f'মোট: {total_before} KB → {total_after} KB — {total_after * 100 // total_before}%')


if __name__ == '__main__':
    main()
