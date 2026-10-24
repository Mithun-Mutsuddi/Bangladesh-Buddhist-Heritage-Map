# শিশু learning-and-play phase — scope, sources ও validation

তারিখ: ২০২৬-১০-২৪  
প্রধান পাতা: `children.html`  
Content registry: `data/children-content.json` (`2026-10-24.children.v1`)

এই নথি workspace-এর implementation ও validation-এর হিসাব। কোনো live deployment সম্পন্ন হওয়ার দাবি এটি নয়।

## ১) যা যুক্ত হয়েছে

- জাতক-ভিত্তিক ছয়-প্রশ্নের quiz ও বারো-কার্ডের প্রতীক memory game; কোনো account, public leaderboard বা ব্যক্তিগত নাম নেই।
- বাংলা **বনরাজার সাহস** তিন-পাতার original mini-comic; browser page viewer, slideshow এবং PDF।
- Somapura-এর বর্তমান ছবি ও AI-assisted hypothetical illustration-এর accessible before/after slider। Illustration-কে প্রত্নতাত্ত্বিক প্রমাণ, নির্ভুল নকশা বা নিশ্চিত প্রাচীন রূপ বলা হয়নি।
- HTML5 Canvas scratch-off dig; pointer/touch-এর পাশাপাশি **“ঘষার বদলে ছবি উন্মোচন”** button। Reveal-এর পরিচয় কেবল **টেরাকোটা ভাস্কর্যের খণ্ডাংশ**—মুদ্রা, plaque-এর নির্দিষ্ট ধরন বা তারিখ বানিয়ে দেওয়া হয়নি।
- চার-পাতার A4 Somapura central-temple simplified paper model: তিন box-tier, cut/fold lines, glue tabs, finial, assembly sketch এবং ১০ মিমি scale check। এটি measured/archaeological reconstruction নয়।
- সাত-পাতার printable art pack ও browser colouring: বুদ্ধ, ভান্তে, ড. বি. আর. আম্বেদকর, Somapura, ধর্মচক্র, পদ্ম, স্তূপ এবং ১–১৭ dot-to-dot।
- ফানুস/paper lantern, mandala-অনুপ্রাণিত জ্যামিতিক art, dragon/nāga mask, singing bowl/digital sound-art, origami lotus ও Jataka-inspired shadow art—ছয়টি four-step SVG activity। প্রতিটির cultural boundary, materials, safety ও source link আছে।
- কীর্তন, Buddha kirtan, পালি chant এবং আধুনিক বৌদ্ধ গানের পার্থক্য; sourced short excerpts, regional culture lead, original melody এবং তিনটি watch-only external listening lead।
- হোমপেজ card/sitemap, ১৫তম feature, shared header/footer navigation এবং reviewed English interface labels।

## ২) Rights ও source boundaries

### স্থানীয় original assets

`tools/build_children_assets.py` থেকে colouring PNG, PDF, preview এবং synthesized WAV তৈরি হয়। Mini-comic, craft diagrams, song lyrics/melody ও illustration কোনো আধুনিক protected comic/song-এর অনুলিপি হিসেবে তৈরি নয়। নতুন গানকে traditional Buddha kirtan বলা হয়নি।

### বর্তমান Somapura ছবি

- `assets/quiz/somapura.jpg`
- **Khan-Tanvir, CC BY-SA 3.0**; বিস্তারিত `data/quiz-images.json`।
- Slider-এর reconstruction আলাদা AI-assisted educational illustration; দুটি চিত্রের দৃশ্য সম্পূর্ণ surveyed alignment নয়।

### Ambedkar colouring

- `assets/quiz/ambedkar.jpg`-এর public-domain portrait থেকে educational outline।
- Commons source title: **Dr B R Ambedkar as Barrister in 1922.jpg**।

### Dalijhara reveal

- `assets/photos/dalijhara-terracotta.jpg`
- Department of Archaeology-এর জুন ২০২১ Dalijhara brochure-এর চিত্রিত নথিচিত্র; মূল brochure: `assets/docs/dalijhara-brochure-2021.pdf`।
- ব্রোশিওরের সীমিত catalog description-এর বাইরে পরিচয় বাড়ানো হয়নি।

### জাতক, books ও comic

- Project Gutenberg #62514: Babbitt/Young-এর *Jataka Tales*; source-এ **public domain in the USA** উল্লেখ। ব্যবহারকারীর দেশের আইন আলাদা হতে পারে।
- Wikimedia Commons-এর ১৯১২ scan: public-domain source/credit রেখে মূল PDF-এ যাওয়া।
- BuddhaNet: publisher/source-provided PDF download-এর link; local rehost বা অন্য প্রকাশনায় ব্যবহারের অনুমতি ধরে নেওয়া হয়নি।
- **Buddha — Amar Chitra Katha Pvt. Ltd.:** ACK Digital-এর সুনির্দিষ্ট `Buddha` title page; সক্রিয় official **Buy/Subscribe** route যাচাই করা হয়েছে। Search index-এ পাওয়া একটি পুরোনো store collection URL 404 হওয়ায় সেটি বাদ দেওয়া হয়েছে। Internet Archive, epdf বা অন্য unofficial mirror থেকে PDF নেওয়া হয়নি।

### External listening/video

