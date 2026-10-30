# চর্যাভূমি (Charyabhumi) ☸
**হাজার বছরের পথ ধরে** — বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস ও ভ্রমণের ফ্রি সাইট।

**বাংলার বৌদ্ধ স্থানগুলো নিজে ঘুরে দেখুন — ইতিহাস, পথ আর মানুষের সঙ্গে।**

ফ্রি · সাইন-আপ নেই · বিজ্ঞাপন নেই

## ২০২৬-১০-৩০ (রাউন্ড ২৫): সমান ছবি, রাজাদের প্রতিকৃতি, জনগোষ্ঠী-বিভাগ, ঋদ্ধি-নিষেধের ইতিহাস ও সাইট-জুড়ে ১২px ন্যূনতম

- **“বিভাগের ছবির সাইজ ঠিক হয়নি” — সারানো হলো।** আর্কাইভ ও অলৌকিক-কাহিনির গ্যালারি এবং রাজা/জনগোষ্ঠী কার্ড — সবখানে ছবির অনুপাত এখন **16:10 + object-fit:cover** (মোবাইলে 3:2, এক কলাম); একই বিভাগে সব ছবি সমান আকার, কার্ডের উচ্চতা নিজের মতো (সারি জুড়ে টানাটানি নেই)।
- **“রাজাদের ছবি আসেনি” — এসেছে।** ৩৫ জন রাজা/রাজবংশ-প্রতিষ্ঠাতার প্রত্যেকের `imgKey`; **৩০ জনের প্রতিকৃতি/স্মারক-ছবি** বসানো হয়েছে (অজাতশত্রু, বিম্বিসার, দেবানাম্পিয়তিস্স, মিন্ডন মিন, মোংকুট, শোতোকু, ত্রিসোং দেৎসেন, সিবি-জাতক রিলিফসহ)। বাকি ৫ জন অতিপ্রাচীন/পুরাণ-চরিত্র — কমন্সে নির্ভরযোগ্য ছবি নেই, তাই ছবি বসানো হয়নি।
- **নতুন বিভাগ — ‘বৌদ্ধ জনগোষ্ঠী ও লিপি’** (`buddha-vamsa.html#communities`, ডেটা `data/buddha-vamsa/communities.json`): **২৩টি জনগোষ্ঠী** — বাঙালি বৌদ্ধ (বরুয়া), চাকমা, মারমা, রাখাইন, ত্রিপুরা, তঞ্চঙ্গ্যা, চাক, খুমি-খেয়াং, ম্রো + সিংহলি, বর্মী, থাই, খ্মের, লাও, তিব্বতি, নেওয়ার, মঙ্গোল, জাপানি, কোরিয়ান, ভিয়েতনামি, চীনা, বালিনি, শান-তাই। প্রতিটির **স্ব-নাম, দেশ/অঞ্চল, লিপি ও ইউনিকোড ব্লক, প্রতীক/পতাকা, ইতিহাস ও বৌদ্ধধর্মের ধারা**; ছবি না থাকলে **কেন নেই** তাও লেখা।
- **ঋদ্ধি-বিভাগে নতুন উপবিভাগ — নিষেধ কখন, কেন, কোথায় লেখা:** পালি বাক্য `Na, bhikkhave, gihīnaṃ iddhipāṭihāriyaṃ dassetabbaṃ… dukkaṭaṃ` (চূল্লবগ্গ ৫.৮.২, V 2:110), ৫ ধাপের ঘটনাপঞ্জি (পিণ্ডোল-চন্দনপাত্র → বুদ্ধের নিজের যমক-পাটিহারিয় → কেবট্ট সুত্ত DN ১১ → দেবদত্ত), ৪টি যুক্তি ও ৪টি অনুমোদিত-বিষয়, প্রতিটি ধাপে নির্ভরযোগ্যতার মাত্রা।
- **সাইট-জুড়ে পড়ার-উপযোগিতা:** ১২টি পাতা × ৩ প্রস্থ মেপে **৮১ ধরনের লেখা ১২px-এর নিচে** পাওয়া গেল (tracker-এ ৮px, atlas-এ ১০px, library-তে ১১.৫px) — প্রতিটি স্টাইলশিটে *legibility floor* দিয়ে ন্যূনতম ১২px করা হলো। শেষ মাপে **ছোট লেখা ০, ওভারফ্লো ০, ভাঙা ছবি ০, JS এরর ০**।
- **ছবি আর হটলিংক নয়:** লোকালাইজার এখন রাজা ও জনগোষ্ঠীর ছবিও নামায়; ৪২৯/৪০০ বাগের সমাধান (960px থাম্ব + কুয়েরি বাদ) — **৭৮টি ছবি নিজের সার্ভারে (২২ MB)**, বাকি অডিটে ভাঙা ছবি শূন্য।
- **এক সংখ্যা, এক সূত্র:** `tools/reconcile_counts.py` → `data/counts.json`; `tests/data-counts.test.mjs` সংখ্যা পুরোনো হলে ফেল করে।
- যাচাই: `node --test tests/` **২৬/২৬**, `validate_heritage_data.py` PASS · SW `charyabhumi-v20261030-legibility` · CSS/JS `?v=20261030b` · প্রিভিউ `buddha-vamsa-preview.html` (৬৭৯ KB)।
- CI-তে টেস্ট+counts ধাপ যোগ করার প্যাচ: `docs/patches/2026-10-30-ci-tests-and-counts.patch` (workflow ফাইল বদলাতে *Workflows: RW* লাগে)।

## ২০২৬-১০-৩০ (রাউন্ড ২৪): আসল পোস্টার-ডাকটিকিট-ম্যাচবক্স-ক্যালেন্ডার ছবি, দ্বিতীয় সাইট-অডিট

