/* Charyabhumi Research & Travel Atlas — local, bilingual, source-linked. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var PASSPORT_KEY = 'charyabhumiAtlasPassportV1';
  var DRAFT_KEY = 'charyabhumiAtlasFieldDraftsV1';
  var state = {
    data: null, content: null, lang: 'bn', q: '', region: 'all', district: 'all',
    selected: null, circuit: 'greater-comilla', bib: 'all', audioSite: 'somapura',
    answers: {}, tourLoaded: {}, passport: readPassport(), drafts: readDrafts(), speaking: false
  };
  var toastTimer;

  var UI = {
    jumpProfiles: ['প্রোফাইল', 'Profiles'], jumpTours: ['360° ও মিডিয়া', '360° & media'],
    jumpCircuits: ['সার্কিট', 'Circuits'], jumpResearch: ['গবেষণা', 'Research'],
    jumpField: ['ফিল্ড আপডেট', 'Field updates'], jumpPassport: ['পাসপোর্ট', 'Passport'],
    jumpLearning: ['পরিবার ও স্কুল', 'Family & school'], jumpBib: ['বিবলিওগ্রাফি', 'Bibliography'],
    profilesTitle: ['প্রত্নস্থলের গভীর profile', 'In-depth archaeological site profiles'],
    profilesSub: ['প্রতিষ্ঠার শতক, বংশ, ধরন, খনন, অবস্থা, কর্তৃপক্ষ, UNESCO, আইন, নিদর্শন, জাদুঘর, উৎস ও visitor metadata—একটি করে dossier.', 'Foundation, dynasty, classification, excavation, condition, authority, UNESCO and legal status, finds, museums, sources and visitor metadata—one dossier at a time.'],
    searchLabel: ['নাম, জেলা বা বিষয় খুঁজুন', 'Search name, district or subject'], regionLabel: ['অঞ্চল', 'Region'],
    districtLabel: ['জেলা', 'District'], clearFilters: ['ছাঁকনি মুছুন', 'Clear filters'],
    toursTitle: ['360° tour, contemporary ছবি ও archival survey', '360° tours, contemporary photographs and archival surveys'],
    toursSub: ['প্রকৃত provider-hosted sphere ছাড়া flat photo-কে 360° বলা নয়। প্রতিটি local image-এর creator ও licence; protected content-এর ক্ষেত্রে link বা অনুমোদিত embed.', 'A flat photograph is never called 360°. Local images carry creator and licence credits; protected media use a source link or permitted embed.'],
    archiveTitle: ['প্রকাশ্য archival reading', 'Open archival reading'], archiveNote: ['মূল scan, প্রকাশন-তারিখ ও rights note সংরক্ষিত', 'Original source, publication date and rights notes retained'],
    photoCredits: ['স্থানীয় ছবির creator ও licence দেখুন', 'View local image creators and licences'],
    circuitsTitle: ['দুটি sourced ভ্রমণ circuit', 'Two source-linked travel circuits'],
    circuitsSub: ['দূরত্ব straight-line planning aid; road distance, fare, schedule ও road condition নয়। প্রতিটি লাল verification label পড়ে যান।', 'Distances are straight-line planning aids, not road distances, fares, schedules or road conditions. Read every verification label.'],
    printPlan: ['প্ল্যান প্রিন্ট', 'Print plan'], beforeTravel: ['যাত্রার আগে পাঁচটি যাচাই', 'Five checks before travel'],
    noInvented: ['কোনো unverified fare, schedule বা road condition লেখা হয়নি।', 'No unverified fare, schedule or road condition has been invented.'],
    researchTitle: ['খনন, সংরক্ষণ ও তথ্য-হালনাগাদ', 'Excavation, conservation and metadata updates'],
    researchSub: ['গবেষকের field report, সরকারি heritage metadata ও সংবাদ—ধরন আলাদা করে। ‘চলমান বিশ্লেষণ’-কে চূড়ান্ত আবিষ্কার বলা নয়।', 'Researcher field reports, official heritage metadata and news are labelled separately. Ongoing analysis is not presented as a final discovery.'],
    fieldTitle: ['ক্ষতি, নতুন তথ্য বা ছবির correction draft', 'Draft damage, new information or photo corrections'],
    fieldLead: ['এই static portal কোনো তথ্য server-এ পাঠায় না। Draft শুধু আপনার browser-এ থাকে; JSON export করে নিজে DoA/স্থানীয় কর্তৃপক্ষে পাঠাতে হবে।', 'This static portal sends nothing to a server. Drafts stay in your browser; export JSON and send it to DoA or the relevant authority yourself.'],
    notOfficial: ['এটি অফিসিয়াল damage report নয়।', 'This is not an official damage report.'],
    urgentHelp: ['চলমান লুট, ভাঙচুর বা বিপদে form-এ অপেক্ষা নয়—DoA/স্থানীয় কর্তৃপক্ষ বা ৯৯৯। ঝুঁকিপূর্ণ এলাকায় ঢুকবেন না।', 'For active looting, vandalism or danger, contact DoA/local authorities or 999 instead of waiting on a form. Never enter a dangerous area.'],
    fieldRule1: ['Observation ও অনুমান আলাদা লিখুন', 'Separate observations from interpretations'],
    fieldRule2: ['অন্যের ছবি হলে creator, source ও licence/permission দিন', 'Credit other creators and give source and licence/permission'],
    fieldRule3: ['শিশু/ব্যক্তির মুখ, ঠিকানা বা sensitive find location প্রকাশ করবেন না', 'Do not publish faces, addresses or sensitive find locations'],
    fieldSite: ['প্রত্নস্থল', 'Site'], fieldType: ['আপডেটের ধরন', 'Update type'], fieldDate: ['পর্যবেক্ষণের তারিখ', 'Observation date'],
    fieldLocation: ['নিরাপদ, সাধারণ অবস্থান', 'Safe, general location'], fieldSource: ['উৎস / ছবির link (যদি থাকে)', 'Source or photo link (if any)'],
    fieldObservation: ['সরাসরি পর্যবেক্ষণ ও যাচাইযোগ্য বিবরণ', 'Direct observation and verifiable description'],
    fieldRights: ['ছবির creator, licence/permission বা উৎস-সীমা', 'Image creator, licence/permission or source limitation'],
    saveDraft: ['Browser-এ draft রাখুন', 'Save draft in browser'], exportDrafts: ['সব draft JSON export', 'Export all drafts as JSON'],
    myDrafts: ['আমার local draft', 'My local drafts'], importDrafts: ['Draft import', 'Import drafts'],
    passportTitle: ['প্রশ্নের উত্তরে stamp, প্রমাণে level', 'Earn stamps through evidence, progress through learning'],
    passportName: ['পাসপোর্টের নাম (ঐচ্ছিক)', 'Passport name (optional)'], exportPassport: ['পাসপোর্ট export', 'Export passport'],
    importPassport: ['Import', 'Import'], printPassport: ['প্রিন্ট', 'Print'], resetPassport: ['Reset', 'Reset'],
    huntTitle: ['Evidence treasure hunts', 'Evidence treasure hunts'], huntNote: ['সব প্রয়োজনীয় stamp মিললে badge', 'Complete every required stamp to earn the badge'],
    learningTitle: ['ইটুর সঙ্গে শুনুন, খুঁজুন, তৈরি করুন', 'Listen, investigate and create with Itu'],
    learningSub: ['বাংলা ও English transcript-সহ browser speech; prerecorded human voice বলে দাবি নয়। পুরোনো children tools আবার তৈরি নয়—সরাসরি ব্যবহার করুন।', 'Browser speech with Bangla and English transcripts, not a claim of prerecorded human narration. Existing children’s tools are linked, not rebuilt.'],
    chooseStory: ['গল্পের প্রত্নস্থল', 'Choose a story site'], listen: ['শুনুন', 'Listen'], stop: ['থামান', 'Stop'],
    audioNote: ['ডিভাইসে Bangla/English voice থাকলে browser-generated narration বাজবে; transcript সবসময় পড়া যায়।', 'If your device has a Bangla or English voice, browser-generated narration will play; the transcript always remains readable.'],
    transcriptNote: ['Transcript পড়ে narration মিলিয়ে নিন; তথ্যের মূল উৎস profile-এর bibliography.', 'Follow the transcript and consult the profile bibliography for the underlying sources.'],
    schoolKit: ['স্কুল ট্রিপ field notebook', 'School trip field notebook'],
    schoolKitText: ['৬ পাতা · ভূমিকা, নিরাপত্তা, observation, sketch, damage draft ও ১২ stamp page · বাংলা/English.', 'Six pages: roles, safety, observation, sketching, damage drafts and twelve stamp spaces, in Bangla and English.'],
    atlasComic: ['ইটু ও হারানো ফলকের রহস্য', 'Itu and the missing plaque'],
    atlasComicText: ['৩ পাতা · ৬ panel · original bilingual archaeology/Pala-era comic; imagined scene স্পষ্টভাবে চিহ্নিত।', 'Three pages and six panels: an original bilingual archaeology/Pala-era comic with imagined scenes clearly labelled.'],
    bibTitle: ['কোন তথ্য কোন উৎসে?', 'Which claim comes from which source?'],
    bibSub: ['Publisher, তারিখ, source type ও rights/use note-সহ ৩৫টি উৎস। Site বেছে সংশ্লিষ্ট bibliography দেখুন.', 'Browse 35 sources with publisher, date, type and rights/use notes, or filter by site.'],
    bibFilter: ['Profile বেছে নিন', 'Choose a profile']
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function tx(bn, en) { return state.lang === 'en' ? en : bn; }
  function T(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return state.lang === 'en' ? (value.en || value.bn || '') : (value.bn || value.en || '');
  }
  function ui(key) { var pair = UI[key]; return pair ? tx(pair[0], pair[1]) : key; }
  function num(value) { return Number(value).toLocaleString(state.lang === 'en' ? 'en-GB' : 'bn-BD'); }
  function site(id) { return state.data.sites.find(function (s) { return s.id === id; }); }
  function source(id) { return state.data.sources.find(function (s) { return s.id === id; }); }
  function hub(id) { return state.data.hubs.find(function (h) { return h.id === id; }); }
  function readJSON(key, fallback) { try { var value = JSON.parse(localStorage.getItem(key)); return value || fallback; } catch (_) { return fallback; } }
  function readPassport() {
    var value = readJSON(PASSPORT_KEY, {name:'',stamps:{}});
    if (!value || typeof value !== 'object') value = {name:'',stamps:{}};
    if (!value.stamps || typeof value.stamps !== 'object') value.stamps = {};
    return {name:String(value.name || '').slice(0,80), stamps:value.stamps};
  }
  function readDrafts() { var value = readJSON(DRAFT_KEY, []); return Array.isArray(value) ? value.slice(0,100) : []; }
  function savePassport() { try { localStorage.setItem(PASSPORT_KEY, JSON.stringify(state.passport)); } catch (_) {} }
  function saveDrafts() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state.drafts)); } catch (_) {} }
  function announce(message) {
    var el = $('atlasToast'); if (!el) return;
    el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3600);
  }
  function external(url) { return /^https:\/\//.test(url || ''); }
  function sourceAnchor(id, label) {
    var s = source(id); if (!s) return '';
    return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(label || s.title) + ' ↗</a>';
  }
  function mapsUrl(s) { return 'https://www.google.com/maps/dir/?api=1&destination=' + s.coordinates.lat + ',' + s.coordinates.lon; }
  function osmUrl(s) { return 'https://www.openstreetmap.org/?mlat=' + s.coordinates.lat + '&mlon=' + s.coordinates.lon + '#map=15/' + s.coordinates.lat + '/' + s.coordinates.lon; }
  function km(a, b) {
    var rad = Math.PI / 180, dLat = (b.lat-a.lat)*rad, dLon = (b.lon-a.lon)*rad;
    var h = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  }
  function distance(s, h) { return tx('সরাসরি ≈ ', 'Straight-line ≈ ') + num(km(s.coordinates,h).toFixed(1)) + tx(' কিমি', ' km'); }
  function dateText(value) {
    if (!value) return '';
    var d = new Date(value); if (isNaN(d)) return String(value).slice(0,10);
    return d.toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'bn-BD', {year:'numeric',month:'short',day:'numeric'});
  }
  function hasStamp(id) { return Boolean(state.passport.stamps[id]); }
  function photoMarkup(photo, cls) {
    if (!photo) return '<div class="atlas-card-placeholder ' + esc(cls || '') + '"><b>⌖</b><span>' + esc(tx('লাইসেন্সযুক্ত স্থানীয় ছবি সংগ্রহ চলমান', 'Licensed local photograph pending')) + '</span></div>';
    return '<img src="' + esc(photo.file) + '" alt="' + esc(T(photo.alt)) + '" width="' + esc(photo.width || 1200) + '" height="' + esc(photo.height || 800) + '" loading="lazy">';
  }
  function creditMarkup(photo) {
    if (!photo) return '';
    var licence = photo.license_url ? '<a href="' + esc(photo.license_url) + '" target="_blank" rel="noopener">' + esc(photo.license) + '</a>' : esc(photo.license || '');
    return '© ' + esc(photo.credit || '') + ' · ' + licence + ' · <a href="' + esc(photo.page || photo.file) + '" target="_blank" rel="noopener">' + esc(tx('মূল/ক্রেডিট', 'Source/credit')) + ' ↗</a>';
  }

  function applyChrome() {
    document.querySelectorAll('[data-ui]').forEach(function (el) { el.textContent = ui(el.getAttribute('data-ui')); });
    if (!state.data) return;
    document.title = tx('Research & Travel Atlas · প্রত্নতত্ত্ব, ভ্রমণ ও প্রমাণ | চর্যাভূমি', 'Research & Travel Atlas · Archaeology, travel and evidence | Charyabhumi');
    $('heroKicker').textContent = tx('RESEARCH & TRAVEL ATLAS · উৎস → প্রমাণ → ভ্রমণ', 'RESEARCH & TRAVEL ATLAS · SOURCE → EVIDENCE → JOURNEY');
    $('atlasTitle').innerHTML = tx('প্রত্নতত্ত্ব পড়ুন,<br><span>পথ নিজে যাচাই করুন।</span>', 'Read the archaeology.<br><span>Verify the journey.</span>');
    $('heroLead').textContent = tx('প্রধান প্রত্নস্থলের গভীর বাংলা–English profile, archival survey, 360° tour, জেলা-hub দূরত্ব, research update আর পরিবারের evidence passport—একটি সংযুক্ত Atlas-এ।', 'In-depth bilingual profiles, archival surveys, genuine 360° links, district-hub distances, research updates and a family evidence passport—in one connected Atlas.');
    $('heroExplore').textContent = tx(num(state.data.sites.length) + 'টি profile পড়ুন ↓', 'Explore ' + num(state.data.sites.length) + ' profiles ↓');
    $('heroPassport').textContent = tx('পাসপোর্ট শুরু করুন', 'Start your passport');
    $('heroCaption').textContent = tx('পাহাড়পুর ও সোমপুর মহাবিহার—একই স্থান, একটি profile।', 'Paharpur and Somapura Mahavihara: one site, one profile.');
    var stats = document.querySelectorAll('.atlas-hero-stats strong');
    [state.data.sites.length,state.content.circuits.length,state.data.sources.length,3218].forEach(function (n,i) { if (stats[i]) stats[i].textContent = num(n); });
    $('statProfiles').textContent = tx('গভীর profile', 'in-depth profiles'); $('statCircuits').textContent = tx('ভ্রমণ circuit', 'travel circuits');
    $('statSources').textContent = tx('নথিভুক্ত উৎস', 'documented sources'); $('statRecords').textContent = tx('মূল রেকর্ড সংরক্ষিত', 'core records retained');
    $('scopeText').innerHTML = '<strong>' + esc(tx('পরিধি স্পষ্ট:', 'Clear scope:')) + '</strong> ' + esc(T(state.data.scope)) + ' <b>' + esc(T(state.data.verification_label)) + '</b> — ' + esc(tx('GPS হলো প্রকাশিত site/component coordinate, surveyed entrance নয়।', 'GPS values are published site/component coordinates, not surveyed entrances.'));
    $('existingMapLink').textContent = tx('৩২১৮ রেকর্ডের মূল মানচিত্র ↗', 'Open the existing 3,218-record map ↗');
    $('profileSearch').placeholder = tx('সোমপুর, কুমিল্লা, তাম্রলিপি…', 'Somapura, Cumilla, copperplate…');
    $('passportNote').textContent = T(state.content.passport.storage_note);
    $('passportName').placeholder = tx('আমার নাম / My name', 'My name / আমার নাম');
    document.querySelector('a[href="assets/atlas/school-field-notebook.pdf"]').textContent = tx('PDF ডাউনলোড · ৬ পাতা', 'Download PDF · 6 pages');
    document.querySelector('a[href="assets/atlas/itu-pala-evidence-comic.pdf"]').textContent = tx('Comic PDF ডাউনলোড', 'Download comic PDF');
    document.querySelector('a[href="children.html"].cb-btn.solid').textContent = tx('শিশু বিভাগ ↗', 'Open children’s section ↗');
    var region = $('profileRegion');
    if (region) {
      region.options[0].text = tx('সব অঞ্চল', 'All regions'); region.options[1].text = tx('লালমাই-ময়নামতি', 'Lalmai-Mainamati'); region.options[2].text = tx('উত্তর / বরেন্দ্র', 'Northern / Varendra');
    }
  }

  function populateSelects() {
    var district = $('profileDistrict'), currentDistrict = state.district;
    var districts = [];
    state.data.sites.forEach(function (s) { if (!districts.some(function (d) { return d.en === s.district.en; })) districts.push(s.district); });
    district.innerHTML = '<option value="all">' + esc(tx('সব জেলা', 'All districts')) + '</option>' + districts.map(function (d) { return '<option value="' + esc(d.en) + '">' + esc(T(d)) + '</option>'; }).join('');
    district.value = currentDistrict;
    var options = state.data.sites.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(T(s.name)) + '</option>'; }).join('');
    var field = $('fieldSite'), oldField = field.value; field.innerHTML = options; if (site(oldField)) field.value = oldField;
    var audio = $('audioSite'); audio.innerHTML = options; audio.value = state.audioSite;
    var bib = $('bibSite'); bib.innerHTML = '<option value="all">' + esc(tx('সব উৎস', 'All sources')) + '</option>' + options; bib.value = state.bib;
  }

  function renderProfiles() {
    var q = state.q.toLowerCase();
    var list = state.data.sites.filter(function (s) {
      if (state.region !== 'all' && s.region !== state.region) return false;
      if (state.district !== 'all' && s.district.en !== state.district) return false;
      if (!q) return true;
      return JSON.stringify(s).toLowerCase().indexOf(q) !== -1;
    });
    $('profileCount').textContent = tx(num(list.length) + ' / ' + num(state.data.sites.length) + 'টি profile দেখানো হচ্ছে', 'Showing ' + num(list.length) + ' of ' + num(state.data.sites.length) + ' profiles');
    $('profileGrid').innerHTML = list.length ? list.map(function (s) {
      return '<article class="atlas-profile-card">' +
        '<div class="atlas-card-media">' + photoMarkup(s.photo) + '<span class="atlas-card-region">' + esc(s.region === 'mainamati' ? tx('ময়নামতি', 'Mainamati') : tx('বরেন্দ্র', 'Varendra')) + '</span></div>' +
        '<div class="atlas-card-body"><h3>' + esc(T(s.name)) + '</h3><p class="atlas-card-location">' + esc(T(s.district) + ' · ' + T(s.upazila)) + '</p>' +
        '<p class="atlas-card-summary">' + esc(T(s.summary)) + '</p><div class="atlas-card-meta"><span>' + esc(T(s.period)) + '</span><span>' + esc(s.classification && s.classification.bn ? (s.region === 'mainamati' ? tx('Mainamati component', 'Mainamati component') : tx('Major profile', 'Major profile')) : '') + '</span></div>' +
        '<div class="atlas-card-footer"><button type="button" data-profile="' + esc(s.id) + '">' + esc(tx('সম্পূর্ণ dossier পড়ুন →', 'Read full dossier →')) + '</button><span class="atlas-stamp-mini ' + (hasStamp(s.id) ? 'earned' : '') + '">' + (hasStamp(s.id) ? '☸ ' + esc(tx('Stamp আছে', 'Stamped')) : '○ ' + esc(tx('প্রশ্নের অপেক্ষায়', 'Quest open'))) + '</span></div></div></article>';
    }).join('') : '<p class="atlas-empty">' + esc(tx('এই ছাঁকনিতে কোনো profile নেই। ছাঁকনি মুছে আবার দেখুন।', 'No profiles match. Clear the filters and try again.')) + '</p>';
  }

  function sourceList(ids) {
    return '<ul class="atlas-sources">' + ids.map(function (id) {
      var s = source(id); if (!s) return '';
      return '<li class="atlas-source-item">' + sourceAnchor(id) + '<p>' + esc(s.publisher) + (s.published ? ' · ' + esc(s.published) : '') + ' · ' + esc(s.kind) + '</p><small>' + esc(s.rights) + '</small></li>';
    }).join('') + '</ul>';
  }

  function travelPanel(s) {
    var tr = s.travel, h = hub(tr.hub);
    var hubs = state.data.hubs.slice().sort(function (a,b) { return km(s.coordinates,a)-km(s.coordinates,b); });
    var distances = tr.published_distances.map(function (d) { return '<li>' + esc(T(d)) + '</li>'; }).join('');
    var computed = hubs.map(function (x) { return '<li><b>' + esc(T(x.name)) + ':</b> ' + esc(distance(s,x)) + '</li>'; }).join('');
    return '<div class="atlas-travel-panel">' +
      '<div class="atlas-travel-cell full"><b>' + esc(tx('কীভাবে যাবেন', 'Access')) + '</b><p>' + esc(T(tr.access)) + '</p></div>' +
      '<div class="atlas-travel-cell"><b>' + esc(tx('প্রধান জেলা-hub', 'Primary district hub')) + '</b><p>' + esc(h ? T(h.name) + ' · ' + distance(s,h) : '') + '</p><ul class="atlas-distance-list">' + computed + '</ul></div>' +
      '<div class="atlas-travel-cell"><b>' + esc(tx('প্রকাশিত দূরত্ব', 'Published distances')) + '</b>' + (distances ? '<ul class="atlas-distance-list">' + distances + '</ul>' : '<p>' + esc(tx('নির্ভরযোগ্য প্রকাশিত দূরত্ব এই profile-এ যোগ হয়নি।', 'No reviewed published distance has been added to this profile.')) + '</p>') + '</div>' +
      '<div class="atlas-travel-cell"><b>' + esc(tx('খোলার সময়', 'Hours')) + '</b><p>' + esc(T(tr.hours)) + '</p></div>' +
      '<div class="atlas-travel-cell"><b>' + esc(tx('টিকিট / প্রবেশমূল্য', 'Tickets / admission')) + '</b><p>' + esc(T(tr.fees)) + '</p></div>' +
      '<div class="atlas-travel-cell full"><span class="atlas-verify">' + esc(T(state.data.verification_label)) + '</span><p>' + esc(T(tr.road)) + '</p><p style="margin-top:8px">' + esc(T(tr.access_note)) + '</p><p style="margin-top:10px">' + sourceAnchor('rail',tx('সরকারি rail ticket','Official rail tickets')) + ' · ' + sourceAnchor('doa-hours',tx('সরকারি সময়সূচি','Official schedule')) + ' · <a href="tel:999">Emergency 999</a></p></div></div>';
  }

  function questMarkup(s) {
    var q = s.quest, answers = state.lang === 'en' ? q.answers_en : q.answers_bn, chosen = state.answers[s.id];
    var answered = typeof chosen === 'number';
    return '<div class="atlas-quest"><div class="atlas-quest-head"><div><h4>☸ ' + esc(tx('প্রমাণ খুঁজে stamp জিতুন', 'Earn a stamp from the evidence')) + '</h4><p>' + esc(T(q.question)) + '</p></div><span class="atlas-stamp-mini ' + (hasStamp(s.id) ? 'earned' : '') + '">' + (hasStamp(s.id) ? '☸ ' + esc(tx('Stamp অর্জিত', 'Stamp earned')) : '') + '</span></div>' +
      '<div class="atlas-quest-answers">' + answers.map(function (a,i) {
        var cls = answered ? (i === q.correct ? 'correct' : i === chosen ? 'wrong' : '') : '';
        return '<button type="button" class="' + cls + '" data-answer-site="' + esc(s.id) + '" data-answer="' + i + '">' + esc(a) + '</button>';
      }).join('') + '</div>' +
      (answered ? '<p class="atlas-quest-feedback" tabindex="-1" data-quest-feedback>' + esc(T(q.explanation)) + ' ' + sourceAnchor(q.evidence,tx('প্রমাণের উৎস','Evidence source')) + '</p>' : '<p>' + esc(tx('উত্তর দিলে ব্যাখ্যা ও মূল উৎস খুলবে। ভুল উত্তরেও শেখার সুযোগ আছে; stamp শুধু সঠিক প্রমাণে।', 'Answer to reveal the explanation and source. A wrong answer still teaches; only the evidence-backed answer earns the stamp.')) + '</p>') + '</div>';
  }

  function renderProfileDetail() {
    var box = $('profileDetail');
    if (!state.selected || !site(state.selected)) { box.innerHTML = ''; return; }
    var s = site(state.selected), h = hub(s.travel.hub);
    var media = s.media || [];
    var mediaHtml = media.length ? '<details><summary>' + esc(tx('অতিরিক্ত ছবি ও archival plate', 'Additional photographs and archival plates')) + '</summary><div class="atlas-archive-grid">' + media.map(function (m) {
      return '<figure class="atlas-archive-card" style="margin:0"><img src="' + esc(m.file) + '" alt="' + esc(T(m.alt)) + '" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px"><figcaption><h4>' + esc(T(m.alt)) + '</h4><p>' + creditMarkup(m) + '</p><a href="' + esc(m.file) + '" target="_blank" rel="noopener">' + esc(tx('ছবি খুলুন','Open image')) + ' ↗</a></figcaption></figure>';
    }).join('') + '</div></details>' : '';
    var tour = s.tour ? '<details><summary>360° · ' + esc(T(s.tour.title)) + '</summary><div><p style="font-size:12px">' + esc(T(s.tour.note)) + '</p>' + (s.tour.mode === 'external' ? sourceAnchor(s.tour.source,tx('Provider-hosted tour খুলুন','Open provider-hosted tour')) : '<a href="#tours">' + esc(tx('অনুমোদিত embed section-এ যান','Go to the permitted embed section')) + '</a>') + '</div></details>' : '';
    box.innerHTML = '<article class="atlas-dossier" id="dossier-' + esc(s.id) + '">' +
      '<div class="atlas-dossier-head"><figure>' + photoMarkup(s.photo) + (s.photo ? '<figcaption>' + creditMarkup(s.photo) + '</figcaption>' : '') + '</figure><div class="atlas-dossier-title"><button class="atlas-dossier-close" type="button" data-close-profile>' + esc(tx('বন্ধ করুন ×','Close ×')) + '</button><span class="atlas-card-location">' + esc(T(s.district) + ' · ' + T(s.upazila)) + '</span><h3>' + esc(T(s.name)) + '</h3><p>' + esc(T(s.summary)) + '</p><span class="atlas-stamp-mini ' + (hasStamp(s.id) ? 'earned' : '') + '">' + (hasStamp(s.id) ? '☸ ' + esc(tx('Evidence passport-এ stamp আছে','Stamped in your evidence passport')) : '○ ' + esc(tx('নিচের evidence quest খোলা আছে','Evidence quest available below'))) + '</span></div></div>' +
      '<div class="atlas-coordinate-strip"><div><b>GPS · ' + s.coordinates.lat.toFixed(6) + ', ' + s.coordinates.lon.toFixed(6) + '</b><span>' + esc(T(s.coordinates.accuracy)) + '</span></div><div><b>' + esc(h ? T(h.name) : '') + '</b><span>' + esc(h ? distance(s,h) + ' · ' + tx('road distance নয়','not road distance') : '') + '</span></div><div><b>' + esc(tx('স্থানাঙ্কের উৎস','Coordinate source')) + '</b>' + sourceAnchor(s.coordinates.source,tx('প্রকাশিত রেকর্ড','Published record')) + '</div><div><b>' + esc(tx('রুট ও মানচিত্র','Route and map')) + '</b><a href="' + esc(mapsUrl(s)) + '" target="_blank" rel="noopener">Google Maps ↗</a> · <a href="' + esc(osmUrl(s)) + '" target="_blank" rel="noopener">OSM ↗</a><br><span>' + esc(tx('গেট আলাদা করে নিশ্চিত করুন','Confirm the gate separately')) + '</span></div></div>' +
      '<div class="atlas-dossier-body"><div class="atlas-fact-grid">' +
        fact(tx('শ্রেণি / Vihara–Stupa–Temple','Classification'),T(s.classification)) + fact(tx('যুগ ও প্রতিষ্ঠার শতক','Period and foundation'),T(s.period)) + fact(tx('বংশ / প্রতিষ্ঠাতা','Dynasty / founder'),T(s.dynasty)) + fact(tx('ব্যবস্থাপনা কর্তৃপক্ষ','Managing authority'),T(s.authority)) +
      '</div><div class="atlas-dossier-columns"><div>' +
        dossierSection(tx('স্থাপত্য ও plan','Architecture and plan'),T(s.architecture)) + dossierSection(tx('আবিষ্কার ও খনন','Discovery and excavation'),T(s.excavation)) + dossierSection(tx('সংরক্ষণ অবস্থা','Preservation condition'),T(s.condition)) +
        '<div class="atlas-dossier-section"><h4>' + esc(tx('শিলা-লিপি, টেরাকোটা, ব্রোঞ্জ, মুদ্রা','Inscriptions, terracotta, bronze and coins')) + '</h4><ul>' + s.finds.map(function (f) { return '<li>' + esc(T(f)) + '</li>'; }).join('') + '</ul></div>' +
      '</div><div><div class="atlas-status-stack"><div class="atlas-status"><b>UNESCO</b>' + esc(T(s.unesco)) + '</div><div class="atlas-status legal"><b>' + esc(tx('আইনি সুরক্ষা','Legal protection')) + '</b>' + esc(T(s.legal)) + '</div></div>' +
        '<div class="atlas-dossier-section" style="margin-top:18px"><h4>' + esc(tx('জাদুঘর ও সংগ্রহ','Museums and collections')) + '</h4><ul>' + s.museums.map(function (m) { return '<li>' + esc(T(m)) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="atlas-dossier-section"><h4>' + esc(tx('ফিল্ড correction','Field correction')) + '</h4><p><a href="#field-desk" data-field-site="' + esc(s.id) + '">' + esc(tx('এই site-এর update draft লিখুন →','Draft an update for this site →')) + '</a></p></div>' +
      '</div></div>' +
      '<details open><summary>' + esc(tx('ভ্রমণ: দূরত্ব, সময়, টিকিট, সড়ক ও জরুরি তথ্য','Travel: distance, hours, tickets, roads and emergency information')) + '</summary><div>' + travelPanel(s) + '</div></details>' +
      '<details><summary>' + esc(tx('Site-linked bibliography ও rights notes','Site-linked bibliography and rights notes')) + '</summary><div>' + sourceList(s.source_ids) + '</div></details>' + mediaHtml + tour +
      '<details><summary>' + esc(tx('বাংলা / English audio transcript','Bangla / English audio transcript')) + '</summary><div><p style="font-size:13px;line-height:1.9">' + esc(s.audio[state.lang]) + '</p><button class="cb-btn ghost sm" type="button" data-listen-site="' + esc(s.id) + '">▶ ' + esc(tx('Browser narration শুনুন','Play browser narration')) + '</button><p style="font-size:10px;margin-top:10px">' + esc(tx('Browser-generated voice; prerecorded human narration নয়।','Browser-generated voice, not prerecorded human narration.')) + '</p></div></details>' +
      questMarkup(s) + '</div></article>';
  }
  function fact(label, value) { return '<div class="atlas-fact"><b>' + esc(label) + '</b><p>' + esc(value) + '</p></div>'; }
  function dossierSection(title, text) { return '<div class="atlas-dossier-section"><h4>' + esc(title) + '</h4><p>' + esc(text) + '</p></div>'; }

  function tourView(s) {
    if (s.tour.mode === 'external') return '<div class="atlas-tour-view"><div><div class="atlas-tour-orb">◉</div><p>' + esc(tx('প্রকৃত provider-hosted 360° tour নতুন ট্যাবে; reuse permission না থাকায় কোনো ফাইল mirror নয়।', 'Open the genuine provider-hosted 360° tour in a new tab; no files are mirrored without reuse permission.')) + '</p>' + sourceAnchor(s.tour.source,tx('360° tour খুলুন ↗','Open 360° tour ↗')) + '</div></div>';
    if (state.tourLoaded[s.id]) return '<div class="atlas-tour-view"><iframe src="' + esc(s.tour.embed_url) + '" title="' + esc(T(s.tour.title)) + '" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
    return '<div class="atlas-tour-view"><div><div class="atlas-tour-orb">◉</div><p>' + esc(tx('Click করলে 360Cities content লোড হবে। Provider unavailable হলে মূল source link ব্যবহার করুন।', 'Click to load 360Cities content. Use the source link if the provider is unavailable.')) + '</p><button class="cb-btn solid" type="button" data-tour-load="' + esc(s.id) + '">360° ' + esc(tx('লোড করুন','Load')) + '</button></div></div>';
  }
  function renderTours() {
    var tours = state.data.sites.filter(function (s) { return s.tour; });
    $('tourGrid').innerHTML = tours.map(function (s) {
      return '<article class="atlas-tour-card">' + tourView(s) + '<div class="atlas-tour-body"><h3>' + esc(T(s.tour.title)) + '</h3><p>' + esc(T(s.tour.note)) + '</p><small>' + esc(source(s.tour.source).rights) + '</small><p style="margin-top:10px">' + sourceAnchor(s.tour.source,tx('মূল provider page','Original provider page')) + ' · <button type="button" data-profile="' + esc(s.id) + '" style="border:0;background:none;padding:0;text-decoration:underline;cursor:pointer">' + esc(tx('Site profile','Site profile')) + '</button></p></div></article>';
    }).join('');
    $('archiveGrid').innerHTML = state.content.archival.map(function (a) {
      var url = a.file || a.url;
      return '<article class="atlas-archive-card"><span class="atlas-archive-kind">' + esc(a.category) + '</span><h4>' + esc(T(a.title)) + '</h4><p>' + esc(T(a.text)) + '</p><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(a.file && /\.pdf$/i.test(a.file) ? tx('PDF খুলুন','Open PDF') : tx('সংরক্ষণাগার item খুলুন','Open archival item')) + ' ↗</a><p style="margin-top:10px">' + sourceAnchor(a.source,tx('সম্পূর্ণ মূল উৎস','Complete original source')) + '</p></article>';
    }).join('');
    var photos = [], seen = {};
    state.data.sites.forEach(function (s) { [s.photo].concat(s.media || []).forEach(function (p) { if (p && p.file && !seen[p.file]) { seen[p.file] = true; photos.push({photo:p,site:s}); } }); });
    $('photoCreditGrid').innerHTML = photos.map(function (x) {
      return '<p><a href="' + esc(x.photo.file) + '" target="_blank" rel="noopener">' + esc(T(x.site.name)) + '</a><br>' + creditMarkup(x.photo) + '</p>';
    }).join('');
  }

  function renderCircuits() {
    $('circuitTabs').innerHTML = state.content.circuits.map(function (c) {
      return '<button type="button" role="tab" aria-selected="' + (state.circuit === c.id) + '" data-circuit="' + esc(c.id) + '">' + esc(T(c.name)) + '</button>';
    }).join('');
    var c = state.content.circuits.find(function (x) { return x.id === state.circuit; }) || state.content.circuits[0];
    var total = 0, previous = null, h = hub(c.hub);
    var stops = c.stops.map(function (stop,index) {
      var s = site(stop.site), leg = '';
      if (previous) { var value = km(previous.coordinates,s.coordinates); total += value; leg = tx('আগের stop থেকে ≈ ','From previous ≈ ') + num(value.toFixed(1)) + tx(' কিমি',' km'); }
      previous = s;
      return '<div class="atlas-route-stop ' + (hasStamp(s.id) ? 'done' : '') + '"><span class="atlas-route-dot"></span><button type="button" data-profile="' + esc(s.id) + '">' + esc(T(s.name)) + '</button><small>' + esc(tx('দিন ','Day ') + num(stop.day)) + (hasStamp(s.id) ? ' · ☸' : '') + '</small>' + (leg ? '<span class="atlas-route-leg">' + esc(leg) + '</span>' : '<span class="atlas-route-leg">' + esc(h ? T(h.name) + ' → ≈ ' + num(km(h,s.coordinates).toFixed(1)) + tx(' কিমি',' km') : '') + '</span>') + '</div>';
    }).join('');
    $('circuitPlan').innerHTML = '<div class="atlas-circuit-intro"><div><h3>' + esc(T(c.name)) + '</h3><p>' + esc(T(c.summary)) + '</p><p class="atlas-route-total">' + esc(tx('Stops-এর মধ্যে straight-line মোট ≈ ','Straight-line total between stops ≈ ') + num(total.toFixed(1)) + tx(' কিমি · actual road route নয়',' km · not an actual road route')) + '</p></div><div class="atlas-circuit-days"><strong>' + num(c.days) + '</strong><span>' + esc(tx('দিনের ধীর পরিকল্পনা','day slower plan')) + '</span></div></div><div class="atlas-route">' + stops + '</div><div class="atlas-circuit-notes">' + c.notes.map(function (n) { return '<p>' + esc(T(n)) + '</p>'; }).join('') + '</div>';
    $('travelModes').innerHTML = state.content.travel_modes.map(function (m) {
      return '<article class="atlas-mode-card"><span aria-hidden="true">' + m.icon + '</span><h4>' + esc(T(m.name)) + '</h4><p>' + esc(T(m.text)) + '</p>' + (m.source ? sourceAnchor(m.source,tx('Official checking link','Official checking link')) : '<small>' + esc(tx('পরিচালকের authorised counter','Operator’s authorised counter')) + '</small>') + '</article>';
    }).join('');
    $('travelChecklist').innerHTML = state.content.travel_checklist.map(function (x) { return '<li>' + esc(T(x)) + '</li>'; }).join('');
  }

  function renderUpdates() {
    var updates = state.content.updates.slice().sort(function (a,b) { return b.date.localeCompare(a.date); });
    var kindLabels = {metadata:tx('Visitor metadata','Visitor metadata'),research:tx('Field research','Field research'),news:tx('সংবাদ / lead','News / lead'),heritage:tx('Heritage metadata','Heritage metadata')};
    $('updateList').innerHTML = updates.map(function (u) {
      var s = site(u.site);
      return '<article class="atlas-update"><time class="atlas-update-date" datetime="' + esc(u.date) + '">' + esc(dateText(u.date)) + '</time><span class="atlas-update-kind">' + esc(kindLabels[u.kind] || u.kind) + '</span><div><h3>' + esc(T(u.title)) + '</h3><p>' + esc(T(u.text)) + '</p><p style="margin-top:6px"><button type="button" data-profile="' + esc(u.site) + '" style="border:0;background:none;padding:0;text-decoration:underline;cursor:pointer">' + esc(s ? T(s.name) : u.site) + '</button></p></div>' + sourceAnchor(u.source,tx('উৎস পড়ুন','Read source')) + '</article>';
    }).join('');
  }

  function renderDrafts() {
    if (!state.drafts.length) { $('draftList').innerHTML = '<p class="atlas-draft-empty">' + esc(tx('এখনো local draft নেই। Form পূরণ করলে তথ্য server-এ না গিয়ে এখানেই থাকবে।', 'No local drafts yet. The form saves here without sending information to a server.')) + '</p>'; return; }
    $('draftList').innerHTML = state.drafts.map(function (d) {
      var s = site(d.site);
      return '<article class="atlas-draft"><div class="atlas-draft-meta"><b>' + esc(s ? T(s.name) : d.site) + '</b><br>' + esc(d.kind) + '<br>' + esc(d.observed || tx('তারিখ নেই','No date')) + '</div><div><h4>' + esc(d.location) + '</h4><p>' + esc(d.description) + '</p>' + (d.rights ? '<p style="margin-top:7px"><b>Rights:</b> ' + esc(d.rights) + '</p>' : '') + (d.source && external(d.source) ? '<p style="margin-top:7px"><a href="' + esc(d.source) + '" target="_blank" rel="noopener">Source ↗</a></p>' : '') + '<p style="margin-top:7px;color:#9b432b"><b>' + esc(tx('Draft only · officially submitted নয়','Draft only · not officially submitted')) + '</b></p></div><div class="atlas-draft-actions"><button type="button" data-draft-export="' + esc(d.id) + '">JSON</button><button type="button" data-draft-delete="' + esc(d.id) + '">' + esc(tx('মুছুন','Delete')) + '</button></div></article>';
    }).join('');
  }

  function currentLevel() {
    var count = Object.keys(state.passport.stamps).filter(function (id) { return site(id); }).length;
    var levels = state.content.passport.levels, current = levels[0], next = null;
    levels.forEach(function (l) { if (count >= l.min) current = l; });
    next = levels.find(function (l) { return l.min > count; });
    return {count:count,current:current,next:next};
  }
  function renderPassport() {
    $('passportName').value = state.passport.name;
    var level = currentLevel(), percent = Math.round(level.count/state.data.sites.length*100);
    $('passportProgress').innerHTML = '<div class="atlas-level-badge"><span>☸</span><div><b>' + esc(T(level.current.name)) + '</b><small>' + esc(level.next ? tx('পরের level-এ আরও ','Next level in ') + num(level.next.min-level.count) + tx('টি stamp',' more stamp(s)') : tx('সর্বোচ্চ Atlas level সম্পূর্ণ','Highest Atlas level complete')) + '</small></div></div><div class="atlas-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + state.data.sites.length + '" aria-valuenow="' + level.count + '"><div class="atlas-progress-fill" style="width:' + percent + '%"></div></div><span class="atlas-progress-count">' + num(level.count) + ' / ' + num(state.data.sites.length) + '</span>';
    $('stampGrid').innerHTML = state.data.sites.map(function (s) {
      var earned = hasStamp(s.id), stamp = state.passport.stamps[s.id];
      return '<article class="atlas-stamp ' + (earned ? 'earned' : '') + '"><div class="atlas-stamp-seal">' + (earned ? '☸' : '?') + '</div><h4>' + esc(T(s.name)) + '</h4><small>' + esc(earned ? dateText(stamp) : tx('Evidence quest খোলা','Evidence quest open')) + '</small><button type="button" data-profile="' + esc(s.id) + '">' + esc(earned ? tx('Profile পড়ুন','Read profile') : tx('প্রশ্নে যান','Go to question')) + '</button></article>';
    }).join('');
    $('huntGrid').innerHTML = state.content.passport.hunts.map(function (h) {
      var done = h.required.filter(hasStamp).length, complete = done === h.required.length;
      return '<article class="atlas-hunt ' + (complete ? 'complete' : '') + '"><h4>' + (complete ? '✓ ' : '◇ ') + esc(T(h.name)) + '</h4><p>' + esc(T(h.text)) + '</p><span class="atlas-hunt-progress">' + num(done) + ' / ' + num(h.required.length) + ' stamps</span><strong class="atlas-hunt-badge">' + (complete ? '☸ ' : '○ ') + esc(T(h.badge)) + '</strong></article>';
    }).join('');
  }

  function renderLearning() {
    var s = site(state.audioSite) || state.data.sites[0]; state.audioSite = s.id;
    $('audioSite').value = s.id;
    $('transcriptTitle').textContent = T(s.name) + ' · ' + tx('Transcript', 'Transcript');
    $('transcriptText').textContent = s.audio[state.lang];
    $('childrenTools').innerHTML = state.content.passport.children_tools.map(function (tool) {
      return '<a class="atlas-child-tool" href="' + esc(tool.url) + '"><b>' + esc(T(tool.name)) + ' ↗</b><span>' + esc(T(tool.text)) + '</span></a>';
    }).join('');
    if (!state.speaking) $('audioStatus').textContent = ui('audioNote');
  }

  function renderBibliography() {
    var ids = state.bib === 'all' ? state.data.sources.map(function (s) { return s.id; }) : site(state.bib).source_ids;
    var list = ids.map(source).filter(Boolean);
    $('bibList').innerHTML = list.map(function (s,index) {
      var linked = state.data.sites.filter(function (p) { return p.source_ids.indexOf(s.id) !== -1; }).map(function (p) { return T(p.name); });
      return '<article class="atlas-bib-item"><span class="atlas-bib-number">' + String(index+1).padStart(2,'0') + '</span><div><h3>' + sourceAnchor(s.id) + '</h3><p>' + esc(s.publisher) + (s.published ? ' · ' + esc(s.published) : '') + ' · ' + esc(s.kind) + '</p><small>' + esc(s.rights) + '</small>' + (linked.length ? '<p>' + esc(tx('সংশ্লিষ্ট: ','Linked: ') + linked.join(tx(' · ',' · '))) + '</p>' : '') + '</div></article>';
    }).join('');
  }

  function renderAll() {
    if (!state.data) { applyChrome(); return; }
    applyChrome(); populateSelects(); renderProfiles(); renderProfileDetail(); renderTours(); renderCircuits(); renderUpdates(); renderDrafts(); renderPassport(); renderLearning(); renderBibliography();
  }

  function selectProfile(id, scroll) {
    if (!site(id)) return;
    state.selected = id; renderProfileDetail();
    try { history.pushState({site:id},'', 'atlas.html?site=' + encodeURIComponent(id) + '#profiles'); } catch (_) {}
    if (scroll !== false) { var el = $('profileDetail'); el.scrollIntoView({behavior:'smooth',block:'start'}); }
  }
  function printSection(id) {
    var target = $(id); if (!target) return;
    target.classList.add('print-target'); document.body.classList.add('atlas-print');
    var cleanup = function () { target.classList.remove('print-target'); document.body.classList.remove('atlas-print'); };
    window.addEventListener('afterprint',cleanup,{once:true}); window.print(); setTimeout(cleanup,1200);
  }
  function downloadJSON(value, filename) {
    var blob = new Blob([JSON.stringify(value,null,2) + '\n'],{type:'application/json'}), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); },1000);
  }
  function draftPackage(items) {
    return {schema:'2026-10-24.atlas-field-draft.v1',official_submission:false,note:'Local draft only. Verify and send to the relevant authority yourself. Sensitive locations and personal data should not be published.',creator:'মিথুন মুৎসুদ্দী',project:'Charyabhumi Research & Travel Atlas',drafts:items};
  }
  function normaliseDraft(d) {
    if (!d || typeof d !== 'object' || !site(d.site)) return null;
    var description = String(d.description || '').trim().slice(0,2400); if (description.length < 3) return null;
    var kinds = ['damage','find','photo','metadata','correction'];
    return {id:String(d.id || 'draft-' + Date.now() + '-' + Math.random().toString(36).slice(2,7)).slice(0,100),site:d.site,kind:kinds.indexOf(d.kind) !== -1 ? d.kind : 'correction',observed:String(d.observed || '').slice(0,10),location:String(d.location || '').slice(0,180),source:external(d.source) ? d.source : '',description:description,rights:String(d.rights || '').slice(0,600),created_at:String(d.created_at || new Date().toISOString()).slice(0,30)};
  }

  function speak(siteId) {
    var s = site(siteId || state.audioSite); if (!s) return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { announce(tx('এই browser-এ speech synthesis নেই; transcript পড়ুন।','Speech synthesis is unavailable in this browser; please use the transcript.')); return; }
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(s.audio[state.lang]); utterance.lang = state.lang === 'en' ? 'en-US' : 'bn-BD'; utterance.rate = .9;
    var voices = window.speechSynthesis.getVoices(), prefix = state.lang === 'en' ? 'en' : 'bn';
    var voice = voices.find(function (v) { return v.lang && v.lang.toLowerCase().indexOf(prefix) === 0; }); if (voice) utterance.voice = voice;
    state.speaking = true; $('audioStatus').textContent = tx('Browser narration চলছে… থামাতে Stop চাপুন।','Browser narration is playing… use Stop to end it.');
    utterance.onend = utterance.onerror = function () { state.speaking = false; $('audioStatus').textContent = ui('audioNote'); };
    window.speechSynthesis.speak(utterance);
  }

  function bind() {
    $('profileSearch').addEventListener('input',function () { state.q = this.value.trim(); renderProfiles(); });
    $('profileRegion').addEventListener('change',function () { state.region = this.value; renderProfiles(); });
    $('profileDistrict').addEventListener('change',function () { state.district = this.value; renderProfiles(); });
    $('profileReset').addEventListener('click',function () { state.q='';state.region='all';state.district='all';$('profileSearch').value='';$('profileRegion').value='all';$('profileDistrict').value='all';renderProfiles(); });
    $('bibSite').addEventListener('change',function () { state.bib = this.value; renderBibliography(); });
    $('audioSite').addEventListener('change',function () { state.audioSite = this.value; window.speechSynthesis && window.speechSynthesis.cancel();state.speaking=false;renderLearning(); });
    $('playAudio').addEventListener('click',function () { speak(state.audioSite); });
    $('stopAudio').addEventListener('click',function () { if (window.speechSynthesis) window.speechSynthesis.cancel();state.speaking=false;$('audioStatus').textContent=ui('audioNote'); });
    $('passportName').addEventListener('input',function () { state.passport.name = this.value.slice(0,80);savePassport(); });
    $('printCircuit').addEventListener('click',function () { printSection('circuits'); });
    $('printPassport').addEventListener('click',function () { printSection('passport'); });
    $('exportPassport').addEventListener('click',function () { downloadJSON({schema:'2026-10-24.atlas-passport.v1',note:'Evidence-question stamps; not proof of physical visits.',name:state.passport.name,stamps:state.passport.stamps},'charyabhumi-atlas-passport.json');announce(tx('পাসপোর্ট JSON download হয়েছে।','Passport JSON downloaded.')); });
    $('resetPassport').addEventListener('click',function () { if (!confirm(tx('সব stamp ও নাম মুছে ফেলবেন? Export করে backup রাখতে পারেন।','Delete all stamps and the passport name? Export a backup first if needed.'))) return;state.passport={name:'',stamps:{}};savePassport();renderAll();announce(tx('পাসপোর্ট reset হয়েছে।','Passport reset.')); });
    $('exportAllDrafts').addEventListener('click',function () { if (!state.drafts.length) { announce(tx('Export করার মতো draft নেই।','There are no drafts to export.'));return; }downloadJSON(draftPackage(state.drafts),'charyabhumi-field-drafts.json'); });
    $('fieldForm').addEventListener('submit',function (event) {
      event.preventDefault(); var fd = new FormData(this);
      var draft = normaliseDraft({id:'draft-' + Date.now(),site:fd.get('site'),kind:fd.get('kind'),observed:fd.get('observed'),location:String(fd.get('location') || '').trim(),source:String(fd.get('source') || '').trim(),description:String(fd.get('description') || '').trim(),rights:String(fd.get('rights') || '').trim(),created_at:new Date().toISOString()});
      if (!draft || draft.description.length < 20 || !draft.location) { $('fieldStatus').textContent = tx('নিরাপদ অবস্থান ও অন্তত ২০ অক্ষরের পর্যবেক্ষণ লিখুন।','Add a safe location and at least 20 characters of observation.');return; }
      state.drafts.unshift(draft);state.drafts=state.drafts.slice(0,100);saveDrafts();this.reset();populateSelects();renderDrafts();$('fieldStatus').textContent=tx('Draft browser-এ রাখা হয়েছে—কোথাও পাঠানো হয়নি। JSON export করে কর্তৃপক্ষে পাঠান।','Draft saved in this browser and not sent anywhere. Export JSON to send it to an authority.');announce($('fieldStatus').textContent);
    });
    $('importPassport').addEventListener('change',function () {
      var file=this.files[0],input=this;if(!file)return;file.text().then(function(text){var data=JSON.parse(text),stamps={};if(!data||typeof data!=='object')throw new Error('invalid');Object.keys(data.stamps||{}).forEach(function(id){if(site(id)&&typeof data.stamps[id]==='string')stamps[id]=data.stamps[id].slice(0,40);});state.passport={name:String(data.name||'').slice(0,80),stamps:stamps};savePassport();renderAll();announce(tx('পাসপোর্ট import সম্পূর্ণ।','Passport imported.'));}).catch(function(){announce(tx('সঠিক Atlas passport JSON নয়।','This is not a valid Atlas passport JSON file.'));}).finally(function(){input.value='';});
    });
    $('importDrafts').addEventListener('change',function () {
      var file=this.files[0],input=this;if(!file)return;file.text().then(function(text){var data=JSON.parse(text),items=Array.isArray(data)?data:data.drafts;if(!Array.isArray(items))throw new Error('invalid');var added=0;items.slice(0,100).forEach(function(raw){var d=normaliseDraft(raw);if(d&&!state.drafts.some(function(x){return x.id===d.id;})){state.drafts.push(d);added++;}});saveDrafts();renderDrafts();announce(tx(num(added)+'টি draft import হয়েছে।',num(added)+' draft(s) imported.'));}).catch(function(){announce(tx('সঠিক field draft JSON নয়।','This is not a valid field-draft JSON file.'));}).finally(function(){input.value='';});
    });
    document.addEventListener('click',function (event) {
      var el = event.target.closest('button,a'); if (!el) return;
      if (el.hasAttribute('data-profile')) { event.preventDefault();selectProfile(el.getAttribute('data-profile'),true); }
      if (el.hasAttribute('data-close-profile')) { state.selected=null;$('profileDetail').innerHTML='';try{history.replaceState({},'','atlas.html#profiles');}catch(_){} }
      if (el.hasAttribute('data-circuit')) { state.circuit=el.getAttribute('data-circuit');renderCircuits(); }
      if (el.hasAttribute('data-tour-load')) { var id=el.getAttribute('data-tour-load');state.tourLoaded[id]=true;renderTours(); }
      if (el.hasAttribute('data-answer-site')) {
        var sid=el.getAttribute('data-answer-site'),answer=Number(el.getAttribute('data-answer')),s=site(sid);state.answers[sid]=answer;
        var earned=answer===s.quest.correct;if(earned&&!hasStamp(sid)){state.passport.stamps[sid]=new Date().toISOString();savePassport();announce(tx('☸ নতুন stamp! '+T(s.name),'☸ New stamp: '+T(s.name)));}
        renderProfiles();renderProfileDetail();renderPassport();renderCircuits();var feedback=document.querySelector('[data-quest-feedback]');if(feedback)feedback.focus({preventScroll:true});
      }
      if (el.hasAttribute('data-listen-site')) { state.audioSite=el.getAttribute('data-listen-site');renderLearning();speak(state.audioSite); }
      if (el.hasAttribute('data-field-site')) { var fid=el.getAttribute('data-field-site');if(site(fid))$('fieldSite').value=fid; }
      if (el.hasAttribute('data-draft-export')) { var did=el.getAttribute('data-draft-export'),draft=state.drafts.find(function(d){return d.id===did;});if(draft)downloadJSON(draftPackage([draft]),'charyabhumi-field-draft.json'); }
      if (el.hasAttribute('data-draft-delete')) { var del=el.getAttribute('data-draft-delete');state.drafts=state.drafts.filter(function(d){return d.id!==del;});saveDrafts();renderDrafts();announce(tx('Local draft মুছে ফেলা হয়েছে।','Local draft deleted.')); }
    });
    document.addEventListener('cb:language',function (event) {
      state.lang = event.detail && event.detail.code === 'en' ? 'en' : 'bn';
      if (window.speechSynthesis) window.speechSynthesis.cancel();state.speaking=false;renderAll();
    });
    window.addEventListener('popstate',function () { var id=new URLSearchParams(location.search).get('site');state.selected=site(id)?id:null;renderProfileDetail(); });
  }

  function init() {
    bind();
    Promise.all([fetch('data/atlas-sites.json?v=20261024a'),fetch('data/atlas-content.json?v=20261024a')]).then(function (responses) {
      responses.forEach(function (r) { if (!r.ok) throw new Error('Atlas data ' + r.status); });return Promise.all(responses.map(function (r) { return r.json(); }));
    }).then(function (values) {
      state.data=values[0];state.content=values[1];
      state.lang=window.CharyabhumiLanguage && CharyabhumiLanguage.get()==='en'?'en':'bn';
      state.passport.stamps=Object.keys(state.passport.stamps).reduce(function(out,id){if(site(id))out[id]=state.passport.stamps[id];return out;},{});
      var params=new URLSearchParams(location.search),requested=params.get('site');if(site(requested))state.selected=requested;
      var circuit=params.get('circuit');if(state.content.circuits.some(function(c){return c.id===circuit;}))state.circuit=circuit;
      renderAll();
    }).catch(function (error) {
      $('profileGrid').innerHTML='<p class="atlas-empty">Atlas data লোড হয়নি। / Atlas data could not be loaded. '+esc(error.message)+'</p>';
      console.error(error);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
