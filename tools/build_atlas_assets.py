#!/usr/bin/env python3
"""Build original Atlas mascot and bilingual printable learning resources."""
from pathlib import Path
from PIL import Image, ImageDraw
from build_children_assets import font, wrap, text_block, draw_temple, draw_stupa, draw_wheel

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "atlas"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1240, 1754
PAPER = "#fffaf0"
INK = "#203b37"
MUTED = "#5f716b"
TERRA = "#b85e3d"
GOLD = "#c68b32"
GREEN = "#2b6c5b"
CREATOR = "চর্যাভূমি · Research & Travel Atlas · মিথুন মুৎসুদ্দী"


def page(title, subtitle="", section="ATLAS FIELD NOTEBOOK"):
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((40, 38, W-40, H-40), 24, outline="#d7c39a", width=3)
    d.text((78, 65), section, font=font(17, latin=True), fill=TERRA)
    d.text((78, 105), title, font=font(42, True), fill=INK)
    y = 166
    if subtitle:
        y = text_block(d, (80, 166), subtitle, font(21), MUTED, W-160, 7)
    d.line((80, max(205, y+5), W-80, max(205, y+5)), fill=GOLD, width=3)
    d.text((W-78, H-72), CREATOR, font=font(17), fill=MUTED, anchor="ra")
    return im, d, max(235, y+30)


def line(d, y, label, x=85, width=1050):
    d.text((x, y), label, font=font(21, True), fill=INK)
    d.line((x, y+42, x+width, y+42), fill="#9caaa4", width=2)


def box(d, xy, title, body, color=GREEN):
    x1,y1,x2,y2=xy
    d.rounded_rectangle(xy, 20, fill="#fffdf7", outline="#d9c9aa", width=2)
    d.rectangle((x1,y1,x1+10,y2), fill=color)
    d.text((x1+30,y1+22), title, font=font(25, True), fill=color)
    return text_block(d,(x1+30,y1+70),body,font(20),INK,x2-x1-58,8)


def checklist(d, items, x, y, width=1040, gap=18):
    for item in items:
        d.rounded_rectangle((x,y+5,x+24,y+29),4,outline=GREEN,width=2)
        y=text_block(d,(x+42,y),item,font(20),INK,width-42,7)+gap
    return y


def draw_mascot(d, cx, cy, scale=1.0):
    def R(v): return int(v*scale)
    # Original brick-shaped field companion, with scarf and magnifier.
    d.rounded_rectangle((cx-R(105),cy-R(90),cx+R(105),cy+R(105)),R(28),fill="#c9754f",outline=INK,width=max(2,R(5)))
    d.line((cx-R(100),cy-R(10),cx+R(100),cy-R(10)),fill="#9d4f35",width=max(2,R(3)))
    d.line((cx,cy-R(85),cx,cy-R(12)),fill="#9d4f35",width=max(2,R(3)))
    d.ellipse((cx-R(58),cy-R(48),cx-R(20),cy-R(10)),fill="white",outline=INK,width=max(2,R(3)))
    d.ellipse((cx+R(20),cy-R(48),cx+R(58),cy-R(10)),fill="white",outline=INK,width=max(2,R(3)))
    d.ellipse((cx-R(43),cy-R(36),cx-R(31),cy-R(24)),fill=INK)
    d.ellipse((cx+R(31),cy-R(36),cx+R(43),cy-R(24)),fill=INK)
    d.arc((cx-R(36),cy-R(8),cx+R(36),cy+R(48)),10,170,fill=INK,width=max(2,R(4)))
    d.polygon([(cx-R(100),cy+R(66)),(cx+R(100),cy+R(66)),(cx+R(90),cy+R(99)),(cx-R(90),cy+R(99))],fill=GREEN)
    d.polygon([(cx+R(55),cy+R(90)),(cx+R(102),cy+R(156)),(cx+R(62),cy+R(132))],fill=GREEN)
    d.ellipse((cx+R(88),cy+R(45),cx+R(174),cy+R(131)),outline=INK,width=max(2,R(6)))
    d.line((cx+R(105),cy+R(120),cx+R(72),cy+R(176)),fill=INK,width=max(2,R(8)))