- **অনেক দিনের প্রশ্নের উত্তর:** পোস্টার-ব্যানার, ডাকটিকিট, ম্যাচবক্স, পুরোনো ক্যালেন্ডার, চলচ্চিত্র-আলোকচিত্র — যেগুলো **আসল ও মুক্ত-লাইসেন্সে** পাওয়া গেল সেগুলো ছবি-সহ বসানো হলো: আফগানিস্তানের বামিয়ান-বুদ্ধ ডাকটিকিট (১৯৩২ ও ১৯৫১), জাপানের কামাকুরা দাইবুৎসু টিকিট (১৯৫৩), ভারতের ১৯৪০-এর ম্যাচবক্স-লেবেল, ‘বুদ্ধ-জয়ন্তী’ ছাপা পোস্টার (লাওস ১৯৫৬), বুদ্ধজয়ন্তীর ছাপা পতাকা (থাইল্যান্ড ২০১২), থাই ১৯৪১ পঞ্জিকা, ‘প্রেম সন্ন্যাস’ (১৯২৫) চলচ্চিত্র-আলোকচিত্র, দিল্লির বুদ্ধ-দেবালয় (১৯৫২)। প্রতিটির নিচে লেখক · লাইসেন্স · উৎস।
- **নতুন টুল** `tools/localize_buddha_vamsa_images.py` — কমন্সের ছবি নিজের `assets/buddha-vamsa/`-এ নামায়, কারণ এক পাতায় ১৫টি ছবি চাইলে উইকিমিডিয়া ৪২৯ দেয় (ব্রাউজারে `ERR_BLOCKED_BY_ORB`)। ৭টি ছবি এখন লোকাল।
- **নতুন বাগ-ফিক্স:** ছবি একবার ব্যর্থ হলে চিরতরে ‘লোড হয়নি’ হয়ে যেত → এখন একবার রিট্রাই।
- **দ্বিতীয় ডাবল-এন্ট্রি সংশোধন:** ছাপা পোস্টার-ব্যানার এখন শুধু আর্কাইভে; মিডিয়া = ‘চলচ্চিত্র, চলচ্চিত্র-পোস্টার ও ঐতিহাসিক আলোকচিত্র’। টেস্টে জোরালো যাচাই যোগ।
- **সাইট-জুড়ে পাঠযোগ্যতা:** atlas / library / history-এ ফোনে ৯px লেখা (১২৫টির মতো জায়গা) ছিল → সাইট-বিস্তৃত ন্যূনতম ১২px; দশটি পাতায় এখন শূন্য। ওয়েলকাম-ডায়ালগ ১০২৪px-এর নিচে আর স্বয়ংক্রিয় নয়।
- যাচাই: ৩৯০/৭৬৮/১৪৪০px × ১০ পাতা — overflow ০, নেভ ৪৫ লিংক, ছোট লেখা ০, JS এরর ০ · `node --test` ২৩/২৩ · `validate_heritage_data.py` PASS · SW `charyabhumi-v20261030-images`।

## ২০২৬-১০-২৯ (রাউন্ড ২৩): ঋদ্ধি-অনুসন্ধান, ডাবল-এন্ট্রি সংশোধন ও পুরো সাইট-অডিট

- **নতুন বিভাগ — ‘ঋদ্ধি, অভিজ্ঞা ও অলৌকিকতা’** (`buddha-vamsa.html#riddhi`, ডেটা `data/buddha-vamsa/riddhi.json`): বুদ্ধ ও শিষ্যদের **৬টি অভিজ্ঞা/ক্ষমতা** (ঋদ্ধি-বিধা, দিব্বসোত, চেতোপরিয়ঞাণ, দিব্বচক্খু, পুব্বেনিবাসানুস্সতি, আসবক্খয়) — প্রতিটির **নাম, বিবরণ, কে, কোথায়, কখন ও পালি সূত্র**; সঙ্গে **১৩টি অলৌকিক-কাহিনি** (যমক-পাটিহারিয়, সংকস্স অবতরণ, আমবৃক্ষমূল, পিণ্ডোল ভারদ্বাজ, চূলপন্থক, দেবদত্ত, মহামোগ্গল্লান, অনুরুদ্ধ, উপ্পলবণ্ণা, মহিন্দ, অশোকের ধাতু-বিতরণ, পদ্মসম্ভব, মিলারেপা) — প্রতিটির **স্থান, সময়, কে, পুরো বিবরণ ও সতর্কতা**। শাস্ত্রে লেখা বিশ্বাস ও ঐতিহাসিক প্রমাণ আলাদা করে দেখানো হয়েছে।
- **ডাবল-এন্ট্রি সংশোধন (এক বিষয় = এক বিভাগ):** অশোক, দশরথ ও কনিষ্কের পূর্ণ প্রোফাইল এখন কেবল `data/heritage-kings.json`-এ (সেখানেই তাঁদের প্রথম এন্ট্রি ছিল); `buddha-vamsa/kings.json`-এ তাঁরা আর নেই — শুধু ‘লিংকড প্রোফাইল’ কার্ড, যা `kings.html?id=…`-এ নিয়ে যায়। ফলে ভবিষ্যতে একই রাজার তথ্য দুই ফাইলে দুই রকম হওয়ার ঝুঁকি নেই (`heritage-kings.json` → schema v6, নতুন `crossPage` ফিল্ড)। শালবন, বিক্রমপুর ও পাহাড়পুরের তীর্থ-এন্ট্রিতে `siteRecord` যোগ করে মূল ডিরেক্টরির সঙ্গে যুক্ত করা হয়েছে — কপি নয়।
- **পোস্টার/ডাকটিকিট/খাম/ম্যাচবক্স/ক্যালেন্ডার প্রশ্নের উত্তর:** নতুন ৬টি আর্কাইভ-এন্ট্রি (মঙ্গোলিয়া ও তাজিকিস্তানের বুদ্ধ-টিকিট, Drukpa প্রথম-দিন-আচ্ছাদন, ম্যাচবক্স-লেবেল, থাই ১৯৪১ পঞ্জিকা, বাংলার পুরোনো পঞ্জিকা) — **যেখানে মুক্ত ছবি পাওয়া গেছে সেখানে ছবি + লেখক + লাইসেন্স + উৎস**, আর যেখানে ছবি সংগঠন/সংগ্রাহক/স্টুডিওর কপিরাইট সেখানে **ছবি বসানো হয়নি**, শুধু ‘কোথায় আছে, কার অনুমতি লাগবে’ লেখা। মোট আর্কাইভ-এন্ট্রি ১৪ → **২০**।
- **ট্র্যাকার পাতার ডিজাইন মিলিয়ে দেওয়া:** `tracker.html` এখন সাইটের সাধারণ হেডার-নেভিগেশন (`brand.js`) ব্যবহার করে, `lang="bn"` ও চর্যাভূমি প্যালেট/ফন্ট; নতুন `tracker-site.css`। মোবাইলে আগে সাইডবার ৬১px বটম-বারে সেঁটে যেত, ব্র্যান্ড ও চতুর্থ ভিউ (‘ভ্রমণসঙ্গী’) লুকিয়ে যেত — এখন **সব ভিউ + ‘হোম’ লিংক + সেটিংস + সংঘমিত্র** এক সারিতে, অনুভূমিক স্ক্রলসহ। ৫–৯px লেখা ন্যূনতম ১২px করা হয়েছে।
- **ফোনে বুদ্ধের ছবি আর কাটা পড়ে না:** `≤620px`-এ হিরো এখন দু-ভাগ — উপরে ছবির পুরো ব্যান্ড (`58vw`), নিচে লেখা; মূর্তি সম্পূর্ণ দেখা যায়।
- **‘বিভাগ দেখা যায় না’ সমস্যার কারণ ও সমাধান:** প্রথম-দর্শনের পূর্ণ-পর্দার ওয়েলকাম-ডায়ালগ মোবাইলে হোমপেজ ঢেকে দিত — ছোট পর্দায় আর নিজে থেকে খোলে না (`?welcome=1` বা বোতামে চাইলে খোলে)। সঙ্গে নেভিগেশনের ৪৪টি গন্তব্যের সব ফাইল विद্যমান যাচাই করা হয়েছে।
- **অডিট:** playwright দিয়ে ৩৯০×৮৪৪ ও ১৪৪০×৯০০-এ index / buddha-vamsa / tracker — অনুভূমিক ওভারফ্লো ০, হেডার-নেভ ৪৫টি লিংক সবখানে, কোনো JS এরর নেই, ছোট লেখা ০ (ট্র্যাকারেও)। `node --test` ২৩/২৩ পাস, `tools/validate_heritage_data.py` PASS, `node --check` সব পাস, স্ট্যান্ডঅ্যালোন প্রিভিউ (৫৬৯ KB) অফলাইনেও চলে।
- বাগ-সংশোধন: হিসাব-পটে ধম্মপদ ‘০’ দেখাচ্ছিল (ভুল স্টেট-কি) — এখন ২২; স্ট্যান্ডঅ্যালোন-বিল্ডার ভার্সন-স্ট্রিং বদলালেই চুপচাপ ডেটা বাদ দিচ্ছিল → এখন ভার্সন-নিরপেক্ষ মিল ও `assert`; `riddhi` যুক্ত ছবি-ফেচারে; `images.json` schema v2।

