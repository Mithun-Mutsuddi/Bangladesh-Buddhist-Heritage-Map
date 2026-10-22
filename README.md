# চর্যাভূমি (Charyabhumi) ☸
**হাজার বছরের পথ ধরে** — বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস ও ভ্রমণের ফ্রি সাইট।

**বাংলার বৌদ্ধ স্থানগুলো নিজে ঘুরে দেখুন — ইতিহাস, পথ আর মানুষের সঙ্গে।**

ফ্রি · সাইন-আপ নেই · বিজ্ঞাপন নেই

- **নতুন হোমপেজ:** `index.html` (রাউন্ড ১৩ ব্র্যান্ডিং)
- **পুরোনো ড্যাশবোর্ড** (৩০ জেলার বিহার-তালিকা, ম্যাপ, ভ্রমণ-তালিকা, উৎসব, সাহিত্য): `index-old.html`
- **কুইজ ও লিডারবোর্ড:** `quiz.html` (৫১৫ প্রশ্ন, প্রতি রাউন্ডে ১০টি)
- **আমাদের কথা, জরুরি নম্বর, ট্রেনের তথ্য:** `about.html`
- **বৌদ্ধধর্ম ও দর্শন:** `philosophy.html` — বুদ্ধের জীবন, মূল শিক্ষা, বাংলায় বৌদ্ধধর্মের ইতিহাস, চার ধারা, ত্রিপিটক (`data/philosophy.json`)
- **পঞ্জিকা:** `calendar.html` — বঙ্গাব্দ · বুদ্ধাব্দ · ইংরেজি তারিখ, ঘড়ি, তিথি-নক্ষত্র-যোগ-করণ, পূর্ণিমা-অমাবস্যা-উপোসথ (ব্রাউজারেই গণনা)
- **কুইজ:** `quiz.html` — ৬৬২টি প্রশ্ন, ১১ বিষয়, ছবি-কুইজ (`data/quiz-bank.json` + `data/quiz-extra14.json` + `data/quiz-images.json`, ছবি `assets/quiz/`)
- **কোন জেলায় কী বিখ্যাত:** `index.html#districts` — `data/district-famous.json` (৩০ জেলা, ৩,২১৮ অদ্বিতীয় রেকর্ড)
- **বুদ্ধ ও বৌদ্ধ চরিত্রের নির্মাতা-আর্কাইভ:** `culture.html#creator-archive` — `data/heritage-creators.json` + `creator-archive.js` + `creator-archive.css`; ৫৪টি ছবিসহ এন্ট্রি, বাংলা/ইংরেজি খোঁজ, অঞ্চল·বিষয়·সম্পর্ক·মিডিয়া ফিল্টার, PDF/অডিও/ভিডিও/বই/শিল্পকর্ম লিংক, উক্তি-যাচাই লেবেল ও লাইব্রেরি-সংযোগ।
- সাইট: https://mithun-mutsuddi.github.io/Bangladesh-Buddhist-Heritage-Map/
- প্রতিষ্ঠাতা: Mithun Mutsuddi · mithunmutsuddi92@gmail.com · WhatsApp +8801882191626
- শুরু: অক্টোবর ২০২৬

---

বাংলাদেশের বৌদ্ধ প্রত্নস্থল, বিহার/প্যাগোডা, তীর্থস্থান, বনবিহার, পালি-শিক্ষা প্রতিষ্ঠান, সামাজিক সেবা, লোকঐতিহ্য এবং বৌদ্ধ সাহিত্যের জন্য বাংলা-ভিত্তিক responsive GitHub Pages site।

## বর্তমান ডিরেক্টরি

