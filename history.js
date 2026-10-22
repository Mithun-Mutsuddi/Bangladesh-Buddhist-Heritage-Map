/* বৌদ্ধ শাসন ও ইতিহাস — data/heritage-history.json থেকে পাতা তৈরি করে।
   কোনো বাহ্যিক লাইব্রেরি নেই; ছবি শুধু উইকিমিডিয়া কমন্সের মুক্ত-লাইসেন্স উৎস থেকে আসে, ক্রেডিটসহ। */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const FIELD_ORDER = [
    ['extent', 'বিস্তৃতি ও সীমা', '🗺'],
    ['buddhism', 'বৌদ্ধধর্মে অবদান', '☸'],
    ['education', 'শিক্ষায় অবদান', '📖'],
    ['viharas', 'বিহার ও মহাবিহার নির্মাণ', '🏛'],
    ['welfare', 'জনকল্যাণমুখী কাজ', '🤝'],
    ['architecture', 'স্থাপত্য', '🏗'],
    ['sculpture', 'ভাস্কর্য ও শিল্প', '🗿'],
    ['literature', 'সাহিত্য', '✍'],
    ['coins', 'মুদ্রা', '🪙'],
    ['administration', 'শাসনব্যবস্থা', '⚖'],
    ['rise', 'উত্থান', '↑'],
    ['decline', 'পতন', '↓'],
  ];
  const KIND_LABEL = { map: 'মানচিত্র', artifact: 'প্রত্ননিদর্শন', site: 'স্থান', portrait: 'প্রতিকৃতি' };

  function figure(img) {
    if (!img) return '';
    const cls = img.kind === 'map' ? 'ph map' : 'ph';
    return `<figure class="figure">
      <img class="${cls}" src="${esc(img.image)}" alt="${esc(img.caption)}" loading="lazy" referrerpolicy="no-referrer"
           onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'fig-missing',textContent:'ছবিটি লোড হয়নি — ইন্টারনেট সংযোগ দরকার'}))">
      <figcaption><span class="kind">${esc(KIND_LABEL[img.kind] || 'চিত্র')}</span>${esc(img.caption)}
        <br><span class="credit">ছবি: ${esc(img.credit || 'অজ্ঞাত')} · ${esc(img.license || '')}${img.source ? ` · <a href="${esc(img.source)}" target="_blank" rel="noopener noreferrer">উৎস ↗</a>` : ''}</span>
      </figcaption></figure>`;
  }

  function rulerTable(rows) {
    if (!rows || !rows.length) return '';
    return `<table class="ruler-table"><caption>শাসকদের তালিকা (তারিখ আনুমানিক)</caption>
      <thead><tr><th>শাসক</th><th>রাজত্বকাল</th><th>পরিচিতি</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.reign)}</td><td>${esc(r.note || '')}</td></tr>`).join('')}
      </tbody></table>`;
  }

  function card(d, i) {
    const fields = FIELD_ORDER.filter(([k]) => d[k]).map(([k, label, ico]) =>
      `<div class="field"><h4><span class="ico" aria-hidden="true">${ico}</span>${label}</h4><p>${esc(d[k])}</p></div>`).join('');
    const sites = (d.sitesBD && d.sitesBD.length)
      ? `<div class="sites"><h4>🇧🇩 বাংলাদেশে স্মৃতিচিহ্ন</h4><ul>${d.sitesBD.map(s => `<li><b>${esc(s.name)}</b> — ${esc(s.note)}</li>`).join('')}</ul></div>`
      : '';
    const caution = d.caution ? `<p class="caution">⚠ ${esc(d.caution)}</p>` : '';
    const gallery = (d.images && d.images.length)
      ? `<div class="dyn-gallery">${d.images.map(figure).join('')}</div>`
      : `<div class="dyn-gallery"><div class="figure"><div class="fig-missing">এই রাজবংশের সমসাময়িক প্রতিকৃতি বা মুদ্রার ছবি নির্ভরযোগ্য মুক্ত-সূত্রে পাওয়া যায়নি — তাই ভুল ছবি বসানো হয়নি।</div></div></div>`;
    return `<article class="dyn-card" id="dyn-${esc(d.id)}">
      <header class="dyn-head">
        <h3><span class="num">${bn(i + 1)}</span>${esc(d.name)}</h3>
        <div class="dyn-period">${esc(d.period)}</div>
        <div class="dyn-cap">রাজধানী: ${esc((d.capitals || []).join(' · ') || 'নিশ্চিত নয়')}</div>
        ${(d.altNames && d.altNames.length) ? `<div class="dyn-alt">অন্য নাম: ${esc(d.altNames.join(' · '))}</div>` : ''}
      </header>
      <div class="dyn-body">
        ${gallery}
        ${rulerTable(d.rulers)}
        <div class="fields">${fields}</div>
        ${sites}
        ${caution}
        <p class="dyn-top"><a href="#dynasties">↑ রাজবংশের তালিকায় ফিরুন</a></p>
      </div>
    </article>`;
  }

  function timeline(rows) {
    const svg = $('timelineSvg');
    if (!svg) return;
    const min = -350, max = 1350, W = 1000, H = 520, L = 110, R = 30, T = 40, B = 40;
    const x = v => L + (v - min) / (max - min) * (W - L - R);
    const rowsSorted = rows.slice().sort((a, b) => a.start - b.start);
    const rowH = (H - T - B) / rowsSorted.length;
    const colors = ['#8f3d08', '#b64c0a', '#762d32', '#2f5b3d', '#7a5320', '#4b1f07'];
    let out = '';
    const step = 100;
    for (let y = -300; y <= 1300; y += step) {
      const px = x(y).toFixed(1);
      out += `<line class="tl-tick" x1="${px}" y1="${T - 10}" x2="${px}" y2="${H - B + 10}"></line>`;
      out += `<text class="tl-tick-label" x="${px}" y="${H - B + 24}" text-anchor="middle">${y < 0 ? bn(Math.abs(y)) + ' খ্রিঃপূঃ' : bn(y)}</text>`;
    }
    rowsSorted.forEach((r, i) => {
      const y = T + i * rowH + rowH * 0.18;
      const h = rowH * 0.64;
      const x1 = x(Math.max(r.start, min)), x2 = x(Math.min(r.end, max));
      const w = Math.max(x2 - x1, 3);
      const c = colors[i % colors.length];
      out += `<a class="tl-bar" href="#dyn-${esc(r.id)}" aria-label="${esc(r.label)} ${esc(String(r.start))}–${esc(String(r.end))}">
        <rect x="${x1.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${c}" opacity=".85"></rect>
        <text class="tl-label" x="${(L - 8).toFixed(1)}" y="${(y + h * 0.72).toFixed(1)}" text-anchor="end">${esc(r.label)}</text></a>`;
    });
    out += `<line class="tl-axis" x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}"></line>`;
    svg.innerHTML = out;
  }

  async function run() {
    let data;
    try {
      const res = await fetch('data/heritage-history.json', { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      const box = $('dynList');
      if (box) box.innerHTML = `<p class="caution">ইতিহাস-তথ্য ফাইল লোড করা যায়নি (${esc(err.message)})। পরে আবার চেষ্টা করুন।</p>`;
      return;
    }
    if ($('hist-lead')) $('hist-lead').textContent = data.intro.lead;
    if ($('hist-note')) $('hist-note').textContent = data.intro.note;
    if ($('eraCards')) $('eraCards').innerHTML = data.eras.map(e =>
      `<div class="era-card"><strong>${esc(e.name)}</strong><span>${esc(e.span)}</span><p>${esc(e.note)}</p></div>`).join('');
    timeline(data.timeline || []);
    const list = data.dynasties || [];
    if ($('dynJump')) $('dynJump').innerHTML = list.map(d => `<a href="#dyn-${esc(d.id)}">${esc(d.name)}</a>`).join('');
    if ($('dynList')) $('dynList').innerHTML = list.map(card).join('');
    if ($('ruinsList')) $('ruinsList').innerHTML = (data.remains.items || []).map(r =>
      `<div class="ruin"><strong>${esc(r.name)}</strong><span class="tag">${esc(r.dynasty)}</span><p>${esc(r.note)}</p></div>`).join('');
    if ($('sourceList')) $('sourceList').innerHTML = (data.sources || []).map(s =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('');
    document.documentElement.dataset.historyReady = '1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
