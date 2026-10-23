# চর্যাভূমি — public data, upazila ও historical archive phase

**তারিখ:** ২০২৬-১০-২৪
**কাজের scope:** `Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map`
**creator attribution:** **মিথুন মুৎসুদ্দী**
**অবস্থা:** প্রকাশিত। মূল implementation commit: `b3301ecb001f66077afc5c03deef3ae8ad95c50b` (`b3301ec`)।
**Deployment:** GitHub Pages run `40014701929` সফল; Heritage data validation run `40014702526` সফল। Pages API-তে status `built` এবং exact commit `b3301ec` নিশ্চিত হয়েছে।
**Live smoke check:** homepage-এ ৩,২১৮ records, ৪৯৭ upazila options, ৩৯ language options ও Noto Sans Bengali loaded; archive-এ ৩৫ items; কোনো JavaScript page error নেই। Live deep link `চট্টগ্রাম → কুমিল্লা → লাকসাম` থেকে ১৮টি স্থান এসেছে।

## ১. ডেটা ও বানান

- মূল directory সংখ্যা অপরিবর্তিত: **৩৫৯ editorial core + ২,৮৫৯ compact directory = ৩,২১৮ unique records**। কোনো রেকর্ড মুছে সংখ্যা কমানো হয়নি।
- `tools/curate_heritage_data.py` এখন NFC, পর্যালোচিত বানান, canonical category, administrative parent এবং source/editorial mirror-এর deterministic cleanup চালায়। এটি coordinates বা নতুন ঐতিহাসিক দাবি তৈরি করে না।
- `গোয়াইয়া কারবারী পাড়া বৌদ্ধ বিহার`-এর repair anchored ও idempotent; পুনরায় চালালে `গগগোয়াইয়া…` হবে না।
- পর্যালোচিত correction-এর মধ্যে আছে `দেবগিরি বন বিহার`, `লেমুঝিড়ি…`, Aliswar-এর **লাকসাম**, ঘনিয়াখালী/দত্তপুর/কলমিয়ার **সদর দক্ষিণ**, এবং `khagrachhari-baroichhari`-এর **মহালছড়ি**। সিন্দুকছড়ি union-parent override আলাদা ও উৎস-পর্যালোচিত।
- Canonical gazetteer alias যোগ হয়েছে: **সীতাকুণ্ড → সীতাকুন্ড**, **তালতলী → তালতলি**, **সোনাইমুড়ি → সোনাইমুড়ী**।
- Broad category একীকরণের সঙ্গে অর্থপূর্ণ পার্থক্য রাখা হয়েছে: **বৌদ্ধ সামাজিক প্রতিষ্ঠান** (৯টি সংগঠন) এবং **সামাজিক সেবা** (অনাথালয়/কল্যাণ) একই জিনিস নয়। পুরোনো institution deep link-ও কাজ করে।
- `docs/data-curation-2026-10-24.json`-এ baseline replay, initial observed audit summary, ৯৫৮টি reconstructed change event এবং **১,৯৫০টি baseline→current field diff** রাখা হয়েছে। ১,২৭৪ হলো প্রথম dry-run-এর observed event count; এটি unique place count নয়। পরবর্তী targeted fixes আলাদাভাবে চিহ্নিত।
- চূড়ান্ত hierarchy audit: **০ invalid upazila, ০ division mismatch, ০ rural উপজেলা–থানা conflict**। অনুপস্থিত source URL-এর পুরোনো warning এখনও editorial backlog; অনুমান করে URL যোগ করা হয়নি।

## ২. বিভাগ → জেলা → উপজেলা

- হোমপেজের জেলা filter-এর পাশে স্বতন্ত্র **উপজেলা** filter আছে।
- `data/bd-geo.json`-এর **৮ বিভাগ / ৬৪ জেলা / ৪৯৫ উপজেলা / ৪,৫৪০ ইউনিয়ন** ব্যবহৃত হয়।
- একই নামের উপজেলা একাধিক জেলায় থাকলে district-scoped value ও জেলার label দেখানো হয়; তাই ৪৯৫ entry-এর কোনোটি নাম deduplicate হয়ে হারায় না।
- Directory ধীরে load হলেও বিভাগ/জেলা/উপজেলা selection preserved থাকে। URL deep link, reset এবং **উপজেলা অজানা / যাচাইাধীন** filter সমর্থিত।
- Administrative gazetteer কোনো স্থানের ঐতিহাসিক অবস্থানের প্রমাণ নয়; source metadata ও approximate-pin সতর্কতা retained।

## ৩. Public Historical Archive

নতুন `historical-archive.html`, `historical-archive.css`, `historical-archive.js` এবং `data/historical-archive.json` যোগ হয়েছে।

