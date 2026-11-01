#!/usr/bin/env python3
"""এক-ফাইলের মতো করে ব্যবহারযোগ্য অফলাইন প্যাক (স্কুলে ইন্টারনেট ছাড়া)।

যা করে:
  • kids-offline/ ফোল্ডারে সাইটের প্রয়োজনীয় পাতা, CSS/JS, data/ ও assets/kids কপি করে
  • ভিডিওগুলো ছোট করে (৪৮০p) আর অডিও হালকা করে (৪৮ kbps mono) — প্যাক ছোট হয়
  • শেষে kids-offline.zip বানায়, ভিতরে index.html — আনজিপ করে index.html খুললেই চলবে

চালান:  python3 tools/build_offline_pack.py
"""
from __future__ import annotations
import json, pathlib, shutil, subprocess, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path('/home/user/kids-offline')
ZIP = pathlib.Path('/home/user/kids-offline-pack.zip')

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:  # pragma: no cover
    FFMPEG = 'ffmpeg'

PAGES = ['children.html', 'sishu-shikkha.html', 'jatak-golpo.html', 'shikkhok-guide.html', 'jatak-golpo.css']
STYLE_JS = ['charyabhumi.css', 'children.css', 'sishu-shikkha.css', 'mobile-fix.css', 'mega.css',
            'children.js', 'kids-media.js', 'sishu-shikkha.js', 'brand.js']
DATA = ['kids-media-list.json', 'kids-media-list.js', 'ai-jataka-index.json', 'ai-jataka-index.js',
        'jatak-shikkok-guide.json', 'jatak-shikkhok-guide.js', 'ai-jataka-stories.json',
        'kids-media-data.js', 'kids-audio-bn.json', 'kids-audio-extra.json', 'children-content.json']


def run(cmd: list[str]) -> bool:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('  ✗', r.stderr.strip()[:200])
        return False
    return True


def copy_tree() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / 'assets' / 'kids').mkdir(parents=True, exist_ok=True)
    for p in PAGES + STYLE_JS:
        src = ROOT / p
        if src.exists():
            shutil.copy2(src, OUT / p)
    (OUT / 'data').mkdir(exist_ok=True)
    for d in DATA:
        src = ROOT / 'data' / d
        if src.exists():
            shutil.copy2(src, OUT / 'data' / d)
    for sub in ('thumbs/disp', 'coloring/ai-jataka', 'brand'):
        src = ROOT / 'assets' / ('kids/' + sub if sub != 'brand' else 'brand')
        if src.exists():
            dst = OUT / 'assets' / ('kids/' + sub if sub != 'brand' else 'brand')
            dst.mkdir(parents=True, exist_ok=True)
            for f in src.iterdir():
                if f.is_file() and f.suffix.lower() in ('.jpg', '.png', '.svg', '.pdf'):
                    shutil.copy2(f, dst / f.name)
    fonts = ROOT / 'assets' / 'tracker' / 'fonts'
    if fonts.exists():
        (OUT / 'assets' / 'tracker' / 'fonts').mkdir(parents=True, exist_ok=True)
        for f in sorted(fonts.iterdir())[:8]:
            if f.suffix in ('.ttf', '.woff2'):
                shutil.copy2(f, OUT / 'assets' / 'tracker' / 'fonts' / f.name)
    dvf = ROOT / 'assets' / 'fonts'
    if dvf.exists():
        (OUT / 'assets' / 'fonts').mkdir(parents=True, exist_ok=True)
        for f in dvf.iterdir():
            shutil.copy2(f, OUT / 'assets' / 'fonts' / f.name)


def shrink_media() -> None:
    # অডিও → ৪৮ kbps mono (কথার জন্য যথেষ্ট)
    n = 0
    for lang in ('bn', 'en', 'hi', 'fr'):
        src = ROOT / 'assets' / 'kids' / 'audio' / lang
        if not src.exists():
            continue
        dst = OUT / 'assets' / 'kids' / 'audio' / lang
        dst.mkdir(parents=True, exist_ok=True)
        for f in sorted(src.glob('*.mp3')):
            if run([FFMPEG, '-y', '-loglevel', 'error', '-i', str(f), '-ac', '1', '-b:a', '48k', str(dst / f.name)]):
                n += 1
    print('  অডিও হালকা হলো:', n)
    # ভিডিও → ৪৮০p
    vsrc = ROOT / 'assets' / 'kids' / 'video' / 'bn'
    vdst = OUT / 'assets' / 'kids' / 'video' / 'bn'
    vdst.mkdir(parents=True, exist_ok=True)
    v = 0
    for f in sorted(vsrc.glob('*.mp4')):
        if run([FFMPEG, '-y', '-loglevel', 'error', '-i', str(f),
                '-vf', 'scale=854:480', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30',
                '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', str(vdst / f.name)]):
            v += 1
    print('  ভিডিও হালকা হলো:', v)


