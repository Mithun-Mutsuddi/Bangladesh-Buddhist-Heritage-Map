'use strict';

const imageCredits = {
  somapura: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Paharpur_Buddhist_Bihar.jpg',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Paharpur_Buddhist_Bihar.jpg',
    credit: 'Wikimedia Commons · ছবির ফাইল পাতায় লাইসেন্স দেখুন'
  },
  shalban: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Shalbon-vihara-04-by-Sakib-Ahmed-Nasim.jpg',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Shalbon-vihara-04-by-Sakib-Ahmed-Nasim.jpg',
    credit: 'Sakib Ahmed Nasim · CC BY-SA 3.0'
  },
  golden: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Golden_Temple%2C_Bandarban.jpg',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Golden_Temple,_Bandarban.jpg',
    credit: 'Wikimedia Commons · ছবির ফাইল পাতায় লাইসেন্স দেখুন'
  },
  rajban: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Rangamati_Rajban_Bihar_Buddhist_Temple.JPG',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Rangamati_Rajban_Bihar_Buddhist_Temple.JPG',
    credit: 'Wikimedia Commons · ছবির ফাইল পাতায় লাইসেন্স দেখুন'
  },
  buddha: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Statue_of_Buddha_at_Buddha_Dhatu_Jadi%2C_Bandarban.jpg/960px-Statue_of_Buddha_at_Buddha_Dhatu_Jadi%2C_Bandarban.jpg',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Statue_of_Buddha_at_Buddha_Dhatu_Jadi,_Bandarban.jpg',
    credit: 'Shakil Ahmed Sarowar · CC BY-SA 4.0'
  }
};