- বুদ্ধ স্মৃতিচিহ্ন/জাদী/স্তূপের আলাদা ফিল্টার; আশরফপুর, গোকুল মেধ, মের্হ টিলা বিহার, ঘিলাতলী সার্বজনীন বৌদ্ধ বিহার, শীলছড়ি শান্তি নিকেতন, সিলেট আখালিয়া বিহার ও সংশ্লিষ্ট শ্মশানসহ ৭টি নতুন রেকর্ড যোগ হয়েছে; অনিশ্চিত GPS/পরিচয়/যোগাযোগ যাচাইাধীন চিহ্নিত; অতীশ দীপঙ্কর স্মৃতি কমপ্লেক্স, দমদম পীরস্থান ঢিবি, দলিজহারা বৌদ্ধ বিহার-চৈত্য কমপ্লেক্স ও ঝুড়িঝাড়া ঢিবি যুক্ত। ভরত ভায়নার placeholder-কে উৎস-সমর্থিত রেকর্ডে উন্নীত করা হয়েছে; তার pin-এ আনুমানিকতার সতর্কতা আছে।

- **৩৪৪টি স্বতন্ত্র স্থান/প্রতিষ্ঠান/ঐতিহ্য রেকর্ড** — প্রতিটি নাম ও লিংক দিয়ে আবার খোঁজা যায়।
- বিভাগ, জেলা, উপজেলা, থানা (যেখানে রেকর্ড আছে), ইউনিয়ন ও ক্যাটাগরি ফিল্টার; প্রশাসনিক তালিকা প্রথম ব্যবহারে lazy-load হয়।
- Leaflet marker cache, clustered batch-loading ও loading-overlay fix সহ দ্রুততর ম্যাপ।
- Historical Archive: ছবি/ভিডিও/অডিও/PDF/লিখিত স্মৃতি, ঐতিহাসিক ও ধারণ-তারিখ, আলোকচিত্রী, সংগ্রহকারী, আপলোডকারী, ইতিহাস-বিবরণ এবং ZIP/JSON export.
- স্থান-তালিকায় একবারে ৪৮টি কার্ড দেখিয়ে ধাপে ধাপে লোড করা হয়; community content fetch ম্যাপের প্রাথমিক boot আটকে রাখে না।
- ৭২টি অতিরিক্ত রেকর্ডে মোট ৩২০টির পর, আরও ৩টি উৎস-সমর্থিত শিক্ষা/শিশু-সেবা রেকর্ড যোগ করে মোট ৩২৩টি স্থান/প্রতিষ্ঠান/ঐতিহ্য রেকর্ড: আবুরখীল, রাউজান, রামু/মহেশখালী, বান্দরবান, খাগড়াছড়ি/মহালছড়ি, কুয়াকাটা-পটুয়াখালীসহ বিভিন্ন অঞ্চলের বিহার, প্রত্নস্থান, পালি শিক্ষা ও শিশু-সেবা সংস্থা।
- বৌদ্ধ ক্যানন, জাতক, ধম্মপদ, বুদ্ধবংশ, থেরগাথা/থেরীগাথা, বিমানবত্থু, পেতবত্থু, অট্ঠকথা, দীপবংশ/মহাবংশ, লোককথা ও আধুনিক ফ্যান্টাসি আলাদা করে পরিচয় করানো সাহিত্য বিভাগ।
- ভ্রমণ-রিভিউ form; রিভিউ এই browser/device-এ save হয়, JSON backup/export করা যায়।
- no-code Content Studio: লেখা, ছবি, ভিডিও, অডিও, নতুন স্থান/coordinates, source URL এবং media credit.
- Buddhist sacred saffron-orange theme, bundled AI-generated Buddha hero artwork, Buddhist flag accents, dharma-wheel and lantern animations.

## প্রকাশিত ঠিকানা

Live site: https://mithun-mutsuddi.github.io/Bangladesh-Buddhist-Heritage-Map/
Repository: https://github.com/Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map

GitHub Pages `main` branch-এর `/(root)` থেকে তৈরি হয়। Root-এ `index.html`, `styles.css`, `app.js`, `content-studio.js` এবং `content.json` রাখতে হবে। প্রকল্পের আরেক কপি `buddhist-heritage-bd/` ফোল্ডারেও রাখা আছে।

## কোড না জেনে কনটেন্ট প্রকাশ