def shrink_coloring() -> None:
    """রঙ করার পাতা: ১২৪০px, খাটি সাদা-কালো ১-বিট PNG — ছাপার জন্য যথেষ্ট, আকার অনেক কম।"""
    from PIL import Image
    d = OUT / 'assets' / 'kids' / 'coloring' / 'ai-jataka'
    if not d.exists():
        return
    n = 0
    for f in sorted(d.glob('*.png')):
        try:
            im = Image.open(f).convert('L')
            if im.width > 1240:
                im = im.resize((1240, round(im.height * 1240 / im.width)), Image.LANCZOS)
            im = im.point(lambda v: 0 if v < 160 else 255).convert('1')
            im.save(f, 'PNG', optimize=True)
            n += 1
        except Exception as e:  # pragma: no cover
            print('  ✗', f.name, e)
    print('  রঙ করার পাতা হালকা হলো:', n)


INDEX = """<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>চর্যাভূমি — শিশু বিভাগ (অফলাইন প্যাক)</title>
<style>body{{font-family:"Noto Sans Bengali",system-ui,sans-serif;background:#fbf7ee;color:#17372c;margin:0;padding:34px 20px;line-height:1.8}}
.w{{max-width:760px;margin:0 auto}}h1{{color:#0f3b31;font-size:1.7rem;margin:0 0 4px}}p.s{{color:#5c6f66;margin:0 0 22px}}
a.c{{display:block;background:#fff;border:1px solid #e2ddcd;border-radius:16px;padding:15px 18px;margin:0 0 12px;text-decoration:none;color:#0f3b31;box-shadow:0 8px 20px rgba(15,59,49,.05)}}
a.c b{{display:block;font-size:1.05rem}}a.c span{{color:#5c6f66;font-size:.9rem}}
.tip{{background:#fff8e6;border:1px solid #f0dfae;border-radius:12px;padding:12px 14px;margin:18px 0 0;font-size:.9rem}}</style></head><body><div class="w">
<h1>চর্যাভূমি — শিশু ও শিক্ষা বিভাগ</h1>
<p class="s">ইন্টারনেট ছাড়াই চলবে · {count}টি আইটেম · অডিও {audio}টি · ভিডিও {video}টি · রঙ করার পাতা {coloring}টি</p>
<a class="c" href="jatak-golpo.html"><b>🎬 ২৩টি গল্প — ছবি, লেখা, অডিও ও অ্যানিমেশন</b><span>তিন ভাষায় লেখা ও কণ্ঠ (বাংলা · English · हिन्दी)</span></a>
<a class="c" href="shikkhok-guide.html"><b>🧑‍🏫 শিক্ষক-নির্দেশিকা</b><span>প্রতিটি গল্পের ৩টি প্রশ্ন, ১টি কাজ ও নতুন শব্দ</span></a>
<a class="c" href="children.html"><b>🎨 শিশু বিভাগ — খেলতে খেলতে বুদ্ধ ঐতিহ্য</b><span>কমিক, অডিও, ভিডিও, রঙ করার পাতা</span></a>
<a class="c" href="sishu-shikkha.html"><b>📚 শিশু ও শিক্ষা — তালিকা</b><span>ধরন ও ভাষা অনুযায়ী সাজানো সব আইটেম</span></a>
<div class="tip">📌 <b>স্কুলে ব্যবহার:</b> এই ফোল্ডারটা পেনড্রাইভ/ল্যাপটপে কপি করুন, তারপর <b>index.html</b> ডাবল-ক্লিক করুন।
অডিও/ভিডিও ব্রাউজারেই চলবে — ইন্টারনেট লাগবে না। ছাপতে হলে রঙ করার পাতার PNG বা PDF প্যাক ব্যবহার করুন।</div>
</div></body></html>"""


def main() -> None:
    print('• কপি হচ্ছে…')
    copy_tree()
    print('• মিডিয়া হালকা হচ্ছে (কয়েক মিনিট লাগতে পারে)…')
    shrink_media()
    shrink_coloring()
    # index.html
    payload = json.loads((ROOT / 'data' / 'kids-media-list.json').read_text(encoding='utf-8'))
    items = payload['items']
    (OUT / 'index.html').write_text(INDEX.format(
        count=len(items),
        audio=sum(1 for i in items if i['type'] == 'audio'),
        video=sum(1 for i in items if i['type'] == 'video'),
        coloring=sum(1 for i in items if i['type'] == 'coloring')), encoding='utf-8')
    # zip
    if ZIP.exists():
        ZIP.unlink()
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for f in sorted(OUT.rglob('*')):
            if f.is_file():
                z.write(f, f.relative_to(OUT))
    size = ZIP.stat().st_size / (1024 * 1024)
    print(f'✓ {ZIP} — {size:.1f} MB, ফাইল: {sum(1 for _ in OUT.rglob("*") if _.is_file())}')


if __name__ == '__main__':
    main()
