#!/usr/bin/env python3
"""বাংলা অডিও গল্পের কণ্ঠ বদলানোর টুল।

কৃত্রিম (AI) কণ্ঠের জায়গায় নিজের বা শিক্ষকের রেকর্ডিং বসাতে:
    python3 tools/install_bn_audio.py --dir ~/recordings --narrator "শিক্ষকের নাম"

ফাইলের নাম হতে হবে স্লাগ অনুযায়ী (mp3/wav/m4a/ogg):
    moon-rabbit, white-elephant, angulimala, sujata, monkey-crocodile, banyan-deer
যেমন: moon-rabbit.mp3, sujata.wav

আগের AI ফাইল মুছে যায় না — assets/kids/audio/bn/ai-backup/ এ সরিয়ে রাখা হয়।
ফিরিয়ে আনতে: python3 tools/install_bn_audio.py --revert
"""
from __future__ import annotations
import argparse, json, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / 'data' / 'kids-audio-bn.json'
AUDIO_DIR = ROOT / 'assets' / 'kids' / 'audio' / 'bn'
BACKUP_DIR = AUDIO_DIR / 'ai-backup'
EXTS = ('.mp3', '.wav', '.m4a', '.ogg', '.opus', '.flac')


def load():
    doc = json.loads(META.read_text(encoding='utf-8'))
    if doc.get('schema') != 'charyabhumi-kids-audio-bn-v1':
        sys.exit('kids-audio-bn.json — schema মেলেনি')
    return doc


def save(doc):
    META.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def duration_sec(path: Path):
    """mutagen → ffprobe → আকার-ভিত্তিক আন্দাজ"""
    try:
        from mutagen.mp3 import MP3  # type: ignore
        return int(round(MP3(str(path)).info.length))
    except Exception:
        pass
    if shutil.which('ffprobe'):
        try:
            out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                  '-of', 'csv=p=0', str(path)], capture_output=True, text=True, check=True).stdout
            return int(round(float(out.strip())))
        except Exception:
            pass
    return max(1, int(path.stat().st_size / 8000))  # ৬৪ kbps ধরে আন্দাজ


def to_mp3(src: Path, dst: Path) -> Path:
    if src.suffix.lower() == '.mp3':
        shutil.copy2(src, dst)
        return dst
    if not shutil.which('ffmpeg'):
        sys.exit(f'{src.name}: MP3 নয়, আর ffmpeg নেই — MP3 বানিয়ে দিন (বা ffmpeg ইনস্টল করুন)।')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src),
                    '-ac', '1', '-ar', '44100', '-b:a', '64k', str(dst)], check=True)
    return dst


def mmss(sec: int) -> str:
    return f'{sec // 60:02d}:{sec % 60:02d}'


def do_install(folder: Path, narrator: str):
    doc = load()
    by_slug = {i['slug']: i for i in doc['items']}
    found = {}
    for f in sorted(folder.iterdir()):
        if f.is_file() and f.suffix.lower() in EXTS and f.stem in by_slug:
            found[f.stem] = f
    if not found:
        sys.exit('কোনো মিল পাওয়া গেল না। ফাইলের নাম হতে হবে: ' + ', '.join(by_slug))
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    changed = 0
    for slug, src in found.items():
        item = by_slug[slug]
        target = ROOT / item['file']
        if target.exists() and item.get('voice') != 'human':
            shutil.copy2(target, BACKUP_DIR / target.name)
        to_mp3(src, target)
        sec = duration_sec(target)
        item.update({'voice': 'human', 'narratorBn': narrator.strip() or 'নিজস্ব রেকর্ডিং',
                     'durationBn': mmss(sec), 'updated_at': __import__('datetime').date.today().isoformat()})
        changed += 1
        print(f'✔ {slug}: {src.name} → {target.relative_to(ROOT)} · {mmss(sec)} · কণ্ঠ: {item["narratorBn"]}')
    save(doc)
    missing = [s for s in by_slug if s not in found]
    if missing:
        print('… এখনো AI কণ্ঠেই আছে:', ', '.join(missing))
    print(f'\n{changed}টি ফাইল বসানো হয়েছে। এখন চালান:  python3 tools/build_kids_media.py  &&  node --test tests/')
    print('নোট: মানুষ-রেকর্ডিং হলে কার্ড থেকে “কৃত্রিম কণ্ঠ” লেবেল সরে যাবে, কৃতিত্বে কণ্ঠশিল্পীর নাম বসবে।')


def do_revert():
    doc = load()
    n = 0
    for item in doc['items']:
        target = ROOT / item['file']
        bak = BACKUP_DIR / target.name
        if bak.exists():
            shutil.copy2(bak, target)
            sec = duration_sec(target)
            item.update({'voice': 'ai', 'narratorBn': None, 'durationBn': mmss(sec),
                         'updated_at': __import__('datetime').date.today().isoformat()})
            n += 1
            print('↩ AI কণ্ঠে ফেরানো হলো:', item['slug'])
    save(doc)
    print(f'{n}টি ফাইল ফেরানো হলো। এখন: python3 tools/build_kids_media.py')


def main():
    ap = argparse.ArgumentParser(description='বাংলা অডিও গল্পের কণ্ঠ বদল (AI ↔ নিজের রেকর্ডিং)')
    ap.add_argument('--dir', type=Path, help='রেকর্ডিং আছে যে ফোল্ডারে')
    ap.add_argument('--narrator', default='', help='কণ্ঠশিল্পীর নাম (কার্ডে কৃতিত্বে বসবে)')
    ap.add_argument('--revert', action='store_true', help='আগের AI কণ্ঠে ফিরে যান')
    ap.add_argument('--list', action='store_true', help='কোন কোন ফাইল লাগবে দেখুন')
    a = ap.parse_args()
    doc = load()
    if a.list:
        for i in doc['items']:
            print(f"{i['slug']:<18} {i['durationBn']}  {i['voice']:<5}  {i.get('narratorBn') or ''}  {i['titleBn']}")
        return
    if a.revert:
        do_revert(); return
    if not a.dir:
        ap.error('--dir দিন (যেমন: --dir ~/recordings)')
    if not a.dir.is_dir():
        sys.exit('ফোল্ডারটি পাওয়া গেল না: ' + str(a.dir))
    do_install(a.dir, a.narrator)


if __name__ == '__main__':
    main()
