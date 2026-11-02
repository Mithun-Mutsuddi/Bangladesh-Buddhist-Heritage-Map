# ডেভেলপার সেটআপ — চর্যাভূমি ভ্রমণ কিট

> সর্বশেষ হালনাগাদ: ২০২৬-১১-০২ · কমিট ৬টি · ২৪৯ ফাইল

---

## ১. দ্রুত শুরু (৩০ সেকেন্ড)

```bash
cd charyabhumi-fix-kit
python3 .dev/server.py
```

তারপর ব্রাউজারে খুলুন:

| URL | কী খুলবে |
|---|---|
| `http://localhost:8080/` | ভ্রমণ হাব (`travel.html`) |
| `http://localhost:8080/bd` | বাংলাদেশ ভ্রমণ |
| `http://localhost:8080/intl` | International Travel |

পোর্ট বদলাতে: `PORT=3000 python3 .dev/server.py`

**নির্ভরতা নেই** — শুধু Python 3.৬+। কোনো `npm install`, কোনো CDN, কোনো ইন্টারনেট লাগে না।

---

## ২. ফাইল ছাড়াই দেখা

তিনটি HTML পেজ **সম্পূর্ণ স্বয়ংসম্পূর্ণ** — CSS, JS, ডেটা, বাংলা ফন্ট সব ভেতরে। যেকোনো একটি ফাইলে ডাবল-ক্লিক করলেই চলবে:

```
charyabhumi-fix-kit/international-travel.html
charyabhumi-fix-kit/bangladesh-travel.html
charyabhumi-fix-kit/travel.html
```

লোকাল সার্ভার লাগে না, ইন্টারনেটও লাগে না (রেট ফাইল আপডেট না করলে)।

---

## ৩. গিট ইতিহাস

```
2c25639  chore(dev): লোকাল ডেভ সার্ভার ও গিট কনফিগ
245134d  chore: বাকি কিট — ফন্ট, টুলস, ছবি, EPUB, EN সংস্করণ
f039cbd  feat(travel): তিনটি স্বয়ংসম্পূর্ণ ভ্রমণ পেজ
69d6a74  data(travel): ১৯৭ দেশ, ৪,১৩৫ তীর্থ, ৩৪০ মুদ্রা
01652cb  data: মূল সাইট ডেটাবেস — ৩,২৩১টি বৌদ্ধ স্থান
25091ea  docs: ভ্রমণ মডিউল ডকুমেন্টেশন ও অডিট রিপোর্ট
```

---

## ৪. রিমোটে পুশ করা

```bash
cd /home/user
git remote add origin https://github.com/<ব্যবহারকারী>/<রিপো>.git
git branch -M main
git push -u origin main
```

> ⚠️ **টোকেন কখনো কমিট করবেন না।** `.gitignore`-এ `.env`, `.netrc`, `.git-credentials` বাদ দেওয়া আছে। টোকেন দিলে শুধু `git push` কমান্ডে ব্যবহার করুন, ফাইলে লিখবেন না।

টোকেন ছাড়া, SSH দিয়ে:

```bash
git remote add origin git@github.com:<ব্যবহারকারী>/<রিপো>.git
git push -u origin main
```

---

## ৫. GitHub Pages চালু করা

১. রিপোতে যান → **Settings** → **Pages**
২. *Source*: `Deploy from a branch`
৩. *Branch*: `main` · ফোল্ডার: **`/ (root)`**
৪. Save → ১–২ মিনিট পরে লিংক:

```
https://<ব্যবহারকারী>.github.io/<রিপো>/charyabhumi-fix-kit/travel.html
https://<ব্যবহারকারী>.github.io/<রিপো>/charyabhumi-fix-kit/bangladesh-travel.html
https://<ব্যবহারকারী>.github.io/<রিপো>/charyabhumi-fix-kit/international-travel.html
```

> ফাইল তিনটি ১.৭–১.৯ MB। GitHub Pages-এর সীমা ১ GB/সাইট, ১০০ GB/মাস ব্যান্ডউইথ — সমস্যা নেই।

---

## ৬. ডেটা হালনাগাদ করার ধাপ

```
/data/sites.json         ২,৯১৬,১০১ B → ৩,২৩১ স্থান     ← মূল ডেটাবেস
/data/intl-sites.json    ১,১৩২,৩৬০ B → ৪,১৩৫ তীর্থ      ← আন্তর্জাতিক
/data/travel-data.json     ১৪৯,০১৩ B → ১৯৭ দেশ
/data/travel-meta.json     ১৪৫,২৪০ B → ভিসা/দূতাবাস/মহাদেশ
/data/rates-bdt.json        ১৫,৭২৩ B → ৩৪০ মুদ্রা
```

ডেটা বদলে পেজ নতুন করে বানাতে হবে (ডেটা HTML-এর ভেতরে এমবেড করা):

```bash
python3 ../gen/page2.py     # দুই পেজ
python3 ../gen/hub.py       # হাব
```

> `gen/` ফোল্ডার রিপোতে নেই — কাজের ফাইল `/tmp/gen/`-এ থাকে। রিপোতে শুধু চূড়ান্ত HTML।

---

## ৭. যাচাই

```bash
node /tmp/t/test2.js charyabhumi-fix-kit/international-travel.html
```

প্রত্যাশিত ফল:

```
tabs: 12 | pans: 12
f-cont opts: 7 | f-country opts: 198
c-from opts: 340 | c-table rows: 340
v-country opts: 197
prep items: 12 | booking links: 16 | contact cards: 197
ERRORS: নেই ✓
```

---

## ৮. সহায়ক শর্টকাট

| কাজ | কমান্ড |
|---|---|
| সার্ভার চালু | `python3 .dev/server.py` |
| ভিন্ন পোর্টে | `PORT=3000 python3 .dev/server.py` |
| বড় ফাইলের আকার | `ls -lh *.html data/*.json` |
| কমিট দেখো | `git log --oneline` |
| পরিবর্তন ফেরত | `git checkout -- <ফাইল>` |

---

## ৯. সমস্যা ও সমাধান

| লক্ষণ | কারণ | সমাধান |
|---|---|---|
| পেজ সাদা দেখাচ্ছে | পুরনো ব্রাউজার ক্যাশ | Ctrl+Shift+R |
| বাংলা অক্ষর ভাঙা | ফন্ট লোড হয়নি | ফন্ট HTML-এ এমবেড করা — ব্রাউজার আপডেট করুন |
| মানচিত্র আঁকা হচ্ছে না | Canvas ব্লকড | ব্রাউজার এক্সটেনশন বন্ধ করুন |
| `Address already in use` | ৮০৮০ পোর্ট ব্যস্ত | `PORT=8081 python3 .dev/server.py` |
| রেট পুরনো | `rates-bdt.json` স্থির | নিচের কমান্ড |

```bash
curl -sL "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/bdt.json" -o data/rates-bdt.json
```
