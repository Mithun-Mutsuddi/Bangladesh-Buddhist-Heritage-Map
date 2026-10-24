#!/usr/bin/env python3
"""Build original, offline-ready assets for the Charyabhumi children section.

The printable models are deliberately simplified teaching aids, not measured
archaeological reconstructions. The song and digital bell are new synthesised
educational assets, not recordings of a traditional performance.
"""
from __future__ import annotations

import math
import random
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "children"
ART = OUT / "art"
PDF = OUT / "pdf"
AUDIO = OUT / "audio"
PREVIEW = OUT / "previews"
for folder in (ART, PDF, AUDIO, PREVIEW):
    folder.mkdir(parents=True, exist_ok=True)

BN = ROOT / "assets/tracker/fonts/font-4.ttf"
BN_BOLD = ROOT / "assets/tracker/fonts/font-6.ttf"
LATIN = ROOT / "assets/tracker/fonts/font-0.ttf"
W, H = 1240, 1754  # A4 at roughly 150 dpi
INK = "#263c3a"
GOLD = "#c68b32"
PAPER = "#fffaf0"


def font(size: int, bold: bool = False, latin: bool = False):
    return ImageFont.truetype(str(LATIN if latin else (BN_BOLD if bold else BN)), size)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, width: int):
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        line = ""
        for word in words:
            candidate = (line + " " + word).strip()
            if line and draw.textlength(candidate, font=fnt) > width:
                lines.append(line)
                line = word
            else:
                line = candidate
        lines.append(line)
    return lines


def text_block(draw, xy, text, fnt, fill=INK, width=1000, spacing=12, anchor="la"):
    x, y = xy
    for line in wrap(draw, text, fnt, width):
        draw.text((x, y), line, font=fnt, fill=fill, anchor=anchor)
        y += fnt.size + spacing
    return y


def page(title: str, subtitle: str = "", color=PAPER):
    im = Image.new("RGB", (W, H), color)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((44, 40, W - 44, H - 42), radius=22, outline="#d7c39a", width=3)
    d.text((80, 74), title, font=font(45, True), fill=INK)
    if subtitle:
        d.text((80, 139), subtitle, font=font(23), fill="#62716c")
    d.line((80, 184, W - 80, 184), fill=GOLD, width=3)
    d.text((W - 80, H - 75), "চর্যাভূমি · শিশু বিভাগ · মিথুন মুৎসুদ্দী", font=font(18), fill="#6c736c", anchor="ra")
    return im, d


def dashed(draw, points, fill=INK, width=3, dash=12, gap=8):
    (x1, y1), (x2, y2) = points
    length = math.hypot(x2 - x1, y2 - y1)
    if not length:
        return
    dx, dy = (x2 - x1) / length, (y2 - y1) / length
    at = 0
    while at < length:
        end = min(at + dash, length)
        draw.line((x1 + dx * at, y1 + dy * at, x1 + dx * end, y1 + dy * end), fill=fill, width=width)
        at += dash + gap


def save_pdf(images, filename: str, title: str):
    images = [im.convert("RGB") for im in images]
    images[0].save(
        PDF / filename,
        "PDF",
        save_all=True,
        append_images=images[1:],
        resolution=150.0,
        quality=88,
        title=title,
        author="Charyabhumi children section",
        subject="Original educational printable; see page notes for scope and safety",
    )
    for index, image in enumerate(images, 1):
        image.save(PREVIEW / (Path(filename).stem + f"-page{index}.jpg"), quality=88)


def draw_stupa(d, ox=0, oy=0, scale=1.0, color=INK, width=6):
    def line(points, **kw):
        d.line([(ox + x * scale, oy + y * scale) for x, y in points], fill=color, width=max(1, int(width * scale)), **kw)
    def arc(box, start, end, **kw):
        d.arc(tuple(ox + v * scale if i % 2 == 0 else oy + v * scale for i, v in enumerate(box)), start, end, fill=color, width=max(1, int(width * scale)), **kw)
    line([(180, 540), (720, 540)])
    line([(220, 500), (680, 500)])
    line([(260, 460), (640, 460)])
    line([(260, 460), (220, 500)])
    line([(640, 460), (680, 500)])
    line([(220, 500), (180, 540)])
    line([(680, 500), (720, 540)])
    arc((270, 150, 630, 480), 180, 360)
    line([(270, 315), (270, 460)])
    line([(630, 315), (630, 460)])
    line([(385, 150), (515, 150)])
    line([(405, 105), (495, 105)])
    line([(425, 60), (475, 60)])
    line([(405, 105), (385, 150)])
    line([(495, 105), (515, 150)])
    line([(425, 60), (405, 105)])
    line([(475, 60), (495, 105)])
    line([(450, 10), (450, 60)])
    for yy, half in [(30, 38), (50, 52), (75, 65)]:
        line([(450 - half, yy), (450 + half, yy)])
    arc((390, 350, 510, 560), 180, 360)