def school_kit():
    pages=[]
    im,d,y=page("স্কুল ট্রিপ কিট", "School trip kit · প্রমাণ লিখি, অনুমান আলাদা রাখি, নিদর্শন রক্ষা করি", "CHARYABHUMI · RESEARCH & TRAVEL ATLAS")
    draw_mascot(d,1010,365,.9)
    d.text((90,285),"আমার/আমাদের অভিযান",font=font(34,True),fill=TERRA)
    for yy,label in [(370,"দল / School / Group"),(455,"তারিখ / Date"),(540,"প্রত্নস্থল / Site"),(625,"শিক্ষক বা দায়িত্বপ্রাপ্ত বড় / Responsible adult")]:line(d,yy,label,width=790)
    y=box(d,(82,735,1158,1015),"ভ্রমণের আগে / Before travel","সরকারি সময়, বিশেষ ছুটি, টিকিট, প্রবেশ অনুমতি, সড়ক, ফেরার যান, আবহাওয়া, পানি, ওষুধ, accessibility এবং জরুরি যোগাযোগ যাচাই করুন। Site coordinate কখনো surveyed entrance gate নয়।\n\nVerify official hours, closures, tickets, permission, roads, return transport, weather, water, medication, accessibility and emergency contacts.",GREEN)
    box(d,(82,1040,1158,1320),"নিরাপত্তা ও সংরক্ষণ / Safety and care","খোঁড়া, দেয়ালে চড়া, ভাস্কর্য ছোঁয়া, ইট/টেরাকোটা/মুদ্রা তোলা বা অনুমতি ছাড়া drone নয়। ক্ষতি দেখলে নিজে মেরামত নয়—দূর থেকে নথি রেখে দায়িত্বপূর্ণ কর্তৃপক্ষকে জানান।\nNo digging, climbing, touching, collecting or unauthorised drones. Do not repair damage yourself.",TERRA)
    d.text((90,1380),"Atlas scope: ১২টি গভীর profile · পূর্ণ ৩,২১৮ রেকর্ডের documentation দাবি নয়",font=font(20),fill=MUTED)
    pages.append(im)

    im,d,y=page("ভূমিকা ও প্রস্তুতি", "Roles and preparation · প্রতিটি দলে কাজ ভাগ করুন")
    roles=[("পর্যবেক্ষক / Observer","যা চোখে দেখা যায় শুধু তা লিখবে।"),("মানচিত্র পাঠক / Map reader","উত্তর দিক, স্থানাঙ্ক ও নিরাপদ পথ দেখবে।"),("উৎস যাচাইকারী / Source checker","তারিখ, লিংক, author ও অনিশ্চিত তথ্য চিহ্নিত করবে।"),("সময় ও নিরাপত্তা / Time and safety","দল একসঙ্গে থাকা, পানি ও ফেরার সময় দেখবে।")]
    for title,body in roles:
        y=box(d,(82,y,1158,y+155),title,body)+20
    d.text((85,y+10),"যাত্রার checklist",font=font(29,True),fill=TERRA);y+=65
    checklist(d,["Official hours / closure / tickets পুনরায় দেখা হয়েছে","ফেরার পরিবহন ও জরুরি যোগাযোগ সবাই জানে","শরীর ও পোশাক আবহাওয়ার উপযোগী; পানি ও ওষুধ আছে","শিক্ষক/অভিভাবকের অনুমতি ও প্রত্নস্থলের নিয়ম মেনে চলা হবে","কোনো বস্তু স্পর্শ বা সরানো হবে না"],85,y)
    pages.append(im)

    im,d,y=page("আমার field observation", "Observation ≠ interpretation · যা দেখলাম এবং যা বুঝলাম আলাদা")
    for label in ["Site / তারিখ / সময়","আবহাওয়া / আলো / দৃশ্যমানতা","GPS (accuracy-সহ) — gate নয়, নিরাপদ public location","দেখা স্থাপত্য: কক্ষ / স্তূপ / মন্দির / দেয়াল / নিকাশি"]:line(d,y,label);y+=85
    d.text((85,y),"Observation — মাপ/রং/অবস্থান/ছবি নম্বর",font=font(24,True),fill=GREEN);y+=48
    for _ in range(5):d.line((85,y,1155,y),fill="#bdc7c0",width=2);y+=55
    d.text((85,y+15),"Interpretation — আমার অনুমান এবং তার প্রমাণ",font=font(24,True),fill=TERRA);y+=63
    for _ in range(5):d.line((85,y,1155,y),fill="#bdc7c0",width=2);y+=55
    d.text((85,y+15),"যা জানি না / আরও যাচাই দরকার",font=font(24,True),fill=INK);y+=63
    for _ in range(3):d.line((85,y,1155,y),fill="#bdc7c0",width=2);y+=55
    pages.append(im)

    im,d,y=page("স্থাপত্য স্কেচ ও তুলনা", "Architecture sketch and comparison · measured reconstruction নয়")
    d.rounded_rectangle((82,y,1158,y+680),16,outline="#aebbb4",width=2)
    for x in range(102,1140,40):d.line((x,y+20,x,y+660),fill="#e4e8e2",width=1)
    for yy in range(int(y)+20,int(y)+670,40):d.line((102,yy,1138,yy),fill="#e4e8e2",width=1)
    d.text((100,y+18),"North / উত্তর ↑   ·   Sketch only what is visible",font=font(19),fill=MUTED)
    y+=720
    for label in ["আমার স্কেচে কোন অংশ নিশ্চিত, কোন অংশ অনুমান?","প্রকাশিত plan/map-এর সঙ্গে পার্থক্য","Source title, author, year ও page/URL"]:line(d,y,label);y+=90
    d.text((85,y+20),"মনে রাখুন: পুরনো illustration বর্তমান অবস্থার প্রমাণ নয়; AI/কাল্পনিক reconstruction প্রত্নতাত্ত্বিক plan নয়।",font=font(20),fill=TERRA)
    pages.append(im)

    im,d,y=page("ক্ষতি, নতুন তথ্য বা ছবির খসড়া", "Draft field update · এই খাতা অফিসিয়াল damage report নয়")
    d.text((85,y),"ধরন",font=font(23,True),fill=INK)
    checklist(d,["Damage / ক্ষতি","New public information / নতুন তথ্য","Photo / metadata correction","Access or visitor information"],85,y+45,1040,8);y+=285
    for label in ["কোথায় এবং কখন পর্যবেক্ষণ (ঝুঁকিপূর্ণ/নিষিদ্ধ এলাকায় ঢুকবেন না)","যা সরাসরি দেখেছি—অনুমান নয়","ছবির তারিখ, দিক ও নিরাপদ অবস্থান","মূল উৎস/লিংক; অন্যের ছবি হলে লাইসেন্স"]:line(d,y,label);y+=90
    y=box(d,(82,y+10,1158,y+260),"জরুরি ঘটনায় / In an urgent case","চলমান লুট, ভাঙচুর বা বিপদ হলে public form-এ অপেক্ষা না করে DoA/স্থানীয় কর্তৃপক্ষ বা জাতীয় জরুরি সেবা ৯৯৯-এ যোগাযোগ করুন। নিজে হস্তক্ষেপ করে ঝুঁকি নেবেন না।",TERRA)
    d.text((85,y+50),"Public portal draft: atlas.html#field-desk  ·  Export করে নিজে সংশ্লিষ্ট কর্তৃপক্ষে পাঠান।",font=font(20),fill=GREEN)
    pages.append(im)

    im,d,y=page("আমার evidence passport", "12 major-site stamps · প্রশ্নের উত্তরে ডিজিটাল stamp; ভ্রমণের প্রমাণ নয়")
    names=["সোমপুর","শালবন","কোটিলা","ইটাখোলা","রূপবান","চারপত্র","আনন্দ","ভোজ","সীতাকোট","হলুদ","ভাসু","জগদ্দল"]
    for i,name in enumerate(names):
        col=i%3;row=i//3;cx=245+col*375;cy=y+95+row*230
        d.ellipse((cx-85,cy-85,cx+85,cy+85),outline="#b7a47f",width=4)
        d.ellipse((cx-72,cy-72,cx+72,cy+72),outline="#d8c9a9",width=2)
        d.text((cx,cy-8),name,font=font(24,True),fill="#8b806a",anchor="mm")
        d.text((cx,cy+35),"তারিখ: ____",font=font(16),fill=MUTED,anchor="mm")
    y+=1030
    d.text((85,y),"ফিরে এসে / After the visit",font=font(28,True),fill=TERRA);y+=55
    checklist(d,["Observation ও interpretation আলাদা করেছি","প্রতিটি তথ্যের উৎস ও তারিখ লিখেছি","কোনো নিদর্শন সংগ্রহ বা সরাইনি","ভুল তথ্য/ছবি পেলে correction draft করেছি"],85,y,1040,10)
    pages.append(im)
    save_pdf(pages,"school-field-notebook.pdf","চর্যাভূমি স্কুল ট্রিপ কিট")


