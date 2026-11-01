#!/usr/bin/env python3
"""AI জাতক-গল্পের ছোট অ্যানিমেশন-ভিডিও বানায় (ছবি + বাংলা অডিও + বাংলা লেখা)।

প্রতিটি গল্পের জন্য: ছবিতে ধীরে জুম (Ken Burns), শুরুতে নাম, শেষে নীতিকথা,
নিচে ছোট করে “কৃত্রিম কণ্ঠ (AI)” — ffmpeg + libass (বাংলা লেখা ঠিকভাবে বসে)।

চালান:  python3 tools/build_ai_jataka_video.py            (সব গল্প)
        python3 tools/build_ai_jataka_video.py mouse-merchant
"""
from __future__ import annotations
import json, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
STORIES = ROOT / 'data' / 'ai-jataka-stories.json'
OUT = ROOT / 'assets' / 'kids' / 'video' / 'bn'
FONT_DIR = pathlib.Path('/home/user/fonts')
FONT = 'Noto Sans Bengali'
W, H, FPS = 1280, 720, 25

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:  # pragma: no cover
    FFMPEG = 'ffmpeg'

try:
    from mutagen.mp3 import MP3
except Exception:  # pragma: no cover
    MP3 = None


def ass_time(t: float) -> str:
    h, r = divmod(max(t, 0), 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def wrap_bn(text: str, per_line: int = 34) -> str:
    """বাংলা লেখা মোটামুটি সমান ভাগে ভেঙে দু-তিন লাইনে সাজায়।"""
    words, lines, cur = text.split(), [], ''
    for w in words:
        if len(cur) + len(w) + 1 <= per_line:
            cur = (cur + ' ' + w).strip()
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return r'\N'.join(lines[:4])


def build_ass(title: str, moral: str, dur: float, path: pathlib.Path) -> None:
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,{FONT},52,&H00FFFFFF,&H000000FF,&H00204A38,&H80000000,-1,0,0,0,100,100,0,0,1,3.2,1.4,2,80,80,300,1
Style: Moral,{FONT},34,&H00F0FFF6,&H000000FF,&H00204A38,&H90000000,0,0,0,0,100,100,0,0,1,3,1.2,2,90,90,120,1
Style: Foot,{FONT},22,&H00E8F2EC,&H000000FF,&H00204A38,&H90000000,0,0,0,0,100,100,0,0,1,2.4,0.8,2,40,40,34,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f'Dialogue: 0,{ass_time(0)},{ass_time(min(7, dur))},Title,,0,0,0,,{wrap_bn(title, 26)}',
          f'Dialogue: 0,{ass_time(0)},{ass_time(dur)},Foot,,0,0,0,,চর্যাভূমি · কৃত্রিম কণ্ঠ (AI) · CC BY-SA 4.0']
    t0 = max(dur - 9, 5)
    ev.append(f'Dialogue: 0,{ass_time(t0)},{ass_time(dur)},Moral,,0,0,0,,{wrap_bn("নীতিকথা: " + moral, 40)}')
    path.write_text(head + '\n'.join(ev) + '\n', encoding='utf-8')


def make(story: dict) -> pathlib.Path | None:
    slug = story['slug']
    img = ROOT / story['art']
    mp3 = ROOT / f'assets/kids/audio/bn/kid-bn-{slug}.mp3'
    if not img.exists() or not mp3.exists():
        print('⚠ বাদ:', slug, '(ছবি বা অডিও নেই)')
        return None
    dur = MP3(mp3).info.length if MP3 else 60.0
    dur = round(dur + 1.6, 2)          # শেষে একটু ফাঁকা
    OUT.mkdir(parents=True, exist_ok=True)
    dst = OUT / f'{slug}.mp4'
    with tempfile.TemporaryDirectory() as td:
        ass = pathlib.Path(td) / 'sub.ass'
        build_ass(story['titleBn'], story['moralBn'], dur, ass)
        vf = (
            f"scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2},"
            f"zoompan=z='min(1.0+0.00035*in,1.14)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},"
            f"fade=t=in:st=0:d=0.9,fade=t=out:st={max(dur - 1.1, 0):.2f}:d=1.1,"
            f"subtitles={ass}:fontsdir={FONT_DIR}"
        )
        cmd = [FFMPEG, '-y', '-loglevel', 'error',
               '-loop', '1', '-framerate', str(FPS), '-t', f'{dur}', '-i', str(img),
               '-i', str(mp3),
               '-filter_complex', f'[0:v]{vf}[v]',
               '-map', '[v]', '-map', '1:a',
               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p',
               '-c:a', 'aac', '-b:a', '96k', '-ar', '44100',
               '-t', f'{dur}', '-movflags', '+faststart', str(dst)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0:
            print('✗ ব্যর্থ', slug, r.stderr.strip()[:400])
            return None
    print('✓', dst.relative_to(ROOT), f'{dst.stat().st_size // 1024} KB · {dur:.0f}s')
    return dst


def main() -> None:
    stories = json.loads(STORIES.read_text(encoding='utf-8'))['stories']
    only = set(sys.argv[1:])
    made = 0
    for st in stories:
        if only and st['slug'] not in only:
            continue
        if make(st):
            made += 1
    print('তৈরি হলো:', made, 'টি ভিডিও')


if __name__ == '__main__':
    main()