def draw_wheel(d, cx, cy, r, color=INK, width=7):
    d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=color, width=width)
    d.ellipse((cx-r*.78, cy-r*.78, cx+r*.78, cy+r*.78), outline=color, width=max(2, width-2))
    d.ellipse((cx-r*.15, cy-r*.15, cx+r*.15, cy+r*.15), outline=color, width=width)
    for i in range(8):
        a = i * math.pi / 4
        d.line((cx+math.cos(a)*r*.15, cy+math.sin(a)*r*.15, cx+math.cos(a)*r*.78, cy+math.sin(a)*r*.78), fill=color, width=width)


def draw_lotus(d, cx, cy, scale=1.0, color=INK, width=6):
    def pts(values):
        return [(cx+x*scale, cy+y*scale) for x, y in values]
    for shift in (-1, 1):
        d.arc((cx+shift*85*scale-105*scale, cy-105*scale, cx+shift*85*scale+105*scale, cy+120*scale), 200 if shift < 0 else 250, 340 if shift < 0 else 290, fill=color, width=width)
    d.arc((cx-110*scale, cy-200*scale, cx+110*scale, cy+90*scale), 205, 335, fill=color, width=width)
    d.arc((cx-210*scale, cy-105*scale, cx+20*scale, cy+125*scale), 205, 350, fill=color, width=width)
    d.arc((cx-20*scale, cy-105*scale, cx+210*scale, cy+125*scale), 190, 335, fill=color, width=width)
    d.line(pts([(-210, 60), (-130, 130), (0, 155), (130, 130), (210, 60)]), fill=color, width=width)
    d.arc((cx-175*scale, cy+25*scale, cx+175*scale, cy+210*scale), 10, 170, fill=color, width=width)


def draw_buddha(d, cx=450, cy=330, scale=1.0, monk=False):
    w = max(2, int(7*scale))
    # Head, ears and a restrained, respectful closed-eye expression.
    d.ellipse((cx-65*scale, cy-225*scale, cx+65*scale, cy-95*scale), outline=INK, width=w)
    if not monk:
        d.arc((cx-45*scale, cy-260*scale, cx+45*scale, cy-180*scale), 180, 360, fill=INK, width=w)
    d.arc((cx-88*scale, cy-190*scale, cx-52*scale, cy-115*scale), 80, 280, fill=INK, width=w)
    d.arc((cx+52*scale, cy-190*scale, cx+88*scale, cy-115*scale), 260, 100, fill=INK, width=w)
    d.arc((cx-37*scale, cy-176*scale, cx-5*scale, cy-148*scale), 20, 160, fill=INK, width=max(2, w-2))
    d.arc((cx+5*scale, cy-176*scale, cx+37*scale, cy-148*scale), 20, 160, fill=INK, width=max(2, w-2))
    d.arc((cx-18*scale, cy-140*scale, cx+18*scale, cy-118*scale), 15, 165, fill=INK, width=max(2, w-2))
    d.line((cx-28*scale, cy-95*scale, cx-32*scale, cy-60*scale, cx+32*scale, cy-60*scale, cx+28*scale, cy-95*scale), fill=INK, width=w)
    # Robe and torso.
    d.arc((cx-175*scale, cy-95*scale, cx+175*scale, cy+270*scale), 180, 360, fill=INK, width=w)
    d.line((cx-175*scale, cy+85*scale, cx-185*scale, cy+240*scale), fill=INK, width=w)
    d.line((cx+175*scale, cy+85*scale, cx+185*scale, cy+240*scale), fill=INK, width=w)
    d.arc((cx-60*scale, cy-90*scale, cx+155*scale, cy+205*scale), 265, 80, fill=INK, width=w)
    # Hands held calmly around a bowl/book-like teaching aid for the monk.
    d.arc((cx-90*scale, cy+65*scale, cx+90*scale, cy+175*scale), 0, 180, fill=INK, width=w)
    d.line((cx-90*scale, cy+120*scale, cx+90*scale, cy+120*scale), fill=INK, width=w)
    # Crossed legs for Buddha; a simple lower robe and feet for the standing monk.
    if not monk:
        d.arc((cx-250*scale, cy+145*scale, cx+40*scale, cy+345*scale), 185, 355, fill=INK, width=w)
        d.arc((cx-40*scale, cy+145*scale, cx+250*scale, cy+345*scale), 185, 355, fill=INK, width=w)
        d.line((cx-210*scale, cy+310*scale, cx+210*scale, cy+310*scale), fill=INK, width=w)
        draw_lotus(d, cx, cy+330*scale, .65*scale, INK, max(2, w-2))
    else:
        d.line((cx-185*scale, cy+240*scale, cx-145*scale, cy+450*scale, cx+145*scale, cy+450*scale, cx+185*scale, cy+240*scale), fill=INK, width=w)
        d.arc((cx-150*scale, cy+420*scale, cx-20*scale, cy+490*scale), 180, 350, fill=INK, width=w)
        d.arc((cx+20*scale, cy+420*scale, cx+150*scale, cy+490*scale), 190, 360, fill=INK, width=w)


