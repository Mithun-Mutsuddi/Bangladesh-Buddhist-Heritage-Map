/* রাজাদের প্রোফাইল — data/heritage-kings.json থেকে কার্ড তৈরি।
   kings.html?id=<king-id> → শুধু সেই রাজার পূর্ণ প্রোফাইল
   kings.html?dynasty=<dynasty-id> → সেই রাজবংশের রাজারা */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  let ALL = [], CUR = 'all', Q = '';

  function profileCard(k) {
    const photo = k.photo ? `<div class="king-photo"><img src="${esc(k.photo.image)}" alt="${esc(k.name)}" loading="lazy" referrerpolicy="no-referrer"
        onerror="this.parentElement.innerHTML='<div class=\\'fig-missing\\'>ছবি লোড হয়নি</div>'"><span class="credit">ছবি: ${esc(k.photo.credit)} · ${esc(k.photo.license)}${k.photo.source ? ` · <a href="${esc(k.photo.source)}" target="_blank" rel="noopener noreferrer">উৎস ↗</a>` : ''}</span></div>` : '';
    const list = (title, arr, icon) => (arr && arr.length)
      ? `<div class="field wide"><h4><span class="ico">${icon}</span>${title}</h4><ul class="king-list">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
    const src = (k.sources && k.sources.length)
      ? `<div class="field wide"><h4><span class="ico">📚</span>সূত্র</h4><ul class="king-list">${k.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a></li>`).join('')}</ul></div>` : '';
    const full = k.detailLevel === 'full';
    return `<article class="king-card ${full ? 'full' : 'basic'}" id="${esc(k.id)}">
      <header class="king-head">
        <div class="king-title">
          <span class="king-order">${esc(k.dynastyName)}</span>
          <h3>${esc(k.name)}</h3>
          ${k.epithet ? `<p class="king-epithet">“${esc(k.epithet)}”</p>` : ''}
          <p class="king-reign">🕰 রাজত্ব: <b>${esc(k.reign)}</b> · রাজধানী: ${esc(k.capital)}</p>
        </div>
        ${photo}
      </header>
      <div class="king-body">
        ${k.summary ? `<p class="king-summary">${esc(k.summary)}</p>` : `<p class="king-summary muted">${esc(k.note || 'এই রাজা সম্পর্কে প্রাথমিক সূত্র কম — শুধু নাম ও রাজত্বকাল নিশ্চিত।')}</p>`}
        ${k.buddhism ? `<div class="field wide buddha"><h4><span class="ico">☸</span>বৌদ্ধধর্মে অবদান</h4><p>${esc(k.buddhism)}</p></div>` : ''}
        <div class="fields">
          ${list('উল্লেখযোগ্য কাজ', k.works, '🏛')}
          ${list('শিলালিপি ও দলিল', k.inscriptions, '📜')}
        </div>
        ${k.coins ? `<div class="field wide"><h4><span class="ico">🪙</span>মুদ্রা</h4><p>${esc(k.coins)}</p></div>` : ''}
        ${k.legacy ? `<div class="field wide"><h4><span class="ico">✦</span>ঐতিহ্য ও মূল্যায়ন</h4><p>${esc(k.legacy)}</p></div>` : ''}
        ${src}
        ${!full ? '<p class="caution">সংক্ষিপ্ত তথ্য: এই রাজার বিস্তারিত কার্যাবলি নির্ভরযোগ্য সূত্রে পাওয়া যায়নি, তাই অনুমান করে কিছু লেখা হয়নি।</p>' : ''}
        <p class="dyn-top"><a href="history.html#dyn-${esc(k.dynastyId)}">→ ${esc(k.dynastyName)}-এর পূর্ণ ইতিহাস</a> · <a href="#top">↑ উপরে</a></p>
      </div>
    </article>`;
  }

  function miniCard(k) {
    return `<a class="king-mini" href="kings.html?id=${esc(k.id)}">
      <span class="king-mini-dyn">${esc(k.dynastyName)}</span>
      <strong>${esc(k.name)}</strong>
      <span class="king-mini-reign">${esc(k.reign)}</span>
      <span class="king-mini-more">প্রোফাইল দেখুন →</span></a>`;
  }

  function render() {
    const box = $('kingsList');
    if (!box) return;
    const single = new URLSearchParams(location.search).get('id');
    const dyn = new URLSearchParams(location.search).get('dynasty');
    let list = ALL;
    if (single) list = ALL.filter(k => k.id === single);
    else {
      if (dyn) CUR = dyn;
      if (CUR !== 'all') list = list.filter(k => k.dynastyId === CUR);
      if (Q) {
        const q = Q.toLowerCase();
        list = list.filter(k => (k.name + ' ' + k.dynastyName + ' ' + (k.epithet || '')).toLowerCase().includes(q));
      }
    }
    if (single) {
      box.className = 'kings-grid single';
      box.innerHTML = list.map(profileCard).join('');
      if ($('kingToolbarWrap')) $('kingToolbarWrap').hidden = true;
    } else if ($('viewMode') && $('viewMode').value === 'profiles') {
      box.className = 'kings-grid single';
      box.innerHTML = list.map(profileCard).join('');
    } else {
      box.className = 'kings-grid';
      box.innerHTML = list.map(miniCard).join('');
    }
    if ($('kingsEmpty')) $('kingsEmpty').hidden = list.length > 0;
    if ($('kingsSectionTitle')) $('kingsSectionTitle').textContent =
      single ? (list[0] ? list[0].name : 'প্রোফাইল') : `রাজাদের তালিকা (${bn(list.length)})`;
  }

  async function run() {
    let data;
    try {
      const res = await fetch('data/heritage-kings.json', { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      if ($('kingsList')) $('kingsList').innerHTML = `<p class="caution">রাজাদের তথ্য ফাইল লোড করা যায়নি (${esc(err.message)})।</p>`;
      return;
    }
    ALL = data.kings || [];
    if ($('kingsLead')) $('kingsLead').textContent =
      `মৌর্য থেকে দেব বংশ পর্যন্ত ${bn(ALL.length)} জন রাজা ও রানির আলাদা প্রোফাইল — কার রাজত্বে কোন বিহার তৈরি হলো, কোন শিলালিপিতে দানের কথা লেখা আছে, কোন মুদ্রায় তাঁর নাম, এবং বৌদ্ধধর্মে তাঁর অবদান কী।`;
    if ($('kingsNote')) $('kingsNote').textContent =
      'যেসব রাজার বিস্তারিত তথ্য প্রাথমিক সূত্রে (বাংলাপিডিয়া, তাম্রশাসন, প্রত্নতত্ত্ব প্রতিবেদন) পাওয়া গেছে তাঁদের পূর্ণ প্রোফাইল আছে; বাকিদের “সংক্ষিপ্ত তথ্য” — সেখানে অনুমান যোগ করা হয়নি।';
    if ($('kingsSectionSub')) $('kingsSectionSub').textContent = 'নাম লিখে খুঁজুন, অথবা রাজবংশ বেছে নিন। প্রতিটি কার্ডে সূত্রের লিংক আছে।';

    const dyns = [...new Map(ALL.map(k => [k.dynastyId, k.dynastyName])).entries()];
    const preDyn = new URLSearchParams(location.search).get('dynasty') || 'all';
    if ($('kingFilters')) $('kingFilters').innerHTML =
      `<a href="#" data-dyn="all" class="${preDyn === 'all' ? 'active' : ''}">সব রাজবংশ</a>` +
      dyns.map(([id, name]) => `<a href="#" data-dyn="${esc(id)}" class="${preDyn === id ? 'active' : ''}">${esc(name)}</a>`).join('');
    document.getElementById('kingFilters')?.addEventListener('click', e => {
      const a = e.target.closest('a[data-dyn]');
      if (!a) return;
      e.preventDefault();
      CUR = a.dataset.dyn;
      document.querySelectorAll('#kingFilters a').forEach(x => x.classList.toggle('active', x === a));
      render();
      window.scrollTo({ top: document.getElementById('kingsList').offsetTop - 120, behavior: 'smooth' });
    });
    if ($('kingSearch')) $('kingSearch').addEventListener('input', e => { Q = e.target.value.trim(); render(); });
    render();
    document.documentElement.dataset.kingsReady = '1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
