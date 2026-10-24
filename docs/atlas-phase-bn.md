# Research & Travel Atlas — বাস্তবায়ন ও যাচাই নথি

**Creator: মিথুন মুৎসুদ্দী**  
**Dataset/schema date: 2026-10-24**

## ১. পরিধি

- `atlas.html`, `atlas.css`, `atlas.js` — বাংলা/English responsive Atlas।
- ১২টি গভীর major-site profile, ২টি circuit, ৩৫টি source record।
- বিদ্যমান মানচিত্র, archive, tracker ও children section-এর বিকল্প নয়; এগুলোর সঙ্গে সংযোগ।
- compiled map/tracker সংখ্যা অপরিবর্তিত: **359 core + 2,859 directory = 3,218**।
- সব ৩,২১৮ রেকর্ডের সমপর্যায়ের archaeological documentation বা “সম্পূর্ণ ইন্টারনেট সংগ্রহ” দাবি নেই।
- Ananda, Bhoja ও Charpatra-এর জন্য অনুমোদিত local photo যাচাই এখনো বাকি; তাই ছবির বদলে স্পষ্ট placeholder। Kotila-এর পাওয়া চিত্রটি 680×452—এটি বড় high-resolution photo বলা হয়নি।

## ২. Profile ও প্রধান উৎস

| Profile | প্রধান archaeological/status source | Coordinate source |
|---|---|---|
| Somapura/Paharpur | UNESCO 322; Banglapedia Paharpur; DoA | UNESCO 322 |
| Shalban | UNESCO 6670; Banglapedia Mainamati | UNESCO 6670 component coordinate |
| Kotila Mura | UNESCO 6670; Banglapedia Mainamati | UNESCO 6670 |
| Itakhola Mura | UNESCO 6670; Banglapedia Mainamati | UNESCO 6670 |
| Rupban Mura | UNESCO 6670; Banglapedia Mainamati | UNESCO 6670 |
| Charpatra Mura | UNESCO 6670; Banglapedia Mainamati; DoA | UNESCO 6670 |
| Ananda Vihara | UNESCO 6670; Banglapedia Mainamati | UNESCO 6670 |
| Bhoja Vihara | UNESCO 6670; Banglapedia Mainamati | UNESCO 6670 |
| Sitakot | Banglapedia Sitakot | *Ancient Sites and Settlement* (2015), Wikidata cross-check |
| Halud | Banglapedia Halud | *Ancient Sites and Settlement* (2015) |
| Bhasu/Vasu | Banglapedia Bhasu; Antiquity project gallery | *Ancient Sites and Settlement* (2015) |
| Jagaddala | Banglapedia Jagaddala; DoA | Bangla Wikipedia coordinate record; interpretation আলাদা উৎসে |

**Paharpur ও Somapura Mahavihara একই site**—একটি profile। Charpatra বৌদ্ধ monastery নয়; nomination-এর বর্ণনানুযায়ী Brahmanical/Vaishnava temple। এর underlying `type`ও `যাচাইাধীন` থেকে **ব্রাহ্মণ্য মন্দির** করা হয়েছে এবং regression test দিয়ে সুরক্ষিত।

প্রতিটি coordinate-এর সতর্কতা: **published site/component coordinate, surveyed entrance gate নয়**। Underlying `heritage-sites.json`-এর ১২টি reviewed record, `dashboard-core.json` এবং `tracker-places.json` একই correction পেয়েছে। অন্য record বা মোট সংখ্যা বদলায়নি।

### UNESCO-সংক্রান্ত সতর্কতা

- Somapura: 1985 World Heritage, property 322।
- Lalmai-Mainamati: 17 May 2023 tentative submission, reference 6670; World Heritage inscription নয়।
- Mahasthan/Karatoya: 17 May 2023 tentative submission, reference 6671।
- Halud ও Jagaddala বর্তমান UNESCO tentative list-এ পৃথক entry নয়। পুরনো 1999 উল্লেখকে বর্তমান মর্যাদা বলা হয়নি। আলাদা “officially withdrawn” ঘটনাও প্রমাণ ছাড়া দাবি করা হয়নি।

