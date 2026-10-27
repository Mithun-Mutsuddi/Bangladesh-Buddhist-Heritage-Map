#!/usr/bin/env python3
"""Build the bilingual Atlas dataset and apply source-backed geography fixes.

The Atlas deliberately starts with deep major-site profiles. It does not claim
that all 3,218 directory records have the same level of documentation.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data"
TODAY = "2026-10-24"


def b(bn: str, en: str):
    return {"bn": bn, "en": en}


def src(id, title, url, publisher, date="", kind="reference", rights="External source link; no local copy implied."):
    return {"id": id, "title": title, "url": url, "publisher": publisher,
            "published": date, "accessed": TODAY, "kind": kind, "rights": rights}


SOURCES = [
    src("unesco-paharpur", "Ruins of the Buddhist Vihara at Paharpur — property 322", "https://whc.unesco.org/en/list/322/", "UNESCO World Heritage Centre", kind="primary heritage record", rights="Descriptive text is marked CC BY-SA IGO 3.0 by UNESCO; linked media keep separate rights."),
    src("unesco-mainamati", "Archaeological sites of Lalmai-Mainamati — tentative reference 6670", "https://whc.unesco.org/en/tentativelists/6670/", "UNESCO / Permanent Delegation of Bangladesh", "2023-05-17", "official nomination", "External official nomination; tentative listing is not World Heritage inscription."),
    src("unesco-mahasthan", "Cultural Landscape of Mahasthan and Karatoya River — tentative reference 6671", "https://whc.unesco.org/en/tentativelists/6671/", "UNESCO / Permanent Delegation of Bangladesh", "2023-05-17", "official nomination"),
    src("unesco-current-list", "Bangladesh — current UNESCO Tentative Lists", "https://whc.unesco.org/en/tentativelists/?action=listtentative&order=states", "UNESCO World Heritage Centre", kind="official status check"),
    src("bp-paharpur", "Paharpur", "https://en.banglapedia.org/index.php/Paharpur", "Banglapedia / Asiatic Society of Bangladesh", kind="scholarly encyclopaedia"),
    src("bp-mainamati", "Mainamati", "https://en.banglapedia.org/index.php/Mainamati", "Banglapedia / Asiatic Society of Bangladesh", kind="scholarly encyclopaedia"),
    src("bp-sitakot", "Sitakot Vihara", "https://en.banglapedia.org/index.php/Sitakot_Vihara", "Banglapedia / Asiatic Society of Bangladesh", kind="scholarly encyclopaedia"),
    src("bp-halud", "Halud Vihara", "https://en.banglapedia.org/index.php/Halud_Vihara", "Banglapedia / Asiatic Society of Bangladesh", kind="scholarly encyclopaedia"),
    src("bp-bhasu", "Bhasu Vihara", "https://en.banglapedia.org/index.php/Bhasu_Vihara", "Banglapedia / Asiatic Society of Bangladesh", kind="scholarly encyclopaedia"),
    src("bp-jagaddala", "Jagaddala Mahavihara", "https://en.banglapedia.org/index.php/Jagaddala_Mahavihara", "Banglapedia / Asiatic Society of Bangladesh", kind="scholarly encyclopaedia"),
    src("doa-jagaddala", "জগদ্দল বিহার", "https://archaeology.gov.bd/site/page/a7386c32-1ec2-4e20-86be-b8c836721523/%E0%A6%9C%E0%A6%97%E0%A6%A6%E0%A7%8D%E0%A6%A6%E0%A6%B2-%E0%A6%AC%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B0", "Department of Archaeology, Bangladesh", "2015-06-30", "official legacy site page"),
    src("doa-paharpur", "পাহাড়পুর বৌদ্ধ বিহারের ধ্বংসাবশেষ", "https://archaeology.gov.bd/site/page/38234055-ebda-4f76-bccd-76dd2eca7577/%E0%A6%AA%E0%A6%BE%E0%A6%B9%E0%A6%BE%E0%A7%9C%E0%A6%AA%E0%A7%81%E0%A6%B0-%E0%A6%AC%E0%A7%8C%E0%A6%A6%E0%A7%8D%E0%A6%A7-%E0%A6%AC%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B0", "Department of Archaeology, Bangladesh", "2021-10-06", "official legacy visitor page"),
    src("doa-hours", "জাদুঘর ও প্রত্নস্থল পরিদর্শনের সময়সূচী", "https://archaeology.gov.bd/pages/static-pages/6922de69933eb65569e1a76d", "Department of Archaeology, Bangladesh", "2026-08-27", "current official visitor metadata"),
    src("mainamati-hours", "ময়নামতি জাদুঘর ও শালবন বিহার প্রদর্শনের সময়সূচি", "https://mainamati.archaeology.gov.bd/", "Mainamati Museum, Department of Archaeology", "2026", "current official visitor metadata"),
    src("mainamati-tickets", "প্রবেশ টিকিটের ও পার্কিং ফি-এর মূল্য তালিকা", "https://mainamati.archaeology.gov.bd/pages/static-pages/6922de7b933eb65569e1aed1", "Mainamati Museum, Department of Archaeology", "2026-09-03", "current official visitor metadata"),
    src("mainamati-notices", "ময়নামতি জাদুঘর — নোটিশ", "https://mainamati.archaeology.gov.bd/pages/notices/", "Mainamati Museum, Department of Archaeology", kind="official closure notices"),
    src("cumilla-spots", "কুমিল্লা জেলা — পর্যটন স্পট", "https://comilla.gov.bd/pages/tourist-spot", "Cumilla District Administration", kind="official local travel metadata"),
    src("cumilla-heritage", "পুরাকীর্তির সংক্ষিপ্ত বর্ণনা", "https://cumilla.gov.bd/pages/static-pages/69912917516a96d4de40788c", "Cumilla District Administration", kind="official local reference"),
    src("doa-law", "প্রত্নতত্ত্ব অধিদপ্তর — আইন, বিধি ও প্রত্নসম্পদ", "https://archaeology.gov.bd/", "Department of Archaeology, Bangladesh", kind="official authority gateway"),
    src("tour-paharpur", "Somapura Mahavihara 360 VR Tour", "https://kirtistudios-paharpur360tour.vercel.app/", "Keerti Creations / provider-hosted tour", kind="external 360 tour", rights="Provider-hosted external tour. No panoramic files are copied. Provider terms and availability apply."),
    src("tour-shalban", "Shalban Buddhist Bihar — spherical panorama", "https://www.360cities.net/image/shalban-buddhist-bihar", "Farsid Raihan / 360Cities", "2016-03-06", "360 photograph", "Copyright Farsid Raihan. 360Cities supplies a non-commercial embed licence; no image file is mirrored."),
    src("tour-terms", "Terms of Use for Embedding Panoramic Images", "https://www.360cities.net/help/sites/embedding-panoramic-images-terms", "360Cities", kind="media licence"),
    src("cunningham", "Report of a Tour in Bihar and Bengal, 1879–80, Vol. XV", "https://archive.org/details/in.ernet.dli.2015.21810", "Alexander Cunningham / Archaeological Survey of India; scan via Internet Archive", "1882", "public-domain survey", "Published in 1882; Cunningham died in 1893. Selected pages are locally excerpted as public-domain historical material with full-source link."),
    src("dikshit", "Excavations at Paharpur, Bengal — Memoirs ASI No. 55", "https://archive.org/details/in.ernet.dli.2015.115760", "K. N. Dikshit / Archaeological Survey of India; scan via Internet Archive", "1938", "historic excavation report", "External reading link only. No local mirror or blanket public-domain claim is made."),
    src("antiquity-bhasu", "Excavations at the Buddhist monastic site of Bhasu Vihara, Bangladesh", "https://www.antiquity.ac.uk/projgall/smith300", "Monica L. Smith, Jaharul Hoque & Nilka Dabare / Antiquity", "2003", "research project gallery"),
    src("dharma-mahasthan", "Exciting discoveries during the last excavation campaigns at Mahasthangarh in 2022 and 2025", "https://dharma.hypotheses.org/6891", "DHARMA ERC project / OpenEdition", "2025-04-22", "research field update", "Researcher-authored field report; interpretations and scientific analysis remain explicitly in progress."),
    src("bss-paharpur", "Paharpur Buddhist Vihara attracts thousands daily", "https://www.bssnews.net/tourism/316171", "Bangladesh Sangbad Sangstha (BSS)", "2025-09-28", "news and visitor-facility lead", "News source for visitor facilities only. Architectural and historical statements require cross-checking with UNESCO/Banglapedia."),
    src("rail", "Bangladesh Railway — official e-ticket", "https://eticket.railway.gov.bd/", "Bangladesh Railway", kind="official ticket channel"),
    src("biwta", "Bangladesh Inland Water Transport Authority", "https://biwta.gov.bd/", "BIWTA", kind="official waterway checking"),
    src("biwtc", "Bangladesh Inland Water Transport Corporation", "https://biwtc.gov.bd/", "BIWTC", kind="official waterway checking"),
    src("caab", "Civil Aviation Authority of Bangladesh", "https://caab.gov.bd/", "CAAB", kind="official aviation gateway"),
    src("sitakot-coordinate", "Chapter 5: Ancient Sites and Settlement — published site coordinates", "https://www.researchgate.net/publication/337873564_Chapter_5_Ancient_Sites_and_Settlement", "Research publication record", "2015", "coordinate cross-check"),
    src("sitakot-wikidata", "Shita Coat Bihar, Nawabganj — Q7499134", "https://www.wikidata.org/wiki/Q7499134", "Wikidata", kind="coordinate cross-check"),
    src("jagaddala-coordinate", "জগদ্দল বিহার — 25.159389, 88.887611 coordinate record", "https://bn.wikipedia.org/wiki/%E0%A6%9C%E0%A6%97%E0%A6%A6%E0%A7%8D%E0%A6%A6%E0%A6%B2_%E0%A6%AC%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B0", "Bangla Wikipedia", kind="coordinate cross-check", rights="Coordinate cross-check only; archaeological interpretation and tentative identification use Banglapedia and DoA sources."),
    src("emergency", "জাতীয় জরুরি সেবা ৯৯৯", "https://999.gov.bd/", "Government of Bangladesh", kind="official emergency information"),
]
SOURCE_MAP = {s["id"]: s for s in SOURCES}
MEDIA = {m["file"]: m for m in json.loads((OUT / "atlas-media.json").read_text())["images"]}


def photo(file, alt_bn, alt_en):
    m = MEDIA[file]
    return {"file": "assets/atlas/" + file, "alt": b(alt_bn, alt_en), "credit": m["credit"],
            "license": m["license"], "license_url": m["license_url"], "page": m["page"],
            "width": m["width"], "height": m["height"], "category": "contemporary photograph"}


def quest(question_bn, question_en, answers_bn, answers_en, correct, explanation_bn, explanation_en, evidence):
    return {"question": b(question_bn, question_en), "answers_bn": answers_bn, "answers_en": answers_en,
            "correct": correct, "explanation": b(explanation_bn, explanation_en), "evidence": evidence}


def travel(hub, access_bn, access_en, distances=None, hours=None, fees=None, access_note_bn="", access_note_en=""):
    return {"hub": hub, "access": b(access_bn, access_en),
            "published_distances": distances or [],
            "hours": hours or b("যাত্রার আগে যাচাই প্রয়োজন — স্থানীয় কর্তৃপক্ষ/সরকারি নোটিশ।", "Verify before travel with the local authority or an official notice."),
            "fees": fees or b("যাত্রার আগে যাচাই প্রয়োজন — অন্য সাইটের টিকিটমূল্য প্রযোজ্য বলে ধরে নেওয়া যাবে না।", "Verify before travel; do not assume that another site's ticket price applies here."),
            "road": b("যাত্রার আগে যাচাই প্রয়োজন — সড়ক, স্থানীয় পরিবহন ও প্রবেশের বর্তমান অবস্থা নিশ্চিত করুন।", "Verify before travel: current road, local transport and access conditions."),
            "access_note": b(access_note_bn or "জেলা শহরে খাবার ও থাকার বিকল্প বেশি; সুনির্দিষ্ট প্রতিষ্ঠানের গুণমান/উপলব্ধতা যাচাই করে নিন। জরুরি সেবা ৯৯৯।", access_note_en or "District hubs generally offer more food and lodging choices; verify each establishment. National emergency service: 999.")}


def site(id, record_id, name_bn, name_en, region, district_bn, district_en, upazila_bn, upazila_en,
         lat, lon, coord_source, classification, period, dynasty, summary, architecture, excavation,
         condition, unesco, legal, finds, museums, source_ids, q, tr, photo_obj=None,
         audio_bn="", audio_en="", authority=None, extra=None):
    value = {
        "id": id, "record_id": record_id, "name": b(name_bn, name_en), "region": region,
        "district": b(district_bn, district_en), "upazila": b(upazila_bn, upazila_en),
        "coordinates": {"lat": lat, "lon": lon, "source": coord_source,
                        "accuracy": b("প্রকাশিত সাইট/component স্থানাঙ্ক; জরিপকৃত প্রবেশদ্বার নয়।", "Published site/component coordinate; not a surveyed entrance gate.")},
        "classification": classification, "period": period, "dynasty": dynasty,
        "summary": summary, "architecture": architecture, "excavation": excavation,
        "condition": condition,
        "authority": authority or b("বাংলাদেশ প্রত্নতত্ত্ব অধিদপ্তর; স্থানীয় আঞ্চলিক দপ্তর/জাদুঘর ব্যবস্থাপনা।", "Department of Archaeology, Bangladesh; relevant regional office or site museum."),
        "unesco": unesco, "legal": legal,
        "finds": [b(x[0], x[1]) for x in finds], "museums": [b(x[0], x[1]) for x in museums],
        "source_ids": source_ids, "quest": q, "travel": tr,
        "photo": photo_obj,
        "audio": {"bn": audio_bn or summary["bn"] + " " + architecture["bn"],
                  "en": audio_en or summary["en"] + " " + architecture["en"]},
    }
    if extra:
        value.update(extra)
    return value


MAINAMATI_ACCESS = ("কুমিল্লা শহর → কোটবাড়ি/ময়নামতি; এরপর অনুমোদিত স্থানীয় পথ। রেল/বাসের সময় ও ভাড়া সরকারি বা পরিচালকের সূত্রে দেখুন।",
                    "Cumilla city → Kotbari/Mainamati, then an authorised local route. Check rail/bus times and fares through official or operator channels.")
MAINAMATI_NOTE = ("কোটবাড়ি ও কুমিল্লা শহরে খাবার/থাকার সুবিধা খুঁজুন। কিছু স্থান সেনানিবাস-সংলগ্ন বা এর মধ্যে—আগে অনুমতি ও প্রবেশনীতি জানুন। জরুরি সেবা ৯৯৯।",
                  "Look for food and lodging in Kotbari and Cumilla. Some places are within or beside the cantonment; check permission and entry rules first. Emergency: 999.")
MAINAMATI_UNESCO = b("ইউনেস্কোর বর্তমান Tentative List-এর ‘Archaeological sites of Lalmai-Mainamati’ (২০২৩, Ref. 6670) component; বিশ্ব ঐতিহ্য তালিকাভুক্ত নয়।",
                     "A component of UNESCO's current tentative property ‘Archaeological sites of Lalmai-Mainamati’ (2023, Ref. 6670); not an inscribed World Heritage property.")
MAINAMATI_LEGAL = b("২০২৩ nomination-এ প্রত্নতত্ত্ব অধিদপ্তরের সংরক্ষণ ও পর্যবেক্ষণের কথা আছে; কিছু component সেনানিবাসের মালিকানায়। বর্তমান আইনি নোটিফিকেশন DoA-তে যাচাই করুন।",
                    "The 2023 nomination describes DoA conservation and monitoring; some components are cantonment-owned. Verify current legal notifications with DoA.")

S = []
S.append(site(
    "somapura", "somapura", "পাহাড়পুর — সোমপুর মহাবিহার", "Paharpur — Somapura Mahavihara", "north", "নওগাঁ", "Naogaon", "বদলগাছী", "Badalgachhi",
    25.03197, 88.977, "unesco-paharpur",
    b("মহাবিহার · ক্রুশাকার কেন্দ্রীয় মন্দির · ভোটিভ স্তূপ ও উপসৌধ", "Mahavihara · cruciform central temple · votive stupas and subsidiary shrines"),
    b("প্রতিষ্ঠা সাধারণত ৮ম শতকের শেষ/৯ম শতকের শুরু; ১২শ শতক পর্যন্ত বিখ্যাত কেন্দ্র", "Foundation generally placed in the late 8th/early 9th century; a renowned centre through the 12th century"),
    b("পাল; ধর্মপালদেবের সঙ্গে সিলমোহর ও গবেষণার ভিত্তিতে সম্পর্ক", "Pala; associated with Dharmapaladeva through seals and research"),
    b("পাহাড়পুর ও সোমপুর মহাবিহার একই স্থান—আলাদা প্রোফাইল নয়। বিশাল আঙিনাঘেরা মহাবিহারটি বাংলার বৌদ্ধ শিক্ষা ও স্থাপত্যের অন্যতম প্রধান নিদর্শন।", "Paharpur and Somapura Mahavihara are one site, not duplicate profiles. The vast courtyard monastery is a defining monument of Bengal's Buddhist learning and architecture."),
    b("প্রায় ২৭৪ মিটার বাহুর চতুষ্কোণে ১৭৭টি ভিক্ষু-কক্ষ; কেন্দ্রে তিন ধাপের ক্রুশাকার মন্দির। ৬৩টি পাথরের ভাস্কর্য, টেরাকোটা ফলকের সারি, ছোট স্তূপ, রান্নাঘর, ভোজনশালা, কূপ ও নিকাশি রয়েছে।", "A roughly 274 m quadrangle with 177 monastic cells and a three-terrace cruciform central temple. It includes 63 stone bas-reliefs, terracotta friezes, small stupas, kitchen, refectory, wells and drains."),
    b("বুকানন-হ্যামিলটন (১৮০৭–১২), কানিংহাম (১৮৭৯); ১৯১৯-এ সুরক্ষিত; নিয়মিত খনন ১৯২৩–৩৪। স্বাধীনতা-পরবর্তী ধাপ ১৯৮১–৮৫, ১৯৮৮–৯১ এবং সীমিত কাজ ২০০৭–০৮।", "Documented by Buchanan Hamilton (1807–12) and Cunningham (1879); protected in 1919; systematic excavation in 1923–34. Post-independence campaigns included 1981–85, 1988–91 and limited work in 2007–08."),
    b("বিস্তৃত খননকৃত ও সংরক্ষিত ধ্বংসাবশেষ। কেন্দ্রীয় মন্দিরের উল্লেখযোগ্য অংশ টিকে আছে, তবে শীর্ষসৌধের প্রকৃত রূপ অজ্ঞাত; reconstruction-কে নিশ্চিত মূলরূপ বলা যাবে না।", "Extensive excavated and conserved remains. Much of the central shrine survives, but its original terminal form is unknown; reconstructions must not be presented as certain."),
    b("১৯৮৫-এ UNESCO বিশ্ব ঐতিহ্য, Property 322; criteria (i)(ii)(vi)।", "Inscribed on the UNESCO World Heritage List in 1985 as property 322, criteria (i)(ii)(vi)."),
    b("১৯১৯-এ তৎকালীন Ancient Monuments Preservation Act, 1904-এ সুরক্ষিত ঘোষিত; বর্তমানে DoA ব্যবস্থাপনা ও বিশ্ব ঐতিহ্য সংরক্ষণ কাঠামো।", "Declared protected in 1919 under the then Ancient Monuments Preservation Act, 1904; now under DoA management and the World Heritage conservation framework."),
    [("৪৭৯ খ্রিস্টাব্দের তাম্রলিপি ও সোমপুর/ধর্মপাল-সম্পর্কিত সিলমোহর", "A 479 CE copperplate and seals associated with Somapura and Dharmapala"), ("টেরাকোটা ফলক, পাথর·ব্রোঞ্জ·স্টুকো ভাস্কর্য", "Terracotta plaques and stone, bronze and stucco sculpture"), ("মুদ্রা, সিরামিক ও দৈনন্দিন ব্যবহার্য বস্তু", "Coins, ceramics and objects of daily use")],
    [("পাহাড়পুর প্রত্নতাত্ত্বিক জাদুঘর — সাইট সংগ্রহ; কোন বস্তু প্রদর্শনে আছে যাত্রার আগে জেনে নিন।", "Paharpur Archaeological Museum holds the site collection; confirm current displays before visiting.")],
    ["unesco-paharpur", "bp-paharpur", "doa-paharpur", "dikshit", "cunningham"],
    quest("সোমপুর মহাবিহারের চার বাহুতে কতগুলি ভিক্ষু-কক্ষ নথিভুক্ত?", "How many monastic cells are documented around Somapura Mahavihara?", ["১১৫", "১৭৭", "২১"], ["115", "177", "21"], 1, "Banglapedia ও UNESCO-সংশ্লিষ্ট নথিতে ১৭৭টি কক্ষ—১১৫ শালবনের সংখ্যা।", "The documented count is 177; 115 belongs to Shalban and several Mainamati monasteries.", "bp-paharpur"),
    travel("joypurhat", "জয়পুরহাট/জামালগঞ্জ বা নওগাঁ → বদলগাছী → পাহাড়পুর। ট্রেনের টিকিট শুধু অনুমোদিত মাধ্যমে; শেষ অংশের যান ও ভাড়া আগে জেনে নিন।", "Joypurhat/Jamalganj or Naogaon → Badalgachhi → Paharpur. Use authorised rail ticketing and confirm the last-mile vehicle and fare.",
           [b("DoA-এর পুরনো পাতায় জামালগঞ্জ স্টেশন থেকে প্রায় ৫ কিমি, নওগাঁ থেকে প্রায় ৩৫ কিমি ও জয়পুরহাট থেকে প্রায় ১২ কিমি; বর্তমান রুট মিলিয়ে নিন।", "A legacy DoA page gives about 5 km from Jamalganj station, 35 km from Naogaon and 12 km from Joypurhat; verify the current route.")],
           b("DoA সাধারণ সময়সূচি (হালনাগাদ ২৭ আগস্ট ২০২৬): মঙ্গলবার–শনিবার শীত ১০:০০–১৭:০০, গ্রীষ্ম ১১:০০–১৮:০০; সোমবার অর্ধদিবস; রবিবার বন্ধ। বিরতি ও বিশেষ ছুটি সরকারি নোটিশে দেখুন।", "DoA general schedule (updated 27 Aug 2026): Tue–Sat 10:00–17:00 in winter and 11:00–18:00 in summer; Monday half-day; Sunday closed. Check official notices for breaks and special closures."),
           b("বর্তমান প্রবেশমূল্য যাত্রার আগে যাচাই প্রয়োজন। DoA-এর ২০১৬-এর পুরনো টেবিলকে বর্তমান দাম হিসেবে ব্যবহার করা হয়নি।", "Verify current admission before travel. The DoA table dated 2016 is not reused as a current price.")),
    photo("somapura-aerial.jpg", "সোমপুর মহাবিহারের আকাশ থেকে তোলা দৃশ্য", "Aerial view of Somapura Mahavihara"),
    "পাহাড়পুর এবং সোমপুর মহাবিহার একই স্থান। পাল যুগের এই মহাবিহারে একশ সাতাত্তরটি ভিক্ষু-কক্ষ ঘিরে রয়েছে বিশাল আঙিনা। মাঝখানের ক্রুশাকার মন্দিরের টেরাকোটা ফলকে প্রানী, মানুষ ও গল্পের দৃশ্য দেখা যায়। শুধু বড় ইটের সৌধ নয়, কক্ষ, নিকাশি, কূপ ও দৈনন্দিন বস্তুও এখানকার ইতিহাস বলে।",
    "Paharpur and Somapura Mahavihara are the same place. One hundred and seventy-seven monastic cells surround the great courtyard of this Pala-period monastery. Terracotta plaques on the cruciform central temple depict animals, people and stories. Its history is carried not only by monumental brickwork, but also by cells, drains, wells and everyday objects.",
    extra={"tour": {"mode": "external", "source": "tour-paharpur", "title": b("সোমপুর ৩৬০° ভার্চুয়াল ট্যুর", "Somapura 360° virtual tour"), "note": b("Provider-hosted ট্যুর; নতুন ট্যাবে খুলবে। কোনো panorama ফাইল স্থানীয়ভাবে কপি নয়।", "Opens the provider-hosted tour in a new tab; no panorama files are copied locally.")},
           "media": [photo("somapura-terracotta.jpg", "পাহাড়পুরের টেরাকোটা ফলকের বিস্তারিত", "Detail of a terracotta plaque at Paharpur"),
                     {"file": "assets/atlas/cunningham-paharpur-plate32.jpg", "alt": b("১৮৮২ সালের রিপোর্টে পাহাড়পুরের Plate XXXII", "Paharpur Plate XXXII from the 1882 report"), "credit": "Alexander Cunningham / ASI", "license": "Public domain", "page": "https://archive.org/details/in.ernet.dli.2015.21810", "category": "archival survey plate"}]}
))

S.append(site(
    "shalban", "shalban", "শালবন বিহার", "Shalban Vihara", "mainamati", "কুমিল্লা", "Cumilla", "সদর দক্ষিণ", "Sadar Dakshin",
    23.426222, 91.137861, "unesco-mainamati",
    b("চতুষ্কোণ বৌদ্ধ বিহার · কেন্দ্রীয় ক্রুশাকার মন্দির · উপস্তূপ", "Quadrangular Buddhist monastery · central cruciform shrine · subsidiary stupas"),
    b("প্রতিষ্ঠা ৭ম শতকের শেষ/৮ম শতকের শুরু; component sequence ৭ম–১৩শ", "Founded in the late 7th/early 8th century; the component sequence spans the 7th–13th centuries"),
    b("প্রারম্ভিক দেব; শ্রীভবদেব", "Early Deva; Sri Bhavadeva"),
    b("লালমাই-ময়নামতির দ্বিতীয় বৃহত্তম বিহার হিসেবে ২০২৩ nomination-এ বর্ণিত; শ্রীভবদেব মহাবিহার নামেও পরিচিত ছিল।", "Described in the 2023 nomination as the second-largest monastery at Lalmai-Mainamati and historically known as Sri Bhavadeva Mahavihara."),
    b("প্রতিটি বাহু ১৬৭.৬ মিটার এবং ১১৫টি ভিক্ষু-কক্ষ; উত্তরে ২২.২ মিটার প্রশস্ত facade-এর প্রবেশদ্বার। আঙিনায় ক্রুশাকার কেন্দ্রীয় মন্দির ও একাধিক উপস্তূপ/উপসৌধ।", "Each side measures 167.6 m, with 115 monastic cells and a northern gateway frontage of 22.2 m. A cruciform central shrine and subsidiary stupas and shrines occupy the courtyard."),
    b("ময়নামতির নিয়মিত খনন কর্মসূচির অংশ; ২০২৩ nomination খননকৃত, সংরক্ষিত ও পর্যবেক্ষিত remains-এর কথা বলে। পুরনো উৎসে আলাদা কক্ষসংখ্যা থাকলেও এখানে সাম্প্রতিক nomination-এর ১১৫ ব্যবহৃত।", "Part of Mainamati's systematic excavation programme. The 2023 nomination records excavated, conserved and monitored remains; its count of 115 cells is used instead of conflicting older figures."),
    b("উপরের সৌধ নষ্ট; ভিত ও নিচের স্থাপত্য দৃশ্যমান। ছোট স্তূপ/সৌধের কিছু অংশ ভালো অবস্থায় উন্মোচিত; আবহাওয়াজনিত ক্ষয় ও দর্শনার্থী-চাপে সংরক্ষণ প্রয়োজন।", "Superstructures are lost while basal and plinth remains are visible. Several subsidiary remains were reported well preserved; weathering and visitor pressure require continuing care."),
    MAINAMATI_UNESCO, MAINAMATI_LEGAL,
    [("৭টি তাম্রলিপি ও ৩৫০-এর বেশি স্বর্ণ·রৌপ্য·তামার মুদ্রা (২০২৩ nomination)", "Seven copperplates and more than 350 gold, silver and copper coins (2023 nomination)"), ("পোড়ামাটির সিল, পাথর ও ব্রোঞ্জ ভাস্কর্য, টেরাকোটা", "Fired-clay seals, stone and bronze images, and terracotta")],
    [("ময়নামতি জাদুঘর — আঞ্চলিক প্রধান সংগ্রহ; নির্দিষ্ট বস্তুর প্রদর্শন যাচাই করুন।", "Mainamati Museum is the principal regional collection; verify particular object displays.")],
    ["unesco-mainamati", "bp-mainamati", "mainamati-hours", "mainamati-tickets", "mainamati-notices", "tour-shalban", "tour-terms"],
    quest("২০২৩ UNESCO nomination অনুযায়ী শালবনে কতগুলি ভিক্ষু-কক্ষ?", "According to the 2023 UNESCO nomination, how many monastic cells does Shalban have?", ["৪১", "১১৫", "১৭৭"], ["41", "115", "177"], 1, "সাম্প্রতিক nomination-এ ১১৫; পুরনো পাতার ১৫৫ বা ১৭৭ নয়।", "The recent nomination gives 115—not the 155 found on an older page or Somapura's 177.", "unesco-mainamati"),
    travel("cumilla", *MAINAMATI_ACCESS,
           [b("জেলা প্রশাসনের পর্যটন তালিকায় কুমিল্লা শহর থেকে প্রায় ৮ কিমি পশ্চিম; বাস্তব দূরত্ব রুটভেদে বদলায়।", "The district administration lists Shalban about 8 km west of Cumilla city; actual distance depends on the route.")],
           b("অফিসিয়াল ২০২৬ সময়সূচি: রবিবার বন্ধ; সোমবার শীত ১৪:৩০–১৭:০০, গ্রীষ্ম ১৫:৩০–১৮:০০; মঙ্গলবার–শনিবার শীত ১০:০০–১৭:০০, গ্রীষ্ম ১১:০০–১৮:০০। বিরতি/বিশেষ ছুটি নোটিশে দেখুন।", "Official 2026 schedule: Sunday closed; Monday 14:30–17:00 in winter and 15:30–18:00 in summer; Tue–Sat 10:00–17:00 in winter and 11:00–18:00 in summer. Check notices for breaks and special closures."),
           b("হালনাগাদ ৩ সেপ্টেম্বর ২০২৬: দেশি প্রাপ্তবয়স্ক ৳৩০; উচ্চমাধ্যমিক পর্যন্ত ৳১০; প্রাথমিক পর্যন্ত বিনামূল্যে; SAARC ৳২০০; অন্যান্য বিদেশি ৳৪০০। ময়নামতি জাদুঘর ও শালবনের তালিকা—যাত্রার আগে পুনরায় দেখুন।", "Updated 3 Sep 2026: Bangladeshi adult Tk 30; students up to higher secondary Tk 10; primary-level students free; SAARC visitors Tk 200; other international visitors Tk 400. This is the Mainamati Museum/Shalban list—recheck before travel."),
           *MAINAMATI_NOTE),
    photo("shalban.jpg", "শালবন বিহারের খননকৃত আঙিনা ও কক্ষসারি", "Excavated courtyard and monastic cells at Shalban Vihara"),
    "শালবন বিহারের চার বাহুতে একশ পনেরোটি ভিক্ষু-কক্ষ। উত্তর দিকের প্রবেশপথ দিয়ে ভেতরে ঢুকলে বিশাল আঙিনা ও কেন্দ্রীয় ক্রুশাকার মন্দিরের ভিত দেখা যায়। তাম্রলিপি থেকে প্রারম্ভিক দেব রাজা শ্রীভবদেবের সঙ্গে এর সম্পর্ক জানা যায়। মুদ্রা, সিলমোহর, পাথর ও ব্রোঞ্জের ভাস্কর্য বলে দেয় এটি শুধু আবাসন নয়, শিক্ষা ও অনুশীলনের কেন্দ্র ছিল।",
    "Shalban Vihara has one hundred and fifteen monastic cells along its four wings. Beyond the northern gateway lie the great courtyard and the base of a cruciform central shrine. Copperplates connect the monastery with the early Deva ruler Sri Bhavadeva. Coins, seals, and stone and bronze images show that this was a centre of learning and practice, not simply a residence.",
    extra={"tour": {"mode": "permitted-embed", "source": "tour-shalban", "embed_url": "https://www.360cities.net/embed_iframe/shalban-buddhist-bihar", "title": b("শালবন ৩৬০° ফটো স্ফিয়ার", "Shalban 360° photo sphere"), "note": b("© Farsid Raihan; 360Cities-এর non-commercial embed অনুমতি। ক্লিক করলে provider content লোড হবে; না চললে মূল লিংক খুলুন।", "© Farsid Raihan, used through 360Cities' non-commercial embed permission. Click to load provider content; use the source link if it is unavailable.")}}
))


def mainamati_site(id, name_bn, name_en, lat, lon, classification, period, dynasty, summary, architecture, excavation, condition, finds, q, photo_obj=None, audio_bn="", audio_en="", extra=None, distances=None):
    return site(id, id, name_bn, name_en, "mainamati", "কুমিল্লা", "Cumilla", "সদর দক্ষিণ", "Sadar Dakshin",
                lat, lon, "unesco-mainamati", classification, period, dynasty, summary, architecture, excavation, condition,
                MAINAMATI_UNESCO, MAINAMATI_LEGAL, finds,
                [("ময়নামতি জাদুঘরে আঞ্চলিক সংগ্রহ; প্রতিটি বস্তুর বর্তমান প্রদর্শন/ভান্ডার আলাদা করে যাচাই করুন।", "Mainamati Museum holds regional material; verify the present display or repository for each object.")],
                ["unesco-mainamati", "bp-mainamati", "cumilla-heritage", "doa-law"], q,
                travel("cumilla", *MAINAMATI_ACCESS, distances or [], None, None, *MAINAMATI_NOTE),
                photo_obj, audio_bn, audio_en, extra=extra)

S.append(mainamati_site(
    "kotila-mura", "কোটিলা মুড়া / ত্রিরত্ন স্তূপ", "Kotila Mura / Triratna Stupas", 23.458083, 91.123361,
    b("তিনটি প্রধান বৃত্তাকার স্তূপ · ভোটিভ স্তূপ · assembly hall", "Three principal circular stupas · votive stupas · assembly hall"),
    b("দীর্ঘ পর্যায়; UNESCO component তালিকায় আনুমানিক ৬ষ্ঠ–১১শ, পরবর্তী ব্যবহারের উল্লেখ ১৩শ পর্যন্ত", "A long sequence; the UNESCO component table gives c. 6th–11th centuries, while later use is described through the 13th"),
    b("একক প্রতিষ্ঠাতা নিশ্চিত নয়; খাদ্গ/দেব/চন্দ্র যুগের দীর্ঘ Mainamati ইতিহাসের অংশ", "No single founder is established; part of Mainamati's long Khadga, Deva and Chandra-era history"),
    b("তিনটি প্রধান স্তূপকে বুদ্ধ, ধর্ম ও সংঘ—ত্রিরত্নের প্রতীক হিসেবে ব্যাখ্যা করা হয়; Mainamati-এর সবচেয়ে স্বতন্ত্র স্থাপত্য সমন্বয়গুলির একটি।", "Its three principal stupas are interpreted as the Three Jewels—Buddha, Dhamma and Sangha—making it one of Mainamati's most distinctive ensembles."),
    b("মধ্যম স্তূপের ভিত ধর্মচক্রের নকশায়; কেন্দ্রীয় গভীর shaft এবং আটটি box chamber। চারপাশে votive stupa, chapel ও assembly hall।", "The middle stupa uses a dhamma-wheel plan, with a central shaft and eight box chambers, surrounded by votive stupas, chapels and an assembly hall."),
    b("খননে তিন স্তূপের নিচের অংশ ও সংশ্লিষ্ট সৌধ উন্মোচিত; Banglapedia অনুযায়ী সব অংশের খনন সম্পূর্ণ নয়।", "Excavation exposed the lower portions of the three stupas and associated structures; Banglapedia notes that investigation was not complete."),
    b("স্তূপগুলির ঊর্ধ্বগঠন নেই; ভিত, চেম্বার ও নিচের স্থাপত্য সংরক্ষণের প্রধান বিষয়।", "The stupa superstructures are lost; preservation focuses on their bases, chambers and lower architecture."),
    [("অসংখ্য ক্ষুদ্র টেরাকোটা/মাটির votive stupa ও inscribed clay tablet", "Numerous miniature terracotta and clay votive stupas and inscribed tablets"), ("নরম ধূসর shale-এর বৌদ্ধ ভাস্কর্য-খণ্ড", "Fragments of Buddhist sculpture in soft grey shale"), ("ত্রিরত্ন সৌধের ইঙ্গিত দেওয়া আঞ্চলিক epigraphic records", "Regional epigraphic records referring to Three Jewels shrines")],
    quest("কোটিলার তিন প্রধান স্তূপ কীসের প্রতীক?", "What do the three principal stupas at Kotila represent?", ["ত্রিরত্ন—বুদ্ধ, ধর্ম, সংঘ", "তিনজন রাজা", "তিনটি নদী"], ["The Three Jewels—Buddha, Dhamma, Sangha", "Three kings", "Three rivers"], 0, "UNESCO nomination তিনটিকে Buddha, Dhamma/Dharma ও Sangha হিসেবে ব্যাখ্যা করে।", "The UNESCO nomination interprets them as Buddha, Dhamma and Sangha.", "unesco-mainamati"),
    photo("kotila-mura.png", "কোটিলা মুড়ার তিন স্তূপের খননকৃত অবশেষ", "Excavated remains of the three stupas at Kotila Mura"),
    "কোটিলা মুড়ায় তিনটি প্রধান স্তূপ বুদ্ধ, ধর্ম ও সংঘ—ত্রিরত্নের কথা মনে করায়। মাঝের স্তূপটির নকশা ধর্মচক্রের মতো, যেখানে আটটি ছোট চেম্বারে মাটির ভোটিভ স্তূপ ও লিখিত ফলক পাওয়া গেছে। এখানে প্রত্নতত্ত্ব শুধু বড় স্থাপনা নয়, ছোট ছোট বস্তুর অবস্থানও গুরুত্বপূর্ণ।",
    "The three principal stupas at Kotila Mura evoke the Three Jewels: Buddha, Dhamma and Sangha. The middle stupa follows a wheel-like plan, with eight small chambers that yielded clay votive stupas and inscribed tablets. Archaeology here depends not only on monumental forms, but also on the positions of very small objects.",
    distances=[b("জেলা প্রশাসনের পাতায় কুমিল্লা সদর থেকে প্রায় ৮ কিমি ও আনন্দ বিহার থেকে প্রায় ১ কিমি; বর্তমান রুট যাচাই করুন।", "The district administration gives about 8 km from Cumilla Sadar and 1 km from Ananda Vihara; verify the current route.")]
))

S.append(mainamati_site(
    "itakhola-mura", "ইটাখোলা মুড়া", "Itakhola Mura", 23.438806, 91.129417,
    b("বিহার–স্তূপ complex · ১৯ কক্ষের monastery · প্রবেশদ্বার", "Monastery–stupa complex · 19-cell monastery · gateway"),
    b("প্রাথমিক remains আনুমানিক ৭ম–৮ম; পরবর্তী নির্মাণপর্যায়", "Earliest remains attributed to the 7th–8th centuries, with later building phases"),
    b("একক রাজা/বংশ নিশ্চিত নয়; প্রারম্ভিক মধ্যযুগীয় সমতট", "No single ruler or dynasty is securely assigned; early-medieval Samatata"),
    b("পাহাড়ের ঢালু ভূমি ব্যবহার করে তৈরি স্তূপ, বিহার ও প্রবেশদ্বারের সমন্বিত প্রত্নাঞ্চল।", "A coordinated monastery, stupa and gateway complex built into the sloping terrain."),
    b("১৩.১ মিটার বর্গাকার নিরেট স্তূপ-ভিত; ৭৯ × ৫৬ মিটার boundary wall; ১৯ কক্ষের বর্গাকার বিহার ও পূর্ব দিকে ১৫.৬ × ৮.৫ মিটার প্রবেশদ্বার।", "A solid 13.1 m square stupa base, a 79 × 56 m boundary wall, a square 19-cell monastery and an eastern gateway measuring 15.6 × 8.5 m."),
    b("খননে আলাদা স্তর ও নির্মাণপর্যায় উন্মোচিত; ২০২৩ nomination স্থাপত্য ও প্রধান নিদর্শনের পরিমাপ দেয়।", "Excavation revealed separate levels and building phases; the 2023 nomination supplies dimensions for the principal remains."),
    b("ক্ষতিগ্রস্ত জীবনাকার স্টুকো অক্ষোভ্য মূর্তি in situ পাওয়া গেছে—অত্যন্ত ভঙ্গুর। দেয়াল ও ভিতে আবহাওয়ার প্রভাব দীর্ঘমেয়াদি উদ্বেগ।", "A damaged life-size stucco image of Akshobhya was found in situ and is highly vulnerable. Weathering of walls and basal remains is a long-term concern."),
    [("In-situ স্টুকো অক্ষোভ্য মূর্তি", "An in-situ stucco image of Akshobhya"), ("তাম্রলিপি, স্বর্ণবস্তু ও মৃৎপাত্র", "A copperplate, gold objects and pottery")],
    quest("ইটাখোলা মুড়ার বিহারে কতগুলি কক্ষ নথিভুক্ত?", "How many cells are recorded in the monastery at Itakhola Mura?", ["১৯", "৪১", "১১৫"], ["19", "41", "115"], 0, "UNESCO nomination-এ ১৯ কক্ষ ও একটি central hall-এর কথা আছে।", "The UNESCO nomination records 19 cells and a central hall.", "unesco-mainamati"),
    photo("itakhola-mura.jpg", "ইটাখোলা মুড়ার সামনের দিকের প্রত্নস্থল", "Front view of the archaeological remains at Itakhola Mura")
))

S.append(mainamati_site(
    "rupban-mura", "রূপবান মুড়া", "Rupban Mura", 23.436444, 91.12925,
    b("ক্রুশাকার মন্দির · বর্গাকার বিহার · স্তূপ/উপসৌধ", "Cruciform temple · square monastery · stupa and subsidiary shrines"),
    b("প্রাথমিক নির্মাণ ৬ষ্ঠ–৭ম; semi-cruciform shrine সম্ভবত ৮ম", "Initial construction in the 6th–7th centuries; the semi-cruciform shrine probably dates to the 8th"),
    b("খাদ্গ ও পরবর্তী প্রারম্ভিক মধ্যযুগীয় সমতট; একক প্রতিষ্ঠাতা নিশ্চিত নয়", "Khadga and later early-medieval Samatata; no single founder is established"),
    b("মন্দির ও বিহার পাশাপাশি থাকা এই স্থানে স্থাপত্যের অস্বাভাবিক sanctuary বিন্যাস এবং গুরুত্বপূর্ণ পাথর·ব্রোঞ্জ নিদর্শন পাওয়া গেছে।", "This paired temple and monastery is noted for an unusual sanctuary arrangement and major stone and bronze finds."),
    b("বর্গাকার platform-এর ওপর ক্রুশাকার মন্দির, পরে প্রায় ২৮.২ × ২৮ মিটার semi-cruciform shrine; ৩৪.১ মিটার বাহুর বিহার। পূর্বের দিকের তিনটি লম্বা সরু sanctuary বিশেষ।", "A cruciform temple on a square platform, later transformed into a roughly 28.2 × 28 m semi-cruciform shrine, with a 34.1 m-square monastery. Three long narrow eastern sanctuaries are distinctive."),
    b("খননে মন্দির ও বিহারের একাধিক নির্মাণপর্যায় উন্মোচিত; প্রাথমিক ও পরবর্তী plan-এর পার্থক্য গবেষণার বিষয়।", "Excavation exposed several phases of the temple and monastery; changes between early and later plans remain important to interpretation."),
    b("ভিত ও নিচের দেয়াল দৃশ্যমান; মূর্তি ও ব্রোঞ্জের বড় নিদর্শন স্থাপত্য থেকে আলাদা সংগ্রহ হিসেবে সংরক্ষণের তথ্য যাচাই প্রয়োজন।", "Basal walls and foundations are visible. The present repositories of major sculptural and bronze finds require collection-specific verification."),
    [("বিশাল পাথরের বুদ্ধমূর্তি ও মহাপ্রতিসরা মূর্তি", "A colossal stone Buddha and a Mahapratisara image"), ("প্রায় অর্ধ মেট্রিক টন ওজনের বড় ব্রোঞ্জ ঘণ্টা", "A large bronze bell weighing about half a metric ton"), ("খাদ্গ শাসক বলভট্টের পাঁচটি debased gold coin", "Five debased gold coins of the Khadga ruler Balabhatta")],
    quest("রূপবান মুড়ার পাঁচটি debased gold coin কোন শাসকের সঙ্গে যুক্ত?", "Which ruler is associated with the five debased gold coins from Rupban Mura?", ["বলভট্ট", "ধর্মপাল", "শাশাঙ্ক"], ["Balabhatta", "Dharmapala", "Shashanka"], 0, "UNESCO nomination মুদ্রাগুলিকে খাদ্গ শাসক বলভট্টের বলে উল্লেখ করে।", "The UNESCO nomination attributes the coins to the Khadga ruler Balabhatta.", "unesco-mainamati"),
    photo("rupban-mura.jpg", "রূপবান মুড়ার খননকৃত স্থাপনা", "Excavated structures at Rupban Mura")
))

S.append(mainamati_site(
    "charpatra-mura", "চারপত্র মুড়া / লড়হমাধব মন্দির", "Charpatra Mura / Ladaha-Madhava Temple", 23.473944, 91.115528,
    b("ব্রাহ্মণ্য/বৈষ্ণব মন্দির — বৌদ্ধ বিহার নয়", "Brahmanical/Vaishnava temple — not a Buddhist monastery"),
    b("মূল মন্দির প্রায় ১০ম–১১শ; component তালিকায় পরবর্তী ব্যবহার ১৩শ পর্যন্ত", "Principal temple c. 10th–11th centuries; the component table records later use through the 13th"),
    b("চন্দ্র; তাম্রলিপিতে লড়হচন্দ্রসহ একাধিক শাসকের উল্লেখ", "Chandra; copperplates mention several rulers including Ladahachandra"),
    b("বৌদ্ধ-প্রধান Mainamati প্রত্নাঞ্চলের মধ্যে গুরুত্বপূর্ণ প্রাচীন ব্রাহ্মণ্য মন্দির; চার তাম্রলিপি থেকে এর নাম।", "An important early Brahmanical temple within the predominantly Buddhist Mainamati landscape, named after four copperplate grants."),
    b("৪৫.৭ × ১৬.৮ মিটার আয়তাকার plan; পূর্বে খোলা স্তম্ভশ্রেণির hall এবং পশ্চিমে নিরেট গর্ভগৃহ। লড়হমাধব/বিষ্ণুকে উৎসর্গিত বলে তাম্রলিপি থেকে ধারণা।", "A 45.7 × 16.8 m rectangular plan with an open pillared hall to the east and a solid sanctum to the west. Inscriptions associate it with Ladaha-Madhava/Vishnu."),
    b("খননে মন্দির, ব্রোঞ্জ relic casket ও চার তাম্রলিপি উন্মোচিত; ময়নামতির ১৯৫৫ সালে শুরু হওয়া খনন ইতিহাসের অংশ।", "Excavation revealed the temple, a bronze relic casket and four copperplates as part of the Mainamati investigations begun in 1955."),
    b("ধ্বংসাবশেষ; সামনের hall-এর অংশ বেশি ক্ষতিগ্রস্ত বলে DoA-এর পুরনো বর্ণনা। সেনানিবাসের মধ্যে অবস্থানের কারণে প্রবেশ অনুমতি আলাদা বিষয়।", "Ruins survive; a legacy DoA description reports greater damage to the frontal hall. Its cantonment location makes access permission a separate consideration."),
    [("চারটি তাম্রলিপি — নামকরণের ভিত্তি", "Four copperplate grants—the basis of its name"), ("অলঙ্কৃত ব্রোঞ্জ relic casket", "An ornamented bronze relic casket"), ("লড়হমাধব ও দেবপর্বত-related epigraphic evidence", "Epigraphic evidence concerning Ladaha-Madhava and Devaparvata")],
    quest("‘চারপত্র’ নামটি কোন প্রত্ননিদর্শন থেকে এসেছে?", "Which archaeological finds gave Charpatra Mura its name?", ["চার তাম্রলিপি", "চার স্তূপ", "চার ব্রোঞ্জ মূর্তি"], ["Four copperplates", "Four stupas", "Four bronze images"], 0, "এখানে চারটি তাম্রলিপি পাওয়া গেছে; স্থানটি বৌদ্ধ বিহার নয়, ব্রাহ্মণ্য মন্দির।", "Four copperplates were found here; the monument is a Brahmanical temple, not a Buddhist monastery.", "unesco-mainamati"),
    distances=[b("জেলা প্রশাসনের পাতায় কোটিলা মুড়া থেকে প্রায় ২ কিমি; সেনানিবাস-সংক্রান্ত প্রবেশপথ আগে নিশ্চিত করুন।", "The district administration places it about 2 km from Kotila Mura; confirm cantonment-related access beforehand.")]
))

S.append(mainamati_site(
    "ananda-vihara", "আনন্দ বিহার", "Ananda Vihara", 23.449333, 91.129583,
    b("বৃহৎ বৌদ্ধ বিহার · কেন্দ্রীয় মন্দির · ভোটিভ স্তূপ/চ্যৈত্য", "Large Buddhist monastery · central shrine · votive stupas and chapels"),
    b("আনুমানিক ৮ম; অন্য গবেষণা-সারসংক্ষেপে ৭ম শেষ/৮ম শুরু", "Attributed to the 8th century; other summaries place it around the late 7th/early 8th"),
    b("প্রারম্ভিক দেব; শ্রীআনন্দদেবের সঙ্গে traditional association", "Early Deva; traditionally associated with Sri Anandadeva"),
    b("Mainamati-এর সবচেয়ে বড় বিহার-পরিকল্পনাগুলির একটি; ধ্বংস ও সেনানিবাস-নির্মাণের ইতিহাস এটিকে সংরক্ষণ-সংবেদনশীল করে তুলেছে।", "One of Mainamati's largest monastic plans; wartime damage and cantonment construction make it especially conservation-sensitive."),
    b("১৯৮ মিটার বর্গাকার, চার বাহুতে ১১৫ কক্ষ; কেন্দ্রীয় মন্দির প্রথমে ক্রুশাকার, পরে rectangular plan-এ বদলায়।", "A 198 m square with 115 cells in four wings. Its central shrine changed from an initial cruciform plan to a later rectangular plan."),
    b("১৯৪৪–৪৫-এ contractors/brick hunters-এর ক্ষতির পর সীমিত খনন; ১৯৭০-এর দশকের শেষের কাজ অসম্পূর্ণ ছিল বলে Banglapedia উল্লেখ করে।", "After damage by contractors and brick hunters in 1944–45, limited excavation followed; Banglapedia describes late-1970s work as incomplete."),
    b("মূল কেন্দ্রীয় সৌধ অনেকটাই অচিহ্নিত হয়ে যাওয়ার ঐতিহাসিক নথি আছে; বর্তমান অবস্থা ও প্রবেশ field verification দরকার।", "Historical accounts describe severe loss of the central shrine; current condition and access require field verification."),
    [("জীবনাকার ভগ্ন ব্রোঞ্জ অবলোকিতেশ্বর", "A broken life-size bronze Avalokiteshvara"), ("তাম্রলিপি, রৌপ্য মুদ্রা ও ক্ষুদ্র ব্রোঞ্জ ভাস্কর্য", "A copperplate, silver coins and miniature bronze images"), ("টেরাকোটা ফলক", "Terracotta plaques")],
    quest("আনন্দ বিহারের কেন্দ্রীয় মন্দিরের plan কীভাবে বদলেছিল?", "How did the plan of Ananda Vihara's central shrine change?", ["ক্রুশাকার থেকে rectangular", "বৃত্ত থেকে ত্রিভুজ", "স্তূপ থেকে দুর্গ"], ["Cruciform to rectangular", "Circular to triangular", "Stupa to fort"], 0, "UNESCO nomination প্রথমে cruciform, পরে rectangular plan-এর কথা বলে।", "The UNESCO nomination describes an initial cruciform plan later changed to a rectangular one.", "unesco-mainamati")
))

S.append(mainamati_site(
    "bhoja-vihara", "ভোজ বিহার", "Bhoja Vihara", 23.442111, 91.131556,
    b("বর্গাকার বৌদ্ধ বিহার · কেন্দ্রীয় ক্রুশাকার মন্দির · উপস্তূপ/চ্যৈত্য", "Square Buddhist monastery · central cruciform shrine · stupas and chapels"),
    b("আনুমানিক ৮ম শতক", "c. 8th century"),
    b("প্রারম্ভিক দেব-সম্পর্কিত Mainamati tradition; সুনির্দিষ্ট প্রতিষ্ঠাতা এই প্রোফাইলে নিশ্চিত বলা হচ্ছে না", "Associated with Mainamati's early-Deva tradition; no specific founder is asserted in this profile"),
    b("শালবন ও আনন্দের পাশাপাশি Mainamati-এর বড় বিহার-প্রত্নাঞ্চল; কেন্দ্রীয় মন্দির ও আঙিনাজুড়ে উপসৌধের সমৃদ্ধ plan।", "A major Mainamati monastery alongside Shalban and Ananda, with a central shrine and a courtyard rich in subsidiary structures."),
    b("১৩৭.২ মিটার বাহুর বর্গাকার বিহার; কেন্দ্রে বড় ক্রুশাকার মন্দির এবং আঙিনায় votive stupa, shrine ও chapel।", "A square monastery with 137.2 m wings, a large central cruciform shrine and a courtyard containing votive stupas, shrines and chapels."),
    b("খননে বিহার ও কেন্দ্রীয় মন্দির উন্মোচিত; ২০২৩ nomination স্থাপত্য ও প্রধান bronze findings নথিভুক্ত করে।", "Excavation exposed the monastery and central shrine; the 2023 nomination records its architecture and principal bronze finds."),
    b("নিচের স্থাপত্য ও ধ্বংসাবশেষ সংরক্ষণের বিষয়; বর্তমান প্রবেশপথ ও conservation condition স্থানীয়ভাবে যাচাই প্রয়োজন।", "Basal architecture and ruins require conservation; current access and condition need local verification."),
    [("অমিতাভ ও অক্ষোভ্য মূর্তি", "Images of Amitabha and Akshobhya"), ("বিশাল ব্রোঞ্জ বজ্রসত্ত্ব — nomination ‘probably the largest in South Asia’ বলে qualifier দেয়", "A giant bronze Vajrasattva—the nomination qualifies it as ‘probably the largest in South Asia’"), ("টেরাকোটা ও অন্যান্য ধাতব নিদর্শন", "Terracotta and other metal objects")],
    quest("ভোজ বিহারের কেন্দ্রীয় মন্দিরের মূল plan কেমন?", "What is the principal plan of Bhoja Vihara's central shrine?", ["ক্রুশাকার", "অষ্টভুজ", "গোলাকার"], ["Cruciform", "Octagonal", "Circular"], 0, "UNESCO nomination বর্গাকার আঙিনার কেন্দ্রে বড় cruciform shrine বর্ণনা করে।", "The UNESCO nomination describes a large cruciform shrine at the centre of the square courtyard.", "unesco-mainamati")
))

S.append(site(
    "sitakot", "sitakot", "সীতাকোট বিহার", "Sitakot Vihara", "north", "দিনাজপুর", "Dinajpur", "নবাবগঞ্জ", "Nawabganj",
    25.414018, 89.050667, "sitakot-coordinate",
    b("চতুষ্কোণ বৌদ্ধ বিহার · ৪১ কক্ষ · shrine/mandapa-সংক্রান্ত অবশেষ", "Quadrangular Buddhist monastery · 41 cells · remains associated with a shrine and mandapa"),
    b("স্থাপত্য ও bronze style-এর ভিত্তিতে আনুমানিক ৭ম–৮ম; stratigraphic date নিশ্চিত নয়", "c. 7th–8th centuries on architectural and bronze stylistic grounds; not securely dated by stratigraphy"),
    b("প্রারম্ভিক মধ্যযুগীয় বরেন্দ্র; একক বংশ/প্রতিষ্ঠাতা নিশ্চিত নয়", "Early-medieval Varendra; no single dynasty or founder is established"),
    b("নবাবগঞ্জের গুরুত্বপূর্ণ খননকৃত বিহার; আকার ও general appearance-এ ভাসু বিহারের সঙ্গে সাদৃশ্য উল্লেখ করা হয়।", "An important excavated monastery in Nawabganj, compared with Bhasu Vihara in size and general appearance."),
    b("৬৫.২৩ × ৬৪.১১ মিটার; ৪১ কক্ষ, উত্তরের gateway ও দুই guardroom। দক্ষিণের বড় কক্ষটি প্রধান shrine এবং সামনের pillared pavilion মণ্ডপ হতে পারে।", "Measuring 65.23 × 64.11 m with 41 cells, a northern gateway and two guardrooms. A larger southern cell may have served as the main shrine, with a pillared pavilion as a mandapa."),
    b("খননে পূর্ণ monastic plan উন্মোচিত; দুই নির্মাণপর্যায় প্রস্তাবিত হলেও stratigraphy দিয়ে নির্ভুল তারিখ নির্ধারিত হয়নি।", "Excavation exposed a coherent monastic plan. Two building periods have been proposed, but no secure stratigraphic date has been established."),
    b("ভিত ও নিচের ইটের স্থাপত্য দৃশ্যমান; বর্তমান রক্ষণাবেক্ষণ/প্রবেশ অবস্থা নতুন field report ছাড়া নিশ্চিত বলা হচ্ছে না।", "Basal brickwork survives. Current maintenance and access are not asserted without a recent field report."),
    b("বর্তমান UNESCO বিশ্ব ঐতিহ্য বা বর্তমান tentative list-এর পৃথক component নয়।", "Not an inscribed World Heritage property or a separately listed component on the current UNESCO tentative list."),
    b("DoA-এর সংরক্ষিত পুরাকীর্তি তালিকায় উল্লেখিত; site-specific বর্তমান legal notification ও প্রবেশনীতি আঞ্চলিক দপ্তরে যাচাই করুন।", "Listed among DoA protected monuments; verify the current site-specific legal notification and access policy with the regional office."),
    [("বোধিসত্ত্ব পদ্মপাণি ও মঞ্জুশ্রীর দুটি ব্রোঞ্জ মূর্তি", "Two bronze images of Bodhisattvas Padmapani and Manjushri"), ("কক্ষের niche, brick platform ও দৈনন্দিন স্থাপত্য-নিদর্শন", "Cell niches, brick platforms and evidence of daily architectural life")],
    [("পর্যালোচিত উৎসে বর্তমান repository স্পষ্ট নয়—DoA আঞ্চলিক দপ্তর/জাদুঘরে যাচাই প্রয়োজন।", "The reviewed source does not specify the current repository; verify with the DoA regional office or museum.")],
    ["bp-sitakot", "sitakot-coordinate", "sitakot-wikidata", "doa-law", "unesco-current-list"],
    quest("সীতাকোট বিহারে কতগুলি monastic cell আছে?", "How many monastic cells does Sitakot Vihara contain?", ["১৯", "৪১", "১৭৭"], ["19", "41", "177"], 1, "Banglapedia-এর plan-এ উত্তরে ৮ এবং অন্য তিন বাহুতে ১১টি করে—মোট ৪১।", "Banglapedia records eight cells in the north and eleven in each other wing: 41 in total.", "bp-sitakot"),
    travel("dinajpur", "দিনাজপুর/নবাবগঞ্জ → প্রকাশিত site coordinate-এর কাছের স্থানীয় রুট। ভাড়া, প্রবেশ ও ফেরার যান আগে ঠিক করুন।", "Dinajpur/Nawabganj → local route near the published site coordinate. Arrange fares, entry and return transport in advance.",
           [], None, None,
           "দিনাজপুর শহরকে hub ধরে খাবার/থাকা যাচাই করুন; গ্রামীণ স্থানে ফেরার পরিবহন আগে ঠিক রাখুন। জরুরি সেবা ৯৯৯।",
           "Use Dinajpur as the hub for verified food and lodging; pre-arrange return transport in the rural area. Emergency: 999."),
    photo("sitakot.jpg", "সীতাকোট বিহারের খননকৃত দেয়াল ও আঙিনা", "Excavated walls and courtyard at Sitakot Vihara")
))

S.append(site(
    "halud-vihara", "halud-vihara", "হলুদ বিহার", "Halud Vihara", "north", "নওগাঁ", "Naogaon", "বদলগাছী", "Badalgachhi",
    24.932497, 88.971383, "sitakot-coordinate",
    b("বৌদ্ধ settlement · temple complex · সম্ভাব্য স্তূপ-ভিত", "Buddhist settlement · temple complex · probable stupa base"),
    b("প্রারম্ভিক মধ্যযুগ; পাহাড়পুর/সীতাকোটের সমকালীন; প্রায় ৮ম–৯ম নিদর্শন", "Early medieval, broadly contemporary with Paharpur and Sitakot; finds include c. 8th–9th-century material"),
    b("বরেন্দ্রের প্রারম্ভিক মধ্যযুগীয় tradition; প্রতিষ্ঠাতা/বংশ এখনো নিশ্চিত নয়", "Early-medieval Varendra tradition; founder and dynasty remain uncertain"),
    b("একাধিক ঢিবি ও গ্রামজুড়ে ছড়ানো প্রত্ননিদর্শনের অঞ্চল; প্রাচীন নাম ও পূর্ণ সীমানা এখনও নির্ণয় হয়নি।", "A landscape of multiple mounds and finds spread through the village; its ancient name and full extent remain unresolved."),
    b("৫.৮০ মিটার বাহুর নিরেট বর্গাকার structure—সম্ভবত স্তূপ-ভিত; দুই অসমান কক্ষ, সিঁড়ি, enclosure wall ও ১.১ মিটার pradakshin path।", "A solid 5.80 m-square structure, probably a stupa base, with two unequal rooms, a staircase, an enclosure wall and a 1.1 m circumambulatory passage."),
    b("১৯৭৬-এ সুরক্ষিত; DoA খনন ১৯৮৪ ও ১৯৯৩। সর্বোচ্চ ৬.১৫ মিটার গভীরতায় আট occupation stratum; এখনও small-scale investigation।", "Protected in 1976 and excavated by DoA in 1984 and 1993. Eight occupation strata were reached at a maximum depth of 6.15 m; investigation remains small-scale."),
    b("Banglapedia-এ ব্যাপক encroachment, ইট-চুরি ও ক্ষতির ঐতিহাসিক নথি আছে; ২০২৬-এর বর্তমান অবস্থা নতুন field verification ছাড়া বলা হচ্ছে না।", "Banglapedia documents extensive encroachment, brick robbing and damage. The current 2026 condition is not asserted without fresh field verification."),
    b("বর্তমান UNESCO tentative list-এ পৃথক এন্ট্রি নেই এবং বিশ্ব ঐতিহ্য নয়; পুরনো ১৯৯৯ tentative উল্লেখকে বর্তমান মর্যাদা ভাববেন না।", "It is not a separate entry on the current UNESCO tentative list and is not a World Heritage property; older 1999 tentative references must not be read as current status."),
    b("১৯৭৬-এ সুরক্ষিত বলে Banglapedia; বর্তমান DoA notification ও অবস্থান-নির্দিষ্ট সংরক্ষণ ব্যবস্থা যাচাই করুন।", "Banglapedia records protection in 1976; verify the present DoA notification and site-specific conservation arrangements."),
    [("Inscribed terracotta sealing, ornamental brick ও মানুষের আকৃতির টেরাকোটা", "Inscribed terracotta sealings, ornamental bricks and figural terracotta"), ("পাথরের pedestal, অলংকার mould ও grinding stone", "A stone pedestal, an ornament mould and a grinding stone"), ("মৃৎপাত্র এবং ঐতিহাসিকভাবে রিপোর্টকৃত পাথর/ধাতব মূর্তি", "Pottery and historically reported stone and metal images")],
    [("বর্তমান object repository যাচাই প্রয়োজন; পাহাড়পুর জাদুঘরে প্রদর্শন আছে ধরে নেওয়া যাবে না।", "The current object repository needs verification; do not assume display at Paharpur Museum.")],
    ["bp-halud", "doa-law", "unesco-current-list", "sitakot-coordinate"],
    quest("হলুদ বিহারে DoA-এর নথিভুক্ত খনন কোন দুই বছর?", "Which two years does Banglapedia record for DoA excavations at Halud Vihara?", ["১৯২৩ ও ১৯৩৪", "১৯৮৪ ও ১৯৯৩", "২০২২ ও ২০২৫"], ["1923 and 1934", "1984 and 1993", "2022 and 2025"], 1, "Banglapedia-এ ১৯৮৪ ও ১৯৯৩—দুই ধাপের খননের কথা আছে।", "Banglapedia records two excavation campaigns, in 1984 and 1993.", "bp-halud"),
    travel("naogaon", "নওগাঁ/বদলগাছী বা পাহাড়পুর → হলুদ বিহার গ্রাম। সড়ক ও ফেরার স্থানীয় যান আগে নিশ্চিত করুন।", "Naogaon/Badalgachhi or Paharpur → Halud Vihara village. Confirm roads and return transport beforehand.",
           [b("Banglapedia: পাহাড়পুর থেকে প্রায় ১৫ কিমি দক্ষিণ ও নওগাঁ শহর থেকে প্রায় ১৮ কিমি উত্তর; এগুলি প্রকাশিত approximate distance, বর্তমান road measurement নয়।", "Banglapedia gives about 15 km south of Paharpur and 18 km north of Naogaon; these are published approximate distances, not current road measurements.")]),
    photo("halud-vihara.jpg", "হলুদ বিহারের প্রত্নস্থল", "Archaeological remains at Halud Vihara")
))

S.append(site(
    "bhasu-vihara", "vasu", "ভাসু / বাসু বিহার (নরপতির ঢাপ)", "Bhasu / Vasu Vihara (Narapatir Dhap)", "north", "বগুড়া", "Bogura", "শিবগঞ্জ", "Shibganj",
    24.982894, 89.29747, "sitakot-coordinate",
    b("দুই rectangular বিহার · semi-cruciform shrine · multiphase ধ্বংসাবশেষ", "Two rectangular monasteries · semi-cruciform shrine · multiphase remains"),
    b("Post-Gupta; উন্মোচিত upper level ১০ম–১১শ; গভীরের প্রাচীন স্তর এখনও অপর্যাপ্তভাবে খনিত", "Post-Gupta; exposed upper levels date to the 10th–11th centuries, while earlier lower levels remain insufficiently investigated"),
    b("পরবর্তী গুপ্ত/প্রারম্ভিক পাল-সম্পর্কিত বরেন্দ্র; একক প্রতিষ্ঠাতা নিশ্চিত নয়", "Post-Gupta and early-Pala-associated Varendra; no single founder is established"),
    b("মহাস্থানগড়ের hinterland-এর বড় বৌদ্ধ প্রত্নাঞ্চল। হিউয়েন সাঙের Po-Shi-Po-এর সঙ্গে সমীকরণ প্রস্তাবিত হলেও প্রত্নতাত্ত্বিকভাবে প্রমাণিত নয়।", "A major Buddhist complex in the hinterland of Mahasthangarh. Its proposed identification with Xuanzang's Po-Shi-Po is not archaeologically demonstrated."),
    b("Monastery 1-এ ২৬ এবং Monastery 2-এ ৩০ কক্ষ; পাশে terraced ambulatory passage-সহ semi-cruciform shrine। ২০০৩ খননে অন্তত চার architectural phase।", "Monastery 1 has 26 cells and Monastery 2 has 30, beside a semi-cruciform shrine with terraced ambulatory passages. The 2003 excavation identified at least four architectural phases."),
    b("১৯৭৩–৭৪ ও ১৯৯৮ খনন; ২০০৩-এ Antiquity project-এর সীমিত trench-এ multiphase structure ও cruciform building-এর নতুন প্রমাণ।", "Excavations in 1973–74 and 1998 were followed by a focused 2003 Antiquity project trench that documented multiphase architecture and another cruciform structure."),
    b("বিস্তৃত ঢিবির অল্প অংশ খনিত; upper-level monastery/shrine-এর ভিত দৃশ্যমান। অধিকাংশ cultural deposit এখনও গবেষণার সম্ভাবনা ধরে রেখেছে।", "Only a small part of the extensive mound has been excavated. Upper-level monastic and shrine bases are visible, while substantial cultural deposits remain for future research."),
    b("মহাস্থান ও করতোয়া Cultural Landscape-এর বর্তমান UNESCO tentative nomination (২০২৩)-এর প্রাসঙ্গিক অংশ; পৃথক World Heritage নয়।", "Associated with the current 2023 UNESCO tentative nomination for the Cultural Landscape of Mahasthan and Karatoya River; not a separate World Heritage property."),
    b("DoA সংরক্ষণাধীন প্রত্নস্থল; Mahasthan nomination-এ protected monuments-এর কথা আছে। বর্তমান notification আঞ্চলিক দপ্তরে যাচাই করুন।", "A DoA-protected archaeological site; the Mahasthan nomination refers to protected monuments. Verify the current notification with the regional office."),
    [("৬০-এর বেশি ব্রোঞ্জ মূর্তি—বুদ্ধ, বোধিসত্ত্ব ও তারা", "More than 60 bronze images of Buddhas, bodhisattvas and Taras"), ("২৫০-এর বেশি inscribed terracotta sealing; ১০০-এর বেশি পাঠযোগ্য", "More than 250 inscribed terracotta sealings, over 100 decipherable"), ("টেরাকোটা ফলক, ornamental brick ও মৃৎপাত্র", "Terracotta plaques, ornamental bricks and pottery")],
    [("মহাস্থান জাদুঘর/DoA সংগ্রহে যাচাই প্রয়োজন; নির্দিষ্ট বস্তুর বর্তমান display নিশ্চিত নয়।", "Verify with Mahasthan Museum or DoA collections; the present display of particular objects is not established.")],
    ["bp-bhasu", "antiquity-bhasu", "unesco-mahasthan", "cunningham", "doa-law"],
    quest("ভাসু বিহার = হিউয়েন সাঙের Po-Shi-Po—এটি নিশ্চিত কেন নয়?", "Why is the identification of Bhasu Vihara with Xuanzang's Po-Shi-Po not certain?", ["উন্মোচিত upper level ১০ম–১১শ; ৭ম শতকের স্তর যথেষ্ট খনিত নয়", "এখানে কোনো কক্ষ নেই", "এটি UNESCO বিশ্ব ঐতিহ্য"], ["Exposed upper levels are 10th–11th century; 7th-century levels are insufficiently excavated", "It has no cells", "It is a World Heritage property"], 0, "Banglapedia স্পষ্ট করে: সীমিত খনন upper level-এ; তাই ৭ম শতকের বিবরণের সঙ্গে সমীকরণ প্রমাণিত নয়।", "Banglapedia explains that excavation has mainly reached upper levels, so identification with the 7th-century account is not demonstrated.", "bp-bhasu"),
    travel("bogura", "বগুড়া → মহাস্থানগড় → ভাসু বিহার। স্থানীয় যান, ফেরার ব্যবস্থা ও খোলা প্রবেশপথ আগে জেনে নিন।", "Bogura → Mahasthangarh → Bhasu Vihara. Check local transport, return arrangements and open access routes.",
           [b("Banglapedia/Antiquity: মহাস্থানগড়ের প্রায় ৬ কিমি পশ্চিম/উত্তর-পশ্চিম; প্রকাশিত approximate distance, turn-by-turn road route নয়।", "Banglapedia and Antiquity place it about 6 km west/north-west of Mahasthangarh; this is an approximate published distance, not a turn-by-turn road route.")],
           None, None,
           "বগুড়া শহর বা মহাস্থান এলাকায় খাবার/বিশ্রামের সুবিধা যাচাই করুন; গ্রামীণ অংশে পানি ও ফেরার যান রাখুন। জরুরি সেবা ৯৯৯।",
           "Verify food and rest options in Bogura or around Mahasthan; carry water and arrange return transport for the rural segment. Emergency: 999."),
    photo("bhasu-vihara.jpg", "ভাসু বিহারের খননকৃত স্থাপত্য", "Excavated architecture at Bhasu Vihara"),
    extra={"media": [{"file": "assets/atlas/cunningham-mahasthan-plate29.jpg", "alt": b("কানিংহামের ১৮৮২ মহাস্থান মানচিত্র, পড়ার সুবিধায় ঘোরানো", "Cunningham's 1882 Mahasthan map, rotated for readability"), "credit": "Alexander Cunningham / ASI", "license": "Public domain", "page": "https://archive.org/details/in.ernet.dli.2015.21810", "category": "archival survey map"}]}
))

S.append(site(
    "jagaddala", "jagaddala", "জগদ্দল মহাবিহার — tentative site identification", "Jagaddala Mahavihara — tentative site identification", "north", "নওগাঁ", "Naogaon", "ধামইরহাট", "Dhamoirhat",
    25.159389, 88.887611, "jagaddala-coordinate",
    b("আংশিকভাবে খনিত মহাবিহার · কক্ষ · প্রবেশদ্বার · ছোট shrine", "Partly excavated mahavihara · cells · gateway · small shrine"),
    b("সম্ভবত ১১শ শেষ–১২শ; প্রাচীন নগর/মহাবিহার-সমীকরণ গবেষণাধীন", "Probably late 11th–12th centuries; identification of the ancient institution remains under scholarly assessment"),
    b("পাল; সম্ভবত রামপাল—তবে স্থান ও প্রতিষ্ঠাতা দুটিই qualifier-সহ", "Pala; probably Ramapala, with both location and attribution explicitly qualified"),
    b("ধামইরহাটের Jagdal-কে বিখ্যাত জগদ্দল মহাবিহারের সম্ভাব্য স্থান হিসেবে চিহ্নিত করা হয়; পাঁচটি সমনামী স্থান বিবেচনার পর এই tentative identification।", "Jagdal in Dhamoirhat is the leading proposed location of the famed Jagaddala Mahavihara after five similarly named places were considered; the identification remains tentative."),
    b("১৯৯৬-এর সীমিত খননে দক্ষিণে ৭ ও পশ্চিমে ৪—মোট ১১ কক্ষ, পূর্বের প্রবেশদ্বার ও পশ্চিমের ছোট shrine। অস্বাভাবিক চার semicircular corner tower-এর ধারণা।", "Limited excavation in 1996 exposed seven southern and four western cells (11 total), an eastern gateway and a small western shrine, along with evidence interpreted as four unusual semicircular corner towers."),
    b("ছোট আকারের খননে monastery-এর অল্প অংশ; বড় অংশ এখনও মাটির নিচে। ১৯৮৩–৮৪ reconnaissance-এর আগে অনেক ঢিবি ইতিমধ্যে ক্ষতিগ্রস্ত ছিল।", "Small-scale excavation exposed only part of the monastery, leaving much buried. Many mounds had already been damaged before the 1983–84 reconnaissance."),
    b("Banglapedia-এ ঢিবির ধ্বংস, সিল্টেড ট্যাংক ও encroachment-এর নথি; বর্তমান field condition আলাদা যাচাই প্রয়োজন।", "Banglapedia documents damaged mounds, silted tanks and encroachment; current field condition needs separate verification."),
    b("বর্তমান UNESCO tentative list-এ পৃথক এন্ট্রি নেই এবং বিশ্ব ঐতিহ্য নয়; পুরনো ১৯৯৯ tentative উল্লেখ বর্তমান মর্যাদা নয়।", "It is not a separate entry on the current UNESCO tentative list and is not a World Heritage property; older 1999 tentative references are not current status."),
    b("DoA-এর স্থানীয় প্রত্নস্থল হিসেবে ব্যবস্থাপনা; বর্তমান আইনি notification ও সংরক্ষণ-সীমানা আঞ্চলিক দপ্তরে যাচাই করুন।", "Managed as a DoA archaeological site; verify current legal notification and protected boundaries with the regional office."),
    [("১৫০-এর বেশি শিল্প/দৈনন্দিন বস্তু—পাথর ভাস্কর্য, টেরাকোটা, স্বর্ণের ingot, মৃৎপাত্র, লোহার পেরেক ও পুঁতি", "More than 150 art and daily-use objects, including stone sculpture, terracotta, a gold ingot, pottery, iron nails and beads"), ("হেরুক ও বিষ্ণুর ভগ্ন পাথর মূর্তি", "Fragmentary stone images of Heruka and Vishnu"), ("১৯৮৪-এ রিপোর্টকৃত ধ্যানী বুদ্ধ-খোদাই slab ও ভগ্ন ব্রোঞ্জ ঘণ্টা", "A Dhyani Buddha slab and broken bronze bell reported in 1984")],
    [("DoA-এর পুরনো পাতায় ১৯৮৪-এর slab ও ব্রোঞ্জ ঘণ্টা পাহাড়পুর জাদুঘরে সংরক্ষিত বলা হয়েছে; বর্তমান প্রদর্শন যাচাই করুন।", "A legacy DoA page places the 1984 slab and bronze bell at Paharpur Museum; confirm their current display."), ("অন্যান্য বস্তুর বর্তমান repository পৃথকভাবে যাচাই প্রয়োজন।", "The current repository for other objects requires separate verification.")],
    ["bp-jagaddala", "doa-jagaddala", "jagaddala-coordinate", "doa-law", "unesco-current-list"],
    quest("জগদ্দলের অবস্থান কেন ‘tentative’ বলা হয়?", "Why is Jagaddala's location described as tentative?", ["পাঁচটি সমনামী স্থানের মধ্যে প্রত্ননিদর্শনের ভিত্তিতে ধামইরহাটকে সম্ভাব্য বলা হয়", "এখানে কোনো খনন হয়নি", "UNESCO এটি মুছে দিয়েছে"], ["Five similarly named places were compared; Dhamoirhat is favoured by its remains", "No excavation occurred", "UNESCO deleted it"], 0, "A.K.M. Zakaria পাঁচ স্থান দেখে ধামইরহাটের ঢিবিগুলিকে সবচেয়ে সম্ভাব্য মনে করেন; এটি চূড়ান্ত প্রমাণ নয়।", "A. K. M. Zakaria favoured the Dhamoirhat mounds after examining five candidates; that is not a final proof.", "bp-jagaddala"),
    travel("naogaon", "জয়পুরহাট/ধামইরহাট → Hatitakidanga → Jagdal। ফেরার যান, স্থানীয় পথ ও প্রবেশ আগে নিশ্চিত করুন।", "Joypurhat/Dhamoirhat → Hatitakidanga → Jagdal. Confirm return transport, local roads and access in advance.",
           [b("Banglapedia: ধামইরহাট থেকে প্রায় ৮ কিমি উত্তর-পূর্ব, Hatitakidanga বাজার থেকে প্রায় ৩ কিমি উত্তর-পূর্ব; পাহাড়পুর প্রায় ২০ কিমি ও হলুদ প্রায় ১৮ কিমি দূরে বলা হয়—রুট যাচাই করুন।", "Banglapedia gives about 8 km north-east of Dhamoirhat and 3 km north-east of Hatitakidanga, with Paharpur about 20 km and Halud about 18 km away; verify the route.")],
           None, None,
           "ধামইরহাট/জয়পুরহাটে খাবার ও থাকার ব্যবস্থা যাচাই করুন; সীমান্ত-নিকট গ্রামীণ এলাকায় নির্দেশনা মানুন। জরুরি সেবা ৯৯৯।",
           "Verify food and lodging in Dhamoirhat or Joypurhat; follow local instructions in this rural border-area landscape. Emergency: 999."),
    photo("jagaddala.jpg", "জগদ্দল মহাবিহারের প্রস্তাবিত প্রত্নাঞ্চলের ঢিবি", "Mound at the proposed Jagaddala Mahavihara site")
))

DATA = {
    "schema_version": "2026-10-24.atlas.v1",
    "generated_at": TODAY,
    "scope": b("১২টি গভীর major-site profile দিয়ে শুরু; মূল ৩২১৮ রেকর্ড, মানচিত্র, archive ও tracker অপরিবর্তিত সংখ্যায় সংযুক্ত। প্রতিটি profile-এর documentation level আলাদা।", "Starting with twelve in-depth major-site profiles, linked to—not replacing—the existing 3,218 records, maps, archive and tracker. Documentation depth varies by profile."),
    "verification_label": b("যাত্রার আগে যাচাই প্রয়োজন", "Verify before travel"),
    "sources": SOURCES,
    "hubs": [
        {"id": "cumilla", "name": b("কুমিল্লা শহর", "Cumilla city"), "lat": 23.4607, "lon": 91.1809},
        {"id": "naogaon", "name": b("নওগাঁ শহর", "Naogaon town"), "lat": 24.8042, "lon": 88.95},
        {"id": "joypurhat", "name": b("জয়পুরহাট শহর", "Joypurhat town"), "lat": 25.0968, "lon": 89.0227},
        {"id": "bogura", "name": b("বগুড়া শহর", "Bogura city"), "lat": 24.8465, "lon": 89.3773},
        {"id": "dinajpur", "name": b("দিনাজপুর শহর", "Dinajpur city"), "lat": 25.6279, "lon": 88.6332}
    ],
    "sites": S,
}

# Source-backed corrections to the underlying core records. These are not
# cosmetic Atlas-only overrides; all other records and the total are retained.
core_path = OUT / "heritage-sites.json"
core = json.loads(core_path.read_text())
records = core["records"]
original_count = len(records)
by_id = {p["record_id"]: p for p in S}
for record in records:
    profile = by_id.get(record["id"])
    if not profile:
        continue
    c = profile["coordinates"]
    record["location_lat_long"] = {"latitude": c["lat"], "longitude": c["lon"]}
    record["upazila"] = profile["upazila"]["bn"]
    record["thana"] = profile["upazila"]["bn"]
    record["coordinate_note"] = c["accuracy"]["bn"]
    record["coordinate_note_en"] = c["accuracy"]["en"]
    record["source_url"] = SOURCE_MAP[c["source"]]["url"]
    record["source_label"] = SOURCE_MAP[c["source"]]["title"]
    record["verification_note"] = c["accuracy"]["bn"] + " " + profile["travel"]["road"]["bn"]
    record["pin_approximate"] = False
    if record["id"] == "somapura":
        record["union"] = "পাহাড়পুর"
    elif record["id"] in {"kotila-mura", "itakhola-mura", "rupban-mura", "charpatra-mura", "ananda-vihara", "bhoja-vihara"}:
        record["union"] = "বিজয়পুর"
    elif record["id"] == "vasu":
        record["union"] = "বিহার"
    elif record["id"] == "shalban":
        record["village"] = "শালমানপুর / কোটবাড়ি"
        record["union"] = ""
    elif record["id"] == "halud-vihara":
        record["village"] = "হলুদ বিহার / দ্বীপগঞ্জ"
    elif record["id"] == "jagaddala":
        record["village"] = "জগদ্দল / জগদল"
    elif record["id"] == "sitakot":
        record["village"] = "মারাশ / ফতেপুর এলাকা"
    record["name_en"] = profile["name"]["en"]
    if record["id"] == "charpatra-mura":
        record["type"] = "ব্রাহ্মণ্য মন্দির"
    record["history"] = profile["summary"]["bn"] + " " + profile["excavation"]["bn"]
    record["summary"] = profile["summary"]["bn"]
    record["archaeology_findings"] = " ".join(x["bn"] for x in profile["finds"])
    record["architectural_significance"] = profile["architecture"]["bn"]
    record["historical_era"] = profile["period"]["bn"]
    record["entry_fee"] = None
    record["travel_note"] = profile["travel"]["access"]["bn"] + " " + profile["travel"]["road"]["bn"]
    record["best_time_to_visit"] = "খোলার সময়, আবহাওয়া, স্থানীয় প্রবেশ ও ফেরার পরিবহন যাত্রার আগে সরকারি/স্থানীয় সূত্রে যাচাই করুন।"
    record["verification_status"] = "atlas-source-reviewed"

assert len(records) == original_count
core["atlas_review"] = {"date": TODAY, "profile_ids": [p["id"] for p in S],
                         "note": "Source-backed major-profile and coordinate review; no records added or removed."}
core_path.write_text(json.dumps(core, ensure_ascii=False, indent=1) + "\n")

# Keep the homepage's compiled core view synchronized with the same records.
# The 359 + 2,859 = 3,218 compiled totals must not change.
dashboard_path = OUT / "dashboard-core.json"
dashboard = json.loads(dashboard_path.read_text())
dashboard_original_count = len(dashboard["places"])
record_by_id = {record["id"]: record for record in records}
for view in dashboard["places"]:
    profile = by_id.get(view["id"])
    if not profile:
        continue
    c = profile["coordinates"]
    base_record = record_by_id[view["id"]]
    view.update({
        "en": profile["name"]["en"],
        "category": base_record["category"], "type": base_record["type"],
        "upazila": profile["upazila"]["bn"], "thana": profile["upazila"]["bn"],
        "coords": [c["lat"], c["lon"]],
        "summary": profile["summary"]["bn"],
        "history": profile["summary"]["bn"] + " " + profile["excavation"]["bn"],
        "source": SOURCE_MAP[c["source"]]["url"],
        "sourceLabel": SOURCE_MAP[c["source"]]["title"],
        "approx": False, "verify": "atlas-source-reviewed · " + c["accuracy"]["bn"],
        "trip": profile["travel"]["access"]["bn"] + " " + profile["travel"]["road"]["bn"],
    })
    if view["id"] == "somapura":
        view["union"] = "পাহাড়পুর"
    elif view["id"] in {"kotila-mura", "itakhola-mura", "rupban-mura", "charpatra-mura", "ananda-vihara", "bhoja-vihara"}:
        view["union"] = "বিজয়পুর"
    elif view["id"] == "vasu":
        view["union"] = "বিহার"
    elif view["id"] == "shalban":
        view["village"] = "শালমানপুর / কোটবাড়ি"
        view["union"] = ""
    elif view["id"] == "halud-vihara":
        view["village"] = "হলুদ বিহার / দ্বীপগঞ্জ"
    elif view["id"] == "jagaddala":
        view["village"] = "জগদ্দল / জগদল"
    elif view["id"] == "sitakot":
        view["village"] = "মারাশ / ফতেপুর এলাকা"
assert len(dashboard["places"]) == dashboard_original_count == dashboard["count"]
dashboard_path.write_text(json.dumps(dashboard, ensure_ascii=False, separators=(",", ":")) + "\n")

(OUT / "atlas-sites.json").write_text(json.dumps(DATA, ensure_ascii=False, indent=2) + "\n")

CONTENT = {
    "schema_version": "2026-10-24.atlas-content.v1",
    "generated_at": TODAY,
    "circuits": [
        {
            "id": "greater-comilla", "hub": "cumilla", "days": 2,
            "name": b("বৃহত্তর কুমিল্লা · লালমাই-ময়নামতি সার্কিট", "Greater Cumilla · Lalmai-Mainamati circuit"),
            "summary": b("দক্ষিণ থেকে উত্তরে সাত component-এর evidence-based পরিকল্পনা। প্রথম দিন শালবন ও জাদুঘর; দ্বিতীয় দিনের সেনানিবাস-সংশ্লিষ্ট প্রবেশ আগে নিশ্চিত করুন।", "An evidence-based south-to-north plan for seven components. Start with Shalban and the museum; confirm second-day cantonment-related access first."),
            "stops": [
                {"site": "shalban", "day": 1}, {"site": "rupban-mura", "day": 1},
                {"site": "itakhola-mura", "day": 1}, {"site": "bhoja-vihara", "day": 2},
                {"site": "ananda-vihara", "day": 2}, {"site": "kotila-mura", "day": 2},
                {"site": "charpatra-mura", "day": 2}
            ],
            "notes": [b("শালবনের সঙ্গে ময়নামতি জাদুঘরের সময় রাখুন; রবিবার বন্ধ ও সোমবারের ভিন্ন সময় মনে রাখুন।", "Allow time for Mainamati Museum with Shalban; remember Sunday closure and different Monday hours."), b("এই ক্রম স্থানাঙ্কের সাহায্যে পরিকল্পনার সুবিধার জন্য; এটি turn-by-turn road route বা সব স্থান খোলা থাকার নিশ্চয়তা নয়।", "The order aids planning from coordinates; it is not a turn-by-turn road route or a guarantee that every place is open."), b("চারপত্র বৌদ্ধ বিহার নয়—ব্রাহ্মণ্য মন্দির হিসেবে পড়ুন ও আলোচনা করুন।", "Read and discuss Charpatra as a Brahmanical temple, not a Buddhist monastery.")]
        },
        {
            "id": "northern-vihara", "hub": "bogura", "days": 4,
            "name": b("উত্তরের মহাবিহার সার্কিট · বরেন্দ্র", "Northern Vihara circuit · Varendra"),
            "summary": b("বগুড়া থেকে ভাসু, তারপর হলুদ–সোমপুর–জগদ্দল–সীতাকোট। লম্বা দূরত্ব ও সীমিত খননের পার্থক্য বুঝে চার দিনের ধীর পরিকল্পনা।", "From Bogura to Bhasu, then Halud, Somapura, Jagaddala and Sitakot: a slower four-day plan that recognises long distances and different excavation scales."),
            "stops": [
                {"site": "bhasu-vihara", "day": 1}, {"site": "halud-vihara", "day": 2},
                {"site": "somapura", "day": 2}, {"site": "jagaddala", "day": 3},
                {"site": "sitakot", "day": 4}
            ],
            "notes": [b("ভাসুর সঙ্গে মহাস্থানগড়/জাদুঘর আলাদা সময় চায়; ভাসু = Po-Shi-Po নিশ্চিত নয়।", "Mahasthangarh and its museum deserve separate time near Bhasu; Bhasu is not securely identified as Po-Shi-Po."), b("সোমপুর ও পাহাড়পুর একই স্থান; জগদ্দলের স্থান-সমীকরণ tentative।", "Somapura and Paharpur are one site; Jagaddala's identification remains tentative."), b("দূরত্বগুলি straight-line planning aid; বাস/ট্রেন/স্থানীয় যান, ভাড়া ও সড়ক অবস্থা যাত্রার আগে যাচাই প্রয়োজন।", "Distances are straight-line planning aids; verify bus/train/local transport, fares and roads before travel.")]
        }
    ],
    "travel_modes": [
        {"icon": "🚆", "name": b("ট্রেন", "Train"), "source": "rail", "text": b("সময়সূচি, seat availability ও ভাড়া Bangladesh Railway e-ticket/Rail Sheba বা authorised counter-এ দেখুন। অনুমোদিত মাধ্যম ছাড়া অগ্রিম অর্থ দেবেন না।", "Check schedules, seat availability and fares through Bangladesh Railway e-ticket/Rail Sheba or an authorised counter. Do not prepay unauthorised sellers.")},
        {"icon": "🚌", "name": b("বাস ও স্থানীয় যান", "Bus and local transport"), "source": "", "text": b("জেলা/জেলা-বাইরের বাসের একটি সার্বজনীন সরকারি timetable নেই। পরিচালকের counter/official channel থেকে timetable, fare ও drop-off নিশ্চিত করুন; শেষ অংশের ফেরার যান আগে ঠিক করুন।", "There is no single official timetable for every interdistrict bus. Confirm schedules, fares and drop-off with the operator's counter or official channel, and arrange return last-mile transport.")},
        {"icon": "✈️", "name": b("বিমান", "Air"), "source": "caab", "text": b("CAAB ও airline-এর সরকারি flight status/fare দেখুন। বিমানবন্দর থেকে প্রত্নস্থলের road transfer আলাদা পরিকল্পনা; কোনো সাইটে সরাসরি বিমান যায় না।", "Check official CAAB and airline flight status and fares. Plan the road transfer from the airport separately; no profiled site is reached directly by air.")},
        {"icon": "⛴️", "name": b("লঞ্চ · নৌকা · জাহাজ", "Launch · boat · ship"), "source": "biwta", "text": b("এই অভ্যন্তরীণ প্রত্নস্থলগুলির নির্দিষ্ট launch route ধরে নেবেন না। যেখানে waterway উপযোগী, BIWTA/BIWTC ও ঘাট কর্তৃপক্ষের schedule, safety notice ও fare দেখুন; নৌকায় অভিজ্ঞ স্থানীয় নির্দেশনা ও life jacket প্রয়োজন।", "Do not assume a direct launch route to these inland sites. Where a waterway is useful, check BIWTA/BIWTC and ghat authority schedules, safety notices and fares; small boats need competent local guidance and life jackets.")}
    ],
    "travel_checklist": [
        b("সরকারি সময়সূচি, বিশেষ ছুটি ও টিকিটমূল্য যাত্রার দিনের আগে আবার দেখুন", "Recheck official hours, special closures and admission the day before departure"),
        b("বাস/ট্রেন/বিমান/নৌপথের ভাড়া ও schedule অনুমোদিত counter বা official channel-এ যাচাই করুন", "Verify fares and schedules through authorised counters or official channels"),
        b("প্রবেশের স্থানাঙ্ক আলাদা করে নিশ্চিত করুন—site coordinate গেট নয়", "Confirm the entrance separately; a site coordinate is not a gate"),
        b("ফেরার যান, মোবাইল নেটওয়ার্ক, পানি, ওষুধ, আবহাওয়া ও accessibility পরিকল্পনা করুন", "Plan return transport, connectivity, water, medication, weather and accessibility"),
        b("খাবার/হোটেলের সাম্প্রতিক অবস্থা, নিরাপত্তা ও দাম নিজে যাচাই করুন; জরুরি সেবা ৯৯৯", "Check current food/lodging conditions, safety and prices yourself; emergency service 999")
    ],
    "updates": [
        {"date": "2026-09-03", "kind": "metadata", "site": "shalban", "source": "mainamati-tickets", "title": b("ময়নামতি টিকিট ও পার্কিং তালিকা হালনাগাদ", "Mainamati admission and parking metadata updated"), "text": b("ময়নামতি জাদুঘর/শালবনের দর্শক শ্রেণিভিত্তিক প্রবেশমূল্য সরকারি পাতা থেকে নথিভুক্ত; অন্য component-এ প্রয়োগ করা হয়নি।", "Official Mainamati Museum/Shalban admission categories were recorded; they were not applied to other components.")},
        {"date": "2026-08-27", "kind": "metadata", "site": "somapura", "source": "doa-hours", "title": b("DoA সাধারণ জাদুঘর/প্রত্নস্থল সময়সূচি হালনাগাদ", "DoA general museum and site schedule updated"), "text": b("সোমপুরের visitor panel-এ তারিখসহ সাধারণ সরকারি সময়সূচি ও বিশেষ নোটিশ যাচাইয়ের নির্দেশ যুক্ত হয়েছে।", "Somapura's visitor panel now cites the dated general schedule and directs readers to special notices.")},
        {"date": "2025-04-22", "kind": "research", "site": "bhasu-vihara", "source": "dharma-mahasthan", "title": b("মহাস্থানগড়ে ২০২২ ও ২০২৫ খননের গবেষক প্রতিবেদন", "Researcher report on Mahasthangarh campaigns in 2022 and 2025"), "text": b("নতুন গবেষণা-কর্মসূচি, সম্ভাব্য প্রাচীন পুকুর এবং মৃৎপাত্র/মুদ্রার বিশ্লেষণ চলমান—চূড়ান্ত সিদ্ধান্ত হিসেবে নয়।", "The report describes new campaigns, a possible ancient pond and ongoing pottery/coin analysis—not final conclusions.")},
        {"date": "2025-09-28", "kind": "news", "site": "somapura", "source": "bss-paharpur", "title": b("পাহাড়পুরের দর্শক-সুবিধা ও ব্যবস্থাপনা নিয়ে সংবাদ", "News on visitor facilities and management at Paharpur"), "text": b("সংবাদটি দর্শক-সুবিধার dated lead হিসেবে রাখা; স্থাপত্য/ইতিহাসের অসঙ্গতিপূর্ণ সংখ্যা UNESCO/Banglapedia দিয়ে cross-check করা।", "The report is retained as a dated visitor-facility lead; inconsistent architectural and historical claims are cross-checked against UNESCO/Banglapedia.")},
        {"date": "2023-05-17", "kind": "heritage", "site": "shalban", "source": "unesco-mainamati", "title": b("লালমাই-ময়নামতির ২১ component tentative nomination", "Lalmai-Mainamati tentative nomination with 21 components"), "text": b("সাতটি selected profile-এর মাপ, কক্ষ, স্থাপত্য ও সংরক্ষণ-বিবরণের প্রধান সাম্প্রতিক উৎস। tentative = World Heritage নয়।", "The principal recent source for dimensions, cells, architecture and conservation in seven selected profiles. Tentative does not mean World Heritage.")},
        {"date": "2023-05-17", "kind": "heritage", "site": "bhasu-vihara", "source": "unesco-mahasthan", "title": b("মহাস্থান–করতোয়া cultural landscape nomination", "Mahasthan–Karatoya cultural landscape nomination"), "text": b("ভাসুকে বিস্তৃত landscape-এর প্রাসঙ্গিক ঐতিহ্য-অংশ হিসেবে পড়ার সরকারি উৎস; পৃথক World Heritage মর্যাদা নয়।", "An official source for reading Bhasu within a wider heritage landscape, not as a separate World Heritage property.")}
    ],
    "archival": [
        {"title": b("কানিংহাম ১৮৮২ · নির্বাচিত পাঁচ scan পাতা", "Cunningham 1882 · five selected scan pages"), "file": "assets/atlas/cunningham-1882-selected-pages.pdf", "source": "cunningham", "category": "public-domain survey excerpt", "text": b("পাহাড়পুর আলোচনার তিন পাতা এবং Plate XXIX (Mahasthan) ও Plate XXXII (Paharpur)। সম্পূর্ণ মূল item-এর লিংকও দেওয়া আছে।", "Three pages of Paharpur discussion plus Plate XXIX (Mahasthan) and Plate XXXII (Paharpur), with a link to the complete source item.")},
        {"title": b("পাহাড়পুর · Plate XXXII", "Paharpur · Plate XXXII"), "file": "assets/atlas/cunningham-paharpur-plate32.jpg", "source": "cunningham", "category": "public-domain survey plate", "text": b("ভাস্কর্য ও carved brick-এর ১৮৮২ survey plate; ঐতিহাসিক নথি, বর্তমান অবস্থার ছবি নয়।", "An 1882 survey plate of sculpture and carved brick; a historical record, not a photograph of current condition.")},
        {"title": b("মহাস্থান · Plate XXIX", "Mahasthan · Plate XXIX"), "file": "assets/atlas/cunningham-mahasthan-plate29.jpg", "source": "cunningham", "category": "public-domain survey map", "text": b("পড়ার সুবিধায় ঘোরানো ও contrast-adjusted; মূল scan-এর তথ্য বদলানোর দাবি নয়।", "Rotated and contrast-adjusted for readability; not presented as an unmodified scan.")},
        {"title": b("দীক্ষিত ১৯৩৮ · Excavations at Paharpur", "Dikshit 1938 · Excavations at Paharpur"), "url": "https://archive.org/details/in.ernet.dli.2015.115760", "source": "dikshit", "category": "external historic report", "text": b("সম্পূর্ণ প্রতিবেদন Internet Archive-এ পড়ার লিংক; স্থানীয় mirror বা blanket public-domain দাবি নয়।", "Read the complete report at Internet Archive; no local mirror or blanket public-domain claim.")}
    ],
    "passport": {
        "storage_note": b("পাসপোর্ট, নাম ও stamp শুধু এই ব্রাউজারে সংরক্ষিত; স্বয়ংক্রিয়ভাবে কোথাও পাঠানো হয় না। Stamp প্রমাণ-প্রশ্নের পুরস্কার—শারীরিক ভ্রমণের প্রমাণ নয়।", "Passport name and stamps are stored only in this browser and are not sent anywhere automatically. Stamps reward evidence questions; they do not prove a physical visit."),
        "levels": [
            {"min": 0, "name": b("নতুন অভিযাত্রী", "New Explorer")},
            {"min": 1, "name": b("তরুণ প্রত্নতাত্ত্বিক", "Young Archaeologist")},
            {"min": 4, "name": b("ঐতিহ্য গবেষক", "Heritage Researcher")},
            {"min": 8, "name": b("ঐতিহ্য সংরক্ষক", "Heritage Conservator")},
            {"min": 12, "name": b("হেরিটেজ মাস্টার", "Heritage Master")}
        ],
        "hunts": [
            {"id": "three-jewels", "name": b("ত্রিরত্নের সূত্র", "Trail of the Three Jewels"), "required": ["kotila-mura", "itakhola-mura", "rupban-mura", "shalban"], "badge": b("ময়নামতি প্রমাণ-পদক", "Mainamati Evidence Badge"), "text": b("স্তূপ, কক্ষ, মুদ্রা ও স্থাপত্যের চার প্রমাণ মিলিয়ে hunt সম্পূর্ণ করুন।", "Complete the hunt with four clues about stupas, cells, coins and architecture.")},
            {"id": "northern-classrooms", "name": b("উত্তরের পাঠশালা", "Northern Classrooms"), "required": ["somapura", "sitakot", "halud-vihara", "bhasu-vihara", "jagaddala"], "badge": b("বরেন্দ্র গবেষণা-পদক", "Varendra Research Badge"), "text": b("নিশ্চিত তথ্য ও tentative identification-এর পার্থক্য খুঁজুন।", "Find the difference between secure evidence and tentative identifications.")},
            {"id": "courtyard-detectives", "name": b("কক্ষ ও আঙিনার গোয়েন্দা", "Courtyard Detectives"), "required": ["somapura", "shalban", "ananda-vihara", "bhoja-vihara"], "badge": b("স্থাপত্য তুলনা-পদক", "Architecture Comparison Badge"), "text": b("১৭৭, ১১৫ ও বদলে যাওয়া central plan তুলনা করুন।", "Compare 177 and 115 cells and changing central plans.")}
        ],
        "children_tools": [
            {"url": "children.html#archaeologist", "name": b("ভার্চুয়াল খনন", "Virtual dig"), "text": b("বিদ্যমান layer-based খনন খেলা; বাস্তব সাইটে খোঁড়ার নির্দেশ নয়।", "Use the existing layer-based dig activity; it is not an instruction to dig at a real site.")},
            {"url": "children.html#paper", "name": b("টাইম-ট্রাভেল স্লাইডার", "Time-travel slider"), "text": b("বিদ্যমান reconstruction comparison দিয়ে ‘প্রমাণ’ ও ‘কাল্পনিক পুনর্গঠন’ আলাদা করুন।", "Use the existing reconstruction comparison to distinguish evidence from imaginative reconstruction.")},
            {"url": "children.html#art", "name": b("রং ও শিল্প", "Colouring and art"), "text": b("বিদ্যমান colouring/craft tools দিয়ে নিজের field notebook সাজান।", "Use the existing colouring and craft tools to make a field notebook.")},
            {"url": "children.html#stories", "name": b("জাতক কমিক ও গল্প", "Jataka comics and stories"), "text": b("বিদ্যমান local comic ও rights-checked listening collection-এ ফিরে যান।", "Return to the existing local comic and rights-checked listening collection.")}
        ]
    },
    "school_kit": {
        "pdf": "assets/atlas/school-field-notebook.pdf",
        "comic_pdf": "assets/atlas/itu-pala-evidence-comic.pdf",
        "title": b("স্কুল ট্রিপ কিট · প্রমাণ খুঁজি, নিদর্শন রক্ষা করি", "School trip kit · Find evidence, protect heritage"),
        "roles": [b("পর্যবেক্ষক", "Observer"), b("মানচিত্র পাঠক", "Map reader"), b("উৎস যাচাইকারী", "Source checker"), b("সময় ও নিরাপত্তা সহায়ক", "Time and safety helper")],
        "rules": [b("খোঁড়া, চড়া, ছোঁয়া বা নিদর্শন তোলা নয়", "No digging, climbing, touching or collecting"), b("ছবিতে ক্ষতি দেখালেও অনুমানকে ঘটনা বলবেন না", "Do not turn a visual impression into a confirmed damage event"), b("Observation, interpretation ও source citation আলাদা লিখুন", "Write observations, interpretations and citations separately"), b("জরুরি ক্ষতি/লুট DoA, স্থানীয় কর্তৃপক্ষ বা ৯৯৯-এ জানান; public portal অফিসিয়াল রিপোর্ট নয়", "Report urgent damage or looting to DoA/local authorities or 999; this public portal is not an official report")]
    }
}
(OUT / "atlas-content.json").write_text(json.dumps(CONTENT, ensure_ascii=False, indent=2) + "\n")
print(f"Wrote {len(S)} Atlas profiles; retained {len(records)} core records and {len(SOURCES)} source records.")
