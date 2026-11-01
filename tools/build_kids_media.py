#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""শিশু ও শিক্ষা বিভাগের ডেটা তৈরি — data/kids-media.json
সূত্র: Wikimedia Commons (মুক্ত/PD), Project Gutenberg (PD), Internet Archive (CC/PD)।
প্রতিটি রেকর্ডে থাম্বনেইল বা অডিও ফাইল আছে; লাইসেন্স-লিংক ও স্বীকৃতি বাধ্যতামূলক।
"""
import json, os, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THUMBS = ROOT / 'assets' / 'kids' / 'thumbs'
AUDIO = ROOT / 'assets' / 'kids' / 'audio'
OUT = ROOT / 'data' / 'kids-media.json'

LIC = {
    'Public domain': ('পাবলিক ডোমেইন', 'https://commons.wikimedia.org/wiki/Commons:Licensing'),
    'CC0': ('কপিরাইট-ত্যাগ (CC0)', 'https://creativecommons.org/publicdomain/zero/1.0/deed.bn'),
    'CC BY 2.0': ('খোলা (CC BY 2.0)', 'https://creativecommons.org/licenses/by/2.0/deed.bn'),
    'CC BY 3.0': ('খোলা (CC BY 3.0)', 'https://creativecommons.org/licenses/by/3.0/deed.bn'),
    'CC BY 4.0': ('খোলা (CC BY 4.0)', 'https://creativecommons.org/licenses/by/4.0/deed.bn'),
    'CC BY-SA 3.0': ('খোলা (CC BY-SA 3.0)', 'https://creativecommons.org/licenses/by-sa/3.0/deed.bn'),
    'CC BY-SA 4.0': ('খোলা (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/deed.bn'),
    'Gutenberg': ('পাবলিক ডোমেইন (Gutenberg)', 'https://www.gutenberg.org/policy/license.html'),
    'IA-user-claim': ('আর্কাইভ-লিংক (আপলোডকারীর দাবি: CC0)', 'https://archive.org/about/terms.php'),
    'copyright': ('কপিরাইটযুক্ত — কিনতে/ধার করতে হবে', 'https://www.amarchitrakatha.com/'),
    'youtube': ('ইউটিউব — স্রষ্টার/আপলোডকারীর চ্যানেলে', 'https://www.youtube.com/'),
    'licensed': ('কপিরাইট — বৈধ প্ল্যাটফর্মে দেখতে হবে', 'https://www.justwatch.com/'),
    'original': ('চর্যাভূমির নিজের আঁকা — মুক্ত ব্যবহার (CC BY-SA 4.0)', 'https://creativecommons.org/licenses/by-sa/4.0/deed.bn'),
}

commons_meta = {}
for row in json.loads(Path('/home/user/discovery/kids/commons_kids.json').read_text(encoding='utf-8')):
    commons_meta.setdefault(row['title'], row)

def commons(title_slug, title, lic, artist, topic, kind, titleBn, descBn, ageBn, extra=None):
    item = dict(
        id='kid-' + title_slug.replace('kid-', ''),
        type=kind, lang='en', ageBn=ageBn, topics=[topic],
        titleBn=titleBn, titleEn=title.replace('File:', '').rsplit('.', 1)[0],
        descBn=descBn,
        thumb=f'assets/kids/thumbs/kid-{title_slug.replace("kid-", "")}.jpg',
        licenceLabel=LIC[lic][0], licenceUrl=LIC[lic][1], licenceKey=lic,
        creatorBn=artist,
        creditBn=f'{artist} · Wikimedia Commons — পুনঃব্যবহারে নাম ও লাইসেন্সের উল্লেখ রাখুন।',
        sourceName='Wikimedia Commons',
        sourceUrl='https://commons.wikimedia.org/wiki/' + title.replace(' ', '_'),
        downloadUrl='https://commons.wikimedia.org/wiki/Special:FilePath/' + title.replace('File:', '').replace(' ', '_'),
    )
    if extra: item.update(extra)
    return item

ITEMS = []

# ---------------------------------------------------------------- চর্যাভূমির নিজের আঁকা কার্টুন (AI-সহায়তায়)
OWN = [
 ('kid-own-moon-rabbit','শশক জাতক — চাঁদের খরগোশ','jataka',
  'অর্ধচন্দ্র রাতের বনে শশক নিজেকে দান করতে এগিয়ে যায় — দানের সবচেয়ে কোমল পাঠ। সঙ্গে ওটার, শিয়াল আর বানর।'),
 ('kid-own-white-elephant','শ্বেত হস্তী জাতক — রাজার দান','jataka',
  'রাজপুত্র প্রজাদের ডাকে শ্বেত হস্তী দান করে দিচ্ছেন — দানের পরও করুণা কীভাবে থাকে, সেই কাহিনি।'),
 ('kid-own-angulimala','বুদ্ধ ও অঙ্গুলিমাল — অস্ত্র নামে','angulimala',
  'ভয়ংকর অঙ্গুলিমালের সামনে শান্ত বুদ্ধ; অস্ত্র ঘাসে পড়ে থাকে। শিশুদের জন্য হিংস্রতা ছাড়া আঁকা — ক্ষমার ছবি।'),
 ('kid-own-sujata','সুজাতার মধুপায়স — নদীর ধারে','sujata',
  'বোধিলাভের আগে সুজাতা গৌতমকে মধুপায়সের পাত্র এগিয়ে দিচ্ছেন — দান মানে সাহস, সেই গল্প।'),
 ('kid-own-monkey-crocodile','বানর ও কুমির — জাতক','jataka',
  'কুমিরের পিঠে চড়ে নদী পেরোচ্ছে চতুর বানর, হাতে আমের কাঁদি — বন্ধুত্ব ও উপস্থিত-বুদ্ধির গল্প।'),
 ('kid-own-banyan-deer','বটহরিণ জাতক — সাহসী হরিণ','jataka',
  'বটহরিণ নিজের প্রাণ বাজি রেখে পালের সামনে দাঁড়ায়, রাজা ধনুক নামিয়ে ফেলেন — করুণা ও সাহসের ছবি।'),
]
for slug, tBn, topic, dBn in OWN:
    ITEMS.append(dict(
        id=slug, type='art', lang='bn', ageBn='৪–১২ বছর', topics=[topic],
        titleBn=tBn, titleEn=tBn, descBn=dBn + ' — ছবিটি এই সাইটের জন্য নতুন আঁকা (AI-সহায়তায়), তাই নির্দ্বিধায় ডাউনলোড করে শ্রেণিকক্ষে/বাড়িতে ব্যবহার করা যায়।',
        thumb=f'assets/kids/thumbs/{slug}.jpg',
        licenceLabel=LIC['original'][0], licenceUrl=LIC['original'][1], licenceKey='original',
        creatorBn='চর্যাভূমি (AI-সহায়তায় আঁকা মূল চিত্র)',
        creditBn='চর্যাভূমি মূল আঁকন (AI-সহায়তায়) · CC BY-SA 4.0 — ব্যবহার ও পরিবর্তন করা যায়, কৃতজ্ঞতাস্বরূপ সূত্র ও লাইসেন্সের উল্লেখ রাখুন।',
        sourceName='চর্যাভূমি · শিশু ও শিক্ষা বিভাগ',
        sourceUrl='sishu-shikkha.html',
        downloadUrl=f'assets/kids/thumbs/{slug}.jpg',
        noteBn='চাইলে প্রিন্ট করে রঙ করার পাতা হিসেবেও ব্যবহার করা যায়।',
    ))

# ---------------------------------------------------------------- কমিক ও ছবির বই
ITEMS.append(commons('jataka-comic-rabbit', 'File:JatakaTales-lapin-page6-2.jpg', 'CC BY-SA 4.0',
    'আধুনিক চিত্রী (কমন্স ব্যবহারকারী)', 'jataka', 'comic',
    'জাতক গল্পের কমিক পাতা — ‘শশক জাতক’',
    '‘Jataka Tales’-এর আধুনিক কমিক-রূপ থেকে একটি পাতা — মিষ্টি-শিল্পরীতিতে আঁকা, শিশুদের জন্য উপযোগী। কমিক্সেই আজ সবচেয়ে সহজে জাতকের নীতিকথা পৌঁছে যায়: ছবি দেখে গল্প বোঝা যায়, ভাষা না জানলেও চলে।', '৬–১২ বছর'))
ITEMS.append(commons('jataka-turtle-1', 'File:Contes de Jataka, La tortue bavarde - 1.jpg', 'Public domain',
    'অজ্ঞাত চিত্রী (ফরাসি শিশু-বই)', 'jataka', 'comic',
    '‘বাচাল কচ্ছপ’ — ফরাসি জাতক ছবির বই (১)',
    '‘La tortue bavarde’ (বাচাল কচ্ছপ) জাতক-ছবির বইয়ের একটি পাতা — কচ্ছপটি বেশি কথা বলতে গিয়ে বিপদে পড়ে। বুদ্ধের পূর্বজন্মের গল্পে এই কাহিনির শিক্ষা: বেশি বলা নয়, সময়মতো চুপ থাকাই প্রজ্ঞা।', '৪–৯ বছর'))
ITEMS.append(commons('jataka-turtle-2', 'File:Contes de Jataka, La tortue bavarde - 2.jpg', 'Public domain',
    'অজ্ঞাত চিত্রী (ফরাসি শিশু-বই)', 'jataka', 'comic',
    '‘বাচাল কচ্ছপ’ — দ্বিতীয় পাতা',
    'একই বইয়ের পরের পাতা — ছায়াচিত্র-শৈলীর অলংকরণে গল্পের পরিণতি। শ্রেণিকক্ষে দুটি পাতা একসঙ্গে দেখিয়ে শিশুদের দিয়ে গল্প বলানোর অনুশীলন করা যায়।', '৪–৯ বছর'))

# ---------------------------------------------------------------- জাতক: ভাস্কর্য ও চিত্রকলা
JATAKA_ART = [
 ('bharhut-dasaratha', 'File:Bharhut Dasaratha Jataka.jpg', 'Public domain', 'আলেকজান্ডার কানিংহাম (১৮৭৯ ছবি)', 'jataka',
  'দশরথ জাতক — ভারহুত স্তূপের খোদাই',
  'ভারহুত স্তূপের (আনু. খ্রিস্টপূর্ব ২য় শতক) রেলিং-খোদাইয়ে দশরথ জাতক — রামায়ণ-কাহিনির বৌদ্ধ রূপ, যেখানে রামকে নির্বাসনে পাঠানোর প্রসঙ্গ নেই, বরং বুদ্ধের পূর্বজন্মের దান-ত্যাগের কথা।'),
 ('bharhut-kurunga', 'File:Bharhut Kurunga Miga Jataka.jpg', 'Public domain', 'আলেকজান্ডার কানিংহাম (১৮৭৯ ছবি)', 'jataka',
  'কুরঙ্গমিগ জাতক — হরিণের বন্ধুত্ব',
  'কুরঙ্গমিগ জাতক: মৃগ-রাজ বন্দিদশা থেকে বন্ধুদের সাহায্যে মুক্তি পান — ভারহুতের খোদাই। শিশুদের জন্য সহজ নীতিকথা: বন্ধুত্ব ও বিশ্বাসই বড় শক্তি।'),
 ('bharhut-yavamajhakiya', 'File:Bharhut Yavamajhakiya Jataka.jpg', 'Public domain', 'আলেকজান্ডার কানিংহাম (১৮৭৯ ছবি)', 'jataka',
  'যবমজ্ঝক জাতক — ভাগাভাগির ন্যায়',
  'যবমজ্ঝক জাতকে দুই ভাইয়ের মধ্যে শস্য ভাগ করার সময় ন্যায়বিচারের পরীক্ষা — অর্ধেক ভাগ নিয়ে কে সন্তুষ্ট, সেই প্রশ্নে গল্প এগোয়।'),
 ('bharhut-mugapakkha', 'File:Muga Pakha Jataka Bharhut.jpg', 'CC BY 3.0', 'Biswarup Ganguly', 'jataka',
  'মূগপক্খ জাতক — দানশীলতার ফল',
  'মূগপক্খ জাতকের দৃশ্য — রাজকুমারের দান ও ত্যাগের কাহিনি। ছবিটি ভারহুত স্তূপ থেকে, এখন এলাহাবাদ জাদুঘরে।'),
 ('bharhut-vessantara', 'File:Rail post depicting the Vessantara Jataka, Bharhut Stupa, circa 2nd century BCE, Allahabad Museum, Uttar Pradesh.jpg', 'CC BY-SA 4.0', 'StonesThatRemember', 'jataka',
  'বেসন্তর জাতক — সবচেয়ে বিখ্যাত দান-কাহিনি',
  'বেসন্তর জাতক: রাজপুত্র বেসন্তর তাঁর সবকিছু — এমনকি হাতি ও সন্তান — দান করে দেন। থাইল্যান্ড, শ্রীলঙ্কা ও মিয়ানমারে এই জাতক সবচেয়ে জনপ্রিয়; শিশুদের জন্য গল্পের রূপে এটি ‘যা ভালোবাসি তা ছাড়তে শেখা’র পাঠ।'),
 ('jataka-stories-panel', 'File:Jataka Stories.jpg', 'CC BY-SA 4.0', 'আলোকচিত্রী (কমন্স)', 'jataka',
  'জাতক-কাহিনির প্যানেল — স্তূপ-বেষ্টনী',
  'স্তূপের বেষ্টনীতে জাতক-দৃশ্যের সারি — প্রাচীন ভারতে গল্প বলার পদ্ধতি ছিল ছবি: পথচারী ছবি দেখে কাহিনি বুঝত। আজকের কমিক्सের পূর্বসূরি এই প্যানেলগুলোই।'),
 ('jataka-story-fresco', 'File:028 A Jataka Story.jpg', 'CC BY-SA 4.0', 'আলোকচিত্রী (Anandajoti ভিক্ষু সংগ্রহ)', 'jataka',
  'জাতক কাহিনির দেয়ালচিত্র',
  'দেয়ালে আঁকা জাতক-দৃশ্য — ভিক্ষুরা প্রায়ই এই ছবি দিয়ে শিশুদের গল্প শোনান। রং ও অঙ্গভঙ্গিতেই এখানে গল্পের মূল বাঁকগুলো ধরা আছে।'),
 ('jataka-panels-nagarjuna', 'File:Jataka tales panels, Dhamma Nagajjuna, Nagarjuna Sagar Telangana, India - 3.jpg', 'CC0', 'আলোকচিত্রী (কমন্স, CC0)', 'jataka',
  'নাগার্জুন সাগরে জাতক-প্যানেল (আধুনিক নির্মাণ)',
  'নাগার্জুন সাগরের বৌদ্ধ স্মারক-স্থলে জাতক-প্যানেল — প্রাচীন শিল্পরীতির অনুকরণে আধুনিক নির্মাণ। ছবিটি CC0, তাই স্কুল-প্রকল্পে নির্দ্বিধায় ব্যবহার করা যায়।'),
 ('jataka-thangka-bhutan', 'File:Painted jataka Thangka Phajoding Gonpa Thimphu, Bhutan.jpg', 'Public domain', 'অজ্ঞাত चित्रकार (ভুটান)', 'jataka',
  'জাতক-থাংকা — ভুটানের ফাজোদিং মঠ',
  'ভুটানের ফাজোদিং গনপার জাতক-থাংকা — তুলিতে আঁকা গল্পের বৃত্ত। থাংকা দেখার নিয়মও শেখার বিষয়: বাঁ থেকে ডানে, বৃত্তে বৃত্তে গল্প এগোয়।'),
 ('ajanta-chaddanta', 'File:Ajanta chaddanta Jataka.jpg', 'CC BY-SA 4.0', 'আলোকচিত্রী (কমন্স)', 'jataka',
  'ছদ্দন্ত জাতক — অজন্তা গুহার চিত্রকলা',
  'অজন্তা গুহার ছদ্দন্ত জাতক: হস্তীরাজ নিজের দাঁত দান করেন — ত্যাগের চরম রূপ। গুহার অন্ধকারে যে রং আজও উজ্জ্বল, তা পাঁচ শতকের শিল্পের বিস্ময়।'),
 ('ajanta-hamsa', 'File:Hamsa jâtaka, Ajanta, India.jpg', 'Public domain', 'অজ্ঞাত (অজন্তা, ৫ম শতক)', 'jataka',
  'হংস জাতক — অজন্তার দেয়ালচিত্র',
  'হংস জাতক — পাখির রাজা ও তাঁর অনুগামীদের কাহিনি, অজন্তার দেয়ালে। প্রাচীন শিল্পীরা গল্পের সবচেয়ে নাটকীয় মুহূর্তটিই বেছে নিতেন — এখানে সেটাই দেখা যায়।'),
 ('burmese-life-of-buddha', 'File:Bodleian MS. Burm. a. 12 Life of the Buddha 13-14.jpg', 'CC BY 4.0', 'Bodleian Libraries (বার্মিজ পাণ্ডুলিপি)', 'buddha-life',
  'বুদ্ধের জীবন — বার্মিজ হাতে-আঁকা পাণ্ডুলিপি',
  'অক্সফোর্ডের বোডলিয়ান গ্রন্থাগারের বার্মিজ পাণ্ডুলিপি থেকে বুদ্ধের জীবনের দৃশ্য — সোনালি রঙে আঁকা। শিশুদের জন্য পাণ্ডুলিপি-শিল্প দেখানোর সবচেয়ে সহজ প্রবেশপথ।'),
]
for slug, title, lic, artist, topic, tBn, dBn in JATAKA_ART:
    ITEMS.append(commons(slug, title, lic, artist, topic, 'art', tBn,
        dBn + ' — ছবিটি ডাউনলোড করে শ্রেণিকক্ষে ব্যবহার করা যায় (লাইসেন্স-শর্ত মানুন)।', '৫–১৪ বছর'))

# ---------------------------------------------------------------- অঙ্গুলিমাল
ITEMS.append(commons('angulimala-015', 'File:015 Angulimala (9140566999).jpg', 'CC BY 2.0', 'Photo Dharma',
    'angulimala', 'art', 'অঙ্গুলিমালের মূর্তি — থেরবাদী মঠ',
    'অঙ্গুলিমালের মূর্তি — যে ডাকাত নারী-হত্যা ও আঙুলের মালা থেকে বুদ্ধের সাক্ষাতে থেমে গিয়েছিলেন, পরে অর্হৎ হয়েছিলেন। শিশুদের জন্য গল্পের কেন্দ্র: কেউ চিরকাল খারাপ থাকে না; বদলানো সম্ভব।', '৯–১৬ বছর'))
ITEMS.append(commons('angulimala-defeat', 'File:073 The Defeat of Angulimala (9022049172).jpg', 'CC BY 2.0', 'Photo Dharma',
    'angulimala', 'art', 'অঙ্গুলিমালের পরাজয় — দেয়ালচিত্র',
    '‘The Defeat of Angulimala’ — বুদ্ধের শান্ত ভঙ্গিতে অঙ্গুলিমালের অহংকার ভেঙে যাওয়ার দৃশ্য। থাই-লাও মঠে এই দৃশ্য খুব প্রচলিত: প্রতিমার ভাষায় বলা হয়, অস্ত্র নয় — নীরবতাই জিতেছে।', '৯–১৬ বছর'))
ITEMS.append(commons('angulimala-painting', 'File:Angulimala and The Buddha.jpg', 'CC BY-SA 4.0', 'Rick Joseph',
    'angulimala', 'art', 'অঙ্গুলিমাল ও বুদ্ধ — আধুনিক চিত্রকলা',
    'আধুনিক চিত্রীর তুলিতে অঙ্গুলিমাল ও বুদ্ধের সাক্ষাৎ — ভয় ও করুণার মুখোমুখি দাঁড়ানো। কম-রং, বেশি ভাব: গল্পের নাটকীয় মুহূর্তটি কেবল দুই চরিত্রেই ধরা দিয়েছে।', '৯–১৬ বছর'))
ITEMS.append(commons('angulimala-russian', 'File:Будда и Ангулимала.jpg', 'CC BY 4.0', 'অজ্ঞাত ชিত্রী (কমন্স)',
    'angulimala', 'art', 'বুদ্ধ ও অঙ্গুলিমাল — রুশ-শিরোনামের চিত্রকলা',
    '‘Будда и Ангулимала’ — রুশ শিরোনামে হলেও দৃশ্যটি সর্বজনীন: রক্তমাখা হাত থেকে ভিক্ষার পাত্রের দিকে এগোনো। নীতিকথা — হিংসা থামে অহিংসায়।', '৯–১৬ বছর'))

# ---------------------------------------------------------------- সুজাতা
ITEMS.append(commons('sujata-and-buddha', 'File:Sujata and the Buddha.jpg', 'CC BY 2.0', 'Indi Samarajiva',
    'sujata', 'art', 'সুজাতা ও বুদ্ধ — মঠের চিত্রকলা',
    'সুজাতার মধুপায়স-দানের দৃশ্য — বোধিলাভের ঠিক আগে গৌতমকে খাইয়ে যে নারী তাঁর দুর্বল শরীর ফিরিয়ে দেন। শিশুদের গল্পে সুজাতা স্মরণ করিয়ে দেন: দান কেবল খাবার নয়, সাহস।', '৫–১২ বছর'))
ITEMS.append(commons('sujata-borobudur', 'File:Sujata offering Madhupayas rice to the Gautama Buddha (Borobudur) - Bangkok National Museum 01.jpg', 'CC BY 4.0', 'বোরোবুদুর সংগ্রহ / ব্যাংকক জাদুঘর',
    'sujata', 'art', 'সুজাতার দান — বোরোবুদুরের ত্রিমাত্রিক প্যানেল',
    'বোরোবুদুরের পাথরের প্যানেল থেকে উদ্ধার করা দৃশ্য, এখন ব্যাংকক জাতীয় জাদুঘরে — সুজাতা মধুপায়স নিবেদন করছেন। ইন্দোনেশিয়ার এই স্তূপে বুদ্ধের জীবনকথা ১৩০০+ প্যানেলে খোদাই করা।', '৭–১৪ বছর'))
ITEMS.append(commons('sujata-cave11', 'File:092 Cave 11, Buddha with Sujata from Side (33438497684).jpg', 'CC BY 2.0', 'Photo Dharma',
    'sujata', 'art', 'সুজাতার সঙ্গে বুদ্ধ — গুহা ১১-এর মূর্তি',
    'গুহা ১১-এর মূর্তিতে বুদ্ধের পাশে সুজাতা — ভিক্ষার পাত্র হাতে। প্রাচীন ভাস্কর্যেও নারী-চরিত্রটি গল্পের কেন্দ্রে রাখা হয়েছে, এটাই উল্লেখযোগ্য।', '৭–১৪ বছর'))

# ---------------------------------------------------------------- বুদ্ধের জীবন
ITEMS.append(commons('maya-birth', 'File:Lalitavistara - 047 S-28, Queen Maya gives Birth (8599312226).jpg', 'CC BY 2.0', 'Photo Dharma',
    'buddha-life', 'art', 'লুম্বিনীতে জন্ম — ললিতবিস্তার প্যানেল',
    'রানি মায়া লুম্বিনি-উদ্যানে দাঁড়িয়ে সিদ্ধার্থকে জন্ম দিচ্ছেন — বোরোবুদুরের ললিতবিস্তার প্যানেল। জন্মের পর সাত পা হেঁটে পদ্ম ফুটে ওঠার বর্ণনা শিশুদের সবচেয়ে পছন্দের অংশ।', '৫–১২ বছর'))
ITEMS.append(commons('mara-yuddhaya-1956', 'File:Mara Yuddhaya (1956).png', 'Public domain', 'Eksath Bhikkhu Peramuna (১৯৫৬)',
    'buddha-life', 'film', '‘মার যুদ্ধ’ (Mara Yuddhaya) — ১৯৫৬-র শ্রীলঙ্কার ছবি',
    '১৯৫৬ সালের সিংহলি চলচ্চিত্র ‘মার যুদ্ধ’ — বুদ্ধের বোধিলাভের আগে মারার (কাম-ক্রোধের প্রতীক) সঙ্গে সংগ্রামের কাহিনি নিয়ে এশিয়ার প্রথমদিকের বৌদ্ধ-ধর্মীয় চলচ্চিত্রগুলোর একটি। ছবিটি পাবলিক ডোমেইন; পোস্টার/স্টিল এখানে সংরক্ষিত।', '১০+ বছর'))

# ---------------------------------------------------------------- গুটেনবার্গ বই
GUT = [
 (62514, 'জাতক টেলস (Jataka Tales) — এলেন ব্যাবিট', 'বাবিটের সহজ ইংরেজি গদ্যে ১৮টি জাতক গল্প — শিশুদের জন্য সবচেয়ে জনপ্রিয় প্রবেশদ্বার। প্রতিটি গল্পে নীতিকথা ও মজার পশু-চরিত্র।', '৫–১১ বছর', ['jataka']),
 (7518, 'More Jataka Tales — আরও জাতক', 'প্রথম বইয়ের পরের খণ্ড — আরও ২০টি গল্প, একই সহজ ভাষায়। শ্রেণিকক্ষে ধারাবাহিক পাঠের জন্য আদর্শ।', '৫–১১ বছর', ['jataka']),
 (51880, 'Buddhist Birth Stories (Jataka) — ১ম খণ্ড', 'জাতকের মূল পালি কাহিনিগুলোর ইংরেজি অনুবাদ (রিস ডেভিডস / কাওয়েল) — বড়দের জন্য, শিক্ষকদের পাঠ-প্রস্তুতিতে সহায়ক।', 'শিক্ষক ও বড়রা', ['jataka']),
 (35895, 'The Gospel of Buddha — পল কারুস', 'বুদ্ধের জীবন ও শিক্ষা গল্পের আকারে সাজানো ধ্রুপদী সংকলন — ১৮৯৪। ইংরেজি ভাষায় বৌদ্ধধর্মের পরিচয় দেওয়ার সবচেয়ে পুরনো জনপ্রিয় বইগুলোর একটি।', '১২+ বছর', ['buddha-life']),
 (69787, 'The Splendour of Asia — বুদ্ধের জীবনকথা', 'বুদ্ধের জীবন নিয়ে গল্প-ধাঁচের জীবনী, শিশু-কিশোরদের উপযোগী গদ্যে।', '১১–১৬ বছর', ['buddha-life']),
 (18194, 'The Life of Buddha and Its Lessons — অলকট', 'হেনরি স্টিল অলকটের সংক্ষিপ্ত জীবনী ও শিক্ষা — বৌদ্ধধর্মের প্রথম আধুনিক পরিচিতিগুলোর একটি।', '১২+ বছর', ['buddha-life']),
 (30216, 'The Buddhist Catechism — প্রশ্নোত্তরে বৌদ্ধধর্ম', 'প্রশ্ন-উত্তরের সহজ ভাষায় বৌদ্ধধর্মের মূল কথা — শিশুদের জন্য প্রশ্ন করতে শেখানোর বই।', '১০–১৬ বছর', ['general']),
 (22782, 'The Buddha: A Drama in Five Acts — নাটক', 'পল কারুসের পাঁচ অঙ্কের নাটক — স্কুল-মঞ্চে অভিনয়ের জন্য ব্যবহারযোগ্য।', '১২+ বছর', ['buddha-life']),
 (2017, 'ধম্মপদ (Dhammapada) — ইংরেজি অনুবাদ', 'বৌদ্ধধর্মের সবচেয়ে জনপ্রিয় শ্লোক-সংকলন — ৪২৩টি গাথা। শিশুদের জন্য বাছাই করা ১০টি শ্লোক দিয়ে শুরু করা যায়।', '১০+ বছর', ['general']),
 (35185, 'The Buddha’s Path of Virtue — ধম্মপদ', 'ধম্মপদের অপর ইংরেজি অনুবাদ — শ্লোক ও ব্যাখ্যা পাশাপাশি।', '১২+ বছর', ['general']),
 (23585, '佛說四十二章經 — Sutra of Forty-Two Sections (চিনা)', 'চিনা ভাষায় বৌদ্ধধর্মের প্রাচীনতম সংক্ষিপ্ত সূত্র-সংকলন — ৪২টি অংশে মূল শিক্ষা। চিনা ভাষা-শিক্ষার্থীদের জন্য উপযোগী।', '১৪+ বছর', ['general']),
 (67358, 'The Thousand Buddhas — হাজার বুদ্ধের চিত্রকলা', 'স্টেইনের সংগৃহীত তুনহুয়াং-এর বৌদ্ধ দেয়ালচিত্রের অ্যালবাম — শিশুদের ছবি দেখানোর জন্য চমৎকার, মূল্যবান শিল্প-সংগ্রহ।', '১০+ বছর', ['buddha-life']),
 (34578, 'The Life or Legend of Gaudama (বর্মি বুদ্ধ-জীবনী)', 'বর্মি ঐতিহ্যে বুদ্ধের জীবনকথা — ইংরেজি অনুবাদ। মিয়ানমারের রীতি ও গল্প বলার ধরন জানা যায়।', '১৪+ বছর', ['buddha-life']),
 (2124, 'A Record of Buddhistic Kingdoms — ফাহিয়েনের ভ্রমণ', 'চিনা পর্যটক ফাহিয়েনের (৫ম শতক) ভারত-শ্রীলঙ্কা ভ্রমণকথা — প্রাচীন বৌদ্ধ স্থানগুলোর চোখে-দেখা বিবরণ।', '১৪+ বছর', ['general']),
]
LANGMAP = {62514: 'en', 7518: 'en', 51880: 'en', 35895: 'en', 69787: 'en', 18194: 'en', 30216: 'en',
           22782: 'en', 2017: 'en', 35185: 'en', 23585: 'zh', 67358: 'en', 34578: 'en', 2124: 'en'}
for bid, tBn, dBn, age, topics in GUT:
    ITEMS.append(dict(
        id=f'kid-gut-{bid}', type='book', lang=LANGMAP[bid], ageBn=age, topics=topics,
        titleBn=tBn, titleEn=f'Project Gutenberg #{bid}',
        descBn=dBn,
        thumb=f'assets/kids/thumbs/kid-gut-{bid}.jpg',
        licenceLabel=LIC['Gutenberg'][0], licenceUrl=LIC['Gutenberg'][1], licenceKey='Gutenberg',
        creatorBn='Project Gutenberg (পাবলিক ডোমেইন)',
        creditBn='Project Gutenberg — ফ্রি পড়া, ডাউনলোড ও পুনঃপ্রকাশ করা যায় (মার্কিন যুক্তরাষ্ট্রে পাবলিক ডোমেইন)।',
        sourceName='Project Gutenberg',
        sourceUrl=f'https://www.gutenberg.org/ebooks/{bid}',
        readUrl=f'https://www.gutenberg.org/ebooks/{bid}.html.images',
        downloadUrl=f'https://www.gutenberg.org/ebooks/{bid}.epub.images',
        downloadUrlAlt=f'https://www.gutenberg.org/ebooks/{bid}.pdf',
    ))

# ---------------------------------------------------------------- ইন্টারনেট আর্কাইভ
ITEMS.append(dict(
    id='kid-ia-hindi-jataka-4', type='book', lang='hi', ageBn='শিক্ষক ও বড়রা',
    topics=['jataka'],
    titleBn='জাতক — হিন্দি অনুবাদ, ৪র্থ খণ্ড (ভদন্ত আনন্দ কৌশল্যায়ন)',
    titleEn='Jataka Vol 4 — Bhadant Anand Kausalyayan (Hindi)',
    descBn='হিন্দি ভাষায় জাতকের বড় সংকলনের ৪র্থ খণ্ড — ভদন্ত আনন্দ কৌশল্যায়ন (১৯০৫–১৯৮৮) অনূদিত। হিন্দিভাষী শিশু-শিক্ষকদের জন্য মূল্যবান; ফাইলটি ইন্টারনেট আর্কাইভে আছে, এখানে কেবল লিংক রাখা হলো (আপলোডকারী CC0 দাবি করেছেন, কিন্তু অনুবাদকের অধিকার নিয়ে সংশয় থাকায় ফাইল কপি করা হয়নি)।',
    thumb='assets/kids/thumbs/kid-ia-jatakavol4bhadantanandka.jpg',
    licenceLabel=LIC['IA-user-claim'][0], licenceUrl=LIC['IA-user-claim'][1], licenceKey='IA-user-claim',
    creatorBn='ভদন্ত আনন্দ কৌশল্যায়ন (অনুবাদ)',
    creditBn='Internet Archive আপলোড · আপলোডকারীর দাবি CC0 — লাইসেন্স নিশ্চিত নয়, তাই কেবল লিংক।',
    sourceName='Internet Archive',
    sourceUrl='https://archive.org/details/jatakavol4bhadantanandkausalyayan_91_b',
    readUrl='https://archive.org/details/jatakavol4bhadantanandkausalyayan_91_b',
    downloadUrl='https://archive.org/download/jatakavol4bhadantanandkausalyayan_91_b',
    noteBn='লাইসেন্স সংশয় — প্রকাশের আগে যাচাই করুন।',
))


# ---------------------------------------------------------------- অমর চিত্র কথা (কপিরাইট — শুধু লিংক)
ACK = [
 ('kid-ack-buddha', 'বুদ্ধ — অমর চিত্র কথা (ACK #২২)',
  'ACK-র বুদ্ধ সংখ্যা — সিদ্ধার্থের জন্ম থেকে বোধিলাভ ও প্রথম উপদেশ পর্যন্ত পূর্ণ কমিক-জীবনী; লেখক এস. কে. রামচন্দ্র রাও। বৌদ্ধধর্ম নিয়ে ACK-র সবচেয়ে পরিচিত সংখ্যা, শিশুদের জন্য সহজ প্যানেল-গল্পে।',
  '৬–১৪ বছর', 'https://shop.amarchitrakatha.com/products/buddha', None, '₹৯৯'),
 ('kid-ack-buddhist-stories', 'বৌদ্ধ কথা সংকলন — Buddha · Amrapali · Angulimala',
  'তিনটি বৌদ্ধ কমিক একসঙ্গে: বুদ্ধ, আম্রপালি ও অঙ্গুলিমাল। অঙ্গুলিমালের গল্প এখানে ডাকাত থেকে অর্হৎ হওয়ার পথ — শিশুদের জন্য সহজ ভাষায়।',
  '৮–১৬ বছর', 'https://shop.amarchitrakatha.com/products/buddhist-stories', None, '₹৪৪৯'),
 ('kid-ack-stories-jataka', 'জাতকের গল্প — Stories From The Jatakas (৫টি কমিক)',
  'পাঁচটি জাতক-কমিক এক মলাটে: Deer Stories, Monkey Stories, Bird Stories, The Mouse Merchant ও The Magic Chant। জাতকের পশু-কাহিনি দিয়ে শিশুদের নীতিশিক্ষার সবচেয়ে জনপ্রিয় ACK সংকলন।',
  '৬–১২ বছর', 'https://shop.amarchitrakatha.com/products/stories-from-the-jatakas', None, '₹৪৯৯'),
 ('kid-ack-more-jataka', 'আরও জাতক — More Stories From The Jatakas',
  'প্রথম সংকলনের পরের খণ্ড — আরও পাঁচটি জাতক-কাহিনি; একই সহজ প্যানেল-শৈলী।',
  '৬–১২ বছর', 'https://shop.amarchitrakatha.com/products/more-stories-from-the-jatakas', None, '₹৪৯৯'),
 ('kid-ack-collection', 'জাতক · পঞ্চতন্ত্র · হিতোপদেশ — বিশাল সংগ্রহ',
  'জাতক, পঞ্চতন্ত্র ও হিতোপদেশের কমিক একসঙ্গে — বৌদ্ধ ও ভারতীয় নীতিকথার সবচেয়ে বড় ACK বক্স সেট। লাইব্রেরি বা স্কুলের জন্য উপযোগী।',
  '৭–১৬ বছর', 'https://shop.amarchitrakatha.com/products/jatakapanchatantrahitopadesha-collection', None, '₹২,২৯৯'),
 ('kid-ack-angulimala-free', 'অঙ্গুলিমাল — ACK ডিজিটালে ফ্রি পড়া',
  'অঙ্গুলিমালের পূর্ণ কমিক ACK-র নিজস্ব ডিজিটাল লাইব্রেরিতে “ফ্রি রিড” হিসেবে রাখা আছে — সাইন-আপ করে ব্রাউজারেই পড়া যায়, কোনো টাকা লাগে না। বাংলা ও হিন্দি সংস্করণও ACK-র ডিজিটাল তালিকায় আছে।',
  '৮–১৬ বছর', None, 'https://digital.amarchitrakatha.com/', 'ফ্রি'),
 ('kid-ack-digital-all','ACK ডিজিটাল লাইব্রেরি — বাংলা · হিন্দি · ইংরেজি',
  'অমর চিত্র কথার নিজস্ব ডিজিটাল লাইব্রেরি: বৌদ্ধ ও জাতক-সংখ্যাগুলো এখানে বাংলা, হিন্দি, ইংরেজি, মালায়ালাম, কন্নড় প্রভৃতি ভাষায় আছে; কিছু সংখ্যা “ফ্রি রিড”, বাকিগুলো সাবস্ক্রিপশনে। ব্রাউজার বা ACK অ্যাপে পড়া যায়।',
  '৬–১৬ বছর', None, 'https://digital.amarchitrakatha.com/', 'ফ্রি + সাবস্ক্রিপশন'),
 ('kid-ack-ia-search','আর্কাইভে ACK-র বৌদ্ধ-কমিক খুঁজুন (Internet Archive)',
  'ইন্টারনেট আর্কাইভ ও অন্যান্য পাবলিক লাইব্রেরিতে ACK-র পুরোনো সংখ্যার স্ক্যান আপলোড করা আছে — বাংলা, ইংরেজি, হিন্দি। এগুলো আপলোডকারীর নিজের আপলোড, তাই লাইসেন্স নিশ্চিত নয়; এখানে ফাইল কপি করা হয়নি — সার্চ-পাতা থেকে নিজে দেখে নিন।',
  'শিক্ষক ও অভিভাবক', None, 'https://archive.org/search?query=amar+chitra+katha', 'সার্চ'),
 ('kid-ack-buddhist-collection', 'বুদ্ধিস্ট কালেকশন — Timeless 10 (২০২৫, ১০টি কমিক)',
  '২০২৫-এ প্রকাশিত বৌদ্ধ-সংকলন: বুদ্ধ, অঙ্গুলিমাল, আম্রপালি, নাগানন্দ, কিং কুশা, দ্য কাউহার্ড অব আলাউই, দ্য ফিয়ারলেস বয়, নন্দিবিশালা প্রভৃতি দশটি সংখ্যা এক মলাটে।',
  '৯–১৬ বছর', 'https://shop.amarchitrakatha.com/search?q=buddhist', None, 'নতুন'),
]
for slug, tBn, dBn, age, buy, read_, price in ACK:
    ITEMS.append(dict(
        id=slug, type='ack', lang='en', ageBn=age, topics=['jataka'] if 'jataka' in slug else (['angulimala'] if 'angulimala' in slug else ['buddha-life']),
        titleBn=tBn, titleEn=tBn.split(' — ')[-1],
        descBn=dBn,
        thumb=f'assets/kids/thumbs/{slug}.jpg',
        priceBn=price if price != 'নতুন' else None,
        licenceLabel=LIC['copyright'][0], licenceUrl=LIC['copyright'][1], licenceKey='copyright',
        creatorBn='অমর চিত্র কথা (ACK) · কপিরাইটযুক্ত',
        creditBn='অমর চিত্র কথা — কপিরাইটযুক্ত; কভার আমাদের আঁকা নয়, মূল কমিক অফিশিয়াল সাইটে দেখুন/কিনুন।',
        sourceName='Amar Chitra Katha', sourceUrl=buy or read_,
        buyUrl=buy, readUrl=read_,
        noteBn='ফাইল এখানে রাখা নেই (কপিরাইট) — অফিশিয়াল সাইট থেকে কিনুন বা ফ্রি-রিড পড়ুন।',
    ))

# ---------------------------------------------------------------- অডিও গল্প (ফরাসি)
audio_man = json.loads(Path('/home/user/discovery/kids/audio_manifest.json').read_text(encoding='utf-8'))
NAME_BN = {
 'Comment Tortue sauva sa vie': ('কীভাবে কচ্ছপ নিজের প্রাণ বাঁচাল', 'কচ্ছপের বুদ্ধিতে প্রাণ রক্ষা — ধৈর্য ও উপস্থিত-বুদ্ধির গল্প।'),
 'Elephant blanc du roi': ('রাজার শ্বেত হস্তী', 'শ্বেত হস্তী দান করে দেওয়ার কাহিনি — দানের পরও করুণা কীভাবে থাকে।'),
 "Face d'Ange": ('দেবদূতের মুখ', '‘দেবদূতের মুখ’ — রূপ নয়, মনের সৌন্দর্যের গল্প।'),
 'Fort comme un boeuf': ('বলদ যত শক্ত', 'শক্তি নয়, বিচার-বুদ্ধিই যে বড় — সেই পাঠ।'),
 'La reine des oiseaux': ('পাখিদের রানি', 'পাখিদের রানি ও তাঁর প্রজাদের কাহিনি — নেতৃত্ব ও দায়িত্ব।'),
 'La traversée du désert': ('মরুভূমি পার', 'দলবদ্ধভাবে মরুভূমি পার হওয়ার গল্প — সংগঠন ও বিশ্বাস।'),
 'Le Blackie de Mamie': ('মামির কালো পশু', 'মামির কালো পশুর গল্প — ছোটদের সবচেয়ে প্রিয় রূপকথা-ধাঁচের জাতক।'),
 'Le Cerf Banyan': ('বটবৃক্ষের হরিণ', 'বন্য হরিণ ও বটগাছের বন্ধুত্ব — প্রকৃতির প্রতি মমতা।'),
 'Le boeuf jaloux du cochon': ('শূকরের প্রতি ঈর্ষান্বিত বলদ', 'ঈর্ষা কীভাবে ক্ষতি করে — শিশুদের জন্য সহজ নীতিকথা।'),
 'Le crabe et la grue': ('কাঁকড়া ও বক', 'ধূর্ত বক ও চতুর কাঁকড়া — বিশ্বাস ও প্রতারণার গল্প।'),
 'Le lapin timide et pas malin': ('ভীতু ও বোকা খরগোশ', 'ভয় কাটিয়ে বুদ্ধি খাটানোর গল্প।'),
 'Le singe et le crocodile': ('বানর ও কুমির', 'জাতকের সবচেয়ে বিখ্যাত গল্পগুলোর একটি — বন্ধুত্ব ও ধূর্ততা।'),
 'Les deux marchands': ('দুই বণিক', 'দুই বণিকের ভিন্ন পথ — পরিশ্রম ও সততার ফল।'),
 'Les princes et le farfadet': ('রাজপুত্ররা ও ডানাওয়ালা প্রাণী', 'রাজপুত্রদের পরীক্ষা — কার সাহস ও দয়া বেশি।'),
 'Querelle de cailles': ('কোয়েল পাখিদের ঝগড়া', 'ঝগড়া যেভাবে দলকে ধ্বংস করে — একতা ও সহনশীলতা।'),
 'Tais-toi la Tortue': ('চুপ করো, কচ্ছপ!', 'কথা না শুনে বিপদে পড়ার গল্প — বাচাল কচ্ছপের কাহিনির অডিও রূপ।'),
}
for a in audio_man:
    raw = a['title'].replace('File:Jataka, ', '').rsplit('.ogg', 1)[0]
    tBn, dBn = NAME_BN.get(raw, (raw, 'জাতক গল্পের ফরাসি অডিও-পাঠ।'))
    dur = a['dur'] or 0
    mm, ss = divmod(dur, 60)
    ITEMS.append(dict(
        id='kid-' + a['slug'], type='audio', lang='fr', ageBn='৪–১০ বছর', topics=['jataka'],
        titleBn=f'{tBn} — ফরাসি অডিও গল্প',
        titleEn=raw,
        descBn=f'{dBn} এলেন ব্যাবিটের ১৯১২ সালের ইংরেজি সংকলন থেকে ফরাসি অনুবাদ, আলস৩৩১২০-এর বলা ও রেকর্ড করা গল্প। অডিওটি এই সাইটেই ৬৪ kbps MP3 হিসেবে রাখা — ইন্টারনেট ছাড়াও চলে।',
        thumb=None, audioUrl=a['file'], durationBn=f'{mm}:{ss:02d}',
        licenceLabel=LIC['CC BY-SA 4.0'][0], licenceUrl=LIC['CC BY-SA 4.0'][1], licenceKey='CC BY-SA 4.0',
        creatorBn='Als33120 (কণ্ঠ ও রেকর্ডিং)',
        creditBn='অডিও: Als33120 (Wikimedia Commons) — কাটা-ছাঁটা কপি একই লাইসেন্সে ছাড়তে হবে; নাম ও লাইসেন্স রাখুন।',
        sourceName='Wikimedia Commons', sourceUrl=a['page'],
        downloadUrl=a['page'], playUrl=a['file'],
    ))



# ---------------------------------------------------------------- বাংলা অডিও গল্প — কৃত্রিম কণ্ঠ (AI)
BN_AUDIO = [
 ('moon-rabbit','শশক জাতক — চাঁদের খরগোশ','00:58','kid-own-moon-rabbit.jpg',
  'খরগোশ, শিয়াল, বানর আর ওটার — চার বন্ধুর গল্প। ভিক্ষুককে দিতে কিছু না পেয়ে খরগোশ নিজেকে দান করে; ইন্দ্র তার ছবি চাঁদে এঁকে রাখেন।'),
 ('white-elephant','শ্বেত হস্তী জাতক','00:54','kid-own-white-elephant.jpg',
  'পথ হারানো মানুষকে সাহায্য করা সাদা হাতির গল্প — উপকার করার পর কৃতজ্ঞতা না পেলেও হাতি রাগ করে না।'),
 ('angulimala','বুদ্ধ ও অঙ্গুলিমাল','01:13','kid-own-angulimala.jpg',
  'অহিংসক থেকে অঙ্গুলিমাল, আর বুদ্ধের একটি কথায় তার থেমে যাওয়া — “আমি থেমেছি, তুমি এখনো থামোনি”।'),
 ('sujata','সুজাতার মধুপায়স','00:57','kid-own-sujata.jpg',
  'নীরঞ্জনা নদীর ধারে সুজাতার দেওয়া মধুপায়স — বোধিবৃক্ষের নিচে বুদ্ধ হওয়ার আগের রাতের গল্প।'),
 ('monkey-crocodile','বানর ও কুমির','00:59','kid-own-monkey-crocodile.jpg',
  'আমগাছের বানর আর নদীর কুমিরের গল্প — কুমিরের মিষ্টি কথার পিছনে লোভ, আর বানরের বুদ্ধিতে বাঁচা।'),
 ('banyan-deer','বটহরিণ জাতক — ন্যাগ্রোধমৃগ','00:58','kid-own-banyan-deer.jpg',
  'গর্ভবতী হরিণীকে বাঁচাতে নিজে ফাঁদে বসা সোনালি হরিণের রাজা; রাজার হাত থেমে যায়, বনে শিকার নিষিদ্ধ হয়।'),
]
# কণ্ঠের হিসাব আলাদা ফাইলে (ai | human) — install_bn_audio.py এটি হালনাগাদ করে
AUDIO_META_PATH = ROOT / 'data' / 'kids-audio-bn.json'
AUDIO_META = {}
if AUDIO_META_PATH.exists():
    _am = json.loads(AUDIO_META_PATH.read_text(encoding='utf-8'))
    if _am.get('schema') != 'charyabhumi-kids-audio-bn-v1':
        raise SystemExit('kids-audio-bn.json — schema মেলেনি')
    AUDIO_META = {a['slug']: a for a in _am.get('items', [])}

for slug, tBn, dur, thumb, desc in BN_AUDIO:
    meta = AUDIO_META.get(slug, {})
    voice = meta.get('voice', 'ai')
    dur = meta.get('durationBn', dur)
    narrator = (meta.get('narratorBn') or '').strip()
    if voice == 'human':
        voiceBn = 'মানুষের কণ্ঠ' + (f' — {narrator}' if narrator else '')
        descTail = f' — কণ্ঠ: {voiceBn}। লেখাটি এই সাইটের নিজস্ব পুনর্কথন, তাই নির্ভয়ে শ্রেণিকক্ষে শোনানো যায়; ইন্টারনেট ছাড়াও চলে।'
        creator = f'চর্যাভূমি — কণ্ঠ: {narrator}' if narrator else 'চর্যাভূমি — মানুষের কণ্ঠ'
        credit = f'লেখা: চর্যাভূমি · কণ্ঠ/রেকর্ডিং: {narrator or "নিজস্ব রেকর্ডিং"} · CC BY-SA 4.0 · নিজস্ব পুনর্কথন, কোনো বই বা অডিও থেকে কপি নয়।'
        note = 'মানুষের কণ্ঠে রেকর্ড করা — শ্রেণিকক্ষে শোনানোর জন্য; MP3 ডাউনলোড করেও রাখা যায়।'
    else:
        voiceBn = 'কৃত্রিম (AI) কণ্ঠ'
        descTail = ' — কণ্ঠটি কৃত্রিম (AI), মানুষের রেকর্ডিং নয়। লেখাটি এই সাইটের নিজস্ব পুনর্কথন, তাই নির্ভয়ে শ্রেণিকক্ষে শোনানো যায়; ইন্টারনেট ছাড়াও চলে।'
        creator = 'চর্যাভূমি — কৃত্রিম কণ্ঠ (AI)'
        credit = 'লেখা ও কণ্ঠ: চর্যাভূমি — কৃত্রিম (AI) কণ্ঠ, CC BY-SA 4.0 · নিজস্ব পুনর্কথন, কোনো বই বা অডিও থেকে কপি নয় · ব্যবহারে “কৃত্রিম কণ্ঠ” লেখাটি রাখুন।'
        note = 'কৃত্রিম কণ্ঠ (AI) — শ্রেণিকক্ষে শোনানোর জন্য; MP3 ডাউনলোড করেও রাখা যায়।'
    ITEMS.append(dict(
        id='kid-bn-audio-' + slug, type='audio', lang='bn', ageBn='৪–১০ বছর', topics=['jataka'],
        titleBn=tBn + ' — বাংলা অডিও গল্প',
        titleEn=tBn,
        descBn=desc + descTail,
        thumb=f'assets/kids/thumbs/{thumb}',
        audioUrl=f'assets/kids/audio/bn/kid-bn-{slug}.mp3',
        durationBn=dur,
        licenceLabel=LIC['CC BY-SA 4.0'][0], licenceUrl=LIC['CC BY-SA 4.0'][1], licenceKey='original',
        creatorBn=creator,
        creditBn=credit,
        sourceName='চর্যাভূমি · শিশু ও শিক্ষা বিভাগ',
        sourceUrl='sishu-shikkha.html',
        downloadUrl=f'assets/kids/audio/bn/kid-bn-{slug}.mp3',
        playUrl=f'assets/kids/audio/bn/kid-bn-{slug}.mp3',
        noteBn=note,
        voiceKind=voice,
    ))

# ---------------------------------------------------------------- অমর চিত্র কথা — বাংলা সংস্করণ (কেনার বৈধ লিংক)
ACK_BN = [
 ('kid-ack-bn-jataka-banorer', 'জাতক কাহিনি — বানরের গল্প গুচ্ছ (বাংলা)', 'jataka',
  'বাংলা ভাষায় জাতকের গল্পের কমিক — বানর-কেন্দ্রিক জাতকগুলোর ছবি-গল্প। বাংলায় জাতক কমিক পাওয়ার সবচেয়ে সহজ পথ।',
  '₹৫০ (বিক্রয় ₹৪৫)', 'https://bnetbazaar.com/product/jatok-kahini-banorer-golpo-guccho/'),
 ('kid-ack-bn-set-10', '১০টি বাংলা অমর চিত্র কথা কমিকের সেট', 'general',
  'বাংলা ভাষায় অমর চিত্র কথার ১০টি কমিকের সেট — শিশুদের জন্য ছবি-গল্পের সংগ্রহ, একসঙ্গে কিনলে সস্তা।',
  '₹৫৬০ (বিক্রয় ₹৫০৪)', 'https://bnetbazaar.com/product/7-bengali-ack-comics-books-in-1-set/'),
 ('kid-ack-bn-set-7', 'বাংলা অমর চিত্র কথা — ৭ খণ্ডের সেট', 'general',
  'বাংলা ভাষায় অমর চিত্র কথার ৭ খণ্ডের সেট — শ্রেণিকক্ষ বা বাড়ির Shelf-এ রাখার জন্য।',
  '₹৩৫–₹৫০৪ (খণ্ড অনুযায়ী)', 'https://bnetbazaar.com/product/7-volume-set-bengali-ack-comics/'),
]
for slug, tBn, topic, dBn, price, buy in ACK_BN:
    ITEMS.append(dict(
        id=slug, type='ack', lang='bn', ageBn='৬–১২ বছর', topics=[topic],
        titleBn=tBn, titleEn=tBn.split(' — ')[-1],
        descBn=dBn + ' — বইটি বাংলা অফিসিয়াল সংস্করণ; এখানে ফাইল রাখা নেই, শুধু বৈধ কেনার ঠিকানা।',
        thumb=f'assets/kids/thumbs/{slug}.jpg',
        priceBn=price,
        licenceLabel=LIC['copyright'][0], licenceUrl=LIC['copyright'][1], licenceKey='copyright',
        creatorBn='অমর চিত্র কথা (ACK) · কপিরাইটযুক্ত',
        creditBn='অমর চিত্র কথা — কপিরাইটযুক্ত বাংলা সংস্করণ; কভার আমাদের আঁকা নয়, বৈধ বিক্রেতার পাতায় দেখুন/কিনুন।',
        sourceName='Bnetbazaar (বাংলা বইয়ের দোকান)',
        sourceUrl=buy, buyUrl=buy,
        noteBn='ফাইল এখানে রাখা নেই (কপিরাইট) — বাংলা সংস্করণটি বৈধ দোকান থেকে কিনুন।',
    ))

# ---------------------------------------------------------------- উইকিমিডিয়া কমন্স থেকে নামানো মুক্ত ছবি (PD/CC)
ART_EXTRA_PATH = ROOT / 'data' / 'kids-art-extra.json'
art_extra_count = 0
if ART_EXTRA_PATH.exists():
    _art = json.loads(ART_EXTRA_PATH.read_text(encoding='utf-8'))
    if _art.get('schema') != 'charyabhumi-kids-art-extra-v1':
        raise SystemExit('kids-art-extra.json — schema মেলেনি')
    for a in _art.get('items', []):
        if not (ROOT / a['file']).exists():
            print('⚠ ছবি নেই:', a['file'])
            continue
        ITEMS.append(dict(
            id='kid-art-' + a['slug'], type='art', lang='en', ageBn='৬–১৪ বছর',
            topics=[a.get('topic') or 'jataka'],
            titleBn=a['titleBn'], titleEn=a.get('titleEn') or a['titleBn'],
            descBn=a['descBn'] + ' — ছবিটি এই সাইটে রাখা আছে (মুক্ত লাইসেন্স), তাই প্রিন্ট করে শ্রেণিকক্ষে ব্যবহার করা যায়।',
            thumb=a['file'],
            licenceLabel=LIC[a['licence']][0] if a['licence'] in LIC else a['licence'],
            licenceUrl=LIC[a['licence']][1] if a['licence'] in LIC else 'https://commons.wikimedia.org/wiki/Commons:Licensing',
            licenceKey=a['licence'] if a['licence'] in LIC else 'CC BY 4.0',
            creatorBn=a.get('artist') or 'অজ্ঞাত',
            creditBn=f"{a.get('artist') or 'অজ্ঞাত'} · Wikimedia Commons · {a['licence']} — পুনঃব্যবহারে নাম ও লাইসেন্সের উল্লেখ রাখুন।",
            sourceName='Wikimedia Commons',
            sourceUrl=a['commonsPage'],
            downloadUrl=a['file'],
            localFile=True,
            noteBn='মুক্ত লাইসেন্সে এই সাইটে রাখা — ডাউনলোড করে প্রিন্ট/প্রজেক্টরে ব্যবহার করা যায়।',
        ))
        art_extra_count += 1
    print('কমন্সের মুক্ত ছবি যোগ হলো:', art_extra_count)

# ---------------------------------------------------------------- অ্যানিমেশন (ইউটিউব এমবেড)
YTV = [
 ('kid-yt-bn-white-elephant','0BjH2lK7gEk','bn','জাতকের গল্প — সাদা হাতি','Inklife TV',
  'জাতকের সাদা হাতি কাহিনির বাংলা অ্যানিমেশন — শিশুদের জন্য সহজ ভাষায়, ছবি দেখে গল্প বোঝা যায়।'),
 ('kid-yt-bn-moon-rabbit','US9F-VSvpmo','bn','চাঁদের খরগোশ — জাতক','Animated Tales by Adii',
  'শশক জাতকের বাংলা অ্যানিমেশন — চাঁদে খরগোশের ছায়ার গল্প, দানের নীতিকথা নিয়ে।'),
 ('kid-yt-bn-balukapath','_vkH3kGwlCA','bn','বালুকাপথ জাতক','Dimmar Golper Jhuli',
  '‘বালুকাপথ’ জাতকের বাংলা পাঠ — ধৈর্য ও পরিশ্রমের কাহিনি, আঁকা ছবির সঙ্গে।'),
 ('kid-yt-bn-king-crow','1LgHjZsGGPw','bn','রাজা ও কাকের গল্প','ঠাকুরদার ঝুলি',
  'গৌতম বুদ্ধের জাতক-কাহিনি থেকে রাজা ও কাকের গল্প — বাংলা অ্যানিমেটেড নীতিকথা।'),
 ('kid-yt-bn-shankha','du1MHMwyYjg','bn','দানবীর শঙ্খ — জাতক','Shree Storyteller',
  '‘দানবীর শঙ্খ’ জাতকের বাংলা অ্যানিমেশন — দান ও ত্যাগের গল্প।'),
 ('kid-yt-en-legend-buddha','IULNt_vF3JI','en','Legend of Buddha — পূর্ণ অ্যানিমেটেড চলচ্চিত্র','Shemaroo Bhakti',
  'বুদ্ধের জীবন নিয়ে পূর্ণ-length ইংরেজি অ্যানিমেটেড চলচ্চিত্র — জন্ম থেকে মহাপরিনির্বাণ পর্যন্ত, শিশুদের জন্য আঁকা।'),
 ('kid-yt-en-short-stories','sU1Gv-MkH0U','en','বুদ্ধের ছোট গল্প — ইংরেজি সংকলন','Geethanjali Kids',
  'বুদ্ধের জীবনের ছোট ছোট গল্পের ইংরেজি অ্যানিমেশন-সংকলন — শ্রেণিকক্ষে এক বসায় দেখানো যায়।'),
 ('kid-yt-en-angulimala','1K63DNwOHsE','en','অঙ্গুলিমাল — খুনি থেকে ভিক্ষু','watsanfran',
  'অঙ্গুলিমালের কাহিনি ইংরেজি অ্যানিমেশনে — ভয় থেকে করুণায়, হিংসা থেকে অহিংসায় ফেরার গল্প।'),
 ('kid-yt-en-selfless-hare','kfEfNC1js5E','en','The Selfless Hare — নিঃস্বার্থ খরগোশ','TinyTaleStudio',
  'শশক জাতকের আধুনিক ইংরেজি অ্যানিমেশন — নিজেকে বিলিয়ে দেওয়ার নীতিকথা।'),
 ('kid-yt-en-story-buddha','N5jba2EuIIk','en','The Story of Buddha — সিদ্ধার্থের জীবন','See U in History',
  'সিদ্ধার্থ থেকে বুদ্ধ — পূর্ণ জীবনকথা ইংরেজি অ্যানিমেশনে, মানচিত্র ও ব্যাখ্যাসহ।'),
 ('kid-yt-hi-angulimala-daku','U0hu3DlVR2w','hi','डाकू अंगुलीमाल — গৌতম বুদ্ধের কাহিনি','ONE CUBE INFOTAINMENT',
  'হিন্দি ভাষায় অঙ্গুলিমালের কাহিনি — ডাকাত থেকে ভিক্ষু হওয়ার পথ, শিশুদের জন্য অ্যানিমেটেড।'),
 ('kid-yt-hi-jataka-five','HpEt7xRogug','hi','जातक कथा — ৫টি কাহিনি','Hindi Bal Kahaniyan',
  'হিন্দিতে পাঁচটি জাতক-কাহিনির সংকলন — একসঙ্গে দেখার জন্য।'),
 ('kid-yt-hi-oldest-animal','nqWjq1qfs80','hi','सबसे बूढ़ा जानवर — জাতক কथा','Educational Express',
  'জাতকের ‘সবচেয়ে বয়স্ক প্রাণী’ কাহিনি — সহজ হিন্দি ভাষায়।'),
 ('kid-yt-hi-buddha-angulimal','7loXBRXau_4','hi','महात्मा बुद्ध और अंगुलिमाल','Maha Cartoon TV XD',
  'বুদ্ধ ও অঙ্গুলিমালের সাক্ষাতের হিন্দি অ্যানিমেশন — শিশুদের প্রিয় কার্টুন-শৈলীতে।'),
 ('kid-yt-bn-nyagrodha','HSRv-qElIv0','bn','ন্যগ্রোধমৃগ জাতক — বুদ্ধের উপদেশ','Sukhchabi',
  'বটগাছের হরিণের কাহিনি — বুদ্ধের পূর্বজন্মের গল্প, বাংলা অ্যানিমেশনে নীতিকথাসহ।'),
 ('kid-yt-bn-seriba','kMgm7rnTXmc','bn','সেরিবা ও সেরিবান — জাতক','Sukhchabi',
  'সেরিবা-সেরিবান জাতকের বাংলা অ্যানিমেশন — কৃতজ্ঞতা ও শত্রুতা ভাঙার গল্প।'),
 ('kid-yt-bn-golden-goose','6PhceOp7ySA','bn','সোনার হাস — Golden Goose','ঠাকুরদার ঝুলি',
  'সোনালি রাজহাঁস জাতকের কাহিনি — লোভ কতটা ক্ষতি করে, শিশুদের জন্য সহজ বাংলায়।'),
 ('kid-yt-bn-batamrig','VWV774Dvkss','bn','বাতমৃগ জাতক','JS STORY',
  'বাতমৃগ (হরিণ) জাতকের গল্প — বুদ্ধের পূর্বজন্মের কাহিনি, ছবি ও বর্ণনায়।'),
 ('kid-yt-bn-matsyadan','QksDFESFxd0','bn','মৎস্যদান জাতক','GYANI MONK',
  'জাতকের গল্প সিরিজের প্রথম পর্ব — মৎস্যদানের কাহিনি, বাংলায়।'),
 ('kid-yt-bn-hachi','ceXjZ9RubG0','bn','হাঁচি — জাতকের গল্প','Paramita Bhattacharya',
  '‘হাঁচি’ নামের ছোট জাতক-কাহিনি — গল্প বলা ও ছবি মিলিয়ে বাংলা পাঠ।'),
 ('kid-yt-ack-demon','yEiqsf6KScM','en','The Demon Outwitted — ACK জাতক','Indian Story Read Along',
  'অমর চিত্র কথার জাতক-কমিক পড়ে শোনানো ভিডিও — পাতার ছবি দেখিয়ে গল্প বলা, শিশুদের জন্য।'),
 ('kid-yt-ack-brave-quail','e_CLXDGs8H0','en','The Brave Quail — ACK জাতক','Indian Story Read Along',
  'অমর চিত্র কথার জাতক-কমিক থেকে ‘সাহসী কোয়েল’ — পাতার ছবি দেখিয়ে গল্প পড়ে শোনানো।'),
 ('kid-yt-ack-fruit-tree','WVLqXJFxTC0','en','The Fruit Tree — ACK জাতক','Indian Story Read Along',
  'ACK-র ‘Stories of Wisdom’ জাতক-সংকলন থেকে ‘ফলের গাছ’ — সহজ ইংরেজিতে নীতিকথা।'),
 ('kid-yt-ack-outwitted','jyCv0GhuLYo','en','ACK — The Outwitted Demon','Super Stories Kids',
  'ACK-র জাতক-কাহিনির অ্যানিমেটেড রূপ — গল্প বলা ও ছবি একসঙ্গে।'),
]
for slug, vid, lang, tBn, channel, dBn in YTV:
    ITEMS.append(dict(
        id=slug, type='video', lang=lang, ageBn='৪–১২ বছর',
        topics=['angulimala'] if 'angulimal' in slug else (['buddha-life'] if 'buddha' in slug or 'buddha' in tBn.lower() else ['jataka']),
        titleBn=tBn, titleEn=tBn, descBn=dBn,
        thumb=f'assets/kids/thumbs/{slug}.jpg',
        embedId=vid, watchUrl=f'https://www.youtube.com/watch?v={vid}',
        licenceLabel=LIC['youtube'][0], licenceUrl=LIC['youtube'][1], licenceKey='youtube',
        creatorBn=channel,
        creditBn=f'ভিডিও: {channel} (YouTube) — কপিরাইট স্রষ্টা/আপলোডকারীর; এখানে কেবল ইউটিউবের এমবেড প্লেয়ারে চলে।',
        sourceName='YouTube', sourceUrl=f'https://www.youtube.com/watch?v={vid}',
        noteBn='কিছু ভিডিওতে বিজ্ঞাপন বা সাজেশন আসতে পারে — অভিভাবক আগে দেখে নিন।',
    ))

# ---------------------------------------------------------------- চলচ্চিত্র ও মাঙ্গা (বৈধ ঠিকানা)
FILMS = [
 ('kid-film-little-buddha','চলচ্চিত্র','বৃহস্পতি/রিচার্ড গির','Little Buddha (১৯৯৩)',
  'সিদ্ধার্থের গল্প ও সমসাময়িক এক তিব্বতি লামার পুনর্জন্ম — বার্নার্দো বের্তোলুচ্চির বিখ্যাত চলচ্চিত্র। পরিবারে একসঙ্গে দেখার জন্য; কোথায় দেখা যাবে তার বৈধ তালিকা লিংকে।',
  '১০+ বছর', 'https://www.justwatch.com/us/movie/little-buddha', 'https://en.wikipedia.org/wiki/Little_Buddha'),
 ('kid-film-pbs-buddha','ডকুমেন্টারি','ডেভিড গ্রুবিন','The Buddha — PBS (২০১০)',
  'রিচার্ড গিয়ার যুক্ত বর্ণনায় PBS-এর ডকুমেন্টারি — বুদ্ধের জীবন ও শিক্ষা, শিল্প ও পণ্ডিতদের সাক্ষাৎকারে। PBS-র নিজের সাইটে ফ্রি স্ট্রিম করার ব্যবস্থা আছে।',
  '১২+ বছর', 'https://www.pbs.org/thebuddha/', 'https://en.wikipedia.org/wiki/The_Buddha_(2010_film)'),
 ('kid-film-king-of-kings','চলচ্চিত্র','কিতিপ্রসর্ট সুকোসোল','Buddha: The King of Kings (২০০৭)',
  'থাইল্যান্ডের বড় বাজেটের বৌদ্ধ-চলচ্চিত্র — দেবদত্তের ষড়যন্ত্র ও বুদ্ধের জীবনের শেষ বছরগুলো নিয়ে; থাই ভাষায়, সাবটাইটেলসহ অনেক জায়গায় দেখা যায়।',
  '১২+ বছর', 'https://www.justwatch.com/us/search?q=buddha%20the%20king%20of%20kings', 'https://en.wikipedia.org/wiki/Buddha_(2007_film)'),
 ('kid-film-tezuka-anime','অ্যানিমে চলচ্চিত্র','তেজুকা ওসামু','তেজুকা: বুদ্ধ — অ্যানিমে চলচ্চিত্র (২০১১)',
  'তেজুকা ওসামুর কিংবদন্তি মাঙ্গা ‘বুদ্ধ’-র অ্যানিমে রূপান্তর — কপিলাবস্তু থেকে বোধিলাভ। বড়দেরও টানে এমন গভীর গল্প; কোথায় দেখা যাবে লিংকে।',
  '১৩+ বছর', 'https://www.justwatch.com/us/search?q=tezuka%20buddha', 'https://en.wikipedia.org/wiki/Buddha_(manga)'),
 ('kid-film-tezuka-manga','মাঙ্গা (কমিক)','তেজুকা ওসামু','তেজুকা: বুদ্ধ — মাঙ্গা (১৪ খণ্ড)',
  'মাঙ্গার ইতিহাসে অন্যতম শ্রেষ্ঠ কাজ — বুদ্ধের জীবন ও সমকালীন সমাজ, ১৪ খণ্ডে। ইংরেজি অনুবাদ এখন ছাপায় পাওয়া যায়; তথ্য ও প্রকাশকের লিংক নিচে।',
  '১৩+ বছর', 'https://en.wikipedia.org/wiki/Buddha_(manga)', None),
]
for slug, kindBn, who, tBn, dBn, age, watch, info in FILMS:
    is_manga = slug.endswith('manga')
    ITEMS.append(dict(
        id=slug, type='manga' if is_manga else 'film', lang='en', ageBn=age,
        topics=['buddha-life'],
        titleBn=f'{tBn}', titleEn=tBn.split(' (')[0],
        descBn=dBn, thumb=f'assets/kids/thumbs/{slug}.jpg',
        licenceLabel=LIC['licensed'][0], licenceUrl=LIC['licensed'][1], licenceKey='licensed',
        creatorBn=who,
        creditBn=f'{kindBn} · {who} — কপিরাইটযুক্ত; ফাইল এখানে নেই, বৈধ প্ল্যাটফর্মে দেখুন/কিনুন।',
        sourceName='JustWatch / PBS / Wikipedia', sourceUrl=watch,
        watchUrl=watch, infoUrl=info,
        noteBn='এখানে কোনো ভিডিও ফাইল রাখা হয়নি — বৈধ স্ট্রিমিং/কেনার লিংক দেওয়া হয়েছে।',
    ))



# ---------------------------------------------------------------- রঙ করার পাতা (নিজের আঁকনের লাইন-আর্ট)
COLORING = [
 ('kid-color-moon-rabbit','শশক জাতক — রঙ করার পাতা','রঙ করো: খরগোশ, ভিক্ষুক, ওটার, শিয়াল, বানর আর রাতের আকাশ।'),
 ('kid-color-white-elephant','শ্বেত হস্তী জাতক — রঙ করার পাতা','রঙ করো: সাদা হাতি, সোনার হাওদা, রাজপুত্র ও নগরের মানুষ।'),
 ('kid-color-angulimala','বুদ্ধ ও অঙ্গুলিমাল — রঙ করার পাতা','রঙ করো: শান্ত বুদ্ধ, নামানো অস্ত্র আর সবুজ বন।'),
 ('kid-color-sujata','সুজাতার মধুপায়স — রঙ করার পাতা','রঙ করো: নদী, পদ্ম, সুজাতার পাত্র ও বোধিবৃক্ষ।'),
 ('kid-color-monkey-crocodile','বানর ও কুমির — রঙ করার পাতা','রঙ করো: নদী, কুমির, আমের কাঁদি আর আকাশ।'),
 ('kid-color-banyan-deer','বটহরিণ জাতক — রঙ করার পাতা','রঙ করো: সোনালি হরিণ, ছোট হরিণের পাল আর চাঁদের আলো।'),
]
for slug, tBn, tip in COLORING:
    ITEMS.append(dict(
        id=slug, type='coloring', lang='bn', ageBn='৪–১০ বছর', topics=['jataka'],
        titleBn=tBn, titleEn=tBn,
        descBn=tip + ' — প্রিন্ট করে রঙ করা যায়; একই আঁকনের রঙিন সংস্করণও তালিকায় আছে। ছবিটি এই সাইটের জন্য নতুন আঁকা।',
        thumb=f'assets/kids/coloring/{slug}.jpg',
        licenceLabel=LIC['original'][0], licenceUrl=LIC['original'][1], licenceKey='original',
        creatorBn='চর্যাভূমি (AI-সহায়তায় আঁকা)',
        creditBn='চর্যাভূমি মূল আঁকন · CC BY-SA 4.0 — স্কুল/বাড়িতে ছাপিয়ে ব্যবহার করা যায়; সূত্র ও লাইসেন্স রাখুন।',
        sourceName='চর্যাভূমি · শিশু ও শিক্ষা বিভাগ',
        sourceUrl=f'sishu-shikkha.html',
        downloadUrl=f'assets/kids/coloring/{slug}.jpg',
        downloadUrlAlt='assets/kids/coloring/rong-kora-patra-pack.pdf',
        noteBn='সবগুলো একসঙ্গে: rong-kora-patra-pack.pdf (৬ পাতা, A4, প্রিন্ট-উপযোগী)।',
    ))

# ---------------------------------------------------------------- ধরন, ভাষা, বিষয়, খোঁজার লিংক
TYPES = [
 {'key':'all','labelBn':'সব','icon':'☸'},
 {'key':'comic','labelBn':'কমিক ও ছবির বই','icon':'💬'},
 {'key':'book','labelBn':'বই / PDF','icon':'📖'},
 {'key':'audio','labelBn':'অডিও গল্প','icon':'🎧'},
 {'key':'ack','labelBn':'অমর চিত্র কথা','icon':'🛒'},
 {'key':'video','labelBn':'অ্যানিমেশন (এমবেড)','icon':'▶'},
 {'key':'film','labelBn':'চলচ্চিত্র','icon':'🎬'},
 {'key':'manga','labelBn':'মাঙ্গা','icon':'📘'},
 {'key':'coloring','labelBn':'রঙ করার পাতা','icon':'🖍️'},
 {'key':'art','labelBn':'চিত্রকলা ও ভাস্কর্য','icon':'🎨'},
]
LANGS = [
 {'key':'all','labelBn':'সব ভাষা','icon':'🌐'},
 {'key':'en','labelBn':'ইংরেজি','icon':'🇬🇧'},
 {'key':'hi','labelBn':'হিন্দি','icon':'🇮🇳'},
 {'key':'fr','labelBn':'ফরাসি','icon':'🇫🇷'},
 {'key':'zh','labelBn':'চিনা','icon':'🇨🇳'},
 {'key':'bn','labelBn':'বাংলা','icon':'🇧🇩'},
]
TOPICS = [
 {'key':'all','labelBn':'সব বিষয়','icon':'✨'},
 {'key':'jataka','labelBn':'জাতক গল্প','icon':'🐇'},
 {'key':'buddha-life','labelBn':'বুদ্ধের জীবন','icon':'🌳'},
 {'key':'angulimala','labelBn':'অঙ্গুলিমাল','icon':'🖐️'},
 {'key':'sujata','labelBn':'সুজাতা','icon':'🍚'},
 {'key':'general','labelBn':'সাধারণ শিক্ষা','icon':'📚'},
]

SEARCH = [
 {'labelBn':'ইন্টারনেট আর্কাইভে ‘Jataka’ (সব মিডিয়া)', 'url':'https://archive.org/search?query=jataka&and[]=mediatype%3A%22movies%22'},
 {'labelBn':'ইন্টারনেট আর্কাইভে ‘Buddha cartoon’', 'url':'https://archive.org/search?query=buddha+cartoon'},
 {'labelBn':'ইন্টারনেট আর্কাইভে ‘Angulimala’', 'url':'https://archive.org/search?query=angulimala'},
 {'labelBn':'ইন্টারনেট আর্কাইভে ‘Jataka’ — বাংলা/হিন্দি বই', 'url':'https://archive.org/search?query=jataka&and[]=mediatype%3A%22texts%22'},
 {'labelBn':'উইকিমিডিয়া কমন্সে জাতক ছবি (মুক্ত)', 'url':'https://commons.wikimedia.org/w/index.php?search=Jataka&title=Special:MediaSearch&type=image'},
 {'labelBn':'উইকিমিডিয়া কমন্সে ‘Life of the Buddha’', 'url':'https://commons.wikimedia.org/w/index.php?search=Life+of+the+Buddha&title=Special:MediaSearch&type=image'},
 {'labelBn':'গুটেনবার্গে বিনামূল্যের জাতক বই', 'url':'https://www.gutenberg.org/ebooks/search/?query=jataka'},
 {'labelBn':'ইউটিউবে ‘Jataka Tales animation’ (অফিশিয়াল/পাবলিক)', 'url':'https://www.youtube.com/results?search_query=jataka+tales+animation+english'},
 {'labelBn':'ইউটিউবে ‘Buddha story cartoon Hindi’', 'url':'https://www.youtube.com/results?search_query=buddha+story+cartoon+hindi'},
 {'labelBn':'ইউটিউবে ‘Angulimala’', 'url':'https://www.youtube.com/results?search_query=angulimala+story+animation'},
 {'labelBn':'ইউটিউবে ‘জাতক গল্প বাংলা’', 'url':'https://www.youtube.com/results?search_query=%E0%A6%9C%E0%A6%BE%E0%A6%A4%E0%A6%95+%E0%A6%97%E0%A6%B2%E0%A7%8D%E0%A6%AA+%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE'},
 {'labelBn':'buddhist.net — শিক্ষা ও শিশু-বই', 'url':'https://buddhist.net/'},
]

# ---------------------------------------------------------------- মালিকের অনুমোদিত ওভারলে
# review.html → kids-overlay.json → এখানে বসানো হয় (সাইট নতুন করে বানাতে হয় না)
OVERLAY_PATH = ROOT / 'data' / 'kids-overlay.json'
overlay_stat = {'cards': 0, 'edits': 0, 'rejected': 0, 'skipped': []}
if OVERLAY_PATH.exists():
    overlay = json.loads(OVERLAY_PATH.read_text(encoding='utf-8'))
    if overlay.get('schema') != 'charyabhumi-kids-overlay-v1':
        raise SystemExit('kids-overlay.json — schema মেলেনি')
    by_id = {it['id']: it for it in ITEMS}
    for e in overlay.get('edits', []):
        it = by_id.get(e.get('id'))
        if not it:
            overlay_stat['skipped'].append('edit:' + str(e.get('id')))
            continue
        for k, v in (e.get('patch') or {}).items():
            if v not in (None, ''):
                it[k] = v
        overlay_stat['edits'] += 1
    rejected = {r.get('id') for r in overlay.get('rejections', []) if r.get('id')}
    overlay_stat['rejected'] = len(rejected)
    ITEMS[:] = [it for it in ITEMS if it['id'] not in rejected]
    for c in overlay.get('cards', []):
        cid = str(c.get('id') or '').strip()
        if not cid or cid in by_id or cid in rejected:
            overlay_stat['skipped'].append('card:' + (cid or '(id নেই)'))
            continue
        if not c.get('titleBn') or not (c.get('readUrl') or c.get('watchUrl') or c.get('embedId') or c.get('playUrl') or c.get('downloadUrl')):
            overlay_stat['skipped'].append('card:' + cid)
            continue
        card = {
            'id': cid, 'type': c.get('type') or 'art', 'lang': c.get('lang') or 'bn',
            'ageBn': c.get('ageBn') or '৪–১০ বছর',
            'topics': c.get('topics') or ['jataka'],
            'titleBn': c['titleBn'], 'titleEn': c.get('titleEn') or c['titleBn'],
            'descBn': c.get('descBn') or '',
            'thumb': c.get('thumb') or None,
            'licenceLabel': c.get('licenceLabel') or 'অনুমোদিত জমা',
            'licenceUrl': c.get('licenceUrl') or 'https://creativecommons.org/licenses/by-sa/4.0/',
            'licenceKey': c.get('licenceKey') or 'licensed',
            'creatorBn': c.get('creatorBn') or 'অজ্ঞাত',
            'creditBn': c.get('creditBn') or 'সূত্র: ' + str(c.get('sourceName') or 'জমাদানকারী'),
            'sourceName': c.get('sourceName') or 'জমা',
            'sourceUrl': c.get('sourceUrl') or 'https://charyabhumi.org/',
            'noteBn': c.get('noteBn') or '',
            'approvedAt': c.get('approvedAt'),
        }
        for f in ('readUrl', 'watchUrl', 'embedId', 'downloadUrl', 'downloadUrlAlt', 'playUrl', 'buyUrl', 'infoUrl', 'audioUrl', 'durationBn'):
            if c.get(f):
                card[f] = c[f]
        ITEMS.append(card)
        overlay_stat['cards'] += 1
    if overlay_stat['skipped']:
        print('⚠ ওভারলে বাদ পড়েছে:', overlay_stat['skipped'][:6])

PAYLOAD = {
 'schema': 'charyabhumi-kids-v1',
 'generated_at': '2026-11-01',
 'title': 'শিশু ও শিক্ষা — জাতক, বুদ্ধ ও বৌদ্ধধর্মের গল্প',
 'introBn': 'জাতক, বুদ্ধের জীবন, অঙ্গুলিমাল ও সুজাতার গল্প — কমিক, ছবির বই, অডিও, চিত্রকলা ও চলচ্চিত্রে। যেসব ফাইল আইনত এখানে রাখা যায় (পাবলিক ডোমেইন বা CC লাইসেন্স), সেগুলো এই সাইটেই ডাউনলোড ও প্লে করা যায়; বাকিগুলোর জন্য মূল সূত্রের লিংক দেওয়া আছে।',
 'types': TYPES, 'languages': LANGS, 'topics': TOPICS,
 'searchLinks': SEARCH,
 'notHostedBn': [
   'ব্লগ/টেলিগ্রাম/মিডিয়াফায়ারে ACK-র স্ক্যান করা PDF ছড়িয়ে আছে — সেগুলো স্রষ্টার অনুমতি ছাড়া আপলোড, তাই এখানে নামানো বা লিংক করা হয়নি। বাংলা সংস্করণ কেনার বৈধ ঠিকানা (Bnetbazaar) ৩টি কার্ডে আছে।',
   'আমার চিত্র কথা (ACK): ওপরে আলাদা অংশে ১২টি কার্ড — বুদ্ধ, বৌদ্ধ কথা সংকলন, জাতকের গল্প, আরও জাতক, বড় বক্স সেট, বুদ্ধিস্ট কালেকশন, অঙ্গুলিমাল (ফ্রি রিড), ACK ডিজিটাল লাইব্রেরি (বাংলা/হিন্দি/ইংরেজি) ও আর্কাইভ-সার্চ। কমিকের ফাইল বা কভার এখানে কপি করা নেই (কপিরাইট) — অফিশিয়াল সাইট/অ্যাপে পড়ুন বা কিনুন।',
   'তেজুকা ওসামুর ‘বুদ্ধ’ (মাঙ্গা + ২০১১-র অ্যানিমে চলচ্চিত্র) — কার্ডে কোথায় দেখবেন/কিনবেন তার বৈধ লিংক আছে; ফাইল নেই।',
   '‘Little Buddha’ (১৯৯৩), ‘The Buddha’ (PBS ২০১০), ‘Buddha: The King of Kings’ (২০০৭) — তিনটিরই কার্ড আছে “চলচ্চিত্র” ফিল্টারে; বৈধ স্ট্রিমিং/দেখার লিংক দেওয়া, ভিডিও ফাইল নেই।',
   'বাংলা/ইংরেজি/হিন্দি জাতক-অ্যানিমেশন — ১৮টি ভিডিও “অ্যানিমেশন” ফিল্টারে সরাসরি এমবেড করা আছে (ইউটিউবের নিজের প্লেয়ারে চলে, সাইটে ফাইল কপি নেই)। ভিডিওর নিচে সবসময় “ইউটিউবে দেখুন” লিংক থাকে।',
   'ইন্টারনেট আর্কাইভ, Scribd, টেলিগ্রাম বা গুগল ড্রাইভে ACK-র স্ক্যান করা কমিক আছে — কিন্তু সেগুলো স্রষ্টার অনুমতি ছাড়া আপলোড; এখানে সেগুলো ডাউনলোড করে রাখা হয়নি (আইনি ঝুঁকি)। বদলে ACK-র নিজের ফ্রি রিড, দোকান, ডিজিটাল লাইব্রেরি ও ইউটিউব-এমবেড দেওয়া হয়েছে।',
 ],
 'overlayApplied': overlay_stat,
 'items': ITEMS,
}


# ---------------------------------------------------------------- হালকা display-thumb (দ্রুত লোড)
# বড় ছবি কার্ডে পুরোটা না দেখিয়ে ছোট সংস্করণ দেখানো হয়; ডাউনলোডে মূল ফাইলই থাকে।
try:
    from PIL import Image as _Img
except Exception:
    _Img = None
DISP = ROOT / 'assets' / 'kids' / 'thumbs' / 'disp'
_thin = 0
if _Img is not None:
    DISP.mkdir(parents=True, exist_ok=True)
    for it in ITEMS:
        t = it.get('thumb')
        if not t or not t.startswith('assets/') or '/disp/' in t:
            continue
        src = ROOT / t
        if not src.exists() or src.stat().st_size <= 120_000:
            continue
        dst = DISP / (src.stem + '.jpg')
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
            try:
                im = _Img.open(src).convert('RGB')
                if im.width > 520:
                    im = im.resize((520, round(im.height * 520 / im.width)), _Img.LANCZOS)
                im.save(dst, 'JPEG', quality=72, optimize=True, progressive=True)
            except Exception:
                continue
        it['thumbFull'] = t
        it['thumb'] = str(dst.relative_to(ROOT))
        _thin += 1
print('হালকা থাম্ব তৈরি হলো:', _thin)

missing = []
for it in ITEMS:
    if it.get('thumb'):
        if not (ROOT / it['thumb']).exists(): missing.append(it['id'] + ' (thumb)')
    if it.get('playUrl') and not (ROOT / it['playUrl']).exists(): missing.append(it['id'] + ' (audio)')
if missing:
    print('⚠ অনুপস্থিত ফাইল:', missing)

OUT.write_text(json.dumps(PAYLOAD, ensure_ascii=False, indent=1), encoding='utf-8')
# fetch ব্লক (file:// / sandboxed preview) হলে পৃষ্ঠা এই স্ক্রিপ্ট ফাইলটি লোড করে
JS_OUT = ROOT / 'data' / 'kids-media-data.js'
JS_OUT.write_text('/* স্বয়ংক্রিয়ভাবে তৈরি — tools/build_kids_media.py */\n'
                  'window.KIDS_MEDIA_DATA = ' + json.dumps(PAYLOAD, ensure_ascii=False) + ';\n',
                  encoding='utf-8')
print('wrote', JS_OUT.relative_to(ROOT), JS_OUT.stat().st_size // 1024, 'KB')
import collections
# হালকা তালিকা (কার্ড আঁকার জন্য) — দ্রুত লোড হয়, বড় JSON টুলের জন্য থাকে
SLIM_KEYS = ('id', 'type', 'lang', 'ageBn', 'durationBn', 'titleBn', 'descBn', 'thumb', 'thumbFull',
             'embedId', 'playUrl', 'readUrl', 'watchUrl', 'buyUrl', 'downloadUrl', 'downloadUrlAlt',
             'licenceKey', 'licenceLabel', 'creditBn', 'sourceName', 'sourceUrl', 'voiceKind', 'localFile')
def _trim(v, n):
    v = v or ''
    return v if len(v) <= n else v[:n].rstrip() + '…'

slim = {'schema': PAYLOAD['schema'], 'generated_at': PAYLOAD.get('generated_at'),
        'title': PAYLOAD.get('title'), 'introBn': PAYLOAD.get('introBn'),
        'types': PAYLOAD['types'], 'languages': PAYLOAD['languages'], 'topics': PAYLOAD['topics'],
        'searchLinks': PAYLOAD.get('searchLinks', []), 'notHostedBn': PAYLOAD.get('notHostedBn', []),
        'items': []}
for it in ITEMS:
    row = {k: it[k] for k in SLIM_KEYS if it.get(k)}
    if 'descBn' in row:
        row['descBn'] = _trim(row['descBn'], 120)
    if 'creditBn' in row:
        row['creditBn'] = _trim(row['creditBn'], 70)
    slim['items'].append(row)
LIST = ROOT / 'data' / 'kids-media-list.json'
LIST.write_text(json.dumps(slim, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
LIST_JS = ROOT / 'data' / 'kids-media-list.js'
LIST_JS.write_text('/* স্বয়ংক্রিয় — tools/build_kids_media.py */\nwindow.KIDS_MEDIA_LIST = '
                   + json.dumps(slim, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print('wrote', LIST.relative_to(ROOT), LIST.stat().st_size // 1024, 'KB ·',
      LIST_JS.relative_to(ROOT), LIST_JS.stat().st_size // 1024, 'KB')

print('wrote', OUT.relative_to(ROOT), '—', len(ITEMS), 'items')
print(collections.Counter(i['type'] for i in ITEMS))
print(collections.Counter(i['lang'] for i in ITEMS))
print(collections.Counter(i['topics'][0] for i in ITEMS))
