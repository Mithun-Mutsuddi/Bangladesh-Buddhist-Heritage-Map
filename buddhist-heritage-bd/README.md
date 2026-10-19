# বাংলাদেশের বৌদ্ধ ঐতিহ্যবাহী স্থান নির্দেশিকা

বাংলাদেশের বৌদ্ধ প্রত্নস্থল, বিহার ও ধর্মীয় ঐতিহ্য অনুসন্ধানের জন্য বাংলা-ভিত্তিক responsive static website। GitHub Pages-এ কোনো build step ছাড়াই প্রকাশ করা যায়।

## ফিচার

- Leaflet + OpenStreetMap-ভিত্তিক interactive map ও custom dharma-wheel markers
- সার্চ, বিভাগ ও স্থান-ধরন অনুযায়ী filter
- নির্বাচিত স্থানের ইতিহাস, ভ্রমণ-পরামর্শ ও reference links
- Google Maps directions, কাছাকাছি ATM, hotel/resort search
- YouTube, Wikipedia, Wikimedia Commons এবং Internet Archive search
- browser localStorage-এ visited-place ও itinerary save করা
- itinerary টেক্সট ফাইল হিসেবে export
- Buddhist flag palette, ধীর ধর্মচক্র animation এবং CSS fanush animation
- image lazy-loading, image fallback এবং reduced-motion support
- নতুন লেখা, স্থান/coordinates, ছবি, ভিডিও, অডিও ও reference যোগ করার no-code Content Studio
- IndexedDB-তে এই ডিভাইসে draft সেভ, preview, delete এবং JSON backup/import
- এক ক্লিকে `content.json` + `assets/uploads/`-সহ publication ZIP তৈরি
- published `content.json` থেকে user-added map locations ও community posts দেখানো
- desktop, tablet ও mobile layout

## GitHub Pages-এ প্রকাশ