def panel(d, rect, caption_bn, caption_en, art):
    x1,y1,x2,y2=rect
    d.rounded_rectangle(rect,20,fill="#fffdf7",outline="#cbb68e",width=3)
    art((x1,y1,x2,y2))
    y=y2-190
    d.rectangle((x1+3,y,x2-3,y2-3),fill="#fff9e9")
    yy=text_block(d,(x1+25,y+16),caption_bn,font(20,True),INK,x2-x1-50,5)
    text_block(d,(x1+25,yy+5),caption_en,font(16,latin=True),MUTED,x2-x1-50,4)


def scene_present(rect, missing=False):
    x1,y1,x2,y2=rect;cx=(x1+x2)//2
    draw_temple(d_holder[0],x1+15,y1+5,.95,TERRA,4)
    draw_mascot(d_holder[0],x2-150,y1+155,.45)
    if missing:
        d_holder[0].rounded_rectangle((x1+55,y1+65,x1+240,y1+205),12,outline=GREEN,width=4)
        d_holder[0].text((x1+147,y1+132),"?",font=font(64,True),fill=GREEN,anchor="mm")


def scene_imagination(rect, workshop=False):
    x1,y1,x2,y2=rect;d=d_holder[0]
    d.text((x1+25,y1+20),"কাল্পনিক দৃশ্য · IMAGINED LEARNING SCENE",font=font(17,True),fill=TERRA)
    if workshop:
        for i in range(4):
            xx=x1+100+i*170;d.rectangle((xx,y1+110,xx+120,y1+195),fill="#c97b56",outline=INK,width=3)
            d.arc((xx+22,y1+130,xx+98,y1+184),180,360,fill="#fff1cf",width=3)
        draw_mascot(d,x2-150,y1+155,.42)
    else:
        for i in range(3):
            xx=x1+120+i*220;d.ellipse((xx,y1+90,xx+65,y1+155),outline=INK,width=3)
            d.arc((xx-35,y1+140,xx+100,y1+300),180,360,fill=GREEN,width=4)
            d.rectangle((xx-15,y1+235,xx+95,y1+275),fill="#e5c891",outline=INK,width=2)
        d.text((x1+55,y1+55),"ইতিহাস পড়ি · কল্পনা চিহ্নিত রাখি",font=font(22,True),fill=GREEN)