## ২০২৬-১০-২৯: নতুন বিভাগ — বুদ্ধবংশ ও বিশ্ব বৌদ্ধ রাজবংশ (রাউন্ড ২২)

- **নতুন পাতা `buddha-vamsa.html`** (নেভিগেশনে ‘ইতিহাস ও ঐতিহ্য → বুদ্ধবংশ ও রাজবংশ’)। সাতটি নতুন ডেটাসেট `data/buddha-vamsa/`-এ: **৩৫টি রাজবংশ, ৩৮ জন রাজা-শাসক, ১৬টি জাতক, ২২টি ধম্মপদ/উক্তি, ২০টি শিলালিপি-দলিল, ৪৩টি তীর্থস্থল, ২৭টি প্রতিমা, ৮১টি সাংস্কৃতিক এন্ট্রি, ১৪টি আর্কাইভ-নথি ও ১৫টি চলচ্চিত্র-আলোকচিত্র**।
- **বুদ্ধের বংশতালিকা** (`lineage.json`): পিতা-পক্ষ (মহাসম্মত → ওক্কাক → … → সুদোধন → বুদ্ধ) ও মাতা-পক্ষ (অঞ্জন → মায়া ও মহাপজাপতি → যশোধরা → রাহুল), সঙ্গে SVG বংশছক। **‘এখন পর্যন্ত’ অংশে সৎ সিদ্ধান্ত** — বুদ্ধের কোনো যাচাইযোগ্য জৈবিক ধারা প্রমাণিত নয়; চারটি স্তর আলাদা করা হয়েছে (জৈবিক / কুল-দাবি / ধম্মবংশ / সাংস্কৃতিক)। শাক্য-দাবিদারদের তালিকাও ‘অযাচাইকৃত’ লেবেলসহ।
- **জাতক-রাজা ও ঐতিহাসিক শাসক এক ছাদের নিচে, কিন্তু মিশিয়ে নয়:** প্রতিটি কার্ডে নির্ভরযোগ্যতার ব্যাজ — ঐতিহাসিক / মিশ্র / জাতক-জনশ্রুতি। বাংলাদেশের ১১১ জন রাজা-জমিদারের পুরোনো তালিকার সঙ্গে ক্রস-লিংক।
- **চার্ট:** গ্যান্ট-সময়রেখা (রাজবংশের স্থায়িত্ব), অক্ষাংশ-দ্রাঘিমা ভৌগোলিক বিন্যাস, অঞ্চল-দেশ-নির্ভরযোগ্যতা-শতাব্দী — চারটি SVG চার্ট, কোনো বাইরের লাইব্রেরি ছাড়া।
- **শিলালিপি:** লুম্বিনী, নিগালি সাগর, ভাব্রু, গির্নার, মাস্কি, সান্নতি, নাসিক, নাগার্জুনকোণ্ডা, গান্ধারী পাণ্ডুলিপি, অশরফপুর ও মৈনামতীর তাম্রশাসন, কুথোদো, সম্যের লিপি, রাম খামহেং — প্রতিটির ‘লেখা’ বাংলায় সারমর্মসহ।
- **ছবি:** উইকিমিডিয়া কমন্স থেকে ১৩৫টি ছবি স্বয়ংক্রিয়ভাবে আনা হয়েছে (`tools/fetch_buddha_vamsa_images.py`), প্রতিটির লেখক-লাইসেন্স-উৎসসহ (`data/buddha-vamsa/images.json`)। কোনো ছবি না মিললে ‘ছবি পাওয়া যায়নি’ লেখা থাকে।
- **আর্কাইভ-প্রমাণ:** ডাকটিকিট, মঠ-মোহর, তারবার্তা, দাক-রশিদ, খাম ও আর্কাইভ-সংগ্রহ — যেখানে কপিরাইট বা অনিশ্চয়তা আছে সেখানে ছবির বদলে ‘যাচাই কীভাবে করবেন’ লেখা।
- নতুন ফাইল: `buddha-vamsa.html`, `buddha-vamsa.js`, `buddha-vamsa.css`, `tools/fetch_buddha_vamsa_images.py`, `tests/buddha-vamsa-data.test.mjs` · ডকুমেন্ট: `docs/update-2026-10-29-buddhavamsa-bn.md` · SW `charyabhumi-v20261029-buddhavamsa`।

## ২০২৬-১০-২৭: সংঘ-সূত্র অনুসন্ধান, নতুন রাখাইন ভিক্ষু ও জাদুঘর-খোঁজ (রাউন্ড ২১)