## ৩. Media rights

### Local Commons photographs

`data/atlas-media.json`-এ প্রতিটি file-এর exact source page, creator, licence, licence URL, dimensions ও byte count আছে। Web delivery-এর জন্য resize/format conversion হয়েছে; original composition ও attribution রক্ষা করা হয়েছে।

| Local file | Creator | Licence |
|---|---|---|
| `somapura-aerial.jpg` | Md. Ahsanul Haque Nayem | CC BY-SA 4.0 |
| `somapura-terracotta.jpg` | Farhana Azad | CC BY-SA 3.0 |
| `shalban.jpg` | Shahidul Hasan Roman | CC BY-SA 4.0 |
| `kotila-mura.png` | Sabilaenun | CC BY 3.0 |
| `itakhola-mura.jpg` | Masum-al-hasan | CC BY-SA 3.0 |
| `rupban-mura.jpg` | Masum-al-hasan | CC BY-SA 3.0 |
| `sitakot.jpg` | Zaheerahmed786 | CC BY-SA 4.0 |
| `halud-vihara.jpg` | Rangan Datta Wiki | CC BY-SA 4.0 |
| `bhasu-vihara.jpg` | Rangan Datta Wiki | CC BY-SA 4.0 |
| `jagaddala.jpg` | Suvopartho | CC BY-SA 4.0 |

### Archival material

- `cunningham-1882-selected-pages.pdf`: Alexander Cunningham, *Report of a Tour in Bihar and Bengal, 1879–80*, 1882—পাঁচটি নির্বাচিত scan page। প্রকাশনা 1882 ও লেখকের মৃত্যু 1893; historical public-domain note রাখা হয়েছে। Internet Archive-এর নিজস্ব কোনো blanket licence ধরে নেওয়া হয়নি।
- `cunningham-paharpur-plate32.jpg`: Paharpur plate; source link সহ।
- `cunningham-mahasthan-plate29.jpg`: পড়ার সুবিধায় rotation ও contrast adjustment—বিবরণে স্পষ্ট।
- Dikshit, *Excavations at Paharpur, Bengal* (1938): Internet Archive external reading link only; local mirror বা blanket public-domain claim নয়।

### 360°

- Shalban: **Farsid Raihan / 360Cities**, provider-এর qualifying non-commercial embed terms; local panorama copy নয়। Embed click-to-load এবং মূল source link রাখা হয়েছে।
- Somapura: Keerti Creations-এর provider-hosted tour-এর attributed external link। Reuse permission প্রমাণিত নয়; কোনো file embed বা mirror করা হয়নি।
- Flat panorama/AI image-কে photo sphere বলা হয়নি। Protected Facebook বা commercial media bypass/copy নয়।

## ৪. Travel information-এর সীমা

- District-hub ও circuit distance **straight-line Haversine planning aid**, road distance নয়।
- Unverified fare, schedule, road condition বা hotel/restaurant quality লেখা হয়নি; **যাত্রার আগে যাচাই প্রয়োজন** label এবং official checking link আছে।
- Rail: Bangladesh Railway e-ticket/Rail Sheba বা authorised counter।
- Air: CAAB ও airline; পরবর্তী road transfer আলাদা।
- Waterway: BIWTA/BIWTC ও ঘাট কর্তৃপক্ষ; inland site-এ direct launch route ধরে নেওয়া হয়নি।
- Mainamati Museum/Shalban: 3 September 2026 official fee list-এর তারিখ ও visitor category সহ তথ্য; অন্য component-এ একই fee প্রয়োগ করা হয়নি।
- Mainamati site-specific 2026 hours এবং DoA-এর 27 August 2026 general schedule আলাদা রাখা হয়েছে। Special closure/notice আবার দেখতে বলা হয়েছে।
- জরুরি সেবা 999; active looting/damage-এ public form-এ অপেক্ষা না করে DoA/স্থানীয় কর্তৃপক্ষ/999।

