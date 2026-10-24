/* চর্যাভূমি — কেন্দ্রীয় কনফিগ (সাইট-মালিক এখানে কী বসাবেন)
   ------------------------------------------------------------------
   নিরাপত্তা: এই ফাইলটি ব্রাউজারে যায় — এখানে কোনো গোপন API SECRET বসাবেন না।
   Gemini/OpenAI-এর আসল কী থাকবে শুধু সার্ভারে (server/sanghamitra_api.py-এর
   environment variable-এ)। এখানে শুধু পাবলিক endpoint / পাবলিক আইডি বসে। */
window.CHARYABHUMI_CONFIG = {
  /* সংঘমিত্র অনলাইন AI endpoint — সার্ভারে sanghamitra_api চালু করে URL বসান।
     ফাঁকা রাখলে স্থানীয় source-based গাইডই চলবে (ডিফল্ট, নিরাপদ)। */
  sanghamitraApiUrl: "",

  /* Google Analytics 4 Measurement ID (যেমন G-XXXXXXXXXX) — ফাঁকা = বন্ধ।
     চালু করলেও এই সাইটে ব্যক্তিগত ট্র্যাকার-ডেটা/জার্নাল পাঠানো হয় না। */
  gaMeasurementId: "",

  /* Google Maps JavaScript API key (যদি কাস্টম Street View JS ব্যবহার করতে চান)।
     ডিফল্টে key ছাড়াই embed/link ভিত্তিক Street View চলে। Key বসালে
     Google Cloud Console-এ HTTP referrer restriction অবশ্যই দিন। */
  googleMapsApiKey: "",

  /* Firebase (ক্রাউডসোর্স ফিল্ড-রিপোর্ট সার্ভারে পাঠাতে চাইলে) —
     firebaseConfig পাবলিক কনফিগ হলেও Firestore Rules (firestore.rules) দিয়েই
     নিরাপত্তা নিশ্চিত করতে হবে। এখন ফাঁকা = রিপোর্ট শুধু ব্রাউজারে + JSON export। */
  firebaseConfig: null,

  /* Supabase বিকল্প (URL + anon key) — Row Level Security ছাড়া ব্যবহার করবেন না। */
  supabase: null,

  /* স্পন্সর/বিজ্ঞাপন (Google Ad Manager/AdSense) — data/support-config.json-এর
     sponsor_policy.enabled=true না করা পর্যন্ত কোনো বিজ্ঞাপন দেখাবে না। */
  adsenseClient: ""
};