- **৮৬ → ৮৭ এন্ট্রি।** নতুন **ভদন্ত উঃ ছেকাচারা মহাথের** (২২ ডিসে ১৯২৫ – ২৬ এপ্রিল ২০২৬, ১০০/১০১ বছর) — রামু শ্রীকুল পুরাতন রাখাইন বৌদ্ধ বিহারের অধ্যক্ষ; ১৯৪২ শ্রামণ্য, ১৯৫৬ আকিয়াবের বেইচিং বিহারে উপসম্পদা, ১৯৮৮-এ রামুতে প্রত্যাবর্তন; ৭–৮ মে ২০২৬ রাখাইন রীতির (ছে কাং, এয়াইং-আলং, তালাং) অন্ত্যেষ্টিক্রিয়ার নথিভুক্ত বিবরণ।
- **রাখাইন এন্ট্রি এখন ৬টি।** সংঘরাজ ভিক্ষু মহাসভার **সদস্য-তালিকা অনলাইনে নেই** — শুধু সংঘরাজ/উপসংঘরাজ নির্বাচনের সংবাদ; তাই ওই তালিকা থেকে নাম তোলা যায়নি। পাওয়া গেল স্থানীয় সংবাদপত্র ‘আমাদের রামু’-র জীবনী-প্রতিবেদন। সারমিত্র/সত্যপ্রিয় মহাথেরের সম্প্রদায়-পরিচয় নিশ্চিত নয় বলে তাঁদের এন্ট্রি করা হয়নি — কারণ লেখা আছে।
- **প্রিনছা খে ও মুক্তিযুদ্ধ জাদুঘর:** জাদুঘরের সাইটে নামভিত্তিক অনলাইন সার্চ নেই, ‘রাখাইন’/‘প্রিনছা’ লিখে কোনো নথি মেলে না; রেকর্ডে যোগ হলো আর্কাইভ-অনুসন্ধানের ফল ও যোগাযোগ-পথ (ইমেইল/ফোন)।
- মুদ্রিত সূত্র-তালিকা (কক্সবাজারের ইতিহাস ২০২৪, সংঘরাজ ভিক্ষু মহাসভার সম্মেলন-স্মারক, বিহার-ইতিহাস পুস্তিকা): `docs/research-2026-10-27-rakhain-sources-bn.md` · SW `charyabhumi-v20261027-rakhain21`।

## ২০২৬-১০-২৭: উক্যচিং মারমার সেক্টর-বিতর্ক, তিন রাখাইন ব্যক্তিত্ব ও সময়রেখার ঘনত্ব (রাউন্ড ২০)

- **৮৩ → ৮৬ এন্ট্রি।** রাখাইন সম্প্রদায় **২ → ৫**: **এথিন রাখাইন** (সাবেক সংসদ সদস্য, শিক্ষাবিদ), **অগ্গমেধাবী ভিক্ষু** (১৬৬৬-এ ‘অং খ্যেং থা’ জনপদের পত্তন — কক্সবাজারের আদি নাম) ও **প্রিনছা খে** (১৯৭১-এ রাখাইন বীরঙ্গনা; একক-সূত্র, স্পষ্ট সতর্কতা-লেবেলসহ)।
- **উক্যচিং মারমা — ‘সেক্টর ৬ বনাম ১১’ নিষ্পত্তি:** ডেইলি স্টার, বাংলা উইকিপিডিয়া ও পরীক্ষা-তালিকা ৬ নম্বর সেক্টর লেখে; প্রথম আলোর মৃত্যুর সংবাদে ১১ লেখা। তাঁর যুদ্ধক্ষেত্র (হাতীবান্ধা, ভূরুঙ্গামারী, রৌমারী, চৌধুরীহাট) ৬ নম্বর সেক্টরের এলাকা—তাই ৬ প্রধান, ১১ টীকায়; দুই সূত্রই সংরক্ষিত। সঙ্গে ২৭ মার্চ ও ১৩ নভেম্বরের অপারেশন-বিবরণ ও ২ নতুন সূত্র।
- **সময়রেখা ঘন:** ৩৪টি এন্ট্রিতে **৫৬টি নতুন পদ** (প্রকাশ-সাল, পাণ্ডুলিপি-আবিষ্কার, চলচ্চিত্র-প্রেক্ষাপট, অনুবাদ-প্রকাশ); সব সময়রেখা এখন বছর → মাস → দিন ক্রমে পুনর্বিন্যস্ত। মোট **৫৪৪টি** পদ, গড়ে ৬.৩/এন্ট্রি। ৬ পদের কম ১৪টিতে জাল তারিখ বসানো হয়নি — কারণ লেখা আছে।
- ৩টি নতুন নিজস্ব SVG প্লেট (SHA-256 সব আলাদা) · বিস্তারিত: `docs/update-2026-10-27-rakhain-sector20-bn.md` · SW `charyabhumi-v20261027-rakhain20`।

## ২০২৬-১০-২৭: বিপ্লবী ও মুক্তিযুদ্ধ বিভাগ, ৫৪ এন্ট্রির মানোন্নয়ন ও আদিবাসী ব্যক্তিত্ব (রাউন্ড ১৯)

- **৭২ → ৮৩ এন্ট্রি।** পুরোনো **৫৪টি** এন্ট্রির প্রতিটিতে নতুন করে লেখা **সময়রেখা (৩–৭টি তারিখসহ ঘটনা)**, যাচাই-নোট ও **৫৪টি নতুন ইন্টারনেট-সূত্র (URL)** যোগ—প্রতিটি লিংক HTTP 200 যাচাই করা। এখন ৮৩টি এন্ট্রিতেই সময়রেখা আছে; পুরোনো কোনো তথ্য মোছা হয়নি, তাই পুনরাবৃত্তি বা তথ্য-ক্ষতিও নেই।
- **নতুন বিভাগ ⚑ ‘বিপ্লবী ও মুক্তিযুদ্ধ’** — `culture.html`-এ আলাদা ফিল্টার-ব্লক ও সেকশন, দুই উপ-শাখা: **ব্রিটিশবিরোধী আন্দোলন (৭)** ও **১৯৭১-এর মুক্তিযুদ্ধ (৫)**; আলাদা ব্যক্তি **১০** (দুইজন দুই শাখাতেই)।
- **নতুন ১১টি এন্ট্রি:** ব্রিটিশবিরোধী — ধীরেন্দ্রলাল, রোহিণীরঞ্জন, নিরঞ্জন, মহেশচন্দ্র ও মহেন্দ্রলাল বড়ুয়া; ১৯৭১ — **ইউ. কে. চিং (উক্যচিং মারমা, বীর বিক্রম)**, **বাগ্মীশ্বর বড়ুয়া** ও **ভিক্ষু জিনানন্দ**; আদিবাসী — **উ পঞ্ঞা জোত মহাথের** (মারমা), **রানি ইয়েন ইয়েন** ও **ভদন্ত উ কুইন্দা মহাথের** (রাখাইন)।
- **ছবি:** ১১টি নতুন নিজস্ব SVG প্লেট (মশাল ও পাহাড় মোটিফ), key-ভিত্তিক অনন্য অলংকরণ; কোনো ভিন্ন ব্যক্তির ছবি ব্যবহৃত হয়নি। **quote স্কিমা** `{textBn, attribution, caution, status}`-এ সংশোধিত।
- বিস্তারিত: `docs/update-2026-10-27-movement-section-bn.md` · SW `charyabhumi-v20261027-movement19`।