- BBC Teach ও অন্যান্য external videos-এ watch-only/source links; rehost/download নয়।
- তিনটি Buddha-kirtan listening lead-এর YouTube title, performer/uploader ও channel metadata **YouTube oEmbed** দিয়ে মিলিয়ে দেখা হয়েছে। এগুলো `search-indexed`; upload-এর ownership, performance rights বা সব সম্প্রদায়ের প্রামাণ্য repertoire independently verified বলা হয়নি।
- Protected lyrics, notation, audio বা video copy করা হয়নি। External content অভিভাবক/শিক্ষক আগে preview করবেন।
- Buddhistdoor-এর official Prabāraṇā/fanus article automated HTTP check-এ bot restriction দেখাতে পারে; official indexed article ও content পাওয়া গেছে। Asian Art Museum-এর পুরোনো 404 URL বদলে তাদের বর্তমান official shadow-theatre lesson দেওয়া হয়েছে।

External availability পরিবর্তিত হতে পারে। কোনো “সম্পূর্ণ internet collection” দাবি নেই।

## ৩) Accessibility, privacy ও safety

- Slider: native range, arrow keys, presets এবং text labels।
- Dig: pointer/touch scratch এবং সমতুল্য reveal button।
- Memory/quiz/craft tabs: native buttons; craft tabs-এ arrow/Home/End navigation।
- Decorative hero motion: pause control এবং `prefers-reduced-motion` সম্মান।
- Comic: text caption, PDF বিকল্প এবং user-controlled slideshow; কোনো autoplay audio নেই।
- Colouring: ছবি device-এই তৈরি/download; upload নেই। Printable pack বিকল্প।
- Fanus/lantern/shadow activity-তে আগুন বা fuel নয়, battery LED; kite/sky-lantern release-এর নির্দেশ নেই।
- Singing bowl-এর প্রাচীন/Tibetan origin বা medical claim করা হয়নি; sound কম রাখার নির্দেশ আছে।
- বাস্তব প্রত্নস্থলে খোঁড়া, ঘষা বা বস্তু তুলে নেওয়ার বদলে কর্তৃপক্ষকে জানানোর নির্দেশ আছে।

## ৪) Asset QA

`pypdf` দিয়ে PDF parse:

| File | Pages | Result |
|---|---:|---|
| `somapura-paper-model.pdf` | ৪ | A4, unencrypted, parse OK |
| `children-art-pack.pdf` | ৭ | A4, unencrypted, parse OK |
| `banyan-deer-mini-comic.pdf` | ৩ | A4, unencrypted, parse OK |
| `maitri-original-song.pdf` | ১ | A4, unencrypted, parse OK |

সব PDF page-এর generated preview দৃশ্যত পরীক্ষা করা হয়েছে; বিশেষ করে nets, glue tabs, finial/assembly, print warning, Ambedkar portrait, comic captions ও song notation। চূড়ান্ত print audit-এ shared fold edge-এর নিচে থাকা solid outline সরিয়ে স্পষ্ট dashed fold line দেওয়া হয়েছে, যাতে কাটা ও ভাঁজের নির্দেশ গুলিয়ে না যায়।

WAV technical inspection:

- `digital-bell.wav`: ৬.০০ সেকেন্ড, mono 22,050 Hz, non-silent, clipping ধরা পড়েনি।
- `maitri-original.wav`: ১৩.৪৪ সেকেন্ড, mono 22,050 Hz, non-silent, clipping ধরা পড়েনি।

এটি technical signal validation; প্রকৃত মানুষের কণ্ঠ বা traditional performance recording-এর দাবি নয়।

## ৫) Automated validation

চূড়ান্ত local run:

- **Playwright: ৩৭/৩৭ pass** (`npx playwright test`) — এর মধ্যে ১২টি dedicated children test।
- **Tracker core: ১২/১২ pass** (`npm test`)।
- **Backend: ১১/১১ pass** (`/tmp/heritage-venv/bin/python -m unittest discover -s tests -p 'test_*.py'`)।
- `python tools/validate_public_phase.py`: PASS — core ৩৫৯ + directory ২,৮৫৯ + tracker ৩,২১৮; ৬৪ জেলা, ৪৯৫ উপজেলা, ৩৫ archive gateways, ৮২ library items, ৫৪ creator entries।
- `python tools/validate_heritage_data.py`: structural PASS; existing human-review/source warnings অক্ষত।
- `python tools/curate_heritage_data.py --dry-run`: **changes=0**, কোনো dataset file written নয়।
- Children registry: ৮ media + ৬ craft + ৭ chant/listening = ২১ unique IDs; local assets ও external-listening boundary checks pass।

Scratch test-এ soil-এর translucent texture stroke destination-out erase-কে আংশিক করছিল বলে একটি বাস্তব bug ধরা পড়েছিল। Eraser-এর opaque stroke স্থির করার পর pointer scratch ও non-scratch alternative দুটিই pass।

## ৬) সীমা

- এটি প্রতিটি প্রধান heritage site-এর সম্পূর্ণ paper-model series নয়; Somapura প্রথম সম্পূর্ণ simplified template।
- সব content-এর পূর্ণ মানব-সম্পাদিত অনুবাদ নেই; shared language framework-এর সীমা অক্ষত।
- কোনো universal traditional kirtan melody, পূর্ণ protected lyrics বা practitioner-approved notation দেওয়া হয়নি।
- External video/audio-এর বিজ্ঞাপন, suggested content, ভবিষ্যৎ availability বা প্রতিটি upload-এর সম্পূর্ণ rights chain নিয়ন্ত্রণ করা যায় না।
- বাস্তব প্রিন্টারের scaling/কাগজ/কাঁচি-আঠার ফলাফল device-ভেদে আলাদা হতে পারে; Actual size / 100% এবং ১০ মিমি scale-check জরুরি।