def draw_temple(d, ox=100, oy=100, scale=1.0, color=INK, width=6):
    def rect(box, **kw):
        x1,y1,x2,y2 = box
        d.rectangle((ox+x1*scale, oy+y1*scale, ox+x2*scale, oy+y2*scale), outline=color, width=max(1, int(width*scale)), **kw)
    # A simplified stepped form, explicitly not a measured elevation.
    for x, y, s in [(220, 400, 460), (270, 320, 360), (320, 245, 260), (370, 180, 160)]:
        rect((x, y, x+s, y+75))
        for xx in range(x+35, x+s-10, 65):
            d.arc((ox+xx*scale, oy+(y+20)*scale, ox+(xx+30)*scale, oy+(y+62)*scale), 180, 360, fill=color, width=max(2, int(4*scale)))
    rect((405, 125, 495, 180))
    d.polygon([(ox+430*scale, oy+125*scale), (ox+450*scale, oy+65*scale), (ox+470*scale, oy+125*scale)], outline=color)
    d.line((ox+450*scale, oy+65*scale, ox+450*scale, oy+25*scale), fill=color, width=width)
    d.line((ox+150*scale, oy+550*scale, ox+750*scale, oy+550*scale), fill=color, width=width)


def build_line_art():
    specs = {}
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_stupa(d, 0, 70, .9); specs["stupa"] = im
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_buddha(d, 450, 280, .85); specs["buddha"] = im
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_buddha(d, 450, 235, .75, monk=True); specs["vante"] = im
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_temple(d, 0, 40, 1.0); specs["somapura"] = im
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_wheel(d, 450, 340, 245); specs["dharma-wheel"] = im
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_lotus(d, 450, 310, 1.35); specs["lotus"] = im
    # Public-domain portrait transformed into an educational colouring outline.
    src = Image.open(ROOT / "assets/quiz/ambedkar.jpg").convert("L")
    src = ImageOps.contain(src, (560, 620), method=Image.Resampling.LANCZOS)
    src = ImageEnhance.Contrast(src).enhance(1.4).filter(ImageFilter.GaussianBlur(1.1))
    edges = src.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges).point(lambda p: 255 if p > 31 else 0)
    portrait = ImageOps.invert(edges).convert("RGB")
    im = Image.new("RGB", (900, 700), "white")
    im.paste(portrait, ((900-portrait.width)//2, 35)); specs["ambedkar"] = im
    for name, image in specs.items():
        image.save(ART / f"{name}-colouring.png", optimize=True)
    # Numbered dot-to-dot stupa; dotted light guide helps independent checking.
    im = Image.new("RGB", (900, 700), "white"); d = ImageDraw.Draw(im)
    draw_stupa(d, 0, 70, .9, color="#c8cfcb", width=3)
    points = [(180,540),(220,500),(260,460),(270,315),(305,230),(360,165),(405,105),(425,60),(450,10),(475,60),(495,105),(515,150),(585,205),(630,315),(640,460),(680,500),(720,540)]
    points = [(x*.9, 70+y*.9) for x,y in points]
    for i, (x,y) in enumerate(points, 1):
        d.ellipse((x-8,y-8,x+8,y+8), fill="white", outline=INK, width=3)
        d.text((x+14,y-20), str(i), font=font(23, latin=True), fill=INK)
    im.save(ART / "stupa-dot-to-dot.png", optimize=True)


def net_page(tier: str, base_mm: int, height_mm: int, title: str, note: str):
    im, d = page(title, "কালো সরলরেখা = কাটুন · ড্যাশ রেখা = ভাঁজ · ছায়াঘেরা অংশ = আঠা/টেপ")
    ppm = 5.9
    b, h = int(base_mm*ppm), int(height_mm*ppm)
    cx, cy = 535, 620
    base_box = (cx-b//2, cy-b//2, cx+b//2, cy+b//2)
    top_side = (cx-b//2, cy-b//2-h, cx+b//2, cy-b//2)
    bottom_side = (cx-b//2, cy+b//2, cx+b//2, cy+b//2+h)
    lid = (cx-b//2, cy+b//2+h, cx+b//2, cy+b//2+h+b)
    left_side = (cx-b//2-h, cy-b//2, cx-b//2, cy+b//2)
    right_side = (cx+b//2, cy-b//2, cx+b//2+h, cy+b//2)
    rects = [base_box,top_side,bottom_side,lid,left_side,right_side]
    for box in rects:
        d.rectangle(box, outline=INK, width=4)
    # Fold lines at every attachment. Rectangle outlines are drawn first;
    # remove the shared solid edge before adding dashes so cut/fold semantics
    # remain unambiguous on a real printout.
    def fold_line(points, width=3):
        d.line(points, fill="white", width=9)
        dashed(d, points, width=width)
    for y in (cy-b//2, cy+b//2, cy+b//2+h):
        fold_line(((cx-b//2,y),(cx+b//2,y)), width=3)
    for x in (cx-b//2, cx+b//2):
        fold_line(((x,cy-b//2),(x,cy+b//2)), width=3)
    tab = 38
    def tab_h(x1,x2,y,sign,label=False):
        poly=[(x1+18,y),(x2-18,y),(x2-36,y+sign*tab),(x1+36,y+sign*tab)]
        d.polygon(poly,fill="#e9e2d4",outline=INK)
        fold_line(((x1+18,y),(x2-18,y)),width=2)
        if label:
            d.text(((x1+x2)//2,y+sign*20),"আঠা",font=font(16),fill="#6e685e",anchor="mm")
    def tab_v(x,y1,y2,sign,label=False):
        poly=[(x,y1+18),(x,y2-18),(x+sign*tab,y2-36),(x+sign*tab,y1+36)]
        d.polygon(poly,fill="#e9e2d4",outline=INK)
        fold_line(((x,y1+18),(x,y2-18)),width=2)
        if label:
            d.text((x+sign*20,(y1+y2)//2),"আঠা",font=font(16),fill="#6e685e",anchor="mm")
    # Side seams: tabs on the upper/lower edges of left and right walls.
    for box in (left_side,right_side):
        x1,y1,x2,y2=box
        tab_h(x1,x2,y1,-1)
        tab_h(x1,x2,y2,1)
    # Three lid edges close with glue or paper tape.
    x1,y1,x2,y2=lid
    tab_v(x1,y1,y2,-1)
    tab_v(x2,y1,y2,1)
    tab_h(x1,x2,y2,1,True)
    d.text((cx,cy),f"{tier}\n{base_mm} × {base_mm} mm",font=font(27,True),fill=INK,anchor="mm",align="center")
    d.text((cx,cy+b//2+h+b+115),note,font=font(23),fill=INK,anchor="ma")
    d.text((cx,cy+b//2+h+b+165),"পাশের ট্যাব দিয়ে বাক্স বন্ধ করুন; ছোট স্তরটি বড় স্তরের ওপর রাখুন।",font=font(19),fill="#62716c",anchor="ma")
    # Scale check and a print warning that stays inside the page.
    sx, sy, side = 965, 1360, int(10*ppm)
    d.rectangle((sx,sy,sx+side,sy+side),outline=INK,width=3)
    d.text((sx+side//2,sy+side+20),"১০ মিমি",font=font(17),anchor="ma",fill=INK)
    d.text((W//2,1545),"A4 · Actual size / 100% · ‘Fit to page’ নয়",font=font(20,True),fill="#9b3f37",anchor="ma")
    return im


def build_paper_model():
    p1 = net_page("স্তর ১", 55, 35, "সোমপুর কেন্দ্রীয় মন্দির · পাতা ২/৪", "সবচেয়ে বড় স্তর — কাগজ/হালকা কার্ডে প্রিন্ট করুন")
    p2 = net_page("স্তর ২", 42, 28, "সোমপুর কেন্দ্রীয় মন্দির · পাতা ৩/৪", "মাঝারি স্তর — স্তর ১-এর ওপর আঠা দিন")
    p3 = net_page("স্তর ৩", 30, 24, "সোমপুর কেন্দ্রীয় মন্দির · পাতা ৪/৪", "সবচেয়ে ছোট স্তর — স্তর ২-এর ওপর রাখুন")
    # Add a simple finial and final assembly sketch to page 3.
    d = ImageDraw.Draw(p3)
    d.text((965,215), "শিখর/ফিনিয়াল", font=font(23,True), fill=INK, anchor="ma")
    d.polygon([(900,390),(1030,390),(965,245)], outline=INK, fill="#f4dfb5")
    dashed(d, ((965,245),(965,390)), width=2)
    d.text((965,415), "কেটে রোল করে আঠা দিন", font=font(17), anchor="ma", fill=INK)
    d.text((970,535), "সম্পূর্ণ আকৃতি", font=font(22,True), fill=INK, anchor="ma")
    draw_temple(d, 820, 555, .30, width=8)
    d.text((W//2,1605), "এটি সরলীকৃত আকৃতি—প্রকৃত মন্দিরের নির্ভুল স্কেল, উচ্চতা বা প্রত্নতাত্ত্বিক reconstruction নয়।", font=font(20), fill="#8c4038", anchor="ma")
    instructions, d = page("সোমপুর কাগজের মডেল · নির্দেশিকা", "মোট ৪ পাতা: নির্দেশিকা + তিন স্তর · A4 · ১০০% আকারে প্রিন্ট")
    steps = [
        "১। স্তর ১, ২ ও ৩—তিনটি পাতা ১০০% / Actual size-এ প্রিন্ট করুন। ‘Fit to page’ বন্ধ রাখুন।",
        "২। কালো সরলরেখা কাটুন। ড্যাশ রেখা শিশুদের জন্য বড়দের সাহায্যে হালকা ভাঁজ করুন।",
        "৩। ছায়াঘেরা ‘আঠা’ ট্যাব ভেতরে রেখে প্রতিটি স্তরের বাক্স তৈরি করুন।",
        "৪। প্রথমে বড়, তারপর মাঝারি, সবার ওপরে ছোট স্তর রাখুন; উপরে কাগজের ফিনিয়াল লাগান।",
        "৫। নিজের রং করুন, কিন্তু প্রকৃত ইট/টেরাকোটার নকশা নকল করার আগে সংগ্রহের ছবি দেখুন।",
    ]
    y = 240
    for line in steps:
        y = text_block(d,(100,y),line,font(28),width=1030,spacing=13)+28
    d.rounded_rectangle((95,1010,1145,1270),radius=20,fill="#edf4ec",outline="#8ba08d",width=3)
    text_block(d,(135,1050),"নিরাপত্তা: ধারালো কাঁচি বড়দের সাহায্যে ব্যবহার করুন। আঠা খাবেন না। ছোট শিশুর কাছে ছোট কাটা অংশ রাখবেন না। এই মডেল দিয়ে প্রকৃত প্রত্নস্থলে কিছু মাপা/খোঁড়া যাবে না।",font(25),width=970,spacing=14)
    d.text((100,1350), "প্রাসঙ্গিক সূত্র", font=font(27,True), fill=INK)
    text_block(d,(100,1405),"UNESCO: Ruins of the Buddhist Vihara at Paharpur · whc.unesco.org/en/list/322/\nবর্তমান ছবি: Khan-Tanvir · CC BY-SA 3.0 · Wikimedia Commons",font(21),width=1040,spacing=10)
    save_pdf([instructions,p1,p2,p3],"somapura-paper-model.pdf","Somapura simplified paper model for children")


def art_sheet(title, subtitle, image_path, note="রং পেন্সিল/ক্রেয়ন ব্যবহার করুন; নিজের পছন্দের রং বেছে নিন।"):
    im,d = page(title,subtitle)
    art = Image.open(image_path).convert("RGB")
    art.thumbnail((1040,1110),Image.Resampling.LANCZOS)
    im.paste(art,((W-art.width)//2,220))
    d.rounded_rectangle((95,1390,1145,1585),radius=18,fill="#f1eadb",outline="#c7b48f",width=2)
    text_block(d,(130,1430),note,font(23),width=980,spacing=12)
    return im


def build_art_pack():
    entries = [
        ("বুদ্ধ · রেখাচিত্র ও colouring","শ্রদ্ধার সঙ্গে শান্ত ভঙ্গির একটি সাধারণ শিক্ষামূলক রেখাচিত্র",ART/"buddha-colouring.png","বিভিন্ন বৌদ্ধ ঐতিহ্যে বুদ্ধের রূপ, পোশাক ও প্রতীক ভিন্ন। এটি নির্দিষ্ট প্রাচীন মূর্তির অনুলিপি নয়।"),
        ("ভান্তে · রেখাচিত্র ও colouring","ভিক্ষু/ভান্তের একটি সাধারণ শিক্ষামূলক রেখাচিত্র",ART/"vante-colouring.png","‘ভান্তে’ সম্মানসূচক সম্বোধন। পোশাকের রং ও আচার অঞ্চল ও নিকায়ভেদে ভিন্ন হতে পারে।"),
        ("ড. বি. আর. আম্বেদকর · colouring","নবযান ও সামাজিক ন্যায়ের ইতিহাস আলাদা করে পড়ুন",ART/"ambedkar-colouring.png","মূল ছবি: Unknown author · Public domain · Wikimedia Commons: Dr B R Ambedkar as Barrister in 1922.jpg। রেখাচিত্রটি সেই ছবির শিক্ষামূলক রূপান্তর।"),
        ("সোমপুর · স্থাপত্য colouring","সরলীকৃত ধাপে-ধাপে কেন্দ্রীয় মন্দিরের আকৃতি",ART/"somapura-colouring.png","এটি পরিমাপকৃত elevation বা নির্ভুল reconstruction নয়। প্রকৃত স্থাপত্য বোঝার জন্য সংগ্রহের ছবি দেখুন।"),
        ("ধর্মচক্র · colouring","আটটি স্পোক/তিরসহ একটি প্রতীকী রেখাচিত্র",ART/"dharma-wheel-colouring.png","চক্রের প্রতীক একাধিক ভারতীয় ঐতিহ্যে পাওয়া যায়; বৌদ্ধ প্রসঙ্গে অর্থ ও ব্যবহার নির্দিষ্ট শিক্ষার সঙ্গে পড়ুন।"),
        ("পদ্ম · colouring","প্রকৃতি ও শিল্পে পরিচিত একটি ফুলের রেখাচিত্র",ART/"lotus-colouring.png","পদ্ম একাধিক দক্ষিণ এশীয় ঐতিহ্যের প্রতীক; এটি শুধু বৌদ্ধ নিদর্শন নয়।"),
        ("স্তূপ · ১–১৭ dot-to-dot","ছোট থেকে বড় সংখ্যা অনুসরণ করে যুক্ত করুন",ART/"stupa-dot-to-dot.png","ডট যুক্ত করার পর রং করুন। হালকা রেখা শুধু সাহায্যের জন্য; স্তূপের আকৃতি অঞ্চলভেদে ভিন্ন হয়।"),
    ]
    pages = [art_sheet(t,s,p,n) for t,s,p,n in entries]
    save_pdf(pages,"children-art-pack.pdf","Buddhist culture colouring and dot-to-dot learning pack")


def deer(d,x,y,s=1,color="#7c5635"):
    d.ellipse((x-55*s,y-30*s,x+55*s,y+30*s),fill=color,outline=INK,width=max(1,int(3*s)))
    d.ellipse((x+38*s,y-75*s,x+83*s,y-30*s),fill=color,outline=INK,width=max(1,int(3*s)))
    for dx in (-35,25):
        d.line((x+dx*s,y+20*s,x+(dx-5)*s,y+82*s),fill=INK,width=max(2,int(4*s)))
    d.line((x+68*s,y-67*s,x+55*s,y-100*s,x+48*s,y-115*s),fill=INK,width=max(1,int(3*s)))
    d.line((x+68*s,y-67*s,x+78*s,y-100*s,x+88*s,y-112*s),fill=INK,width=max(1,int(3*s)))
    d.ellipse((x+67*s,y-57*s,x+72*s,y-52*s),fill=INK)


def forest(d,box,deer_count=2):
    x1,y1,x2,y2=box
    d.rectangle(box,fill="#dceccf",outline="#b69b6a",width=3)
    for x in range(x1+55,x2,150):
        d.rectangle((x,y1+150,x+15,y2-45),fill="#7b5b3d")
        d.ellipse((x-55,y1+55,x+70,y1+190),fill="#77a565",outline="#4b7747",width=2)
    for i in range(deer_count):
        deer(d,x1+150+i*150,y2-150,.65 if i else .8)


def comic_page(number, panels):
    im,d = page(f"বনরাজার সাহস · মিনি-কমিক {number}/৩","Banyan Deer জাতক থেকে অনুপ্রাণিত মুক্ত, অহিংস শিশু-অভিযোজন")
    positions=[(80,235,1140,710),(80,820,1140,1295)]
    for idx,(caption,kind) in enumerate(panels):
        box=positions[idx]; x1,y1,x2,y2=box
        forest(d,box,2 if kind!="talk" else 1)
        if kind=="think":
            d.ellipse((x2-310,y1+45,x2-70,y1+180),fill="white",outline=INK,width=3)
            d.text((x2-190,y1+112),"সবাইকে\nবাঁচাতে হবে",font=font(23,True),fill=INK,anchor="mm",align="center")
        elif kind=="talk":
            deer(d,x1+250,y2-150,.9)
            d.rounded_rectangle((x2-500,y1+45,x2-75,y1+200),radius=25,fill="white",outline=INK,width=3)
            d.text((x2-287,y1+120),"শিকার নয়—\nবনে শান্তি হোক",font=font(25,True),fill=INK,anchor="mm",align="center")
        elif kind=="promise":
            d.rounded_rectangle((x2-560,y1+50,x2-80,y1+200),radius=25,fill="#fff4ca",outline=INK,width=3)
            d.text((x2-320,y1+124),"আমরা হরিণদের\nক্ষতি করব না",font=font(25,True),fill=INK,anchor="mm",align="center")
        d.rounded_rectangle((x1+20,y2-82,x2-20,y2-18),radius=12,fill="#fffaf0dd",outline="#b69b6a",width=2)
        d.text(((x1+x2)//2,y2-50),caption,font=font(25),fill=INK,anchor="mm")
    d.text((W//2,1400),"গল্প ভাবুন: বনরাজা কেন একা নয়, সবার কথা ভাবল?",font=font(27,True),fill=INK,anchor="ma")
    text_block(d,(140,1470),"এটি প্রাচীন গল্পের নতুন সংক্ষিপ্ত অভিযোজন—মূল পাঠ বা কোনো আধুনিক কমিকের অনুলিপি নয়। সব জাতক অভিযোজন শিশু-উপযোগী নাও হতে পারে; অভিভাবক আগে পড়ে দেখবেন।",font(21),width=960,spacing=10)
    return im


def build_comic():
    pages=[
        comic_page(1,[("বনে হরিণরা শিকারের ভয়ে আতঙ্কিত ছিল।","forest"),("বনরাজা ভাবল—সবাইকে রক্ষা করতে হবে।","think")]),
        comic_page(2,[("সে দলকে সাহস দিয়ে শান্তিপূর্ণ পথ বেছে নিল।","forest"),("রাজার কাছে গিয়ে বনের কথা বলল।","talk")]),
        comic_page(3,[("রাজা হরিণদের ক্ষতি না করার প্রতিশ্রুতি দিলেন।","promise"),("বনে ফিরে এল আনন্দ—সাহস আর কথা সবাইকে বাঁচাল।","forest")]),
    ]
    save_pdf(pages,"banyan-deer-mini-comic.pdf","Banyan Deer inspired original children mini-comic")


def build_song_sheet():
    im,d=page("মৈত্রীর আলো · নতুন শিক্ষামূলক গান","মূল কথা ও সরল সুর · ঐতিহ্যবাহী Buddha kirtan বা ধর্মগ্রন্থের পাঠ নয়")
    lyrics="আলো জ্বলুক প্রাণে প্রাণে\nমৈত্রী ফুটুক মনে মনে\nসবাই সুখী হোক সব সময়\nশান্তি ছড়াক পথে পথে"
    d.rounded_rectangle((95,245,1145,640),radius=25,fill="#fff2cc",outline="#d0a44d",width=3)
    y=300
    for line in lyrics.split("\n"):
        d.text((W//2,y),line,font=font(39,True),fill=INK,anchor="ma"); y+=78
    d.text((100,735),"সুর ও ছন্দ",font=font(30,True),fill=INK)
    text_block(d,(100,795),"৪/৪ · ধীরে · প্রতি লাইন ৮ মাত্রার সহজ অনুশীলন\nসা রে গা মা | মা গা রে সা\nসা রে গা মা | মা গা রে সা\nগা মা পা মা | গা রে সা সা\nগা মা পা মা | গা রে সা সা",font(29),width=1040,spacing=18)
    d.rounded_rectangle((95,1120,1145,1410),radius=20,fill="#eaf2ee",outline="#8ca298",width=3)
    text_block(d,(135,1160),"শুনে গাইবেন, জোরে গলা চাপাবেন না। অনলাইনের ‘maitri-original.wav’ হলো নতুন synthesized melody guide—কোনো প্রকৃত শিল্পীর কণ্ঠ, প্রচলিত রাগ বা স্থানীয় মণ্ডলীর ঐতিহ্যবাহী সুর বলে দাবি নয়। ঐতিহ্যবাহী কথা ও সুর জানতে স্থানীয় শিল্পী/বৌদ্ধ মণ্ডলীর কাছে শিখুন।",font(24),width=970,spacing=14)
    save_pdf([im],"maitri-original-song.pdf","Maitri original educational song and simple melody")


def write_wav(path: Path, samples, rate=22050):
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        data=bytearray()
        for value in samples:
            v=max(-32767,min(32767,int(value*32767)))
            data += int(v).to_bytes(2,"little",signed=True)
        w.writeframes(data)


def tone(freq,duration,rate=22050,volume=.22,decay=2.0):
    out=[]
    for i in range(int(duration*rate)):
        t=i/rate
        env=(1-math.exp(-t*40))*math.exp(-decay*t/max(.2,duration))
        value=math.sin(2*math.pi*freq*t)+.25*math.sin(2*math.pi*freq*2*t)
        out.append(volume*env*value/1.25)
    return out


def build_audio():
    rate=22050
    notes=[261.63,293.66,329.63,392.0,392.0,329.63,293.66,261.63]
    sequence=notes+notes+[329.63,392.0,440.0,392.0,329.63,293.66,261.63,261.63]*2
    beat=.42; samples=[]
    for freq in sequence:
        part=tone(freq,beat,rate,.20,3.0)
        samples.extend(part)
    # Gentle original synthesized bell, not a recorded singing bowl.
    bell=[]
    duration=6.0
    for i in range(int(duration*rate)):
        t=i/rate
        env=(1-math.exp(-t*70))*math.exp(-.78*t)
        value=(math.sin(2*math.pi*432*t)+.45*math.sin(2*math.pi*864.7*t)+.18*math.sin(2*math.pi*1197*t))
        bell.append(.19*env*value/1.63)
    write_wav(AUDIO/"maitri-original.wav",samples,rate)
    write_wav(AUDIO/"digital-bell.wav",bell,rate)


def main():
    # Match the generated reconstruction to the licensed current photograph.
    source = OUT / "somapura-reconstruction.png"
    if source.exists():
        im = Image.open(source).convert("RGB").resize((800,588),Image.Resampling.LANCZOS)
        im.save(OUT / "somapura-reconstruction.jpg",quality=91,optimize=True)
    build_line_art()
    build_paper_model()
    build_art_pack()
    build_comic()
    build_song_sheet()
    build_audio()
    print("Children assets built:")
    for folder in (ART,PDF,AUDIO):
        for p in sorted(folder.iterdir()):
            print(f"  {p.relative_to(ROOT)} ({p.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