## ২০২৬-১০-২৭: বিপ্লবী জীবন, ১৯৭১ ও তিন নতুন ব্যক্তিত্ব (রাউন্ড ১৮)

- **৬৯ → ৭২ এন্ট্রি।** নতুন পৃষ্ঠা থেকে ডাঃ সামন্ত ভদ্রের রেকর্ডে যোগ হলো — **§১০ বিপ্লবী জীবন** (মাস্টারদা সূর্য সেনের ‘বিপ্লবী দল’, সহযোদ্ধাদের তালিকা) এবং **§১১ ১৯৭১** (পোড়া পাহাড় অপারেশন, দুই ভাইয়ের সঙ্গে ভারতে প্রশিক্ষণ, আগরতলায় অন্নসত্র ও চিকিৎসা)। পুণ্যজ্যোতি ভিক্ষুর রেকর্ডেও প্রশিক্ষণ-তথ্য যোগ।
- **নতুন তিনজন:** **প্রতিভা মুৎসুদ্দি** (শিক্ষাবিদ ও ভাষা সংগ্রামী, একুশে পদক ২০০২), **সুকুমার বড়ুয়া** (‘ছড়াসম্রাট’, ১৯৩৮–২০২৬, একুশে পদক ২০১৭), **সুব্রত বড়ুয়া** (বিজ্ঞানলেখক, একুশে পদক ২০১৮)।
- **আসল ছবি ২টি** নতুন (Wikimedia Commons, CC BY-SA); সুব্রত বড়ুয়ার জন্য প্রতীকী SVG — এবং কার্ডে স্পষ্ট নোট, কেন তাঁকে ‘বিজ্ঞানী’ নয় বরং ‘বিজ্ঞানলেখক’ বলা হয়েছে।
- **ইঞ্জিন:** `creator-archive.js`-এ bold-text রেন্ডারিং (`**…**` → `strong`)।
- বিস্তারিত: `docs/update-2026-10-27-revolutionary-life-bn.md` · SW `charyabhumi-v20261027-people18`।

## ২০২৬-১০-২৭: পূর্ণাঙ্গ জীবনী, আদিবাসী বৌদ্ধ ব্যক্তিত্ব ও বিদেশি পরিব্রাজক (রাউন্ড ১৭)

- **৬৫ → ৬৯ এন্ট্রি।** পাঁচ পারিবারিক ব্যক্তিত্ব (সামন্ত ভদ্র, সম্বোধি, পুণ্যজ্যোতি, তিরতন, রোহিণী) PDF-এর সব পৃষ্ঠা পড়ে সম্পূর্ণ নতুন করে লেখা; সঙ্গে ৩ নতুন আদিবাসী/বাঙালি বৌদ্ধ ব্যক্তিত্ব—**সাধনানন্দ মহাস্থবির (বনভান্তে)**, **রাণী কালিন্দী**, **কৃপাশরণ মহাস্থবির**, **বিশুদ্ধাচার মহাস্থবির**।
- **ভুল সংশোধন:** সারমেধ মহাস্থবিরের কাল ‘বিংশ শতক’ → **১৮০১–১৮৮২**; জ্ঞানশ্রী মহাথের **১৯২৫–২০২৫** (প্রয়াণ ১৩ নভেম্বর ২০২৫), ২০২০-এ ত্রয়োদশ সংঘরাজ, ২০২৩-এ ‘অগ্রমহাপণ্ডিত’; অগ্রবংশ মহাথেরের প্রয়াণ ৫ জানুয়ারি ২০০৮।
- **বিদেশি তিন পরিব্রাজকের বাংলা-অবদান:** তাম্রলিপ্তিতে ফা-হিয়েনের দুই বছর ও ২২/২৪ বিহার; হিউয়েন সাংয়ের পুণ্ড্রবর্ধন-সমতট-তাম্রলিপ্তি-কর্ণসুবর্ণের সংখ্যা; ই-ৎসিংয়ের চীন মন্দির, ৫৬ চীনা ভিক্ষু ও বিহার-হ্রাস (৫–৬)।
- **নতুন UI:** বিস্তারিত প্যানেলে **⏳ সময়রেখা** (এতদিন `timeline` ডেটা অদৃশ্য ছিল)।
- **আসল ছবি ২টি** (Wikimedia Commons, CC BY-SA 3.0 ও 4.0): অগ্রবংশ মহাথের ও বনভান্তে; বাকিদের নিজস্ব প্রতীকী SVG, ক্যাপশনে স্পষ্ট “প্রতীকী প্রতিকৃতি”।
- বিস্তারিত: `docs/update-2026-10-27-people-complete-bn.md` · SW `charyabhumi-v20261027-people17`।

## ২০২৬-১০-২৭: নির্মাতা-আর্কাইভে ১১ জন নতুন মানুষ (রাউন্ড ১৬)

- **৫৪ → ৬৫ এন্ট্রি** — মালিকের দেওয়া `জীবনকাহিনি.pdf` থেকে ৫ জন (ডাঃ সামন্ত ভদ্র ভিক্ষু ১৯২১–২০০০, সম্বোধি মহাস্থবির 'কবিবর', পুণ্যজ্যোতি ভিক্ষু, তিরতন শরণ মুৎসুদ্দী, রোহিণী রঞ্জন মুৎসুদ্দী), বাংলাদেশের আদিবাসী-বৌদ্ধ ঐতিহাসিক ৩ জন (রাজগুরু অগ্রবংশ মহাথের, জ্ঞানশ্রী মহাথের, সারমেধ মহাস্থবির) এবং বিদেশি তীর্থযাত্রী ৩ জন (ফা-হিয়েন, হিউয়েন সাং, ই-ৎসিং)।
- **ছবি:** ডাঃ সামন্ত ভদ্র মুৎসুদ্দীর পারিবারিক আলোকচিত্র (অনুমতিসহ) + তিন তীর্থযাত্রীর পাবলিক-ডোমেইন প্রতিকৃতি; বাকি ৭ জনের জন্য **নিজস্ব প্রতীকী SVG প্লেট** — ভিন্ন কারও ছবি বসানো হয়নি, কার্ডেই লেখা “প্রতীকী প্রতিকৃতি”।
- **দ্বৈত-নিয়ন্ত্রণ:** id + normalize-করা নাম + ছবির SHA-256 — তিন স্তরে ডুপ্লিকেট আটকানো; বিল্ড idempotent।
- **ইঞ্জিন:** `creator-archive.js` এখন `assets/…` আপেক্ষিক ছবি দেখায় এবং লোকাল ছবি ব্যর্থ হলে অন্য সাইটে ফাইল খোঁজে না।
- বিস্তারিত: `docs/update-2026-10-27-creator-people-bn.md` · SW `charyabhumi-v20261027-people16`।