- **৩৫টি curated source gateway**—Buddha, Buddhism, Bengali Buddhists/Buddhism ও Bangladeshi Buddhists/Buddhism-এর initial research index।
- বিষয় ও মিডিয়া হিসেবে books/PDF, manuscripts, images/artwork/sculpture/iconography, audio/chanting/music, video, articles/news, research/texts, maps ও collections অন্তর্ভুক্ত।
- Search, media/topic/source-state filters, incremental card loading, source/verification/rights details, existing **৮২-item library**, **৫৪-entry creator archive**, history ও maps-এর cross-link আছে।
- Animated inline SVG orbit/dharma/book graphic, loading/entry animation এবং `prefers-reduced-motion` বিকল্প আছে।
- প্রতিটি card-এ source tier আলাদা: primary, official/institutional, reviewed reference, tertiary, discovery, community বা internal। Search result-কে historical proof বলা হয় নি।
- Public-domain/অনুমোদিত media ছাড়া protected PDF, image, audio বা video স্থানীয়ভাবে কপি করা হয়নি; source link/attribution ব্যবহার করা হয়েছে। প্রতিটি Wikimedia/museum file-এর licence আলাদা যাচাই করতে হবে।
- Buddhist Channel, BuddhaNet history/audio, Internet Archive, Wikipedia/Wikimedia, YouTube, Academia, Google Scholar, ResearchGate, UNESCO, museum ও অন্যান্য discovery source যোগ করা হয়েছে। Access restriction (403/429/login) হলে সেটিকে content verification হিসেবে চিহ্নিত করা হয়নি।
- ব্যবহারকারীর দেওয়া **Buddhist Historical Archive (বৌদ্ধ ঐতিহাসিক সংরক্ষণাগার)** নামটি community lead হিসেবে আছে। এই workspace-এর accessible record-এ direct group URL নিশ্চিত নয়, তাই numeric group ID অনুমান করা হয়নি; public search link দেওয়া হয়েছে। Private/login content অতিক্রম করা হয়নি। Direct URL ও public post পাওয়া গেলে স্বাধীন provenance review দরকার।
- এটি **সম্পূর্ণ ইন্টারনেট সংরক্ষণের দাবি নয়**; verified initial collection ও পরবর্তী contribution-এর কাঠামো।

## ৪. Language ও font

- Homepage-এর একদম শুরুতে, welcome control-এও এবং shared header/content pages-এ persistent language selector আছে।
- **বাংলা, English, Chakma (ccp), Marma (rmz)**-সহ ৩৮টি named language + automatic/other route (মোট ৩৯ option)।
- Chakma/Marma-কে **community interface support** হিসেবে চিহ্নিত করা হয়েছে; পূর্ণ article-এর মানব-সম্পাদিত অনুবাদের দাবি নয়। অন্যান্য language-এ external automatic translation route স্পষ্টভাবে automatic বলে চিহ্নিত।
- Local `Noto Sans Bengali` font faces (400/500/600/700) ব্যবহৃত হয়; browser font-load check pass।
- Tracker-এর পুরোনো private app-এর নিজস্ব English/Bangla control অক্ষত; shared early selector মূল public content/header pages-এ যুক্ত।

## ৫. Verification

সফল local checks:

```text
python tools/curate_heritage_data.py --dry-run   # 0 changes on current tree
python tools/build_tracker_data.py               # 3218 records; 64 districts
python tools/validate_public_phase.py             # PASS
python tools/validate_heritage_data.py            # structural PASS; existing source warnings
npm test                                         # 12/12 tracker unit tests
npx playwright test tests/homepage.spec.cjs      # 7/7
npx playwright test tests/tracker.spec.cjs       # 11/11
npx playwright test tests/public-phase.spec.cjs  # 5/5
/tmp/heritage-venv/bin/python -m unittest tests.test_tracker_backend -v  # 11/11
npx playwright test --reporter=line             # 23/23 (static এবং API host)
```

Browser crawl-এ public pages-এ local 404 বা JavaScript page error পাওয়া যায়নি; desktop/mobile overflow, archive filters, English state, Chakma/Marma support state, animation ও reduced motion যাচাই করা হয়েছে।

## ৬. পরবর্তী editorial ধাপ

1. Direct Facebook group URL ও public post provenance নিশ্চিত করা।
2. প্রতিটি newly proposed media-এর licence/permission, creator, date ও stable source URL যাচাই করা।
3. Source URL warning-এর ৪০টি additional record-এর জন্য প্রকৃত source সংগ্রহ করা; অনুমান করা নয়।
4. Chakma/Marma community reviewers দিয়ে interface ও অগ্রাধিকারপ্রাপ্ত নিবন্ধের মানব-সম্পাদিত অনুবাদ যোগ করা।
5. Restricted source-এর ক্ষেত্রে access limitation নথিভুক্ত রেখে alternative institutional copy খোঁজা।