// Coordinates are approximate map pins for trip planning, not a survey or official boundary.
const destinations = [
  {
    id: 'somapura', name: 'পাহাড়পুর সোমপুর মহাবিহার', district: 'নওগাঁ', division: 'রাজশাহী', kind: 'প্রত্নস্থল', category: 'প্রত্নস্থল ও মহাবিহার', coords: [25.03197, 88.97700], imageKey: 'somapura',
    summary: 'পাল যুগের সুবিশাল বৌদ্ধ মহাবিহার; বাংলাদেশের অন্যতম গুরুত্বপূর্ণ প্রত্নতাত্ত্বিক নিদর্শন।',
    history: 'সোমপুর মহাবিহার পাল আমলের এক অসামান্য বৌদ্ধ শিক্ষা ও সাধনাকেন্দ্র। এর পরিকল্পিত প্রাঙ্গণ, ভিক্ষুকক্ষ ও কেন্দ্রীয় স্থাপত্য দক্ষিণ এশিয়ার বৌদ্ধ স্থাপত্যের ইতিহাস বোঝার গুরুত্বপূর্ণ উপাদান। UNESCO ১৯৮৫ সালে এটিকে বিশ্ব ঐতিহ্য তালিকায় অন্তর্ভুক্ত করে।',
    source: 'https://whc.unesco.org/en/list/322/', sourceLabel: 'UNESCO World Heritage Centre',
    dhamma: 'কোনো স্থানে যাওয়ার আগে তার ইতিহাস, সংরক্ষণবিধি ও স্থানীয় মানুষের জীবনকে সম্মান করুন।', quoteRef: 'https://whc.unesco.org/en/list/322/',
    trip: 'ঢাকা থেকে নওগাঁ/জয়পুরহাট হয়ে স্থানীয় বাস বা সিএনজিতে পাহাড়পুরে যাওয়ার রুট খুঁজুন। যাত্রার সময়সূচি ও ভাড়া আগে যাচাই করুন।'
  },
  {
    id: 'shalban', name: 'শালবন বিহার', district: 'কুমিল্লা', division: 'চট্টগ্রাম', kind: 'প্রত্নস্থল', category: 'প্রত্নস্থল ও মহাবিহার', coords: [23.42676, 91.13673], imageKey: 'shalban',
    summary: 'ময়নামতি প্রত্নাঞ্চলের প্রধান বৌদ্ধ বিহারগুলোর একটি; চারদিকে ভিক্ষুকক্ষসহ পরিকল্পিত আঙিনা।',
    history: 'কুমিল্লার ময়নামতি-লালমাই অঞ্চলের শালবন বিহার প্রাচীন বাংলার বৌদ্ধ বসতি, শিক্ষা ও ধর্মীয় স্থাপত্যের পরিচয় বহন করে। খননে ভিক্ষুকক্ষ, কেন্দ্রীয় মন্দির ও নানা প্রত্নবস্তু আবিষ্কৃত হয়েছে; পাশের ময়নামতি জাদুঘরও ভ্রমণ পরিকল্পনায় রাখা যেতে পারে।',
    source: 'https://commons.wikimedia.org/wiki/File:Shalban_Vihara.jpg', sourceLabel: 'Wikimedia Commons · Shalban Vihara',
    dhamma: 'প্রত্নস্থলে দেয়াল বা ইটের ওপর ওঠা, প্রত্নবস্তু স্পর্শ করা এবং আবর্জনা ফেলা থেকে বিরত থাকুন।', quoteRef: 'https://commons.wikimedia.org/wiki/File:Shalban_Vihara.jpg',
    trip: 'কুমিল্লা শহর থেকে কোটবাড়ি/ময়নামতি এলাকায় স্থানীয় পরিবহনে যাওয়ার রুট খুঁজুন। জাদুঘর ও প্রত্নস্থলের খোলার সময় আলাদা করে নিশ্চিত করুন।'
  },
  {
    id: 'golden', name: 'বুদ্ধ ধাতু জাদি (স্বর্ণমন্দির)', district: 'বান্দরবান', division: 'চট্টগ্রাম', kind: 'বিহার', category: 'বিহার ও তীর্থস্থান', coords: [22.19540, 92.21780], imageKey: 'golden',
    summary: 'বালাঘাটার পাহাড়ে অবস্থিত স্বর্ণাভ প্যাগোডা; বৌদ্ধ তীর্থ ও পাহাড়ি দৃশ্যের জন্য পরিচিত।',
    history: 'বুদ্ধ ধাতু জাদি, সাধারণভাবে বান্দরবানের স্বর্ণমন্দির নামে পরিচিত, একটি উল্লেখযোগ্য থেরবাদ বৌদ্ধ ধর্মীয় স্থাপনা। পবিত্র প্রাঙ্গণে প্রবেশের আগে পোশাক, জুতা, ছবি তোলা ও দর্শনার্থীদের আচরণবিধি সম্পর্কে স্থানীয় নির্দেশনা মেনে চলুন।',
    source: 'https://commons.wikimedia.org/wiki/File:Buddha_Dhatu_Jadi_-_Bandarban_Golden_Temple.jpg', sourceLabel: 'Wikimedia Commons · Golden Temple',
    dhamma: 'এটি সক্রিয় ধর্মীয় স্থান; পূজা ও ধ্যানরত মানুষের ব্যক্তিগত পরিসরকে সম্মান করুন।', quoteRef: 'https://commons.wikimedia.org/wiki/File:Buddha_Dhatu_Jadi_-_Bandarban_Golden_Temple.jpg',
    trip: 'বান্দরবান শহর থেকে বালাঘাটা এলাকার জন্য স্থানীয় পরিবহন/গাড়ি খুঁজুন। পাহাড়ি এলাকায় আবহাওয়া ও স্থানীয় প্রশাসনের নির্দেশনা দেখে পরিকল্পনা করুন।'
  },
  {
    id: 'rajban', name: 'রাজবন বিহার', district: 'রাঙামাটি', division: 'চট্টগ্রাম', kind: 'বিহার', category: 'বিহার ও তীর্থস্থান', coords: [22.66203, 92.17097], imageKey: 'rajban',
    summary: 'রাঙামাটির পরিচিত বৌদ্ধ তীর্থ ও সাধনাকেন্দ্র; কাপ্তাই হ্রদ অঞ্চলের ভ্রমণের সঙ্গে যুক্ত করা যায়।',
    history: 'রাজবন বিহার রাঙামাটির অন্যতম গুরুত্বপূর্ণ বৌদ্ধ ধর্মীয় ও ধ্যানচর্চার কেন্দ্র হিসেবে পরিচিত। বনভন্তে নামে শ্রদ্ধেয় সাধনানন্দ মহাস্থবীরের সঙ্গে এই বিহারের ইতিহাস ঘনিষ্ঠভাবে যুক্ত। ধর্মীয় উৎসবের সময় দর্শনার্থীর চাপ বেশি হতে পারে।',
    source: 'https://commons.wikimedia.org/wiki/File:RajbanViharaRangamati.jpg', sourceLabel: 'Wikimedia Commons · Rajban Vihara',
    dhamma: 'বিহারের ভেতরে শান্ত পরিবেশ বজায় রাখুন এবং স্থানীয়ভাবে অনুমোদিত স্থানেই ছবি তুলুন।', quoteRef: 'https://commons.wikimedia.org/wiki/File:RajbanViharaRangamati.jpg',
    trip: 'রাঙামাটি শহর থেকে বিহারের সুনির্দিষ্ট প্রবেশপথ ও পরিবহন স্থানীয়ভাবে নিশ্চিত করুন; লেক ভ্রমণের সঙ্গে মিলিয়ে সময় রাখুন।'
  },
  {
    id: 'dharmarajika', name: 'ধর্মরাজিকা বৌদ্ধ মহাবিহার', district: 'ঢাকা', division: 'ঢাকা', kind: 'মঠ', category: 'মঠ ও ধর্মীয় কেন্দ্র', coords: [23.72890, 90.43250], imageKey: null,
    summary: 'ঢাকার কমলাপুর/বাসাবো অঞ্চলের পরিচিত বৌদ্ধ ধর্মীয় ও সমাজসেবামূলক কেন্দ্র।',
    history: 'ধর্মরাজিকা বৌদ্ধ মহাবিহার ঢাকার সক্রিয় বৌদ্ধ ধর্মীয় প্রতিষ্ঠানের মধ্যে পরিচিত। এটি রাজধানীতে বৌদ্ধ ধর্মীয় অনুষ্ঠান, উপাসনা ও সামাজিক কর্মকাণ্ড সম্পর্কে জানার একটি সম্ভাব্য গন্তব্য। যাত্রার আগে স্থানীয় যোগাযোগে অনুষ্ঠানসূচি ও দর্শনার্থীর নিয়ম জেনে নিন।',
    source: 'https://commons.wikimedia.org/wiki/Category:Dharmarajika_Buddhist_Monastery', sourceLabel: 'Wikimedia Commons · Dharmarajika',
    dhamma: 'ধর্মীয় অনুষ্ঠানের সময় অনুমতি ছাড়া ছবি বা ভিডিও ধারণ করবেন না।', quoteRef: 'https://suttacentral.net/',
    trip: 'ঢাকার কমলাপুর/বাসাবো অঞ্চলে Google Maps-এ সুনির্দিষ্ট প্রবেশপথ ও বর্তমান যাতায়াতের অবস্থা যাচাই করুন।'
  },
  {
    id: 'nandan', name: 'নন্দনকানন বৌদ্ধ বিহার', district: 'চট্টগ্রাম', division: 'চট্টগ্রাম', kind: 'বিহার', category: 'বিহার ও তীর্থস্থান', coords: [22.35850, 91.83120], imageKey: null,
    summary: 'চট্টগ্রাম শহরের ঐতিহ্যবাহী বৌদ্ধ বিহার; শহুরে ঐতিহ্যভ্রমণে একটি গুরুত্বপূর্ণ থামার স্থান।',
    history: 'নন্দনকানন বৌদ্ধ বিহার চট্টগ্রামের নগরজীবনে বৌদ্ধ সম্প্রদায়ের ধর্মীয় ঐতিহ্যের একটি পরিচিত অংশ। নির্দিষ্ট প্রবেশ, অনুষ্ঠান বা দর্শনের সময় সম্পর্কে তথ্য পরিবর্তিত হতে পারে, তাই যাওয়ার আগে স্থানীয়ভাবে নিশ্চিত করা উচিত।',
    source: 'https://commons.wikimedia.org/wiki/Category:Buddhist_monasteries_in_Chittagong', sourceLabel: 'Wikimedia Commons · Chattogram',
    dhamma: 'ধর্মীয় স্থাপত্য ও সম্প্রদায়ের ইতিহাস বোঝার সময় স্থানীয়দের বক্তব্যকেও গুরুত্ব দিন।', quoteRef: 'https://suttacentral.net/',
    trip: 'চট্টগ্রাম শহরের কেন্দ্র থেকে Google Maps-এ Nandan Kanan Buddhist Temple খুঁজে বর্তমান রুট ও যানজট যাচাই করুন।'
  },
  {
    id: 'ramu', name: 'রামু বৌদ্ধ ঐতিহ্যাঞ্চল', district: 'কক্সবাজার', division: 'চট্টগ্রাম', kind: 'বিহার', category: 'বিহার ও তীর্থস্থান', coords: [21.45490, 92.09980], imageKey: null,
    summary: 'কক্সবাজারের রামুতে একাধিক বৌদ্ধ বিহার, মূর্তি ও জীবন্ত ধর্মীয় ঐতিহ্যের সমাহার।',
    history: 'রামু অঞ্চল বাংলাদেশের বৌদ্ধ ঐতিহ্যের একটি উল্লেখযোগ্য জীবন্ত কেন্দ্র, যেখানে বিভিন্ন বিহার ও বৌদ্ধ শিল্পকর্ম রয়েছে। এটি একক স্থাপনার বদলে একাধিক স্থানের অঞ্চলভিত্তিক সূচক; নির্দিষ্ট বিহার নির্বাচন করে তার অবস্থান ও স্থানীয় রীতি যাচাই করুন।',
    source: 'https://bn.wikipedia.org/wiki/রামু_উপজেলা', sourceLabel: 'বাংলা উইকিপিডিয়া · রামু',
    dhamma: 'সক্রিয় উপাসনালয় পরিদর্শনে স্থানীয় সম্প্রদায়ের অনুমতি ও রীতি অনুসরণ করুন।', quoteRef: 'https://suttacentral.net/',
    trip: 'Google Maps-এ Ramu Buddhist Temple বা নির্দিষ্ট বিহারের নাম লিখে দিকনির্দেশ ও সাম্প্রতিক তথ্য যাচাই করুন।'
  },
  {
    id: 'vasu', name: 'বাসু বিহার প্রত্নস্থল', district: 'বগুড়া', division: 'রাজশাহী', kind: 'প্রত্নস্থল', category: 'প্রত্নস্থল ও মহাবিহার', coords: [25.04740, 89.32380], imageKey: null,
    summary: 'উত্তরবঙ্গের প্রাচীন বৌদ্ধ প্রত্নঐতিহ্যের সঙ্গে যুক্ত একটি প্রত্নস্থল।',
    history: 'বাসু বিহার উত্তরবঙ্গের বৌদ্ধ প্রত্নঐতিহ্য নিয়ে আলোচনায় উল্লেখযোগ্য। প্রত্নস্থলের সুনির্দিষ্ট সীমানা, প্রদর্শনযোগ্য নিদর্শন ও প্রবেশের অবস্থা ভ্রমণের আগে প্রত্নতত্ত্ব অধিদপ্তর বা স্থানীয় সূত্রে যাচাই করা বাঞ্ছনীয়।',
    source: 'https://en.wikipedia.org/wiki/Vasu_Vihara', sourceLabel: 'Vasu Vihara · reference overview',
    dhamma: 'প্রত্নস্থলে সংরক্ষণবিধি মানুন; নিদর্শন সংগ্রহ বা স্থানান্তর করবেন না।', quoteRef: 'https://suttacentral.net/',
    trip: 'বগুড়া অঞ্চল থেকে বাসু বিহারের সঠিক প্রবেশপথ ও স্থানীয় পরিবহন Google Maps এবং স্থানীয় সূত্রে মিলিয়ে নিন।'
  },
  {
    id: 'jagaddala', name: 'জগদ্দল মহাবিহার প্রত্নাঞ্চল', district: 'নওগাঁ', division: 'রাজশাহী', kind: 'প্রত্নস্থল', category: 'প্রত্নস্থল ও মহাবিহার', coords: [25.16820, 88.82750], imageKey: null,
    summary: 'পাল যুগের উত্তর বাংলার বৌদ্ধ মহাবিহার ঐতিহ্যের সঙ্গে সম্পর্কিত প্রত্নাঞ্চল।',
    history: 'জগদ্দল মহাবিহার পাল যুগের বৌদ্ধ উচ্চশিক্ষা ও অনুবাদ-ঐতিহ্যের আলোচনায় স্থান পায়। সাইটে দৃশ্যমান ধ্বংসাবশেষ, চিহ্নিত সীমানা ও পর্যটক সুবিধা সীমিত বা পরিবর্তনশীল হতে পারে; এটি দূরবর্তী গন্তব্য ধরে যথেষ্ট সময় নিয়ে পরিকল্পনা করুন।',
    source: 'https://en.wikipedia.org/wiki/Jagaddala_Mahavihara', sourceLabel: 'Jagaddala Mahavihara · reference overview',
    dhamma: 'ঐতিহাসিক তথ্য বিভিন্ন গবেষণায় ভিন্ন হতে পারে; একাধিক উৎস মিলিয়ে দেখুন।', quoteRef: 'https://suttacentral.net/',
    trip: 'নওগাঁ জেলার উত্তরাঞ্চলে যাত্রার আগে স্থানীয় গাইড ও বর্তমান সড়ক পরিস্থিতি সম্পর্কে নিশ্চিত হন।'
  },
  {
    id: 'mainamati', name: 'ময়নামতি বৌদ্ধ প্রত্নাঞ্চল ও জাদুঘর', district: 'কুমিল্লা', division: 'চট্টগ্রাম', kind: 'প্রত্নস্থল', category: 'প্রত্নস্থল ও মহাবিহার', coords: [23.43320, 91.13200], imageKey: 'shalban',
    summary: 'শালবন বিহারসহ ছড়িয়ে থাকা প্রত্নস্থল ও আবিষ্কৃত নিদর্শন জানতে উপযোগী অঞ্চলভিত্তিক গন্তব্য।',
    history: 'ময়নামতি-লালমাই প্রত্নাঞ্চলে একাধিক বৌদ্ধ বিহার, স্তূপ ও বসতির নিদর্শন পাওয়া গেছে। শালবন বিহার ও ময়নামতি জাদুঘরকে একই দিনের ভ্রমণে যুক্ত করা যায়; জাদুঘরের খোলার সময় ও টিকিটের তথ্য আগে যাচাই করুন।',
    source: 'https://commons.wikimedia.org/wiki/Category:Mainamati', sourceLabel: 'Wikimedia Commons · Mainamati',
    dhamma: 'জাদুঘরের ছবি তোলা ও প্রদর্শনীর নিয়ম স্থানে টাঙানো নির্দেশনা অনুযায়ী পালন করুন।', quoteRef: 'https://commons.wikimedia.org/wiki/Category:Mainamati',
    trip: 'কুমিল্লা শহর থেকে ময়নামতি ও কোটবাড়ি এলাকার পরিবহন, প্রবেশসময় এবং প্রত্নস্থলগুলোর দূরত্ব যাচাই করুন।'
  }
];