## ২০২৬-১০-২৭: উৎসব ও লোকসংস্কৃতি phase (রাউন্ড ১৩)

- **নতুন ৪ বিভাগ / ১৫ এন্ট্রি / ১৫ ছবি-কী** — `data/heritage-culture.json` এখন **৮ বিভাগ, ৪৩ এন্ট্রি**:
  প্রবারণা → কঠিন চীবর → কল্পতরু; জল-নৌকা-আলোর আচার (কল্পজাহাজ/তরি, প্রদীপ-ফানুস, জল খেলা, ফুল-প্রদীপ ভাসানো);
  নৃত্য ও খেলা (পাংখো, ময়ুর, বিজু, গরাইয়া, বাঁশ খেলা, ঘিলা-বৌচি-পিঠা); এবং **কল্পতরু / কল্পজাহাজ / ফানুস / ড্রাগন মহারথ বানানোর নিয়ম**।
- **সচল চিত্র:** নতুন `culture-fest-anim.js` — ৭টি ইনলাইন-SVG অ্যানিমেশন (বাইরের ছবি/লাইব্রেরি ছাড়াই), `prefers-reduced-motion` মানে।
  ছবি: `assets/culture-2026/` — ১০টি নিজস্ব ইলাস্ট্রেশন + `svgs/` এ ৫টি রেখাচিত্র।
- **হোমে সেতু:** “আপনার পরবর্তী গন্তব্য খুঁজুন” অংশে 🪔 উৎসব-বিভাগের ৭টি সরাসরি লিংক-চিপ (`index.html`, `culture-2026.css`)।
- **সূত্র:** মালিকের দেওয়া `Kolpotoru.pdf` (পুস্তিকা, পৃ. ১৭৩–১৭৫) `assets/docs/kolpotoru-kathin-chibar.pdf` নামে সংরক্ষিত ও উদ্ধৃত;
  বাকি তথ্য সংবাদ/সংস্থান-লিংকসহ প্রতিটি এন্ট্রির নিচে। রেপোর দুটি প্রত্নতত্ত্ব-ব্রোশিওর আগেই সাইটে ছিল — নতুন করে কিছু যোগ করা হয়নি।
- **দ্বৈত-নিয়ন্ত্রণ:** বিল্ড-স্ক্রিপ্ট id/title/image-key সংঘর্ষে বন্ধ হয়; ২০টি এন্ট্রিতে `dedupe` নোট; নতুন↔পুরোনো `see_also` ক্রস-লিংক।
- বিস্তারিত: `docs/update-2026-10-27-culture-festivals-bn.md` · SW `charyabhumi-v20261027-culture13`।

## ২০২৬-১০-২৪: মেগা ফিচার phase (GIS · ভ্রমণ · জ্ঞানকোষ · গবেষণা · কমিউনিটি)

- **নতুন ৭টি পাতা:** `explore3d.html` (Street View/Earth/KML/Timelapse/Lens), `travel-planner.html` (রুট, ৫ থিম-ভ্রমণসূচি, বাজেট ক্যালকুলেটর), `knowledge.html` (ব্রাহ্মী-সিল-চর্যাপদ-৩১ ভূমি-মুদ্রা জ্ঞানকোষ), `research.html` (Scholar গেটওয়ে ও পরিভাষা অভিধান), `community.html` (শব্দ-পরিবেশ ও ভ্রমণ-খসড়া), `support.html` (নিরাপদ দান গাইড), `heritage-lab.html` (বিশ্ব-তুলনা ও ডিজিটাল সার্টিফিকেট)।
- **আপডেট:** হোমে `#mega-hub` ও per-card ম্যাপ-টুল, ক্যালেন্ডারে স্বয়ংক্রিয় উৎসব-তারিখ (পঞ্জিকা-ইঞ্জিন, ±১ দিন দাবিত্যাগসহ), শিশুপাতায় XP/ব্যাজ/ট্রেজার-হান্ট/ডিগ/পেপার-ক্র্যাফট, সংঘমিত্রে ১৫+ নতুন বিষয় + Gemini সার্ভার-প্রোভাইডার, PWA (install/offline)।
- **ডেটা:** নতুন ৬টি JSON (`heritage-knowledge`, `travel-plus`, `research-plus`, `support-config`, `festivals-auto`, `games-plus`) — ফাইল বদলালেই পাতা আপডেট। কোনো API key ছাড়াই চলে; কী শুধু সার্ভারে (`GEMINI_API_KEY`/`OPENAI_API_KEY`)।
- **সততা-নীতি:** বানানো দান-নম্বর/দাগ-গেজেট নম্বর/ভিডিও আইডি নেই — যাচাইকৃত তথ্য না পেলে ঘর খালি ও নির্দেশনাসহ।
- বিস্তারিত: `docs/update-2026-10-24-mega-features-bn.md` · টেস্ট: `tests/mega-features.spec.cjs` (১২টি)।
- **পর্যায় ২ (একই দিন):** `orientation.html` (আর্কিও-অ্যাস্ট্রোনমি ও মণ্ডল জ্যামিতি), `restoration.html` (অ্যানাস্টাইলোসিস-সত্যতা ও ১৮৮২ বনাম আজ), `corridors.html` (আন্তঃসীমান্ত বৌদ্ধ করিডোর মানচিত্র), `offline.html` (অফলাইন প্যাক/PWA); ডেটা `data/orientation-heritage.json`; SW `mega3`। বিস্তারিত: `docs/update-2026-10-24-orientation-corridors-bn.md` · টেস্ট: `tests/orientation-phase.spec.cjs` (১০টি)।
- **পর্যায় ৩ (একই দিন):** ভরত ভায়না (কেশবপুর, যশোর) ব্রোশিওরের সব তথ্য + ৮টি ছবি + PDF স্থান-কার্ডে; সারা-সাইট ডেটা অডিট (ডুপ্লিকেট/ভাঙা পথ ০); Leaflet স্থানীয় vendor + ৩ টাইল-ফলব্যাক (ম্যাপ মেরামত); দান-লিংকে স্থানের নাম; শিশু বিভাগে মেমরি ম্যাচ ও ভরত ক্রুশ রঙ-করা; কার্ড reveal অ্যানিমেশন; SW `mega4`, অ্যাসেট `20261024h`। বিস্তারিত: `docs/update-2026-10-24-bharat-phase3-bn.md` · টেস্ট: `tests/bharat-phase.spec.cjs` (৪টি)।
- **পর্যায় ৪ (একই দিন):** জ্ঞানকোষে ৩ নতুন ট্যাব — ধর্ম-ধারা (থেরবাদ/মহাযান/বজ্রযান/সহজযান/মন্ত্রযান/তন্ত্রযান), থের-থেরী-অরহন্ত ও প্রধান শিষ্য-তালিকা, দানের প্রকার ও ফল; প্রাণী·দেবতা·পৌরাণিক কাহিনীর ২১ কার্ড; বিশ্ব বৌদ্ধ ম্যাপ (Pew ২০২০ জনসংখ্যা, সংখ্যাগরিষ্ঠ ৭ দেশ, সাংবিধানিক মর্যাদা, ১০ মূর্তিশৈলী); সংঘমিত্রে ৭ নতুন উত্তর; শিশু কুইজে ৪ প্রশ্ন ও ওয়ার্কশিট ৬; ডেটা `data/knowledge-plus.json`; SW `mega5`। বিস্তারিত: `docs/update-2026-10-24-knowledge-phase4-bn.md` · টেস্ট: `tests/knowledge-plus.spec.cjs` (৪টি)।