এই প্রকল্পের জন্য repository: [Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map](https://github.com/Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map)।

1. GitHub-এ repository খুলুন এবং **Add file → Upload files** নির্বাচন করুন।
2. এই ফোল্ডারের `index.html`, `styles.css`, `app.js`, `content-studio.js`, `content.json`, `README.md` এবং `assets/favicon.svg` upload করুন। আগের একই নামের ফাইলগুলো replace করে দিন।
3. নিচে **Commit changes** চাপুন।
4. Repository → **Settings → Pages** খুলুন।
3. Repository → **Settings → Pages** খুলুন।
5. **Build and deployment** অংশে `Deploy from a branch` বেছে নিন; branch `main` এবং folder `/ (root)` নির্বাচন করে Save করুন।
6. প্রকাশ সম্পন্ন হলে GitHub Pages একটি `https://<username>.github.io/<repository>/` URL দেখাবে।

কাস্টম ডোমেইন ব্যবহার করলে GitHub Pages সেটিংসের `Custom domain` অংশ থেকে DNS যুক্ত করুন।


## কোড না জেনে নতুন লেখা, ছবি, লোকেশন, ভিডিও বা অডিও প্রকাশ

1. লাইভ সাইট খুলে **কনটেন্ট যোগ করুন** অংশে যান।
2. ধরন বেছে শিরোনাম ও সংক্ষিপ্ত পরিচিতি লিখুন। নতুন স্থান হলে জেলা/বিভাগ এবং latitude ও longitude দিন। সূত্রের URL ও ছবির কৃতিত্ব থাকলে যোগ করুন।
3. ছবি/ভিডিও/অডিও ফাইল বেছে নিতে পারেন (প্রতি ফাইল সর্বোচ্চ ৩৫ MB), অথবা YouTube/সরাসরি media URL দিতে পারেন। বড় ভিডিওর জন্য YouTube লিংক ব্যবহার করাই ভালো।
4. **খসড়া সেভ করুন** চাপলে তা শুধু ওই browser/device-এ থাকবে; সাইটে অন্য দর্শক দেখতে পাবেন না।
5. **প্রকাশনার ZIP তৈরি করুন** চাপুন। ZIP-এর মধ্যে `content.json`, uploaded media এবং `PUBLISH-INSTRUCTIONS.txt` থাকবে।
6. ZIP Extract করুন। GitHub repository-র root-এ `content.json` upload/replace করুন এবং `assets/uploads/`-এর মিডিয়া ফাইলগুলো একই path-এ দিন; তারপর **Commit changes** চাপুন। সাইটে প্রকাশ হতে কয়েক মিনিট লাগতে পারে।

খসড়া private-by-default। `localStorage` বা browser data clear করলে `localStorage`-এ থাকা ভ্রমণ তালিকা মুছে যেতে পারে; Content Studio draft আলাদা IndexedDB-তে থাকে, তবু browser storage মুছে ফেললে draft-ও হারাতে পারে। JSON backup-এ file binary থাকে না, তাই image/video/audio-সহ প্রকাশের জন্য ZIP ব্যবহার করুন। কোনো password বা GitHub token Content Studio-তে দেবেন না।

**স্থির hosting-এর সীমাবদ্ধতা:** GitHub Pages-এ frontend থেকে সরাসরি সবার জন্য নিরাপদ publish করতে আলাদা authenticated backend লাগে। এই Content Studio সে কারণে আগে local draft বানায় ও GitHub-এ commit করার জন্য package তৈরি করে; website নিজে থেকেই GitHub repository পরিবর্তন করে না।


## Sacred saffron-orange theme and Buddha artwork

The hero and Buddha feature use the bundled local file `assets/images/buddha-hero.png` (AI-generated digital illustration inspired by a golden Buddha and ancient Buddhist architecture). It is an illustrative artwork, not a documentary photograph of any real Bangladesh site. Because it is bundled locally, the main Buddha visual does not rely on an external image host. The design uses a sacred saffron/orange, amber, sandalwood and deep-brown palette.

## ছবি কেন লোড নাও হতে পারে?

সাইটে Wikimedia Commons-এর সরাসরি যাচাই করা file URLs ব্যবহার করা হয়েছে এবং ছবির উৎসের লিংক দেখানো হয়। ছবি বাহ্যিক সার্ভারে থাকায় নেটওয়ার্ক/হোস্ট সাময়িকভাবে ব্যর্থ হলে বিকল্প ধর্মচক্র-ডিজাইন দেখানো হবে। প্রকল্পে image binary আলাদা করে bundle করা নেই; পুরোপুরি local/offline image চাইলে Commons file page থেকে ফাইল ও লাইসেন্স যাচাই করে `assets/images/`-এ রেখে `app.js`-এর `imageCredits` path local file path-এ বদলাতে হবে।

## ছবি ও লাইসেন্সের কৃতিত্ব

- **Somapura / Paharpur Buddhist Vihara** — [Wikimedia Commons image file](https://commons.wikimedia.org/wiki/File:Paharpur_Buddhist_Bihar.jpg); file page-এ author/license যাচাই করুন।
- **Shalban Vihara** — [Sakib Ahmed Nasim, CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Shalbon-vihara-04-by-Sakib-Ahmed-Nasim.jpg).
- **Buddha Dhatu Jadi / Golden Temple** — [Wikimedia Commons image file](https://commons.wikimedia.org/wiki/File:Golden_Temple,_Bandarban.jpg); file page-এ author/license যাচাই করুন।
- **Rajban Vihara** — [Wikimedia Commons image file](https://commons.wikimedia.org/wiki/File:Rangamati_Rajban_Bihar_Buddhist_Temple.JPG); file page-এ author/license যাচাই করুন।
- **Buddha statue at Buddha Dhatu Jadi** — [Shakil Ahmed Sarowar, CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Statue_of_Buddha_at_Buddha_Dhatu_Jadi,_Bandarban.jpg).

CC BY-SA লাইসেন্সের ছবি পুনঃব্যবহার/রিমিক্স করলে সংশ্লিষ্ট লাইসেন্সের attribution ও share-alike শর্ত মেনে চলুন। প্রকৃত URL, author এবং license বদলালে এই ক্রেডিট তালিকাও আপডেট করুন।

## তথ্যসূত্র ও অনুপ্রেরণা

- [UNESCO World Heritage Centre — Somapura Mahavihara](https://whc.unesco.org/en/list/322/)
- [Wikimedia Commons — Buddhist monasteries in Bangladesh](https://commons.wikimedia.org/wiki/Category:Buddhist_monasteries_in_Bangladesh)
- [SuttaCentral](https://suttacentral.net/)
- [Internet Archive search](https://archive.org/search?query=Bangladesh+Buddhist+heritage)
- [Unseen Bangladesh](https://unseenbangladesh.com/) — district/place discovery, travel planning ও cost-information ধারার অনুপ্রেরণা
- [Travel Tracker — India](https://travel-tracker.org/india) — visited-place progress/checklist ধারণার অনুপ্রেরণা

এটি একটি স্বতন্ত্র project; উল্লিখিত সাইটগুলোর সঙ্গে অনুমোদন, অধিভুক্তি বা তথ্য-অংশীদারিত্বের দাবি করা হচ্ছে না।

## তথ্য ও ব্যবহার সংক্রান্ত নোট

- স্থানগুলোর coordinate নির্দেশক/approximate; বিশেষ করে অঞ্চলভিত্তিক গন্তব্যে নির্দিষ্ট বিহারের অবস্থান আলাদাভাবে যাচাই করুন।
- ATM, হোটেল ও রিসোর্টের বর্তমান তালিকা ও রুট Google Maps-এ live search হিসেবে খোলে; এই সাইট কোনো ফলাফল বা দূরত্বের নিশ্চয়তা দেয় না।
- ব্রাউজারের location কেবল ব্যবহারকারী বোতামে চাপ দিলে চাওয়া হয়; অবস্থান সার্ভারে পাঠানো হয় না।
- visited/itinerary তথ্য একই browser/device-এর `localStorage`-এ রাখা হয়।
- Leaflet map tiles ও ছবি দেখাতে internet connection দরকার।

## ফাইল কাঠামো

```text
buddhist-heritage-bd/
├── index.html
├── styles.css
├── app.js
├── content-studio.js
├── content.json
├── README.md
└── assets/
    └── favicon.svg
```
