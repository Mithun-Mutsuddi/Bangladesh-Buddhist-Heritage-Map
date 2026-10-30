/* বুদ্ধবংশ ও বিশ্ব বৌদ্ধ রাজবংশ — buddha-vamsa.js
   data/buddha-vamsa/*.json থেকে সব কিছু রেন্ডার করে। কোনো বাইরের লাইব্রেরি নেই। */
(() => {
  'use strict';

  const BASE = 'data/buddha-vamsa/';
  const V = '?v=20261029a';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const yearText = (y) => (y < 0 ? `খ্রি.পূ. ${bn(Math.abs(y))}` : `খ্রি. ${bn(y)}`);
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

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

  const state = {
    meta: null, dynasties: [], kings: [], lineage: null, jatakas: [], quotes: [],
    inscriptions: [], places: [], sculptures: [], culture: null, archives: [], media: [], riddhi: null,
    images: {}, dynRegion: 'all', kingCert: 'all', quoteTheme: 'all', placeCountry: 'all', cultureTab: 'artStyles',
  };

  /* একটি স্ব-নিহিত (standalone) প্রিভিউ ফাইলে ডেটা window.__BV_DATA__-এ বসানো থাকে;
     সেক্ষেত্রে fetch লাগে না — নেটওয়ার্কবিহীন পরিবেশেও পাতা চলে। */
  const INLINE = typeof window !== 'undefined' ? window.__BV_DATA__ : null;
  const load = (file) => {
    const key = file.replace(/\.json$/, '');
    if (INLINE && INLINE[key]) return Promise.resolve(INLINE[key]);
    return fetch(BASE + file + V).then((r) => { if (!r.ok) throw new Error(file + ' ' + r.status); return r.json(); });
  };

  /* ---------------- image helpers ---------------- */
  function figure(imgKey, alt) {
    const img = state.images[imgKey];
    if (!img || !img.image) {
      return `<figure><div class="noimg">ছবি পাওয়া যায়নি<br><span class="bv-credit">কমন্সে উপযুক্ত ছবি মেলেনি — ভুয়া ছবি বসানো হয়নি</span></div></figure>`;
    }
    // ছবি একবার ব্যর্থ হলে সাথে সাথে ‘লোড হয়নি’ বসিয়ে দিলে দুর্বল নেটওয়ার্কে
    // ছবিটা চিরতরে হারিয়ে যেত। তাই একবার রিট্রাই (ক্যাশ-বাস্টিং কোয়েরি সহ),
    // তারপরও না এলে তবেই প্লেসহোল্ডার।
    return `<figure><img src="${esc(img.image)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer"
      data-src="${esc(img.image)}"
      onerror="if(!this.dataset.retry){this.dataset.retry='1';setTimeout(()=>{this.src=this.dataset.src+(this.dataset.src.includes('?')?'&':'?')+'retry='+Date.now();},900);}else{this.replaceWith(Object.assign(document.createElement('div'),{className:'noimg',textContent:'ছবি লোড হয়নি'}))}">
      <figcaption class="bv-credit">ছবি: ${esc(img.credit)} · ${esc(img.license)}${img.source ? ` · <a href="${esc(img.source)}" target="_blank" rel="noopener noreferrer">উৎস ↗</a>` : ''}</figcaption></figure>`;
  }

  /* ---------------- intro / stats ---------------- */
  function renderIntro() {
    const m = state.meta;
    $('bvLead').innerHTML = m.intro[0];
    const culture = state.culture || {};
    const cultureCount = ['artStyles', 'music', 'dance', 'dress', 'poetry', 'stories', 'myths', 'creatures', 'festivals']
      .reduce((sum, k) => sum + ((culture[k] || []).length), 0);
    const stats = [
      [state.dynasties.length, 'রাজবংশ'],
      [state.kings.length, 'রাজা ও শাসক'],
      [state.jatakas.length, 'জাতক-কাহিনি'],
      [state.quotes.length, 'ধম্মপদ ও উক্তি'],
      [state.inscriptions.length, 'শিলালিপি ও দলিল'],
      [state.sculptures.length, 'প্রতিমা ও ভাস্কর্য'],
      [state.places.length, 'তীর্থ ও ঐতিহ্যস্থল'],
      [cultureCount, 'সাংস্কৃতিক এন্ট্রি'],
      [state.archives.length + state.media.length, 'আর্কাইভ ও চলচ্চিত্র'],
      [(state.riddhi ? state.riddhi.events.length : 0), 'ঋদ্ধি-কাহিনি'],
      [(state.riddhi ? state.riddhi.powers.length : 0), 'অভিজ্ঞা-ক্ষমতা'],
    ];
    $('bvStats').innerHTML = stats.map(([n, label]) => `<div class="bv-stat"><b>${bn(n)}</b><span>${esc(label)}</span></div>`).join('');
    $('bvHeroNote').textContent = 'সব সংখ্যা নিচের ডেটাসেট থেকে স্বয়ংক্রিয়ভাবে গোনা হয়েছে — বেশি দেখানোর জন্য কোনো সংখ্যা ফোলানো হয়নি।';
    $('bvIntro').innerHTML = m.intro.slice(1).map((p) => `<p>${p}</p>`).join('');
    $('bvMethod').innerHTML = m.method.map((x) => `<li>${x}</li>`).join('');
    $('bvGaps').innerHTML = m.gap_register.map((g) => `<div class="bv-gap"><b>${esc(g.topic)}</b><span class="st">অবস্থা: ${esc(g.status)}</span><p>${esc(g.note)}</p></div>`).join('');
    $('bvCredits').innerHTML = m.credits.map((c) => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.label)} ↗</a></li>`).join('');
  }

  /* ---------------- lineage ---------------- */
  function renderLineage() {
    const L = state.lineage;
    if (!L) return;
    $('bvLineageCaveat').textContent = L.caveat;
    $('bvFatherTitle').textContent = L.fatherSide.title;
    $('bvFatherClan').textContent = L.fatherSide.clan;
    $('bvMotherTitle').textContent = L.motherSide.title;
    $('bvMotherClan').textContent = L.motherSide.clan;

    const chain = (rows) => rows.map((r) => `<li class="${r.gap ? 'gap' : ''}" data-gen="${esc(r.gen)}">
        <b>${esc(r.name)}</b>
        <p>${esc(r.note)}</p>
        <span class="src">সূত্র: ${esc(r.source)} · <span class="bv-tag ${esc(r.certainty)}">${esc(certLabel(r.certainty))}</span></span>
      </li>`).join('');
    $('bvFatherChain').innerHTML = chain(L.fatherSide.chain);
    $('bvMotherChain').innerHTML = chain(L.motherSide.chain);

    const people = (rows) => `<div class="bv-kv">${rows.map((p) => `<span title="${esc(p.note)}"><b>${esc(p.name)}</b> — ${esc(p.note)}</span>`).join('')}</div>`;
    $('bvSiblings').innerHTML = people(L.fatherSide.siblings) + `<h4>ভ্রাতৃস্পুত্র ও সমগোত্রীয়</h4>` + people(L.fatherSide.paternalCousins);
    $('bvMotherKin').innerHTML = people(L.motherSide.motherSideKin);

    const P = L.present;
    $('bvPresentTitle').textContent = P.title;
    $('bvVerdict').textContent = P.verdict;
    $('bvStreams').innerHTML = P.streams.map((s) => `<div class="bv-stream"><b>${esc(s.label)}</b><span class="st">${esc(s.status)}</span><p>${esc(s.detail)}</p><p class="bv-mini">${esc(s.note)}</p></div>`).join('');
    $('bvClaimants').innerHTML = `<thead><tr><th>গোষ্ঠী</th><th>দাবি</th><th>অবস্থা</th><th>মন্তব্য</th></tr></thead><tbody>${
      P.claimants.map((c) => `<tr><td>${esc(c.group)}</td><td>${esc(c.claim)}</td><td>${esc(c.status)}</td><td>${esc(c.note)}</td></tr>`).join('')}</tbody>`;
    $('bvPresentSources').innerHTML = 'সূত্র: ' + P.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join(' · ');
    drawTree(L.tree.nodes);
  }

  function certLabel(c) {
    return { historical: 'ঐতিহাসিক', mixed: 'মিশ্র', traditional: 'জাতক-জনশ্রুতি' }[c] || c;
  }

  function drawTree(nodes) {
    const svg = $('bvTree');
    if (!svg) return;
    svg.innerHTML = '';
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const sideX = { father: 40, mother: 400 };
    const genGap = 132;
    const rowGap = 62;
    const rows = {};
    nodes.forEach((n) => { rows[n.side] = rows[n.side] || {}; (rows[n.side][n.gen] = rows[n.side][n.gen] || []).push(n); });
    const pos = {};
    Object.entries(rows).forEach(([side, gens]) => {
      Object.entries(gens).forEach(([gen, list]) => {
        list.forEach((n, i) => {
          pos[n.id] = { x: sideX[side] + Number(gen) * genGap, y: 60 + i * rowGap + (side === 'mother' ? 40 : 0) };
        });
      });
    });
    const width = 40 + 8 * genGap + 150;
    const height = Math.max(...Object.values(pos).map((p) => p.y)) + 70;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    // links
    nodes.forEach((n) => {
      if (!n.parent || !pos[n.parent] || !pos[n.id]) return;
      const a = pos[n.parent], b = pos[n.id];
      const path = svgEl('path', {
        d: `M${a.x + 56},${a.y + 16} C${a.x + 90},${a.y + 16} ${b.x - 34},${b.y + 16} ${b.x},${b.y + 16}`,
        fill: 'none', stroke: '#c9bda3', 'stroke-width': n.gap ? 1.4 : 1.8, 'stroke-dasharray': n.gap ? '5 4' : '',
      });
      svg.appendChild(path);
    });
    nodes.forEach((n) => {
      const p = pos[n.id];
      if (!p) return;
      const g = svgEl('g');
      g.appendChild(svgEl('rect', {
        x: p.x, y: p.y, rx: 8, ry: 8, width: 118, height: 32,
        fill: n.gap ? '#f3ecd9' : (n.side === 'mother' ? '#eef4ee' : '#fdf4e2'),
        stroke: n.gap ? '#c9bda3' : (n.side === 'mother' ? '#8aa79a' : '#d8b26a'),
        'stroke-width': 1.2, 'stroke-dasharray': n.gap ? '4 3' : '',
      }));
      const t = svgEl('text', { x: p.x + 8, y: p.y + 21, 'font-size': '11.5', fill: '#2a1f19' });
      const label = n.label.length > 17 ? n.label.slice(0, 16) + '…' : n.label;
      t.textContent = label;
      g.appendChild(t);
      g.appendChild(svgEl('title')).textContent = n.label;
      svg.appendChild(g);
    });
    const legend = document.createElement('div');
    legend.className = 'bv-legend';
    legend.innerHTML = '<span><i style="background:#fdf4e2;border:1px solid #d8b26a"></i>পিতা-পক্ষ</span><span><i style="background:#eef4ee;border:1px solid #8aa79a"></i>মাতা-পক্ষ</span><span><i style="background:#f3ecd9;border:1px dashed #c9bda3"></i>নাম-অজানা ধারা</span>';
    svg.parentElement.appendChild(legend);
  }

  /* ---------------- dynasties ---------------- */
  function renderDynastyFilters() {
    const regions = ['all', ...new Set(state.dynasties.map((d) => d.region))];
    $('bvDynRegions').innerHTML = regions.map((r) => `<button type="button" class="bv-chip" data-region="${esc(r)}" aria-pressed="${r === state.dynRegion}">${r === 'all' ? 'সব অঞ্চল' : esc(r)}</button>`).join('');
    $('bvDynRegions').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.dynRegion = b.dataset.region;
      renderDynastyFilters();
      renderDynasties();
    }));
  }

  function renderDynasties() {
    const q = ($('bvDynSearch').value || '').trim().toLowerCase();
    const list = state.dynasties.filter((d) => {
      const okRegion = state.dynRegion === 'all' || d.region === state.dynRegion;
      const hay = [d.name, d.nameEn, d.country, d.capital, d.notable.join(' '), d.buddhistRole].join(' ').toLowerCase();
      return okRegion && (!q || hay.includes(q));
    });
    $('bvDynCount').textContent = `${bn(list.length)} / ${bn(state.dynasties.length)} রাজবংশ`;
    $('bvDynList').innerHTML = list.map((d) => `<article class="bv-item">
      <div class="badges">
        <span class="bv-badge ${esc(d.certainty)}">${esc(certLabel(d.certainty))}</span>
        <span class="bv-badge">${esc(d.region)}</span>
        <span class="bv-badge flag">${esc(d.country)}</span>
      </div>
      <h3>${esc(d.name)}</h3>
      <span class="meta">${esc(d.timeLabel)} · রাজধানী: ${esc(d.capital)}</span>
      <p>${esc(d.buddhistRole)}</p>
      <p class="meta"><b>উল্লেখযোগ্য:</b> ${esc(d.notable.join(' · '))}</p>
      <p class="meta"><b>প্রমাণ:</b> ${esc(d.evidence)}</p>
      <p class="meta"><b>সূত্র:</b> ${d.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join(' · ')}</p>
    </article>`).join('') || `<p class="bv-mini">এই ছাঁকনিতে কিছু পাওয়া যায়নি।</p>`;
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
    // year grid
    for (let y = -500; y <= 2000; y += 250) {
      svg.appendChild(svgEl('line', { x1: x(y), x2: x(y), y1: top - 8, y2: height - 34, stroke: '#e7dfcd', 'stroke-width': 1 }));
      const t = svgEl('text', { x: x(y), y: height - 14, 'text-anchor': 'middle', class: 'bv-axis' });
      t.textContent = y === 0 ? '০' : yearText(y);
      svg.appendChild(t);
    }
    rows.forEach((d, i) => {
      const y = top + i * rowH;
      if (i % 2 === 0) {
        svg.appendChild(svgEl('rect', { x: left, y: y - 1, width: width - left - right, height: rowH, fill: '#faf6ea', opacity: 0.8 }));
      }
    });
    rows.forEach((d, i) => {
      const y = top + i * rowH;
      const label = svgEl('text', { x: left - 10, y: y + 12, 'text-anchor': 'end', 'font-size': '11', fill: '#5b4a3f' });
      label.textContent = d.name.length > 26 ? d.name.slice(0, 25) + '…' : d.name;
      svg.appendChild(label);
      const start = x(d.start), end = x(d.end);
      const bar = svgEl('rect', {
        x: start, y: y + 2, width: Math.max(4, end - start), height: rowH - 7, rx: 4,
        fill: colorFor(d.region), opacity: 0.88,
      });
      bar.appendChild(svgEl('title')).textContent = `${d.name} — ${d.timeLabel}`;
      svg.appendChild(bar);
    });
    const legend = document.createElement('div');
    legend.className = 'bv-legend';
    legend.innerHTML = Object.entries(REGION_COLORS).slice(0, 9)
      .map(([k, c]) => `<span><i style="background:${c}"></i>${esc(k)}</span>`).join('');
    svg.parentElement.appendChild(legend);
  }

  function drawGeo() {
    const svg = $('bvGeoSvg');
    if (!svg) return;
    svg.innerHTML = '';
    const W = 680, H = 330, pad = 34;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.appendChild(svgEl('rect', { x: pad, y: 14, width: W - pad * 2, height: H - pad - 14, fill: '#f7f2e4', stroke: '#e2d8c3' }));
    const px = (lon) => pad + ((lon + 180) / 360) * (W - pad * 2);
    const py = (lat) => 14 + ((90 - lat) / 180) * (H - pad - 14);
    for (let lon = -180; lon <= 180; lon += 30) {
      svg.appendChild(svgEl('line', { x1: px(lon), x2: px(lon), y1: 14, y2: H - pad, stroke: '#e7dfcd' }));
      const t = svgEl('text', { x: px(lon), y: H - 16, 'text-anchor': 'middle', class: 'bv-axis' });
      t.textContent = `${lon}°`;
      svg.appendChild(t);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      svg.appendChild(svgEl('line', { x1: pad, x2: W - pad, y1: py(lat), y2: py(lat), stroke: '#e7dfcd' }));
      const t = svgEl('text', { x: 6, y: py(lat) + 4, class: 'bv-axis' });
      t.textContent = `${lat}°`;
      svg.appendChild(t);
    }
    state.dynasties.forEach((d) => {
      const g = svgEl('circle', {
        cx: px(d.geo.lon), cy: py(d.geo.lat), r: 6.4,
        fill: colorFor(d.region), 'fill-opacity': 0.82, stroke: '#fffdf7', 'stroke-width': 1.4,
      });
      g.appendChild(svgEl('title')).textContent = `${d.name} — ${d.capital} (${d.geo.lat.toFixed(2)}, ${d.geo.lon.toFixed(2)})`;
      svg.appendChild(g);
    });
    const note = svgEl('text', { x: pad + 6, y: 30, 'font-size': '11', fill: '#7b6a5d' });
    note.textContent = 'প্রতিটি বিন্দু = একটি রাজবংশের রাজধানী (দ্রাঘিমা-অক্ষাংশ)';
    svg.appendChild(note);
  }

  /* ---------------- kings ---------------- */
  function renderKingFilters() {
    const opts = [['all', 'সব ধরন'], ['historical', 'ঐতিহাসিক'], ['mixed', 'মিশ্র'], ['traditional', 'জাতক-জনশ্রুতি']];
    $('bvKingCert').innerHTML = opts.map(([v, label]) => `<button type="button" class="bv-chip" data-cert="${v}" aria-pressed="${v === state.kingCert}">${esc(label)}</button>`).join('');
    $('bvKingCert').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.kingCert = b.dataset.cert;
      renderKingFilters();
      renderKings();
    }));
  }

  function renderKings() {
    const q = ($('bvKingSearch').value || '').trim().toLowerCase();
    const list = state.kings.filter((k) => {
      const okCert = state.kingCert === 'all' || k.certainty === state.kingCert;
      const hay = [k.name, k.nameEn, k.dynasty, k.country, k.role, k.summary, (k.jatakas || []).join(' ')].join(' ').toLowerCase();
      return okCert && (!q || hay.includes(q));
    });
    $('bvKingCount').textContent = `${bn(list.length)} / ${bn(state.kings.length)} জন`;
    $('bvKingList').innerHTML = list.map((k) => `<article class="bv-item">
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
      <p class="meta"><b>পিতা:</b> ${esc(k.father)} · <b>মাতা:</b> ${esc(k.mother)}</p>
      <p class="meta"><b>প্রমাণ:</b> ${esc(k.evidence)}</p>
      ${k.note ? `<p class="meta"><b>সতর্কতা:</b> ${esc(k.note)}</p>` : ''}
      ${(k.jatakas || []).length ? `<p class="meta"><b>জাতক:</b> ${esc(k.jatakas.join(' · '))}</p>` : ''}
      <p class="meta"><b>সূত্রের ধরন:</b> ${esc(k.sourceTypes.join(' · '))}</p>
    </article>`).join('') || `<p class="bv-mini">এই ছাঁকনিতে কিছু পাওয়া যায়নি।</p>`;
  }

  /* ---------------- jatakas ---------------- */
  function renderJatakas() {
    const J = { jatakas: state.jatakas };
    $('bvArchetypes').innerHTML = (state.jatakaArchetypes || []).map((a) => `<div class="item"><b>${esc(a.name)}</b><span>${esc(a.role)} — ${esc(a.note)}</span></div>`).join('');
    $('bvJatakaList').innerHTML = J.jatakas.map((j) => `<article class="bv-item">
      <div class="badges"><span class="bv-badge flag">জাতক ${bn(j.no)}</span><span class="bv-badge">${esc(j.place)}</span></div>
      <h3>${esc(j.title)}</h3>
      <span class="role">${esc(j.role)}</span>
      <p>${esc(j.summary)}</p>
      <p class="meta"><b>নৈতিক শিক্ষা:</b> ${esc(j.moral)}</p>
      ${j.versePali ? `<p class="meta"><b>পালি:</b> <i>${esc(j.versePali)}</i></p>` : ''}
      ${j.verseBn ? `<p class="meta"><b>অর্থ:</b> ${esc(j.verseBn)}</p>` : ''}
      <p class="meta"><b>শিল্পে:</b> ${esc(j.artSites.join(' · '))}</p>
      <p class="meta">${j.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</p>
    </article>`).join('');
  }

  /* ---------------- quotes ---------------- */
  function renderQuoteFilters() {
    const labels = state.quotesThemeLabels || {};
    const themes = [['all', 'সব বিষয়'], ...Object.entries(labels)];
    $('bvQuoteThemes').innerHTML = themes.map(([v, l]) => `<button type="button" class="bv-chip" data-theme="${v}" aria-pressed="${v === state.quoteTheme}">${esc(l)}</button>`).join('');
    $('bvQuoteThemes').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.quoteTheme = b.dataset.theme;
      renderQuoteFilters();
      renderQuotes();
    }));
  }

  function renderQuotes() {
    const list = state.quotesData.filter((q) => state.quoteTheme === 'all' || q.theme === state.quoteTheme);
    $('bvQuoteList').innerHTML = list.map((q) => `<article class="bv-quote">
      <span class="ref">${esc(q.ref)}</span>
      <div class="pali">${esc(q.pali)}</div>
      <p class="bn">${esc(q.bn)}</p>
      <p class="where"><b>কোথায় পাওয়া গেছে:</b> ${esc(q.whereFound.join(' · '))}</p>
      <p class="where">সূত্র: ${esc(q.source)}</p>
    </article>`).join('');
  }

  /* ---------------- inscriptions ---------------- */
  function renderInscriptions() {
    $('bvInscriptionList').innerHTML = state.inscriptions.map((i) => `<article class="bv-item">
      <div class="badges"><span class="bv-badge flag">${esc(i.kind)}</span><span class="bv-badge">${esc(i.country)}</span></div>
      <h3>${esc(i.name)}</h3>
      <span class="meta">${esc(i.date)} · ${esc(i.place)} · লিপি: ${esc(i.script)} · ভাষা: ${esc(i.language)}</span>
      <p><b>লেখা:</b> ${esc(i.text)}</p>
      <p class="meta"><b>গুরুত্ব:</b> ${esc(i.significance)}</p>
      <p class="meta"><b>কোথায় রাখা:</b> ${esc(i.kept)}</p>
      <p class="meta"><a href="${esc(i.srcUrl)}" target="_blank" rel="noopener noreferrer">${esc(i.srcLabel)} ↗</a></p>
    </article>`).join('');
  }

  /* ---------------- sculptures ---------------- */
  function renderSculptures() {
    const q = ($('bvSculptSearch').value || '').trim().toLowerCase();
    const list = state.sculptures.filter((s) => {
      const hay = [s.name, s.place, s.country, s.museum, s.note, s.material].join(' ').toLowerCase();
      return !q || hay.includes(q);
    });
    $('bvSculptCount').textContent = `${bn(list.length)} / ${bn(state.sculptures.length)} প্রতিমা`;
    $('bvSculptList').innerHTML = list.map((s) => `<article class="bv-tile">
      ${figure('sculpt-' + s.id, s.name)}
      <div class="body">
        <div class="badges"><span class="bv-badge ${/ধ্বংস|ক্ষত/.test(s.status) ? 'damaged' : ''}">${esc(s.status)}</span><span class="bv-badge">${esc(s.country)}</span></div>
        <h3>${esc(s.name)}</h3>
        <p class="meta">${esc(s.date)} · ${esc(s.material)}</p>
        <p>${esc(s.note)}</p>
        <p class="meta"><b>স্থান:</b> ${esc(s.place)} · <b>সংগ্রহ:</b> ${esc(s.museum)}</p>
      </div>
    </article>`).join('') || `<p class="bv-mini">কিছু পাওয়া যায়নি।</p>`;
  }

  /* ---------------- places ---------------- */
  function renderPlaceFilters() {
    const countries = ['all', ...new Set(state.places.map((p) => p.country))];
    $('bvPlaceCountries').innerHTML = countries.slice(0, 14).map((c) => `<button type="button" class="bv-chip" data-country="${esc(c)}" aria-pressed="${c === state.placeCountry}">${c === 'all' ? 'সব দেশ' : esc(c)}</button>`).join('');
    $('bvPlaceCountries').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.placeCountry = b.dataset.country;
      renderPlaceFilters();
      renderPlaces();
    }));
  }

  function renderPlaces() {
    const q = ($('bvPlaceSearch').value || '').trim().toLowerCase();
    const list = state.places.filter((p) => {
      const okCountry = state.placeCountry === 'all' || p.country === state.placeCountry;
      const hay = [p.name, p.country, p.region, p.type, p.note].join(' ').toLowerCase();
      return okCountry && (!q || hay.includes(q));
    });
    $('bvPlaceCount').textContent = `${bn(list.length)} / ${bn(state.places.length)} স্থান`;
    $('bvPlaceList').innerHTML = list.map((p) => `<article class="bv-tile">
      ${figure('place-' + p.id, p.name)}
      <div class="body">
        <div class="badges">
          <span class="bv-badge">${esc(p.type)}</span>
          ${p.unesco ? '<span class="bv-badge unesco">ইউনেস্কো</span>' : ''}
        </div>
        <h3>${esc(p.name)}</h3>
        <p class="meta">${esc(p.country)} · ${esc(p.region)} · ${esc(p.date)}</p>
        <p>${esc(p.note)}</p>
        <p class="meta"><a href="${esc(p.srcUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.srcLabel)} ↗</a></p>
      </div>
    </article>`).join('') || `<p class="bv-mini">কিছু পাওয়া যায়নি।</p>`;
  }

  /* ---------------- culture ---------------- */
  const CULTURE_TABS = [
    ['artStyles', 'শিল্পরীতি'], ['music', 'সঙ্গীত'], ['dance', 'নৃত্য'], ['dress', 'পোশাক'],
    ['poetry', 'কবিতা ও সাহিত্য'], ['stories', 'কাহিনি-গ্রন্থ'], ['myths', 'পুরাণ ও স্বর্গ-নরক'],
    ['creatures', 'পৌরাণিক প্রাণী'], ['festivals', 'উৎসব'],
  ];
  function renderCultureTabs() {
    $('bvCultureTabs').innerHTML = CULTURE_TABS.map(([id, label]) =>
      `<button type="button" class="bv-chip" role="tab" data-tab="${id}" aria-selected="${id === state.cultureTab}">${esc(label)}</button>`).join('');
    $('bvCultureTabs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      state.cultureTab = b.dataset.tab;
      renderCultureTabs();
      renderCulture();
    }));
  }
  function renderCulture() {
    const rows = (state.culture && state.culture[state.cultureTab]) || [];
    const isFestival = state.cultureTab === 'festivals';
    $('bvCultureNote').textContent = isFestival
      ? 'উৎসবের তারিখ চান্দ্র-পঞ্জিকা অনুসারে বছরভেদে বদলায় — তাই মাস লেখা হয়েছে, নির্দিষ্ট দিন নয়।'
      : 'প্রতিটি এন্ট্রিতে দেশ/অঞ্চল ও সংক্ষিপ্ত বিবরণ আছে; ছবি থাকলে তার লেখক ও লাইসেন্স নিচে দেওয়া।';
    $('bvCultureList').innerHTML = rows.map((r) => `<article class="bv-tile">
      ${isFestival ? '' : figure(state.cultureTab + '-' + r.id, r.name)}
      <div class="body">
        <h3>${esc(r.name)}</h3>
        <p class="meta">${esc(r.country || r.region || '')}${r.era ? ' · ' + esc(r.era) : ''}</p>
        <p>${esc(r.desc)}</p>
      </div>
    </article>`).join('') || `<p class="bv-mini">এই বিভাগে এখনো কোনো এন্ট্রি নেই।</p>`;
  }

  /* ---------------- archives + media ---------------- */
  function renderArchives() {
    const img = (a) => (a.imgKey ? `<div class="bv-arch-img">${figure(a.imgKey, a.title)}</div>` : '');
    $('bvArchiveList').innerHTML = state.archives.map((a) => `<article class="bv-item">
      ${img(a)}
      <div class="badges"><span class="bv-badge flag">${esc(a.kind)}</span>${a.country ? `<span class="bv-badge">${esc(a.country)}</span>` : ''}</div>
      <h3>${esc(a.title)}</h3>
      <span class="meta">${esc(a.date)}</span>
      <p>${esc(a.desc)}</p>
      <p class="meta"><b>কোথায়:</b> ${esc(a.where)}</p>
      <p class="meta"><b>অবস্থা:</b> ${esc(a.status)}</p>
      ${a.note ? `<p class="meta"><b>সতর্কতা:</b> ${esc(a.note)}</p>` : ''}
      ${a.sourceUrl ? `<p class="meta"><a href="${esc(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(a.sourceLabel || 'সংগ্রহ দেখুন')} ↗</a></p>` : ''}
    </article>`).join('');
  }

  /* ---------------- ঋদ্ধি ও শিষ্য ---------------- */
  function renderRiddhi() {
    const R = state.riddhi;
    if (!R) return;
    if ($('bvRiddhiTitle')) $('bvRiddhiTitle').textContent = R.title;
    $('bvRiddhiIntro').textContent = R.intro;
    $('bvRiddhiFraming').innerHTML = R.framing.map((f) => `<p>${esc(f)}</p>`).join('');
    $('bvRiddhiPlaceLabel').textContent = R.placesLabel || '';
    $('bvRiddhiLegacy').textContent = R.legacy || '';

    $('bvRiddhiPowers').innerHTML = `<thead><tr><th>ক্ষমতা</th><th>কী</th><th>কে</th><th>কোথায়</th><th>কখন</th><th>সূত্র</th></tr></thead><tbody>${
      R.powers.map((p) => `<tr>
        <td data-label="ক্ষমতা"><b>${esc(p.name)}</b><br><span class="bv-mini">${esc(p.pali)}</span></td>
        <td data-label="কী">${esc(p.desc)}</td>
        <td data-label="কে">${esc(p.who)}</td>
        <td data-label="কোথায়">${esc(p.where)}</td>
        <td data-label="কখন">${esc(p.when)}</td>
        <td data-label="সূত্র" class="bv-mini">${esc(p.src)}</td>
      </tr>`).join('')}</tbody>`;

    $('bvRiddhiEvents').innerHTML = R.events.map((e) => `<article class="bv-item">
      ${state.images['riddhi-' + e.id] ? figure('riddhi-' + e.id, e.name) : ''}
      <h3>${esc(e.name)}</h3>
      <p class="meta"><b>স্থান:</b> ${esc(e.place)}</p>
      <p class="meta"><b>সময়:</b> ${esc(e.when)}</p>
      <p class="meta"><b>কে:</b> ${esc(e.who)}</p>
      <p>${esc(e.desc)}</p>
      ${e.note ? `<p class="meta"><b>সতর্কতা:</b> ${esc(e.note)}</p>` : ''}
    </article>`).join('');
  }

  function renderMedia() {
    $('bvMediaList').innerHTML = state.media.map((m) => `<article class="bv-item">
      ${m.imgKey && state.images[m.imgKey] ? `<div class="bv-arch-img">${figure(m.imgKey, m.title)}</div>` : ''}
      <div class="badges"><span class="bv-badge flag">${esc(m.kind)}</span><span class="bv-badge">${esc(m.country)}</span><span class="bv-badge">${esc(m.year)}</span></div>
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.desc)}</p>
      <p class="meta"><b>সতর্কতা:</b> ${esc(m.note)}</p>
      ${m.sourceUrl ? `<p class="meta"><a href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.sourceLabel || 'সূত্র')} ↗</a></p>` : ''}
    </article>`).join('');
  }

  /* ---------------- charts ---------------- */
  function barChart(svgId, entries, opts = {}) {
    const svg = $(svgId);
    if (!svg) return;
    svg.innerHTML = '';
    const rows = entries.filter((e) => e[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, opts.limit || 10);
    const max = Math.max(1, ...rows.map((r) => r[1]));
    const W = 460, rowH = 30, top = 12, labelW = opts.labelW || 150;
    const H = top + rows.length * rowH + 16;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const w = ((W - labelW - 46) * r[1]) / max;
      const label = svgEl('text', { x: labelW - 8, y: y + 15, 'text-anchor': 'end', 'font-size': '11.5', fill: '#5b4a3f' });
      label.textContent = r[0].length > 22 ? r[0].slice(0, 21) + '…' : r[0];
      svg.appendChild(label);
      svg.appendChild(svgEl('rect', { x: labelW, y: y + 3, width: Math.max(2, w), height: rowH - 12, rx: 4, fill: opts.color || '#123f39', opacity: 0.86 }));
      const v = svgEl('text', { x: labelW + Math.max(2, w) + 7, y: y + 15, 'font-size': '11', fill: '#7b6a5d' });
      v.textContent = bn(r[1]);
      svg.appendChild(v);
    });
  }

  function drawCharts() {
    const byRegion = {};
    state.dynasties.forEach((d) => { byRegion[d.region] = (byRegion[d.region] || 0) + 1; });
    barChart('bvRegionChart', Object.entries(byRegion), { color: '#8f3d08' });

    const byCountry = {};
    state.places.forEach((p) => { byCountry[p.country] = (byCountry[p.country] || 0) + 0.5; });
    state.sculptures.forEach((s) => { byCountry[s.country] = (byCountry[s.country] || 0) + 0.5; });
    barChart('bvCountryChart', Object.entries(byCountry).map(([k, v]) => [k, Math.round(v)]), { color: '#1d5c4f' });

    const certs = { historical: 0, mixed: 0, traditional: 0 };
    state.kings.forEach((k) => { certs[k.certainty] = (certs[k.certainty] || 0) + 1; });
    barChart('bvCertChart', [['ঐতিহাসিক', certs.historical], ['মিশ্র', certs.mixed], ['জাতক-জনশ্রুতি', certs.traditional]], { color: '#c98a12', labelW: 120 });

    const centuries = {};
    state.dynasties.forEach((d) => {
      const c = Math.floor(d.start / 100) * 100;
      centuries[c] = (centuries[c] || 0) + 1;
    });
    barChart('bvCenturyChart', Object.entries(centuries).map(([k, v]) => [yearText(Number(k)), v]), { color: '#4a5f9e', labelW: 130, limit: 14 });
  }

  /* ---------------- wire up ---------------- */
  function bindSearch(id, fn) {
    const el = $(id);
    if (el) el.addEventListener('input', fn);
  }

  async function init() {
    try {
      const [meta, dyn, kings, lineage, jat, quotes, insc, places, sculpt, culture, archives, media, images, riddhi] = await Promise.all([
        load('meta.json'), load('dynasties.json'), load('kings.json'), load('lineage.json'),
        load('jatakas.json'), load('quotes.json'), load('inscriptions.json'), load('places.json'),
        load('sculptures.json'), load('culture.json'), load('archives.json'), load('media.json'), load('images.json'),
        load('riddhi.json'),
      ]);
      state.meta = meta;
      state.dynasties = dyn.dynasties;
      state.kings = kings.kings;
      state.lineage = lineage;
      state.kingCrosslink = kings.crosslink;
      state.jatakas = jat.jatakas;
      state.jatakaArchetypes = jat.kingArchetypes;
      state.quotes = quotes.quotes;
      state.quotesData = quotes.quotes;
      state.quotesThemeLabels = quotes.themeLabels;
      state.inscriptions = insc.inscriptions;
      state.places = places.places;
      state.sculptures = sculpt.sculptures;
      state.culture = culture;
      state.archives = archives.archives;
      state.media = media.media;
      state.images = images.images || {};
      state.riddhi = riddhi;

      renderIntro();
      renderLineage();
      renderRiddhi();
      renderDynastyFilters(); renderDynasties(); drawGantt(); drawGeo();
      renderKingFilters(); renderKings();
      $('bvKingsSub').textContent = 'জাতক-জনশ্রুতির রাজা ও ঐতিহাসিক শাসক একসঙ্গে, কিন্তু প্রতিটি কার্ডে নির্ভরযোগ্যতার ব্যাজ দেওয়া আছে। বাংলাদেশের জমিদার ও সার্কেল-প্রধানদের পূর্ণ তালিকা আলাদা পাতায়।';
      $('bvKingCrosslink').innerHTML = `বাংলাদেশের রাজা, জমিদার, সার্কেল-প্রধান ও ভিক্ষু-পণ্ডিতদের পূর্ণ প্রোফাইল (১১১ জন) → <a href="${esc(kings.crosslink.href)}">${esc(kings.crosslink.label)}</a>`;
      $('bvLinkedProfiles').innerHTML = (kings.linkedProfiles || []).map((p) => `<article class="bv-item">
        <div class="badges"><span class="bv-badge">${esc(p.country)}</span><span class="bv-badge ${esc(p.certainty)}">${esc(certLabel(p.certainty))}</span></div>
        <h3><a href="${esc(p.href)}">${esc(p.name)}</a></h3>
        <span class="meta">${esc(p.reign || '')} · ${esc(p.dynasty)}</span>
        <p>${esc(p.summary)}</p>
        <p class="meta"><b>ধর্মীয় ভূমিকা:</b> ${esc(p.dhamma)}</p>
        <p class="meta"><a href="${esc(p.href)}">পূর্ণ প্রোফাইল দেখুন →</a></p>
      </article>`).join('');
      renderJatakas();
      renderQuoteFilters(); renderQuotes();
      renderInscriptions();
      renderSculptures();
      renderPlaceFilters(); renderPlaces();
      renderCultureTabs(); renderCulture();
      renderArchives(); renderMedia();
      drawCharts();

      // গভীর লিংক (#riddhi ইত্যাদি): ডেটা রেন্ডারের আগে ব্রাউজার স্ক্রল করে ফেলে
      // ভুল জায়গায় থেমে যেত — তাই রেন্ডারের পরে আবার ঠিক জায়গায় নিয়ে যাই।
      if (location.hash && location.hash.length > 1) {
        const target = document.querySelector(location.hash);
        if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      }

      bindSearch('bvDynSearch', renderDynasties);
      bindSearch('bvKingSearch', renderKings);
      bindSearch('bvSculptSearch', renderSculptures);
      bindSearch('bvPlaceSearch', renderPlaces);
    } catch (err) {
      console.error(err);
      const lead = $('bvLead');
      if (lead) lead.innerHTML = 'ডেটা লোড করা যায়নি। পাতাটি লোকাল ফাইল হিসেবে খুললে <code>fetch</code> কাজ করে না — টার্মিনালে <code>python3 -m http.server</code> চালিয়ে দেখুন।';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