## নতুন: Charjavumi Travel Tracker

`tracker.html` — ৬৪ জেলার ইন্টারঅ্যাকটিভ ম্যাপ, বিদ্যমান ৩২১৮টি ডিরেক্টরি রেকর্ডের ভিজিট-চেকলিস্ট, ব্যক্তিগত ছবি/ভিডিও জার্নাল, অনুমতিভিত্তিক foreground GPS রুট, PNG/JPG progress card এবং backup/restore। মূল সাইট অক্ষত; হোমপেজ ও নেভিগেশনে ট্র্যাকার লিংক যোগ করা হয়েছে।

ডেটা এই ব্রাউজারেই থাকে। Cloud sign-in/live buddies চালু নয়। স্থানীয় সংঘমিত্র উৎসভিত্তিক গাইড; optional online AI ও scoped-token STDIO MCP server আলাদা করে configure করতে হবে। MCP imported snapshot ব্যবহার করে, browser sync নয়।

[বাংলায় শুরু করুন](START-HERE-bn.md) · [Deployment & MCP](docs/tracker-deployment.md) · [Tests](docs/tracker-validation.md) · [Attributions](docs/tracker-attributions.md)

## ২০২৬-১০-২৪: Public archive, upazila ও language phase

- **Public Historical Archive:** `historical-archive.html` + `data/historical-archive.json` — Buddha, Buddhism, Bengali/Bangladeshi Buddhist heritage-এর **৩৫টি source gateway**, media/topic/source-state filters, animated inline SVG, existing ৮২-item library ও ৮৭-entry creator archive-এর cross-link। প্রতিটি item-এ verification scope ও rights boundary আছে; এটি পুরো internet archive করার দাবি নয়।
- **সম্পূর্ণ upazila filter:** `index.html`-এর জেলা filter-এর পাশে উপজেলা; `data/bd-geo.json`-এর ৮ বিভাগ / ৬৪ জেলা / ৪৯৫ উপজেলা / ৪,৫৪০ ইউনিয়ন। একই নামের উপজেলা district-scoped value-তে রাখা হয়েছে।
- **Data cleanup:** ৩৫৯ core + ২,৮৫৯ directory = **৩২১৮ records** অক্ষত; canonical spelling/category/geography, reviewed exceptions এবং tracker synchronization। বিস্তারিত audit: `docs/data-curation-2026-10-24.json`।
- **ভাষা:** ওয়েবসাইটের শুরুতে persistent language selector; বাংলা/English-এর পাশে Chakma (`ccp`) ও Marma (`rmz`) community-support option এবং স্পষ্টভাবে চিহ্নিত automatic-translation route। পূর্ণ মানব-সম্পাদিত অনুবাদের দাবি নয়।
- **নতুন phase report:** `docs/update-2026-10-24-public-archive-bn.md`। পুরোনো private browser-local draft archive (`archive.js`) public source registry থেকে আলাদা।

## ২০২৬-১০-২৪: শিশু learning-and-play phase

- **পাতা:** `children.html` + `children.css` + `children.js`; হোমপেজ, সূচিপত্র, footer ও shared navigation-এ যুক্ত।
- **খেলা ও archaeology:** জাতক/সংস্কৃতি quiz, প্রতীক memory, keyboard-সহ hypothetical reconstruction/present-photo slider এবং Canvas scratch-off dig-এর non-scratch বিকল্প। Reconstruction প্রমাণ নয়; ডালিঝরার নথিচিত্রকে কেবল **টেরাকোটা ভাস্কর্যের খণ্ডাংশ** বলা হয়েছে।
- **স্থানীয় downloads:** ৪-পাতার printable Somapura paper model, ৭-পাতার art pack, ৩-পাতার original Banyan Deer mini-comic এবং নতুন শিক্ষামূলক song/notation PDF; generator: `tools/build_children_assets.py`।
- **Culture ও listening:** ছয়টি four-step SVG craft activity, synthesized digital bell/original melody এবং `data/children-content.json`-এ source/rights/status-সহ media ও listening leads। Protected ACK PDF, lyrics, ভিডিও বা recording rehost নয়; search-indexed upload-কে প্রামাণ্য tradition বলা হয়নি।
- **Privacy/accessibility:** sign-up বা drawing upload নেই; touch/mouse/keyboard controls, reduced-motion pause এবং printable/non-scratch alternatives রয়েছে। Automated coverage: `tests/children.spec.cjs`। বিস্তারিত source/QA: `docs/children-phase-bn.md`।

