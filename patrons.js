/* বৌদ্ধ ধর্মের পৃষ্ঠপোষক — এক পাতায় দুই স্তর।
   উপরের অংশ (ব্যক্তি-প্রোফাইল, ১১২ জন) kings.js রেন্ডার করে;
   এই ফাইলটি নিচের অংশ — বিশ্ব বৌদ্ধ রাজবংশ (৩৫) ও শাসক-তালিকা (৩৫) — রেন্ডার করে।
   ডেটা: data/buddha-vamsa/{dynasties,kings,images}.json — একই ডেটা বুদ্ধবংশ পাতাও ব্যবহার করে,
   কিন্তু কনটেন্ট এখন থেকে কেবল এই এক জায়গাতেই দেখানো হয় (দুই বিভাগে ভাগ হয়নি)। */
(() => {
  'use strict';

  const BASE = 'data/buddha-vamsa/';
  const V = '?v=20261030a';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const yearText = (y) => (y < 0 ? `খ্রি.পূ. ${bn(Math.abs(y))}` : `খ্রি. ${bn(y)}`);
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  const certLabel = (c) => ({ historical: 'ঐতিহাসিক', mixed: 'মিশ্র', traditional: 'জাতক-জনশ্রুতি' }[c] || c);

  const REGION_COLORS = {
    'দক্ষিণ এশিয়া': '#8f3d08',
    'দক্ষিণ ও মধ্য এশিয়া': '#b5571f',
    'হিমালয়': '#123f39',
    'হিমালয় ও মধ্য এশিয়া': '#1d5c4f',
    'দক্ষিণ-পূর্ব এশিয়া': '#c98a12',
    'সমুদ্র-দক্ষিণ-পূর্ব এশিয়া': '#a86400',
    'পূর্ব এশিয়া': '#4a5f9e',
    'মধ্য ও পূর্ব এশিয়া': '#6b4e9e',
    'মধ্য এশিয়া': '#7a6a3a',
  };
  const colorFor = (region) => REGION_COLORS[region] || '#7b6a5d';

  const state = { dynasties: [], kings: [], images: {}, dynRegion: 'all', kingCert: 'all' };

  function figure(imgKey, alt) {
    const img = state.images[imgKey];
    if (!img || !img.image) return '';
    return `<figure><img src="${esc(img.image)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer"
      onerror="if(this.parentElement){this.parentElement.innerHTML='<div class=&quot;noimg&quot;>ছবি লোড হয়নি</div>'}">
      <figcaption class="bv-credit">ছবি: ${esc(img.credit)} · ${esc(img.license)}${img.source ? ` · <a href="${esc(img.source)}" target="_blank" rel="noopener noreferrer">উৎস ↗</a>` : ''}</figcaption></figure>`;
  }

  /* ---------------- রাজবংশ ---------------- */
  function renderDynastyFilters() {
    const box = $('bvDynRegions');
    if (!box) return;
    const regions = ['all', ...new Set(state.dynasties.map((d) => d.region))];
    box.innerHTML = regions.map((r) => `<button type="button" class="bv-chip" data-region="${esc(r)}" aria-pressed="${r === state.dynRegion}">${r === 'all' ? 'সব অঞ্চল' : esc(r)}</button>`).join('');
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.dynRegion = b.dataset.region;
      renderDynastyFilters();
      renderDynasties();
    }));
  }

  function renderDynasties() {
    const box = $('bvDynList');
    if (!box) return;
    const q = ($('bvDynSearch') ? $('bvDynSearch').value : '').trim().toLowerCase();
    const list = state.dynasties.filter((d) => {
      const okRegion = state.dynRegion === 'all' || d.region === state.dynRegion;
      const hay = [d.name, d.nameEn, d.country, d.capital, (d.notable || []).join(' '), d.buddhistRole].join(' ').toLowerCase();
      return okRegion && (!q || hay.includes(q));
    });
    if ($('bvDynCount')) $('bvDynCount').textContent = `${bn(list.length)} / ${bn(state.dynasties.length)} রাজবংশ`;
    box.innerHTML = list.map((d) => `<article class="bv-item">
      <div class="badges">
        <span class="bv-badge ${esc(d.certainty)}">${esc(certLabel(d.certainty))}</span>
        <span class="bv-badge">${esc(d.region)}</span>
        <span class="bv-badge flag">${esc(d.country)}</span>
      </div>
      <h3>${esc(d.name)}</h3>
      <span class="meta">${esc(d.timeLabel)} · রাজধানী: ${esc(d.capital)}</span>
      <p>${esc(d.buddhistRole)}</p>
      <p class="meta"><b>উল্লেখযোগ্য:</b> ${esc((d.notable || []).join(' · '))}</p>
      <p class="meta"><b>প্রমাণ:</b> ${esc(d.evidence)}</p>
      <p class="meta"><b>সূত্র:</b> ${(d.sources || []).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join(' · ')}</p>
    </article>`).join('') || '<p class="bv-mini">এই ছাঁকনিতে কিছু পাওয়া যায়নি।</p>';
  }

  function drawGantt() {
    const svg = $('bvGantt');
    if (!svg) return;
    svg.innerHTML = '';
    const rows = state.dynasties.slice().sort((a, b) => a.start - b.start);
    const left = 190, right = 24, top = 34, rowH = 19;
    const width = 1180, height = top + rows.length * rowH + 44;
    const minY = -650, maxY = 2040;
    const x = (year) => left + ((Math.max(minY, Math.min(maxY, year)) - minY) / (maxY - minY)) * (width - left - right);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    for (let y = -500; y <= 2000; y += 250) {
      svg.appendChild(svgEl('line', { x1: x(y), x2: x(y), y1: top - 8, y2: height - 34, stroke: '#e7dfcd', 'stroke-width': 1 }));
      const t = svgEl('text', { x: x(y), y: height - 14, 'text-anchor': 'middle', class: 'bv-axis' });
      t.textContent = y === 0 ? '০' : yearText(y);
      svg.appendChild(t);
    }
    rows.forEach((d, i) => {
      const y = top + i * rowH;
      if (i % 2 === 0) svg.appendChild(svgEl('rect', { x: left, y: y - 1, width: width - left - right, height: rowH, fill: '#faf6ea', opacity: 0.8 }));
      const label = svgEl('text', { x: left - 10, y: y + 12, 'text-anchor': 'end', 'font-size': '11', fill: '#5b4a3f' });
      label.textContent = d.name.length > 26 ? d.name.slice(0, 25) + '…' : d.name;
      svg.appendChild(label);
      const start = x(d.start), end = x(d.end);
      const bar = svgEl('rect', { x: start, y: y + 2, width: Math.max(4, end - start), height: rowH - 7, rx: 4, fill: colorFor(d.region), opacity: 0.88 });
      bar.appendChild(svgEl('title')).textContent = `${d.name} — ${d.timeLabel}`;
      svg.appendChild(bar);
    });
    if (svg.parentElement && !svg.parentElement.querySelector('.bv-legend')) {
      const legend = document.createElement('div');
      legend.className = 'bv-legend';
      legend.innerHTML = Object.entries(REGION_COLORS).slice(0, 9).map(([k, c]) => `<span><i style="background:${c}"></i>${esc(k)}</span>`).join('');
      svg.parentElement.appendChild(legend);
    }
  }

  /* ---------------- শাসক-তালিকা ---------------- */
  function renderKingFilters() {
    const box = $('bvKingCert');
    if (!box) return;
    const opts = [['all', 'সব ধরন'], ['historical', 'ঐতিহাসিক'], ['mixed', 'মিশ্র'], ['traditional', 'জাতক-জনশ্রুতি']];
    box.innerHTML = opts.map(([v, label]) => `<button type="button" class="bv-chip" data-cert="${v}" aria-pressed="${v === state.kingCert}">${esc(label)}</button>`).join('');
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.kingCert = b.dataset.cert;
      renderKingFilters();
      renderKings();
    }));
  }

  function kingFigure(k) {
    const key = k.imgKey || ('king-' + k.id);
    if (!state.images[key]) return '';
    return `<figure>${figure(key, k.name)}</figure>`;
  }

  function renderKings() {
    const box = $('bvKingList');
    if (!box) return;
    const q = ($('bvKingSearch') ? $('bvKingSearch').value : '').trim().toLowerCase();
    const list = state.kings.filter((k) => {
      const okCert = state.kingCert === 'all' || k.certainty === state.kingCert;
      const hay = [k.name, k.nameEn, k.dynasty, k.country, k.role, k.summary, (k.jatakas || []).join(' ')].join(' ').toLowerCase();
      return okCert && (!q || hay.includes(q));
    });
    if ($('bvKingCount')) $('bvKingCount').textContent = `${bn(list.length)} / ${bn(state.kings.length)} জন`;
    box.innerHTML = list.map((k) => `<article class="bv-item">
      ${kingFigure(k)}
      <div class="badges">
        <span class="bv-badge ${esc(k.certainty)}">${esc(certLabel(k.certainty))}</span>
        <span class="bv-badge">${esc(k.country)}</span>
        ${k.category === 'jataka' ? '<span class="bv-badge flag">জাতক-চরিত্র</span>' : ''}
      </div>
      <h3>${esc(k.name)}</h3>
      <span class="role">${esc(k.role)}</span>
      <span class="meta">${esc(k.time)} · ${esc(k.dynasty)}</span>
      <p>${esc(k.summary)}</p>
      <p class="meta"><b>ধর্মীয় ভূমিকা:</b> ${esc(k.dhamma)}</p>
      ${k.evidence ? `<p class="meta"><b>প্রমাণ:</b> ${esc(k.evidence)}</p>` : ''}
      ${k.note ? `<p class="meta"><b>সতর্কতা:</b> ${esc(k.note)}</p>` : ''}
      <p class="meta"><b>সূত্রের ধরন:</b> ${esc((k.sourceTypes || []).join(' · '))}</p>
    </article>`).join('') || '<p class="bv-mini">এই ছাঁকনিতে কিছু পাওয়া যায়নি।</p>';
  }

  function bindSearch(id, fn) {
    const el = $(id);
    if (!el) return;
    let t;
    el.addEventListener('input', () => { clearTimeout(t); t = setTimeout(fn, 140); });
  }

  async function init() {
    if (!$('bvDynList')) return;
    try {
      const [dyn, kings, images] = await Promise.all([
        fetch(BASE + 'dynasties.json' + V).then((r) => r.json()),
        fetch(BASE + 'kings.json' + V).then((r) => r.json()),
        fetch(BASE + 'images.json' + V).then((r) => r.json()).catch(() => ({ images: {} })),
      ]);
      state.dynasties = dyn.dynasties || [];
      state.kings = kings.kings || [];
      state.images = images.images || {};

      if ($('bvDynNote')) {
        $('bvDynNote').innerHTML = `${esc(dyn.note || '')} <a href="buddha-vamsa.html">বুদ্ধের নিজের বংশ, জাতক ও শিলালিপি →</a>`;
      }
      if ($('bvKingsSub')) {
        $('bvKingsSub').textContent = 'জাতক-জনশ্রুতির রাজা ও ঐতিহাসিক শাসক একসঙ্গে, কিন্তু প্রতিটি কার্ডে নির্ভরযোগ্যতার ব্যাজ দেওয়া আছে। বাংলাদেশের জমিদার, পণ্ডিত ও ভিক্ষুদের পূর্ণ প্রোফাইল উপরের অংশে।';
      }
      if ($('bvKingCrosslink')) {
        $('bvKingCrosslink').innerHTML = `বাংলাদেশের রাজা, জমিদার, সার্কেল-প্রধান, পণ্ডিত ও ভিক্ষুদের পূর্ণ প্রোফাইল → <a href="#profiles">ব্যক্তি-প্রোফাইল বিভাগে</a>`;
      }

      renderDynastyFilters(); renderDynasties(); drawGantt();
      renderKingFilters(); renderKings();
      bindSearch('bvDynSearch', renderDynasties);
      bindSearch('bvKingSearch', renderKings);

      if (location.hash && location.hash.length > 1) {
        const target = document.querySelector(location.hash);
        if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      }
    } catch (err) {
      const box = $('bvDynList');
      if (box) box.innerHTML = `<p class="bv-mini">রাজবংশের ডেটা লোড করা যায়নি (${esc(err.message)})। পাতাটি লোকাল ফাইল হিসেবে খুললে <code>fetch</code> কাজ করে না — টার্মিনালে <code>python3 -m http.server</code> চালিয়ে দেখুন।</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
