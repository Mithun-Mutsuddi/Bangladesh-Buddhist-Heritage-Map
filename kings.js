/* রাজাদের প্রোফাইল — data/heritage-kings.json থেকে কার্ড তৈরি।
   kings.html?id=<king-id> → শুধু সেই রাজার পূর্ণ প্রোফাইল
   kings.html?dynasty=<dynasty-id> → সেই রাজবংশের রাজারা */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const notNA = v => Array.isArray(v) && v.length && !/^প্রযোজ্য নয়/.test(String(v[0]));
  let ALL = [], CUR = 'all', Q = '', ROLE = 'all';

  function profileCard(k) {
    const photo = k.photo ? `<div class="king-photo"><img src="${esc(k.photo.image)}" alt="${esc(k.name)}" loading="lazy" referrerpolicy="no-referrer"
        onerror="this.parentElement.innerHTML='<div class=\'fig-missing\'>ছবি লোড হয়নি</div>'">${k.photo.note ? `<span class="photo-note">${esc(k.photo.note)}</span>` : ''}<span class="credit">ছবি: ${esc(k.photo.credit)} · ${esc(k.photo.license)}${k.photo.source ? ` · <a href="${esc(k.photo.source)}" target="_blank" rel="noopener noreferrer">উৎস ↗</a>` : ''}</span></div>` : '';
    const badge = k.roleLabel ? `<span class="role-badge r-${esc(k.role)}" title="${esc(k.roleNote || '')}">${esc(k.roleIcon || '')} ${esc(k.roleLabel)}</span>` : '';
    const isPerson = k.role === 'monk' || k.role === 'lay';
    const seatLabel = k.role === 'zamindar' ? 'কেন্দ্র' : (isPerson ? 'জন্মস্থান' : 'রাজধানী');
    const timeLabel = k.role === 'zamindar' ? 'কাল' : (isPerson ? 'জীবনকাল' : 'রাজত্ব');
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
          ${badge}
          <p class="king-reign">🕰 ${timeLabel}: <b>${esc(k.reign)}</b> · ${seatLabel}: ${esc(k.capital)}</p>
        </div>
        ${photo}
      </header>
      <div class="king-body">
        ${k.summary ? `<p class="king-summary">${esc(k.summary)}</p>` : `<p class="king-summary muted">${esc(k.note || 'এই রাজা সম্পর্কে প্রাথমিক সূত্র কম — শুধু নাম ও রাজত্বকাল নিশ্চিত।')}</p>`}
        ${k.verifyNote ? `<p class="verify-note">${esc(k.verifyNote)}</p>` : ''}
        ${k.roleNote ? `<p class="role-note"><b>ভূমিকা:</b> ${esc(k.roleNote)}</p>` : ''}
        ${k.buddhism ? `<div class="field wide buddha"><h4><span class="ico">☸</span>বৌদ্ধধর্মে অবদান</h4><p>${esc(k.buddhism)}</p></div>` : ''}
        <div class="fields">
          ${list('উল্লেখযোগ্য কাজ', k.works, '🏛')}
          ${list('গ্রন্থ ও রচনা', k.books, '📖')}
          ${notNA(k.inscriptions) ? list('শিলালিপি ও দলিল', k.inscriptions, '📜') : ''}
        </div>
        ${k.coins && !/^প্রযোজ্য নয়/.test(k.coins) ? `<div class="field wide"><h4><span class="ico">🪙</span>মুদ্রা</h4><p>${esc(k.coins)}</p></div>` : ''}
        ${k.legacy ? `<div class="field wide"><h4><span class="ico">✦</span>ঐতিহ্য ও মূল্যায়ন</h4><p>${esc(k.legacy)}</p></div>` : ''}
        ${src}
        ${!full ? '<p class="caution">সংক্ষিপ্ত তথ্য: এই রাজার বিস্তারিত কার্যাবলি নির্ভরযোগ্য সূত্রে পাওয়া যায়নি, তাই অনুমান করে কিছু লেখা হয়নি।</p>' : ''}
        <p class="dyn-top">${k.noHistory ? '' : `<a href="history.html#dyn-${esc(k.dynastyId)}">→ ${esc(k.dynastyName)}-এর পূর্ণ ইতিহাস</a> · `}<a href="#top">↑ উপরে</a></p>
      </div>
    </article>`;
  }

  function miniCard(k) {
    const face = k.photo ? `<span class="king-mini-face"><img src="${esc(k.photo.image)}" alt="${esc(k.name)}" loading="lazy" referrerpolicy="no-referrer"
      onerror="this.parentElement.classList.add('noimg')"></span>` : '<span class="king-mini-face noimg"></span>';
    return `<a class="king-mini" href="kings.html?id=${esc(k.id)}">
      ${face}
      <span class="king-mini-dyn">${esc(k.dynastyName)}</span>
      <strong>${esc(k.name)}</strong>
      <span class="king-mini-reign">${esc(k.reign)}</span>
      ${k.roleLabel ? `<span class="king-mini-role r-${esc(k.role)}">${esc(k.roleIcon || '')} ${esc(k.roleLabel)}</span>` : ''}
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
      if (ROLE !== 'all') list = list.filter(k => k.role === ROLE);
      if (Q) {
        const q = Q.toLowerCase();
        list = list.filter(k => (k.name + ' ' + k.dynastyName + ' ' + (k.epithet || '') + ' ' + (k.roleLabel || '') + ' ' + ((k.books || []).join(' '))).toLowerCase().includes(q));
      }
    }
    if (single) {
      box.className = 'kings-grid single';
      box.innerHTML = list.map(profileCard).join('');
      const tb = document.querySelector('.king-toolbar');
      if (tb) tb.hidden = true;
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
      `মৌর্য থেকে আজ পর্যন্ত ${bn(ALL.length)} জনের আলাদা প্রোফাইল — বৌদ্ধ শাসক, জমিদার ও সমাজ-পৃষ্ঠপোষক, পার্বত্য প্রধান, যাঁরা নিজে বৌদ্ধ নন কিন্তু বিহার-শিক্ষায় পৃষ্ঠপোষকতা করেছেন, প্রখ্যাত বৌদ্ধ পণ্ডিত-লেখক এবং মহাস্থবির-মহাথেররা। কার রাজত্বে কোন বিহার তৈরি হলো, কোন শিলালিপিতে দানের কথা, কোন মুদ্রায় তাঁর নাম — সব সূত্রসহ।`;
    if ($('kingsNote')) $('kingsNote').textContent =
      'প্রত্যেক কার্ডে “ভূমিকা” ব্যাজ দেখে বোঝা যায় তিনি বৌদ্ধ শাসক, পৃষ্ঠপোষক, জমিদার নাকি পার্বত্য প্রধান। যাঁদের বিস্তারিত তথ্য প্রাথমিক সূত্রে (বাংলাপিডিয়া, তাম্রশাসন, প্রত্নতত্ত্ব প্রতিবেদন) পাওয়া গেছে তাঁদের পূর্ণ প্রোফাইল আছে; বাকিদের “সংক্ষিপ্ত তথ্য” — সেখানে অনুমান যোগ করা হয়নি। প্রাচীন রাজাদের প্রতিকৃতি নেই, তাই তাঁদের কার্ডে মুদ্রা/শিলালিপি/বিহারের ছবি দেওয়া হয়েছে এবং ছবির নিচে স্পষ্ট লেখা আছে যে এটি প্রতিকৃতি নয়।';
    if ($('kingsSectionSub')) $('kingsSectionSub').textContent = 'নাম লিখে খুঁজুন, অথবা রাজবংশ বেছে নিন। প্রতিটি কার্ডে সূত্রের লিংক আছে।';

    const dyns = [...new Map(ALL.map(k => [k.dynastyId, k.dynastyName])).entries()];
    const preDyn = new URLSearchParams(location.search).get('dynasty') || 'all';
    if ($('kingFilters')) $('kingFilters').innerHTML =
      `<a href="#" data-dyn="all" class="${preDyn === 'all' ? 'active' : ''}">সব রাজবংশ</a>` +
      dyns.map(([id, name]) => `<a href="#" data-dyn="${esc(id)}" class="${preDyn === id ? 'active' : ''}">${esc(name)}</a>`).join('');
    if ($('kingRoleFilters')) {
      const roles = [['all', 'সব (ভূমিকা-ভেদে)'], ['buddhist', '☸ বৌদ্ধ শাসক'], ['patron', '🤝 পৃষ্ঠপোষক (নিজে বৌদ্ধ নন)'],
                     ['zamindar', '🏛 জমিদার ও সমাজ-পৃষ্ঠপোষক'], ['chief', '⛰ পার্বত্য প্রধান'],
                     ['monk', '🧘 ভিক্ষু / মহাস্থবির'], ['lay', '🕯 পণ্ডিত ও লেখক'], ['none', '○ পৃষ্ঠপোষকতা নেই']];
      $('kingRoleFilters').innerHTML = roles.map(([id, label]) =>
        `<a href="#" data-role="${esc(id)}" class="${id === 'all' ? 'active' : ''}">${esc(label)} (${bn(id === 'all' ? ALL.length : ALL.filter(k => k.role === id).length)})</a>`).join('');
      $('kingRoleFilters').addEventListener('click', e => {
        const a = e.target.closest('a[data-role]');
        if (!a) return;
        e.preventDefault();
        ROLE = a.dataset.role;
        document.querySelectorAll('#kingRoleFilters a').forEach(x => x.classList.toggle('active', x === a));
        render();
      });
    }
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