const bnDigits = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]);
const byId = id => document.getElementById(id);
let map = null;
let markerLayer = null;
let userMarker = null;
let userPosition = null;
let activePlaceId = destinations[0]?.id ?? null;
let sortUnvisitedFirst = true;
const visitedIds = new Set(readStorage('buddhistHeritageVisited', []));
const itineraryIds = new Set(readStorage('buddhistHeritageItinerary', []));

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* Private browsing or storage quota: keep the page usable. */ }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function mapLinkFor(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.coords.join(','))}`;
}
function googleSearch(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function nearbyLink(place, type) {
  const query = `${type} near ${place.name}, ${place.district}, Bangladesh`;
  return googleSearch(query);
}
function mediaFor(place) {
  if (place.customImageUrl) {
    return { image: place.customImageUrl, creditUrl: place.source || place.customImageUrl, credit: place.sourceLabel || 'কমিউনিটি-যোগ করা ছবি' };
  }
  if (!place.imageKey || !imageCredits[place.imageKey]) return null;
  return imageCredits[place.imageKey];
}
function imageMarkup(place) {
  const media = mediaFor(place);
  if (!media) return `<div class="place-art" aria-hidden="true"><span>${place.kind === 'প্রত্নস্থল' ? '▥' : place.kind === 'মঠ' ? '🪷' : '☸'}</span></div>`;
  return `<img src="${media.image}" alt="${escapeHtml(place.name)}-এর ছবি" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.classList.add('image-failed');const art=document.createElement('div');art.className='place-art';art.setAttribute('aria-hidden','true');art.innerHTML='<span>☸</span>';this.parentElement.prepend(art)">`;
}
function renderPlaces() {
  const searchText = byId('placeSearch').value.trim().toLocaleLowerCase('bn');
  const division = byId('divisionFilter').value;
  const category = byId('categoryFilter').value;
  const filtered = destinations.filter(place => {
    const matchesSearch = !searchText || [place.name, place.district, place.division, place.category, place.summary].join(' ').toLocaleLowerCase('bn').includes(searchText);
    const matchesDivision = division === 'all' || place.division === division;
    const matchesCategory = category === 'all' || place.kind === category;
    return matchesSearch && matchesDivision && matchesCategory;
  });
  if (sortUnvisitedFirst) filtered.sort((a, b) => Number(visitedIds.has(a.id)) - Number(visitedIds.has(b.id)) || a.name.localeCompare(b.name, 'bn'));
  else filtered.sort((a, b) => a.name.localeCompare(b.name, 'bn'));

  byId('resultsCount').textContent = `${bnDigits(filtered.length)}টি স্থান পাওয়া গেছে`;
  byId('emptyState').hidden = filtered.length > 0;
  byId('placeGrid').innerHTML = filtered.map(place => {
    const media = mediaFor(place);
    const visited = visitedIds.has(place.id);
    return `<article class="place-card ${activePlaceId === place.id ? 'is-selected' : ''}" data-place-card="${place.id}">
      <div class="place-media">${imageMarkup(place)}<span class="place-badge">${escapeHtml(place.kind)}</span>${visited ? '<span class="visited-badge" title="দেখা হয়েছে">✓</span>' : ''}${media ? `<a class="image-credit-link" href="${media.creditUrl}" target="_blank" rel="noopener noreferrer" aria-label="ছবির উৎস">ছবির উৎস ↗</a>` : ''}</div>
      <div class="place-card-body"><h3>${escapeHtml(place.name)}</h3><p class="place-location"><span>⌖</span>${escapeHtml(place.district)} জেলা · ${escapeHtml(place.division)} বিভাগ</p><p class="place-summary">${escapeHtml(place.summary)}</p>
        <div class="place-card-actions"><button type="button" class="card-action primary" data-action="details" data-id="${place.id}">বিস্তারিত দেখুন</button><button type="button" class="card-action" data-action="visited" data-id="${place.id}">${visited ? '✓ দেখা হয়েছে' : '□ দেখা হয়েছে'}</button><button type="button" class="card-action" data-action="itinerary" data-id="${place.id}">${itineraryIds.has(place.id) ? '✓ তালিকায় আছে' : '+ তালিকায় যোগ'}</button></div>
      </div></article>`;
  }).join('');
  updateMarkers(filtered);
  updateProgress();
}
function selectedPlace() { return destinations.find(place => place.id === activePlaceId) || null; }
function selectPlace(id, panMap = true) {
  const place = destinations.find(item => item.id === id);
  if (!place) return;
  activePlaceId = id;
  renderPlaces();
  renderPlaceDetail(place);
  if (map && panMap) map.setView(place.coords, Math.max(map.getZoom(), 10), { animate: true });
  if (window.matchMedia('(max-width: 800px)').matches && panMap) {
    byId('placeDetail').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }
}
function renderPlaceDetail(place) {
  const media = mediaFor(place);
  const visited = visitedIds.has(place.id);
  const inTrip = itineraryIds.has(place.id);
  const wikiSearch = `https://bn.wikipedia.org/w/index.php?search=${encodeURIComponent(place.name)}`;
  const commonsSearch = `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(place.name)}`;
  const archiveSearch = `https://archive.org/search?query=${encodeURIComponent(place.name + ' Bangladesh Buddhist')}`;
  const videoSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(place.name + ' Bangladesh')}`;
  const sourceUrl = place.source || commonsSearch;
  byId('placeDetail').innerHTML = `<div class="detail-empty-art" aria-hidden="true">${media ? `<img src="${media.image}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;opacity:.72">` : ''}<span style="position:absolute;right:18px;top:4px">☸</span><i>🪷</i></div>
    <p class="section-kicker">SELECTED DESTINATION</p><h3>${escapeHtml(place.name)}</h3>
    <div class="detail-meta"><span class="detail-chip">${escapeHtml(place.district)} জেলা</span><span class="detail-chip">${escapeHtml(place.division)} বিভাগ</span><span class="detail-chip">${escapeHtml(place.category)}</span></div>
    <p class="detail-history">${escapeHtml(place.history)}</p>
    <p><strong>🧭 যাওয়ার পরিকল্পনা:</strong> ${escapeHtml(place.trip)}</p>
    <p class="detail-quote">☸ <strong>শ্রদ্ধাশীল ভ্রমণ:</strong> ${escapeHtml(place.dhamma)} ${place.id === 'somapura' ? '<a href="https://whc.unesco.org/en/list/322/" target="_blank" rel="noopener noreferrer">[UNESCO]</a>' : ''}</p>
    <div class="detail-actions">
      <a class="action-primary" href="${mapLinkFor(place)}" target="_blank" rel="noopener noreferrer">↗ Google Maps দিকনির্দেশ</a>
      <a href="${nearbyLink(place, 'ATM')}" target="_blank" rel="noopener noreferrer">▣ কাছাকাছি ATM</a>
      <a href="${nearbyLink(place, 'hotel and resort')}" target="_blank" rel="noopener noreferrer">⌂ হোটেল / রিসোর্ট</a>
      <a href="${videoSearch}" target="_blank" rel="noopener noreferrer">▷ YouTube ভিডিও</a>
      <a href="${wikiSearch}" target="_blank" rel="noopener noreferrer">W উইকিপিডিয়া</a>
      <a href="${commonsSearch}" target="_blank" rel="noopener noreferrer">▧ ছবি / Commons</a>
      <a href="${archiveSearch}" target="_blank" rel="noopener noreferrer">▤ আর্কাইভ / বই</a>
      <button type="button" data-action="visited" data-id="${place.id}">${visited ? '✓ দেখা হয়েছে' : '□ দেখা হয়েছে'}</button>
      <button type="button" data-action="itinerary" data-id="${place.id}">${inTrip ? '✓ তালিকায় আছে' : '+ তালিকায় যোগ'}</button>
    </div>
    <p class="detail-source">তথ্যসূত্র: <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(place.sourceLabel || 'সম্পর্কিত রেফারেন্স')} ↗</a>${media ? ` · <a href="${media.creditUrl}" target="_blank" rel="noopener noreferrer">ছবির কৃতিত্ব ↗</a>` : ''}</p>`;
}
function initMap() {
  const container = byId('map');
  if (typeof L === 'undefined') {
    container.innerHTML = '<div class="map-loading">ম্যাপ লাইব্রেরি লোড হয়নি। নিচের Google Maps লিংক দিয়ে স্থান ও রুট দেখুন।</div>';
    return;
  }
  map = L.map('map', { scrollWheelZoom: false }).setView([23.685, 90.3563], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  map.whenReady(() => { setTimeout(() => map?.invalidateSize(), 120); });
  updateMarkers(destinations);
}
function updateMarkers(list) {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();
  list.forEach(place => {
    const icon = L.divIcon({ className: '', html: '<div class="custom-map-pin"><span>☸</span></div>', iconSize: [34, 38], iconAnchor: [17, 36], popupAnchor: [0, -32] });
    const marker = L.marker(place.coords, { icon }).addTo(markerLayer);
    marker.bindPopup(`<strong>${escapeHtml(place.name)}</strong><br>${escapeHtml(place.district)}, ${escapeHtml(place.division)}<br><a href="${mapLinkFor(place)}" target="_blank" rel="noopener noreferrer">Google Maps-এ রুট ↗</a>`);
    marker.on('click', () => selectPlace(place.id, false));
  });
  if (userPosition) addUserMarker(userPosition.lat, userPosition.lng);
}
function addUserMarker(lat, lng) {
  if (!map) return;
  userPosition = { lat, lng };
  if (userMarker) userMarker.remove();
  const icon = L.divIcon({ className: '', html: '<div class="user-map-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
  userMarker = L.marker([lat, lng], { icon }).addTo(map).bindPopup('আপনার বর্তমান অবস্থান');
}
function requestLocation(onSuccess, onFailure) {
  if (!navigator.geolocation) {
    alert('এই ব্রাউজারে অবস্থান শনাক্ত করার সুবিধা নেই।');
    return;
  }
  const button = byId('locateMe');
  if (button) { button.disabled = true; button.textContent = 'অবস্থান খোঁজা হচ্ছে…'; }
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    addUserMarker(lat, lng);
    if (map) map.setView([lat, lng], 12, { animate: true });
    if (button) { button.disabled = false; button.textContent = '◎ আমার অবস্থান'; }
    if (typeof onSuccess === 'function') onSuccess(lat, lng);
  }, error => {
    if (button) { button.disabled = false; button.textContent = '◎ আমার অবস্থান'; }
    const reason = error.code === 1 ? 'অবস্থান ব্যবহারের অনুমতি দেওয়া হয়নি।' : 'অবস্থান পাওয়া যায়নি।';
    if (typeof onFailure === 'function') onFailure(reason);
    else alert(`${reason} ব্রাউজারের location permission চালু করে আবার চেষ্টা করুন, অথবা কোনো স্থান বেছে Google Maps লিংক ব্যবহার করুন।`);
  }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
}
function toggleVisited(id) {
  if (visitedIds.has(id)) visitedIds.delete(id); else visitedIds.add(id);
  saveStorage('buddhistHeritageVisited', [...visitedIds]);
  renderPlaces(); renderItinerary();
  const place = destinations.find(item => item.id === id);
  if (place && activePlaceId === id) renderPlaceDetail(place);
}
function toggleItinerary(id) {
  if (itineraryIds.has(id)) itineraryIds.delete(id); else itineraryIds.add(id);
  saveStorage('buddhistHeritageItinerary', [...itineraryIds]);
  renderPlaces(); renderItinerary();
  const place = destinations.find(item => item.id === id);
  if (place && activePlaceId === id) renderPlaceDetail(place);
}
function updateProgress() {
  byId('visitedCount').textContent = bnDigits(visitedIds.size);
  byId('itineraryCount').textContent = bnDigits(itineraryIds.size);
  byId('visitedStat').textContent = bnDigits(visitedIds.size);
  const percent = Math.round((visitedIds.size / destinations.length) * 100);
  byId('progressPercent').textContent = `${bnDigits(percent)}%`;
}
function renderItinerary() {
  const places = destinations.filter(place => itineraryIds.has(place.id));
  if (!places.length) {
    byId('itineraryList').innerHTML = '<p class="itinerary-empty">তালিকা এখনো খালি। কোনো স্থানের কার্ড থেকে “তালিকায় যোগ” চাপুন।</p>';
  } else {
    byId('itineraryList').innerHTML = places.map(place => `<div class="itinerary-item"><input class="itinerary-check" type="checkbox" aria-label="${escapeHtml(place.name)} দেখা হয়েছে" data-action="visited" data-id="${place.id}" ${visitedIds.has(place.id) ? 'checked' : ''}><div><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.district)} · ${escapeHtml(place.division)} বিভাগ</small></div><button class="itinerary-remove" type="button" data-action="remove-itinerary" data-id="${place.id}" aria-label="${escapeHtml(place.name)} তালিকা থেকে সরান">×</button></div>`).join('');
  }
  updateProgress();
}
function exportItinerary() {
  const selected = destinations.filter(place => itineraryIds.has(place.id));
  if (!selected.length) { alert('ডাউনলোডের আগে অন্তত একটি স্থান ভ্রমণ তালিকায় যোগ করুন।'); return; }
  const lines = [
    'বাংলাদেশের বৌদ্ধ ঐতিহ্যবাহী স্থান নির্দেশিকা',
    `তালিকা তৈরি: ${new Date().toLocaleDateString('bn-BD')}`,
    '',
    ...selected.map((place, index) => `${index + 1}. ${place.name}\n   জেলা: ${place.district}; বিভাগ: ${place.division}\n   Google Maps: ${mapLinkFor(place)}\n   ATM: ${nearbyLink(place, 'ATM')}\n   হোটেল/রিসোর্ট: ${nearbyLink(place, 'hotel and resort')}\n   তথ্যসূত্র: ${place.source}`)
  ];
  const blob = new Blob(['\ufeff' + lines.join('\n\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'buddhist-heritage-bangladesh-itinerary.txt';
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
}

byId('placeGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (button) {
    const id = button.dataset.id;
    if (button.dataset.action === 'details') selectPlace(id);
    if (button.dataset.action === 'visited') toggleVisited(id);
    if (button.dataset.action === 'itinerary') toggleItinerary(id);
    return;
  }
  const card = event.target.closest('[data-place-card]');
  if (card) selectPlace(card.dataset.placeCard);
});
byId('placeDetail').addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  if (target.dataset.action === 'visited') toggleVisited(target.dataset.id);
  if (target.dataset.action === 'itinerary') toggleItinerary(target.dataset.id);
});
byId('itineraryList').addEventListener('change', event => {
  if (event.target.matches('input[data-action="visited"]')) toggleVisited(event.target.dataset.id);
});
byId('itineraryList').addEventListener('click', event => {
  const button = event.target.closest('[data-action="remove-itinerary"]');
  if (button) { itineraryIds.delete(button.dataset.id); saveStorage('buddhistHeritageItinerary', [...itineraryIds]); renderPlaces(); renderItinerary(); }
});
['placeSearch', 'divisionFilter', 'categoryFilter'].forEach(id => byId(id).addEventListener(id === 'placeSearch' ? 'input' : 'change', renderPlaces));
byId('clearFilters').addEventListener('click', () => { byId('placeSearch').value = ''; byId('divisionFilter').value = 'all'; byId('categoryFilter').value = 'all'; renderPlaces(); });
byId('sortVisited').addEventListener('click', () => { sortUnvisitedFirst = !sortUnvisitedFirst; byId('sortVisited').textContent = sortUnvisitedFirst ? 'দেখা হয়নি আগে ↑' : 'নাম অনুসারে A–Z'; renderPlaces(); });
byId('locateMe').addEventListener('click', () => requestLocation());
byId('nearbyAtm').addEventListener('click', () => {
  if (userPosition) { window.open(googleSearch(`ATM near ${userPosition.lat},${userPosition.lng}`), '_blank', 'noopener,noreferrer'); return; }
  // Open a blank tab synchronously to avoid popup blockers after geolocation resolves.
  const resultTab = window.open('about:blank', '_blank');
  if (resultTab) {
    resultTab.document.title = 'ATM খোঁজা হচ্ছে';
    resultTab.document.body.innerHTML = '<p style="font:16px sans-serif;padding:24px">আপনার অবস্থান শনাক্ত করা হচ্ছে…</p>';
  }
  requestLocation((lat, lng) => {
    const url = googleSearch(`ATM near ${lat},${lng}`);
    if (resultTab && !resultTab.closed) resultTab.location.href = url;
    else { byId('nearbyAtm').textContent = 'ATM-এর জন্য আবার চাপুন ↗'; }
  }, reason => {
    if (resultTab && !resultTab.closed) resultTab.close();
    alert(`${reason} আগে “আমার অবস্থান” চালু করুন বা কোনো গন্তব্য নির্বাচন করে তার ATM লিংক ব্যবহার করুন।`);
  });
});
byId('exportItinerary').addEventListener('click', exportItinerary);
byId('clearItinerary').addEventListener('click', () => {
  if (!itineraryIds.size) return;
  if (confirm('ভ্রমণ তালিকার সব স্থান মুছে ফেলবেন?')) { itineraryIds.clear(); saveStorage('buddhistHeritageItinerary', []); renderPlaces(); renderItinerary(); }
});
byId('navToggle').addEventListener('click', () => {
  const isOpen = byId('siteNav').classList.toggle('is-open');
  byId('navToggle').setAttribute('aria-expanded', String(isOpen));
});
byId('siteNav').addEventListener('click', event => {
  if (event.target.closest('a')) { byId('siteNav').classList.remove('is-open'); byId('navToggle').setAttribute('aria-expanded', 'false'); }
});

async function loadPublishedCommunityPlaces() {
  try {
    const response = await fetch(new URL('./content.json', document.baseURI), { cache: 'no-store' });
    if (!response.ok) return;
    const loaded = await response.json();
    const posts = Array.isArray(loaded) ? loaded : Array.isArray(loaded.posts) ? loaded.posts : [];
    posts.filter(post => post && post.type === 'place').forEach(post => {
      const latitude = Number(post.latitude);
      const longitude = Number(post.longitude);
      if (!post.title || post.latitude === null || post.latitude === undefined || post.latitude === '' || post.longitude === null || post.longitude === undefined || post.longitude === '' || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return;
      const id = `community-post-${String(post.id || post.title).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)}`;
      if (destinations.some(place => place.id === id)) return;
      const imageIsImage = String(post.mediaType || '').startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(String(post.mediaPath || post.mediaUrl || ''));
      destinations.push({
        id,
        name: String(post.title).slice(0, 140),
        district: String(post.district || 'জেলা উল্লেখ নেই').slice(0, 60),
        division: String(post.division || ''),
        kind: 'কমিউনিটি স্থান',
        category: 'কমিউনিটি স্থান',
        coords: [latitude, longitude],
        imageKey: null,
        customImageUrl: imageIsImage ? (post.mediaPath || post.mediaUrl || '') : '',
        summary: String(post.summary || '').slice(0, 500),
        history: String(post.body || post.summary || 'এই স্থানটি কমিউনিটি সদস্যের দেওয়া তথ্য থেকে যুক্ত হয়েছে। ভ্রমণের আগে স্থানীয়/বিশ্বস্ত সূত্রে যাচাই করুন।').slice(0, 10000),
        source: post.sourceUrl || '',
        sourceLabel: post.credit || 'কমিউনিটি-যোগ করা স্থান',
        dhamma: 'কমিউনিটি-যোগ করা তথ্য; যাত্রার আগে অবস্থান, প্রবেশাধিকার ও সূত্র যাচাই করুন।',
        quoteRef: post.sourceUrl || 'https://suttacentral.net/',
        trip: 'গন্তব্যে যাওয়ার আগে Google Maps-এ রুট ও স্থানীয় প্রবেশের নিয়ম যাচাই করুন.'
      });
    });
  } catch (error) {
    // A missing content.json is expected for a fresh local preview or a file:// launch.
  }
}

byId('currentYear').textContent = new Date().getFullYear();
(async function startApp() {
  await loadPublishedCommunityPlaces();
  renderPlaces();
  renderItinerary();
  initMap();
  if (activePlaceId) renderPlaceDetail(selectedPlace());
})();