- **হোমপেজ:** `index.html`; নাম, Dhaka time, উৎসব ও ঐচ্ছিক এলাকা অনুযায়ী session-once graphical welcome
- **নতুন গবেষণা-পাতা:** `purna-chandra-tarai.html` (পূর্ণচন্দ্র মুখার্জি) ও `maps.html` (BD MAPS এবং ডালিঝরা)
- **পূর্ববর্তী হালনাগাদের বিস্তারিত প্রতিবেদন:** `docs/update-2026-10-23-bn.md`; নতুন phase: `docs/update-2026-10-24-public-archive-bn.md`
- **পুরোনো ড্যাশবোর্ড** (৩০ জেলার বিহার-তালিকা, ম্যাপ, ভ্রমণ-তালিকা, উৎসব, সাহিত্য): `index-old.html`
- **কুইজ ও লিডারবোর্ড:** `quiz.html` (৫১৫ প্রশ্ন, প্রতি রাউন্ডে ১০টি)
- **আমাদের কথা, জরুরি নম্বর, ট্রেনের তথ্য:** `about.html`
- **বৌদ্ধধর্ম ও দর্শন:** `philosophy.html` — বুদ্ধের জীবন, মূল শিক্ষা, বাংলায় বৌদ্ধধর্মের ইতিহাস, চার ধারা, ত্রিপিটক (`data/philosophy.json`)
- **পঞ্জিকা:** `calendar.html` — বঙ্গাব্দ · বুদ্ধাব্দ · ইংরেজি তারিখ, ঘড়ি, তিথি-নক্ষত্র-যোগ-করণ, পূর্ণিমা-অমাবস্যা-উপোসথ (ব্রাউজারেই গণনা)
- **কুইজ:** `quiz.html` — ৬৬২টি প্রশ্ন, ১১ বিষয়, ছবি-কুইজ (`data/quiz-bank.json` + `data/quiz-extra14.json` + `data/quiz-images.json`, ছবি `assets/quiz/`)
- **কোন জেলায় কী বিখ্যাত:** `index.html#districts` — `data/district-famous.json` (৩০ জেলা, ৩২১৮ অদ্বিতীয় রেকর্ড)
- **বুদ্ধ ও বৌদ্ধ চরিত্রের নির্মাতা-আর্কাইভ:** `culture.html#creator-archive` — `data/heritage-creators.json` + `creator-archive.js` + `creator-archive.css`; ৮৭টি ছবিসহ এন্ট্রি, বাংলা/ইংরেজি খোঁজ, অঞ্চল·বিষয়·সম্পর্ক·মিডিয়া ফিল্টার, PDF/অডিও/ভিডিও/বই/শিল্পকর্ম লিংক, উক্তি-যাচাই লেবেল ও লাইব্রেরি-সংযোগ।
- সাইট: https://mithun-mutsuddi.github.io/Bangladesh-Buddhist-Heritage-Map/
- প্রতিষ্ঠাতা: Mithun Mutsuddi · mithunmutsuddi92@gmail.com · WhatsApp +8801882191626
- শুরু: অক্টোবর ২০২৬

---

বাংলাদেশের বৌদ্ধ প্রত্নস্থল, বিহার/প্যাগোডা, তীর্থস্থান, বনবিহার, পালি-শিক্ষা প্রতিষ্ঠান, সামাজিক সেবা, লোকঐতিহ্য এবং বৌদ্ধ সাহিত্যের জন্য বাংলা-ভিত্তিক responsive GitHub Pages site।

## বর্তমান ডিরেক্টরি

> ২৩ অক্টোবর ২০২৬-এর সক্রিয় হোমপেজ ও ট্র্যাকার ডেটা: **৩২১৮টি আলাদা ID (৩৫৯ core + ২,৮৫৯ directory)**। নিচের ছোট সংখ্যাগুলো পুরোনো development log-এর তৎকালীন হিসাব; বর্তমান মোট নয়।

- বুদ্ধ স্মৃতিচিহ্ন/জাদী/স্তূপের আলাদা ফিল্টার; আশরফপুর, গোকুল মেধ, মের্হ টিলা বিহার, ঘিলাতলী সার্বজনীন বৌদ্ধ বিহার, শীলছড়ি শান্তি নিকেতন, সিলেট আখালিয়া বিহার ও সংশ্লিষ্ট শ্মশানসহ ৭টি নতুন রেকর্ড যোগ হয়েছে; অনিশ্চিত GPS/পরিচয়/যোগাযোগ যাচাইাধীন চিহ্নিত; অতীশ দীপঙ্কর স্মৃতি কমপ্লেক্স, দমদম পীরস্থান ঢিবি, দলিজহারা বৌদ্ধ বিহার-চৈত্য কমপ্লেক্স ও ঝুড়িঝাড়া ঢিবি যুক্ত। ভরত ভায়নার placeholder-কে উৎস-সমর্থিত রেকর্ডে উন্নীত করা হয়েছে; তার pin-এ আনুমানিকতার সতর্কতা আছে।

- **৩৪৪টি স্বতন্ত্র স্থান/প্রতিষ্ঠান/ঐতিহ্য রেকর্ড** — প্রতিটি নাম ও লিংক দিয়ে আবার খোঁজা যায়।
- বিভাগ, জেলা, উপজেলা, থানা (যেখানে রেকর্ড আছে), ইউনিয়ন ও ক্যাটাগরি ফিল্টার; প্রশাসনিক তালিকা প্রথম ব্যবহারে lazy-load হয়।
- Leaflet marker cache, clustered batch-loading ও loading-overlay fix সহ দ্রুততর ম্যাপ।
- Private draft Historical Archive (`archive.js`): ছবি/ভিডিও/অডিও/PDF/লিখিত স্মৃতি, ঐতিহাসিক ও ধারণ-তারিখ, আলোকচিত্রী, সংগ্রহকারী, আপলোডকারী, ইতিহাস-বিবরণ এবং ZIP/JSON export; এটি public source registry নয়।
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
- [ঐতিহাসিক বৌদ্ধ বিহার মানচিত্র, বাংলাদেশ — BD MAPS](https://map-of-bangladesh.blogspot.com/2015/12/historical-buddho-bihar-map-bangladesh.html) (`maps.html`-এ মূল পাতা ও ক্রেডিটসহ local reference copy; বর্তমান navigation map নয়)
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

- `heritage-enhancements.js` + `upgrade.css`: legacy-responsive festival tracker, route planner, local-service Google Maps searches, community correction form, map recovery layer and source-aware long-form content UI. The former separate chatbot was removed.
- `sanghamitra.js` + `sanghamitra.css`: the single shared source-based assistant used across the site and tracker, with consent-gated statistics, optional online AI and device-dependent voice controls.
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

### Uttarbanga vihara enrichment (27 Oct 2026)

The 27 name-only North-Bengal vihara rows from the Buddhist Religious Welfare Trust list were promoted in place
(same `id`s, no duplicates) into full editorial records with Bengali summaries, history, travel notes, corrected
upazila/district data and a self-made illustrated plate in `assets/bihar-2026/`. One new archaeological record,
অগ্রপুরী বিহার (ধামইরহাট, নওগাঁ), was added from additional published sources, so the dataset now holds ৩২১৮
records (382 rich `core` + 2,837 directory rows). Illustrations are explicitly labelled as symbolic artwork,
never as photographs of the site. Details: [docs/update-2026-10-27-uttarbanga-vihar-bn.md](docs/update-2026-10-27-uttarbanga-vihar-bn.md).

### Validation

From the repository root:

```bash
python tools/validate_heritage_data.py
python tools/curate_heritage_data.py --dry-run
python tools/build_tracker_data.py
python tools/validate_public_phase.py
npm test
npx playwright test
```

The public-phase validator checks ৩২১৮ records, 495 upazilas, tracker synchronization, archive metadata and language hooks. Browser tests cover the homepage, tracker, upazila deep links, archive filters, language states and reduced motion. This is a structural check, not a guarantee that each historical claim, GPS coordinate, current opening time, event date, travel route or fee is factually verified. Check the source URL and the relevant site/host authority before publishing.