def scene_return(rect, protect=False):
    x1,y1,x2,y2=rect;d=d_holder[0]
    if protect:
        draw_stupa(d,x1+10,y1-90,.7,GREEN,4);draw_mascot(d,x2-160,y1+155,.45)
        d.rounded_rectangle((x1+160,y1+65,x1+450,y1+190),15,fill="#e6f0e9",outline=GREEN,width=3)
        d.text((x1+305,y1+128),"OBSERVE\nRECORD\nCITE",font=font(23,True,latin=True),fill=GREEN,anchor="mm",align="center")
    else:
        d.rounded_rectangle((x1+80,y1+55,x1+600,y1+245),12,fill="white",outline=INK,width=3)
        for i,t in enumerate(["OBSERVATION","SOURCE + DATE","UNKNOWN / VERIFY"]):
            d.text((x1+110,y1+80+i*50),t,font=font(20,True,latin=True),fill=[GREEN,TERRA,MUTED][i])
            d.line((x1+390,y1+95+i*50,x1+560,y1+95+i*50),fill="#aab7b0",width=2)
        draw_mascot(d,x2-160,y1+155,.45)


def comic():
    global d_holder
    pages=[]
    panels=[
      ("ইটু: পাহাড়পুর আর সোমপুর মহাবিহার একই জায়গা! আজ আমরা শুধু দেখব, কিছু ছুঁব না।", "Itu: Paharpur and Somapura Mahavihara are one place. Today we observe without touching.",lambda r:scene_present(r,False)),
      ("মীরা: পুরনো ছবির সঙ্গে না মিললেই ‘চুরি’ নয়। আগে তারিখ, উৎস আর বর্তমান তথ্য যাচাই করি।", "Mira: A difference from an old photograph does not prove theft. Check dates, sources and current information first.",lambda r:scene_present(r,True)),
      ("ইটু: এবার কল্পনায় পাল যুগের পাঠশালায় যাই—কিন্তু এটি প্রমাণ নয়, শেখার জন্য imagined scene!", "Itu: Let us imagine a Pala-period place of learning—clearly an imagined learning scene, not evidence.",lambda r:scene_imagination(r,False)),
      ("মীরা: শিল্পীরা টেরাকোটা ফলক বানাচ্ছেন বলে কল্পনা করি। নির্দিষ্ট ব্যক্তি বা ঘটনা বলে দাবি করছি না।", "Mira: We may imagine artisans making terracotta plaques without claiming these are specific historical people or events.",lambda r:scene_imagination(r,True)),
      ("বর্তমানে ফিরে observation, source এবং ‘যা জানি না’ তিন খাতায় লিখলাম। নতুন তথ্য কর্তৃপক্ষে যাচাই করার জন্য পাঠানো যায়।", "Back in the present, we separate observations, sources and unknowns. New information can be sent for authoritative review.",lambda r:scene_return(r,False)),
      ("ইটু: Heritage Master-এর নিয়ম—দেখো, লেখো, উৎস দাও, রক্ষা করো। নিদর্শন স্মৃতি হিসেবে তোলা নয়!", "Itu: The Heritage Master rule—observe, record, cite and protect. Never collect heritage as a souvenir!",lambda r:scene_return(r,True))]
    for p in range(3):
        im,d,y=page("ইটু ও হারানো ফলকের রহস্য" if p==0 else "প্রমাণের পথে ইটু", "Itu and the missing plaque · Original bilingual archaeology comic" if p==0 else f"Evidence with Itu · Part {p+1} of 3", "ORIGINAL EDUCATIONAL COMIC")
        d_holder=[d]
        panel(d,(70,y,1170,y+650),*panels[p*2])
        panel(d,(70,y+675,1170,y+1325),*panels[p*2+1])
        pages.append(im)
    save_pdf(pages,"itu-pala-evidence-comic.pdf","ইটু ও হারানো ফলকের রহস্য")