## ৫. Research, field desk ও bibliography

- Research log-এ official heritage metadata, visitor metadata, researcher field report ও news আলাদা label।
- 2022/2025 Mahasthan report-এর ongoing analysis-কে final discovery বলা হয়নি।
- BSS Paharpur সংবাদটি dated visitor-facility lead; এর architectural/historical claims মূল profile-এর ভিত্তি নয়।
- Field desk সম্পূর্ণ local/static: কোনো server submission নেই। Draft localStorage-এ, JSON export/import আছে এবং export-এ `official_submission: false`।
- ছবি upload নেই; source URL, creator/licence/permission note ও safe general location চাওয়া হয়। Sensitive find location বা personal data প্রকাশের নির্দেশ নেই।

## ৬. Family, school ও audio

- Evidence quest-এর সঠিক উত্তরে ১২ stamp; ভুল উত্তরে stamp নয়। Stamp physical visit-এর প্রমাণ নয়।
- Levels: New Explorer → Young Archaeologist → Heritage Researcher → Heritage Conservator → Heritage Master।
- Passport name/stamp local-only; JSON export/import ও print আছে।
- বিদ্যমান `children.html#archaeologist`, `#paper`, `#art`, `#stories` reuse হয়েছে; competing dig/slider/colouring/comic তৈরি নয়।
- Original mascot **ইটু**, six-page `school-field-notebook.pdf`, three-page `itu-pala-evidence-comic.pdf`। Comic-এর imagined Pala-era scene স্পষ্টভাবে চিহ্নিত; measured reconstruction নয়।
- Bangla/English transcript সবসময় পড়া যায়। Narration হলো device/browser speech synthesis; prerecorded human voice বা generated audio-file collection দাবি নেই।

## ৭. Build

```bash
python tools/build_atlas_data.py
python tools/build_tracker_data.py
PYTHONPATH=tools python tools/build_atlas_assets.py
node --check atlas.js
```

`build_atlas_data.py` reviewed source record, Atlas JSON এবং homepage compiled core update করে। `build_tracker_data.py` একই source থেকে ৩,২১৮-place tracker view তৈরি করে। Local photos/PDF-গুলো repository asset; build চালাতে protected media download করতে হয় না।

## ৮. Validation checklist

```bash
npx playwright test tests/atlas.spec.cjs
npx playwright test
python tools/validate_public_phase.py
# backend environment used in the preceding phases:
PYTHONPATH=. /tmp/heritage-venv/bin/python tests/test_tracker_backend.py
```

Atlas suite-এ bilingual UI, profile/filter, এক-site সিদ্ধান্ত, wrong/correct quiz behaviour, persistent passport, validated import, circuits, click-to-load 360, local-only draft, real PDF, ৩,২১৮-record invariant, integration links ও mobile overflow পরীক্ষা করা হয়।

### 2026-10-24 local validation result

- **Playwright: 50/50 PASS** — Atlas 13 + existing children/homepage/public/tracker suites। Homepage feature assertionটি intentional Atlas card-এর জন্য 16-এ হালনাগাদ।
- **Tracker core: 12/12 PASS**।
- **Backend: 11/11 PASS**।
- `validate_public_phase.py`: **PASS** — 359 + 2,859 = 3,218; 64 districts/495 upazilas/4,540 unions; tracker sync ও language hooks।
- Geography audit-এর পর canonical **বদলগাছী** ও **ধামইরহাট** ব্যবহৃত হয়েছে।
- `heritage-sites.json`, `dashboard-core.json`, `tracker-places.json`: প্রতিটিতে একই ১২ reviewed record বদলেছে; অন্য record অপরিবর্তিত।
- PDF validation: Cunningham excerpt **5 pages**, school kit **6 pages**, comic **3 pages**; সবগুলো বৈধ PDF এবং generated দুটির author ঠিক **মিথুন মুৎসুদ্দী**।

এই ফল local validation; commit/GitHub Pages deployment আলাদা ধাপ।