1. লাইভ সাইটে **কনটেন্ট যোগ করুন** খুলুন।
2. লেখা/স্থান/ছবি/ভিডিও/অডিও বেছে শিরোনাম, বিবরণ ও source লিখুন। ম্যাপের স্থানের জন্য latitude ও longitude দিন।
3. **খসড়া সেভ করুন** — এটি কেবল বর্তমান browser/device-এ সেভ হবে।
4. **প্রকাশনার ZIP তৈরি করুন** চাপুন এবং ZIP extract করুন।
5. প্রকাশিত `content.json`-কে review করে root repository-তে upload/replace করুন; `assets/uploads/`-এর media files একই path-এ upload করুন; এরপর **Commit changes** দিন।

GitHub Pages static hosting। আলাদা authenticated backend ছাড়া visitor-facing site নিজে থেকে নিরাপদে GitHub repository-তে commit করতে পারে না। কোনো GitHub password/token Content Studio-তে দেবেন না। Local review অন্য সবাই দেখবেন না যতক্ষণ না তা যাচাইসহ প্রকাশিত `content.json`-এ যোগ করা হয়।

## গবেষণা ও সূত্র

- [বাংলাদেশের বৌদ্ধ বিহার/প্যাগোডার তালিকা — বৌদ্ধ ধর্মীয় কল্যাণ ট্রাস্ট](https://brwt.gov.bd/pages/static-pages/6922dbb0933eb65569e0bdb6)
- [ঐতিহাসিক বৌদ্ধ বিহার মানচিত্র, বাংলাদেশ — BD MAPS](https://map-of-bangladesh.blogspot.com/2015/12/historical-buddho-bihar-map-bangladesh.html) (তুলনামূলক গবেষণা সূত্র; ছবিটি তৃতীয় পক্ষের, তাই কপি না করে উৎস-লিংক দেওয়া হয়েছে)
- [চট্টগ্রাম বিভাগ — বৌদ্ধ বিহার/প্যাগোডা তালিকা](https://chittagongdiv.gov.bd/pages/static-pages/6991177b35ce18e1c073d998)
- [কুমিল্লা জেলা প্রশাসন — প্যাগোডা/বিহার তালিকা](https://www.comilla.gov.bd/bn/site/page/0fCN-%E0%A6%AA%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%97%E0%A7%8B%E0%A6%A1%E0%A6%BE)
- [খাগড়াছড়ি জেলা প্রশাসন — বৌদ্ধ বিহার](https://www.khagrachhari.gov.bd/bn/site/page/1xX7-%E0%A6%AC%E0%A7%8C%E0%A6%A6%E0%A7%8D%E0%A6%A7-%E0%A6%AC%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B0)
- [মানিকছড়ি উপজেলা — বৌদ্ধ মন্দির/বিহার তালিকা](https://manikchari.khagrachhari.gov.bd/pages/static-pages/69911a7d35ce18e1c073fbff)
- [বান্দরবান রাজবিলা ইউনিয়ন — বৌদ্ধ মন্দির তালিকা](https://rajbilaup.bandarban.gov.bd/pages/static-pages/699145ba516a96d4de414a07)
- [কক্সবাজার জেলা প্রশাসন — প্যাগোডা তালিকা](https://coxsbazar.gov.bd/pages/static-pages/6991178035ce18e1c073db07)
- [নাটেশ্বর বৌদ্ধ মন্দির ও স্তূপ — মুন্সীগঞ্জ জেলা প্রশাসন](https://www.munshiganj.gov.bd/bn/site/religious_institutes/4rJh-%E0%A6%A8%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B6%E0%A7%8D%E0%A6%AC%E0%A6%B0-%E0%A6%AC%E0%A7%8C%E0%A6%A6%E0%A7%8D%E0%A6%A7-%E0%A6%AE%E0%A6%A8%E0%A7%8D%E0%A6%A6%E0%A6%BF%E0%A6%B0)
- [উয়ারী-বটেশ্বর — প্রত্নতত্ত্ব অধিদপ্তর](https://archaeology.gov.bd/pages/static-pages/6922de61933eb65569e1a41e)
- [মহালছড়ি উপজেলা — বৌদ্ধ বিহার তালিকা](https://mohalchari.khagrachhari.gov.bd/pages/static-pages/69910abb35ce18e1c073907f)
- [বাবুছড়া ইউনিয়ন — বৌদ্ধ বিহার তালিকা](https://babucharaup.khagrachhari.gov.bd/pages/static-pages/69912e1a516a96d4de408ca5)
- [UNESCO — Somapura Mahavihara](https://whc.unesco.org/en/list/322/)
- [World Buddhist Directory — Bangladesh](https://buddhanet.info/wbd/country.php?country_id=40)
- [Pali Text Society — Canon](https://palitextsociety.org/the-books-of-the-pali-canon/) · [Commentaries](https://palitextsociety.org/the-books-of-the-pali-canon-the-commentaries/)
- [SuttaCentral](https://suttacentral.net/) · [Internet Archive](https://archive.org/search?query=Bangladesh+Buddhist+heritage) · [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Buddhist_monasteries_in_Bangladesh)

## জরুরি তথ্য-সতর্কতা

এই ৩২৩টি রেকর্ড **পূর্ণাঙ্গ সরকারি master census নয়**। সরকারি ও স্থানীয় তালিকার দৃশ্যমান নামগুলো থেকে সংগ্রহ চলছে; কিছু জেলা/ইউনিয়নের তালিকা অনেক বড়, কিছু নামের বানান/বর্তমান কার্যক্রম পরিবর্তিত হতে পারে। তাই এটিকে কাজ-চলমান directory হিসেবে বিবেচনা করুন। “সব কিছু বাদ না পড়া” নিশ্চিত করতে প্রতিটি জেলার বিহার/প্যাগোডা তালিকা, স্থানীয় প্রতিষ্ঠান এবং মাঠপর্যায়ের যাচাই ধারাবাহিকভাবে করতে হবে।

- অনেক নতুন গ্রাম/উপজেলা-স্তরের marker আনুমানিক; এগুলোকে মন্দিরের verified entrance GPS ধরে যাত্রা করবেন না। মানচিত্র ও details-এ যেখানে প্রযোজ্য সেখানে এই সতর্কতা দেখানো হয়।
- “সতিমন ডাঙ্গি/সতিমন ঠাকুর” লোকধর্ম-ঐতিহ্যটি **গবেষণাধীন**; নিশ্চিত বৌদ্ধ বিহার বলে ঘোষণা করা হয়নি।
- অনাথালয়/শিশু-সেবা সংক্রান্ত কিছু রেকর্ড প্রকাশ্য তালিকায় আছে; বর্তমান কার্যক্রম/যোগাযোগ আগে নিশ্চিত করুন। নির্দিষ্ট বৌদ্ধ বৃদ্ধাশ্রমের বিশ্বাসযোগ্য বর্তমান directory entry যাচাই করা যায়নি—অনুমান করে কোনো প্রতিষ্ঠান যোগ করা হয়নি।
- ATM, hotel/resort links Google Maps live searches; live list/availability/route guarantee নয়।
- Site uses third-party online map tiles and some externally hosted photos. The bundled Buddha hero is AI-generated illustration, not a documentary photo of a real Bangladesh site.
- User location permission is requested only after a user clicks the location control. Browser-local drafts/reviews are not public until manually reviewed and published.


## ম্যাপের নির্ভরযোগ্যতা ও চিহ্ন

- অনেক স্থানীয় বিহারের সুনির্দিষ্ট প্রবেশদ্বার GPS যাচাই করা যায়নি। এসব রেকর্ডে map pin আনুমানিক হিসেবে দেখানো হয় এবং Google Maps-এ নাম ধরে খোঁজার লিংক খোলে; সরাসরি সেই আনুমানিক কোঅর্ডিনেটে driving directions দেওয়া হয় না।
- বহু মার্কার একে অপরের খুব কাছাকাছি থাকলে Leaflet.markercluster সেগুলোকে গুচ্ছবদ্ধ করে; zoom বাড়ালে পৃথক ধর্মচক্র চিহ্ন দেখা যায়। CDN লোড না হলে ordinary Leaflet marker layer-এ fallback রয়েছে।
- উয়ারী-বটেশ্বর গুরুত্বপূর্ণ প্রত্নস্থল হলেও ব্যবহৃত প্রত্নতত্ত্ব অধিদপ্তর সূত্রে নিশ্চিত বৌদ্ধ বিহার/মন্দিরের দাবি নেই; তাই এটি “বৌদ্ধ-সংযোগ যাচাইাধীন” হিসেবে রাখা হয়েছে।


## সম্প্রসারিত ডিরেক্টরি ও মানচিত্র

- অতিরিক্তভাবে যুক্ত করা যাচাইকৃত প্রাতিষ্ঠানিক রেফারেন্স: World Fellowship of Buddhists directory (মেরুল বাড্ডা আন্তর্জাতিক বৌদ্ধ বিহার/মিরপুর শাক্যমুনি), বনফুল আদিবাসী গ্রীনহার্ট কলেজের নিজস্ব সাইট, ধর্মরাজিকা ট্রাস্ট ফাউন্ডেশন এবং রামপাল ইউনিয়নের বিক্রমপুর বৌদ্ধ বিহার পাতার উল্লেখ।
- ব্যবহারকারী-প্রদত্ত যেসব নামের স্বাধীন উৎস বা সঠিক GPS এখনো মেলেনি, সেগুলো “যাচাইাধীন” হিসেবে আলাদা রাখা হয়; পিন দেখানো হয় না এবং Google Maps-এ নাম ধরে খোঁজার লিংক দেওয়া হয়। এগুলো confirmed/verified site হিসেবে গণ্য করা যাবে না।
- ম্যাপ ২৫০+ এন্ট্রির জন্য marker clustering ব্যবহার করে। পিন এখন গেরুয়া বৃত্তের মধ্যে ধর্মচক্র; cluster-এর আইকনেও ধর্মচক্র ও সংখ্যা দেখায়। clustering plugin বা script ব্যর্থ হলে সাধারণ Leaflet marker layer fallback হিসেবে ব্যবহৃত হয়।


### সর্বশেষ যাচাই-টীকা

- নব শালবন বৌদ্ধ বিহারের সরকারি তালিকাভুক্ত অবস্থান কোটবাড়ি, কুমিল্লা। আলাদা “উত্তরা” রেকর্ডের স্বাধীন সূত্র না পাওয়ায় সম্ভাব্য duplicate/ভুল অবস্থানের এন্ট্রি বাদ দেওয়া হয়েছে।
- “পাহাড়তলী মহামুনি বৌদ্ধ বিহার” বর্তমান মহামুনি রেকর্ডের নাম/সূত্রে একীভূত করা হয়েছে; পাহাড়তলী ইউনিয়নের সরকারি পর্যটন পাতায় অবস্থানের উল্লেখ আছে।
- “বিক্রমপুর রঘুরামপুর বৌদ্ধ বিহার” রামপাল ইউনিয়নের সরকারি পাতার সঙ্গে মিলিয়ে একই রেকর্ডে নাম ও সূত্র সংশোধন করা হয়েছে।
- “বিহার ধাপ” ও “লতিকোট মুড়া” প্রত্নতত্ত্ব অধিদপ্তর/সরকারি সূত্রে উল্লেখ থাকায় যোগ করা হয়েছে। সুনির্দিষ্ট GPS গেট যাচাই না হওয়ায় পিন নেই।
- রংপুর, নীলফামারী ও ময়মনসিংহের জন্য পৃথক স্থান যাচাই হওয়ার আগ পর্যন্ত কেবল বিভাগ/জেলাভিত্তিক গবেষণা-সূচি আছে; এগুলো কোনো নির্দিষ্ট বিহার নয়।


## Historical Archive ও প্রশাসনিক ফিল্টার

- আর্কাইভের খসড়া IndexedDB-তে শুধু এই browser/device-এ সংরক্ষিত হয়; ZIP export-এ metadata ও media থাকে। GitHub Pages নিজে visitor-এর ফাইল public server-এ আপলোড বা repository-তে commit করতে পারে না। প্রকাশের আগে ফাইল review করে commit করুন অথবা GitHub issue-তে জমা দিন।
- বিভাগ/জেলা/উপজেলা/ইউনিয়নের select তালিকা `iqbalhasandev/bangladesh-geo-json`-এর bilingual ওপেন dataset থেকে first-use fetch করে। প্রশাসনিক lookup কোনো ঐতিহ্যস্থানের অবস্থান প্রমাণ করে না; রেকর্ডে সঠিক `upazila`, `thana`, `union` metadata না থাকলে ঐ স্তরে ফল মিলবে না। পৃথক পুলিশ-থানা তালিকা ও per-place locality এখনও যাচাই/সম্প্রসারণাধীন।
- প্রশাসনিক dataset reference: https://github.com/iqbalhasandev/bangladesh-geo-json (MIT license; original source attribution retained here). Historical archive submissions need provenance, copyright/permission, and editorial verification.


## 2026 responsive heritage guide upgrade

A focused implementation is available on branch `feat/heritage-guide-upgrade` and is proposed for review before merging. The original 323-record directory is preserved.

### Included files

- `heritage-enhancements.js` + `upgrade.css`: responsive festival tracker, route planner, local-service Google Maps searches, community correction form, map recovery layer, bilingual SanghaMitra demo and source-aware long-form content UI.
- `data/heritage-sites.json`: normalized JSON export of all 323 directory records, including location coordinates when present, source URLs, category, history, approximate-pin and verification status.
- `data/heritage-seo-bn.json` and `seo-content.js`: Bengali SEO/editorial drafts for all 323 records. Every text targets 200+ whitespace-separated words. Some site-specific records lack enough independent historical evidence, so generated pages are explicitly marked as drafts for human editing; they must not be represented as research-verified articles before editorial review.
- `data/events.json`: Buddhist festivals and lunar/local-date guidance; no fixed Gregorian festival dates are invented.
- `docs/sanghamitra-system-prompt.md`: bilingual heritage chatbot system prompt, supported intents, evidence and safety rules, and example conversation flow.
- `server/sanghamitra_api.py` and `requirements.txt`: optional FastAPI endpoint for server-backed AI. The static site keeps a local rule-based demo and can call the server only when `window.SANGHAMITRA_API_URL` is configured.
- `docs/firestore-schema.json` and `firestore.rules`: Firestore collection design and starter security rules. These are not auto-connected; configure Firebase Auth, Storage rules, App Check, moderator roles and indexes before accepting production submissions.
- `tools/validate_heritage_data.py`: validates unique IDs, coordinate bounds, JSON structure, festival identifiers and SEO coverage.

### Map reliability and what to know

The main map remains Leaflet + OpenStreetMap with Google Maps name search and route links. A recovery layer tries to initialize the map and create markers if the normal map layer is missing; if the Leaflet CDN is blocked it provides a plain search-link fallback. The main page's map initialization is guarded so an unrelated review/itinerary rendering exception does not leave the initial loading overlay behind.

In the current data snapshot, 264 records have numeric coordinates, but most are marked approximate or verification-pending. A marker is not automatically a surveyed entrance GPS. The “my location” control still requires browser permission and HTTPS (or localhost). A map tile or CDN outage may still prevent the interactive basemap from loading even where search links work.

### Local API setup

See [deployment and local development](docs/deployment.md). For a local API, install `requirements.txt`, set `OPENAI_API_KEY` in the shell/environment, then run:

```bash
uvicorn server.sanghamitra_api:app --reload --port 8000
```

Never put provider keys in the public frontend or commit secrets. GitHub Pages serves the static frontend only; deploy the optional Python API separately.

### Validation

From the repository root:

```bash
python tools/validate_heritage_data.py
```

This is a structural check, not a guarantee that each historical claim, GPS coordinate, current opening time, event date, travel route or fee is factually verified. Check the source URL and the relevant site/host authority before publishing.