def save_pdf(images, filename, title):
    images=[im.convert("RGB") for im in images]
    images[0].save(OUT/filename,"PDF",save_all=True,append_images=images[1:],resolution=150.0,quality=88,title=title,author="মিথুন মুৎসুদ্দী",subject="Original bilingual educational resource; not a measured archaeological reconstruction")
    for i,im in enumerate(images,1):im.save(OUT/(Path(filename).stem+f"-page{i}.jpg"),quality=86)


MASCOT='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 360" role="img" aria-labelledby="t d">
<title id="t">ইটু — প্রমাণ খোঁজার ইটের সঙ্গী</title><desc id="d">An original terracotta-brick companion with a green scarf and magnifying glass.</desc>
<rect width="420" height="360" rx="36" fill="#f7efdd"/><path d="M52 300Q210 248 368 300" fill="none" stroke="#d7c39a" stroke-width="8" stroke-linecap="round"/>
<rect x="86" y="66" width="210" height="224" rx="38" fill="#c9754f" stroke="#203b37" stroke-width="8"/><path d="M91 150h200M191 72v72" stroke="#9d4f35" stroke-width="5"/>
<g fill="#fff" stroke="#203b37" stroke-width="5"><ellipse cx="147" cy="128" rx="27" ry="30"/><ellipse cx="234" cy="128" rx="27" ry="30"/></g><g fill="#203b37"><circle cx="154" cy="136" r="9"/><circle cx="227" cy="136" r="9"/></g><path d="M151 181q40 42 80 0" fill="none" stroke="#203b37" stroke-width="8" stroke-linecap="round"/>
<path d="M91 237q100 30 200 0l-8 52q-92 26-184 0z" fill="#2b6c5b"/><path d="l0 0M255 267l55 78-55-19z" fill="#2b6c5b"/>
<circle cx="322" cy="204" r="53" fill="#ffffff88" stroke="#203b37" stroke-width="10"/><path d="M289 243l-45 72" stroke="#203b37" stroke-width="14" stroke-linecap="round"/>
<path d="M116 45l36-26 34 28M240 42l28-25 28 30" fill="none" stroke="#c68b32" stroke-width="8" stroke-linecap="round"/>
</svg>'''


def main():
    (OUT/"itu-mascot.svg").write_text(MASCOT)
    school_kit();comic()
    for p in sorted(OUT.glob("*.pdf")):print(p.name,p.stat().st_size)


if __name__ == "__main__":
    main()
