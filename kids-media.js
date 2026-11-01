/* শিশু ও শিক্ষা বিভাগ — জাতক ও বুদ্ধ-বিষয়ক মিডিয়া তালিকা (dependency-free) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const bn = v => String(v ?? '').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const TYPE_LABEL = { comic:'কমিক', book:'বই', audio:'অডিও', art:'চিত্রকলা', film:'চলচ্চিত্র', ack:'অমর চিত্র কথা', video:'অ্যানিমেশন', manga:'মাঙ্গা', coloring:'রঙ করার পাতা' };
  const LANG_LABEL = { en:'ইংরেজি', hi:'হিন্দি', fr:'ফরাসি', zh:'চিনা', bn:'বাংলা', sa:'সংস্কৃত' };
  const KIND_ICON  = { comic:'💬', book:'📖', audio:'🎧', art:'🎨', film:'🎬' };

  const state = { type:'all', lang:'all', topic:'all', q:'', playable:false, data:null };
  let lightbox = null;

  const matches = item => {
    if (state.type !== 'all' && item.type !== state.type) return false;
    if (state.lang !== 'all' && item.lang !== state.lang) return false;
    if (state.topic !== 'all' && !(item.topics || []).includes(state.topic)) return false;
    if (state.playable && !(item.playUrl || item.downloadUrl || item.readUrl || item.buyUrl)) return false;
    if (state.q) {
      const hay = [item.titleBn, item.titleEn, item.descBn, item.creatorBn, item.creditBn,
        LANG_LABEL[item.lang] || '', TYPE_LABEL[item.type] || '', (item.topics || []).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(state.q.toLowerCase())) return false;
    }
    return true;
  };

  const actions = item => {
    const out = [];
    if (item.buyUrl) out.push(`<a class="kbtn buy" href="${esc(item.buyUrl)}" target="_blank" rel="noopener">${item.priceBn ? esc(item.priceBn) + ' · ' : ''}কিনুন ↗</a>`);
    if (item.readUrl) out.push(`<a class="kbtn primary" href="${esc(item.readUrl)}" target="_blank" rel="noopener">${item.type === 'film' ? 'উৎসে দেখুন' : 'পড়ুন'} ↗</a>`);
    if (item.downloadUrl) {
      const local = item.downloadUrl.startsWith('assets/');
      out.push(`<a class="kbtn" href="${esc(item.downloadUrl)}"${local ? ' download' : ' target="_blank" rel="noopener"'}>${local ? 'ডাউনলোড' : 'ডাউনলোড ↗'}</a>`);
    }
    if (item.downloadUrlAlt) out.push(`<a class="kbtn" href="${esc(item.downloadUrlAlt)}" target="_blank" rel="noopener">PDF ↗</a>`);
    if (item.watchUrl) out.push(`<a class="kbtn play-link" href="${esc(item.watchUrl)}" target="_blank" rel="noopener">${item.type === 'video' ? 'ইউটিউবে দেখুন' : 'কোথায় দেখবেন'} ↗</a>`);
    if (item.infoUrl) out.push(`<a class="kbtn" href="${esc(item.infoUrl)}" target="_blank" rel="noopener">তথ্য ↗</a>`);
    if (item.sourceUrl && ![item.readUrl, item.downloadUrl, item.buyUrl, item.watchUrl].includes(item.sourceUrl)) {
      out.push(`<a class="kbtn" href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">উৎস ↗</a>`);
    }
    return out.join('');
  };

  const card = item => {
    const isAudio = item.type === 'audio' && item.playUrl;
    const isVideo = item.type === 'video' && item.embedId;
    if (isVideo) {
      return `<article class="kcard kcard-video" data-id="${esc(item.id)}" data-type="${esc(item.type)}" data-embed="${esc(item.embedId)}">
        <div class="kcard-media kvideo">
          <img src="${esc(item.thumb)}" alt="${esc(item.titleBn)}" loading="lazy" decoding="async">
          <button class="kplay" type="button" aria-label="${esc(item.titleBn)} — এখানেই চালান">
            <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true"><polygon points="24,16 52,32 24,48" fill="currentColor"/></svg>
          </button>
          <span class="kbadge">অ্যানিমেশন</span><span class="kbadge play">এখানেই চলে</span>
        </div>
        <div class="kcard-body">
          <h3>${esc(item.titleBn)}</h3>
          <p class="kmeta">${esc(LANG_LABEL[item.lang] || item.lang)} · ${esc(item.ageBn || '')} · ${esc(item.creatorBn || 'YouTube')}</p>
          <p class="kdesc">${esc(item.descBn)}</p>
          <p class="klic"><b>${esc(item.licenceLabel)}</b> — ${esc(item.creditBn || '')}</p>
          ${item.noteBn ? `<p class="knote">${esc(item.noteBn)}</p>` : ''}
          <div class="kcard-actions">${actions(item)}</div>
        </div>
      </article>`;
    }
    const media = isAudio
      ? `<div class="kcard-media audio-art"><span class="wave" aria-hidden="true"><svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#ffe7bb" stroke-width="3" stroke-linecap="round"><path d="M10 40V32a22 22 0 0 1 44 0v8"/><rect x="6" y="38" width="12" height="18" rx="5" fill="#ffe7bb" stroke="none"/><rect x="46" y="38" width="12" height="18" rx="5" fill="#ffe7bb" stroke="none"/><path d="M22 52h6a8 8 0 0 0 8-8" stroke-opacity=".7"/></svg></span><span class="dur">${esc(item.durationBn || '')}</span><span class="kbadge">${esc(TYPE_LABEL[item.type])}</span></div>`
      : `<div class="kcard-media${item.type === 'book' || item.type === 'ack' ? ' contain' : ''}">${item.thumb ? `<img src="${esc(item.thumb)}" alt="${esc(item.titleBn)}" loading="lazy" decoding="async" onerror="this.style.display='none';this.parentElement.classList.add('imgfail');this.parentElement.dataset.fallback='${esc((item.titleBn || '').slice(0, 40))}'">` : ''}<span class="kbadge">${esc(TYPE_LABEL[item.type] || item.type)}</span></div>`;
    const playable = isAudio ? '<span class="kbadge play">এখানেই চলে</span>' : '';
    return `<article class="kcard" data-id="${esc(item.id)}" data-type="${esc(item.type)}">
      ${media.replace('</div>', playable + '</div>')}
      <div class="kcard-body">
        <h3>${esc(item.titleBn)}</h3>
        <p class="kmeta">${esc(LANG_LABEL[item.lang] || item.lang)} · ${esc(item.ageBn || '')} · ${esc(TYPE_LABEL[item.type] || item.type)}</p>
        <p class="kdesc">${esc(item.descBn)}</p>
        ${isAudio ? `<div class="kaudio">
          <audio controls preload="metadata" src="${esc(item.playUrl)}" aria-label="${esc(item.titleBn)}"></audio>
          <p class="kaudio-tools"><a href="${esc(item.playUrl)}" download>⬇ MP3 ডাউনলোড</a> <span>·</span> <a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">মূল সূত্র ↗</a></p>
          <p class="kaudio-err" hidden>এই ফাইলটি এখন লোড হচ্ছে না — ফাইলটি সাইটের <code>assets/kids/audio/</code> ফোল্ডারে আছে; ইন্টারনেট/ফাইল-পথ ঠিক থাকলে “MP3 ডাউনলোড” চেপে শুনতে পারেন।</p>
        </div>` : ''}
        <p class="klic"><b>${esc(item.licenceLabel)}</b> — ${esc(item.creditBn || '')}${item.creatorBn ? '' : ''}</p>
        ${item.noteBn ? `<p class="knote">${esc(item.noteBn)}</p>` : ''}
        <div class="kcard-actions">${actions(item)}</div>
      </div>
    </article>`;
  };

  const render = () => {
    const d = state.data;
    const visible = d.items.filter(matches);
    $('#kGrid').innerHTML = visible.length
      ? visible.map(card).join('')
      : '<p class="kidsmedia-empty">এই ছাঁকনিতে কিছু মেলেনি — ফিল্টার একটু বদলে দেখুন।</p>';
    $('#kCount').innerHTML = `<b>${bn(visible.length)}</b>টি দেখানো হচ্ছে · মোট <b>${bn(d.items.length)}</b>টি যাচাই করা আইটেম · অডিও ${bn(d.items.filter(i => i.playUrl).length)}টি · ছবি ${bn(d.items.filter(i => i.type === 'art' || i.type === 'comic').length)}টি`;
  };

  const chips = (el, list, key, onPick) => {
    el.innerHTML = list.map(o => `<button type="button" class="chip" data-key="${esc(o.key)}" aria-pressed="${o.key === 'all' ? 'true' : 'false'}">${esc(o.labelBn)}</button>`).join('');
    el.addEventListener('click', e => {
      const b = e.target.closest('button[data-key]'); if (!b) return;
      $$('button[data-key]', el).forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      state[key] = b.dataset.key; render();
    });
  };

  const openLightbox = (src, item) => {
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'klightbox';
      lightbox.innerHTML = '<button class="klb-close" type="button" aria-label="বন্ধ করুন">×</button><div><img alt=""><div class="klb-bar"></div></div>';
      document.body.appendChild(lightbox);
      lightbox.addEventListener('click', e => {
        if (e.target === lightbox || e.target.classList.contains('klb-close')) lightbox.classList.remove('open');
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });
    }
    $('.klightbox img', document).src = src;
    $('.klightbox img').alt = item ? item.titleBn : '';
    $('.klb-bar').innerHTML = item
      ? `${esc(item.titleBn)} · <b>${esc(item.licenceLabel)}</b>
         <a href="${esc(item.thumb)}" download>ছবি ডাউনলোড</a>
         <a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">Commons পাতা ↗</a>`
      : '';
    lightbox.classList.add('open');
  };

  const render_ = data => {
    state.data = data;
    $('#kLead').textContent = data.introBn;
    chips($('#kTypes'), data.types, 'type');
    chips($('#kLangs'), data.languages, 'lang');
    chips($('#kTopics'), data.topics, 'topic');
    render();

    const stats = $('#kStats');
    if (stats) {
      const c = t => data.items.filter(i => i.type === t).length;
      stats.innerHTML = [
        [data.items.length, 'মোট আইটেম'],
        [c('audio'), 'অডিও গল্প'],
        [c('book'), 'বই / নথি'],
        [c('art') + c('comic'), 'ছবি ও কমিক'],
        [c('ack'), 'অমর চিত্র কথা'],
        [c('film'), 'চলচ্চিত্র'],
      ].map(([n, l]) => `<li><b>${bn(n)}</b>${l}</li>`).join('');
    }

    const host = $('#kSearchLinks');
    if (host) host.innerHTML = data.searchLinks.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.labelBn)} ↗</a></li>`).join('');
    const notHosted = $('#kNotHosted');
    if (notHosted) notHosted.innerHTML = data.notHostedBn.map(t => `<li>${esc(t)}</li>`).join('');

    $('#kGrid').addEventListener('error', e => {
      const a = e.target;
      if (a && a.tagName === 'AUDIO') {
        const box = a.closest('.kaudio');
        if (box) { const p = box.querySelector('.kaudio-err'); if (p) p.hidden = false; }
      }
    }, true);
    $('#kGrid').addEventListener('click', e => {
      const playBtn = e.target.closest('.kplay');
      if (playBtn) {
        const cardEl = playBtn.closest('.kcard');
        const id = cardEl?.dataset.embed;
        if (!id) return;
        const holder = cardEl.querySelector('.kcard-media');
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`;
        iframe.title = cardEl.querySelector('h3')?.textContent || 'ভিডিও';
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.className = 'kiframe';
        holder.innerHTML = '';
        holder.classList.add('playing');
        holder.appendChild(iframe);
        const hint = document.createElement('p');
        hint.className = 'kembed-hint';
        hint.innerHTML = 'প্লেয়ার না এলে ইন্টারনেট/এমবেড ব্লক আছে — <a href="https://www.youtube.com/watch?v=' +
          encodeURIComponent(id) + '" target="_blank" rel="noopener">ইউটিউবে দেখুন ↗</a>';
        hint.hidden = true;
        holder.after(hint);
        let loaded = false;
        iframe.addEventListener('load', () => { loaded = true; hint.hidden = true; });
        setTimeout(() => { if (!loaded) hint.hidden = false; }, 7000);
        return;
      }
      const img = e.target.closest('.kcard-media img');
      if (!img || img.closest('.kvideo')) return;
      const cardEl = img.closest('.kcard');
      const item = data.items.find(i => i.id === cardEl.dataset.id);
      openLightbox(img.src, item);
    });
  };

  const showError = msg => {
    $('#kCount').innerHTML = 'তালিকা লোড করা যায়নি — <a href="data/kids-media.json">JSON ফাইলটি</a> সরাসরি দেখা যাবে।';
    const g = $('#kGrid');
    if (g) g.innerHTML = `<p class="kidsmedia-empty">${esc(msg)}</p>`;
  };

  // ১) JSON fetch → ২) script-ভার্সন (file:// বা স্যান্ডবক্সে fetch ব্লক হলে) → ৩) বার্তা
  const loadViaScript = () => new Promise((resolve, reject) => {
    if (window.KIDS_MEDIA_DATA) return resolve(window.KIDS_MEDIA_DATA);
    const sc = document.createElement('script');
    sc.src = 'data/kids-media-data.js?v=20261101b';
    sc.onload = () => window.KIDS_MEDIA_DATA ? resolve(window.KIDS_MEDIA_DATA) : reject(new Error('script-এ ডেটা নেই'));
    sc.onerror = () => reject(new Error('script লোড হয়নি'));
    document.head.appendChild(sc);
  });

  // মালিকের অনুমোদিত ওভারলে (review.html → data/kids-overlay.json) — না পেলেও চলবে
  const applyOverlay = data => {
    const url = 'data/kids-overlay.json?v=20261101c';
    const merge = ov => {
      if (!ov || ov.schema !== 'charyabhumi-kids-overlay-v1') return data;
      const byId = new Map(data.items.map(i => [i.id, i]));
      (ov.edits || []).forEach(e => {
        const it = byId.get(e.id);
        if (!it || !e.patch) return;
        Object.keys(e.patch).forEach(k => { if (e.patch[k] !== '' && e.patch[k] != null) it[k] = e.patch[k]; });
        it.editedBy = 'owner';
      });
      const rejected = new Set((ov.rejections || []).map(r => r.id).filter(Boolean));
      if (rejected.size) data.items = data.items.filter(i => !rejected.has(i.id));
      (ov.cards || []).forEach(c => {
        if (!c || !c.id || byId.has(c.id) || rejected.has(c.id) || !c.titleBn) return;
        data.items.unshift(Object.assign({ ageBn:'৪–১০ বছর', topics:['jataka'], lang:'bn', type:'art',
          descBn:'', licenceKey:'licensed' }, c, { approvedBy:'owner' }));
      });
      data.overlay = { cards:(ov.cards || []).length, edits:(ov.edits || []).length, rejected: rejected.size };
      return data;
    };
    if (window.KIDS_MEDIA_OFFLINE || typeof fetch !== 'function' || location.protocol === 'file:') return Promise.resolve(data);
    return fetch(url, { cache:'no-store' }).then(r => r.ok ? r.json() : null).then(merge).catch(() => data);
  };

  fetch('data/kids-media.json?v=20261101c')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
    .then(applyOverlay)
    .then(render_)
    .catch(() => loadViaScript().then(applyOverlay).then(render_).catch(err => {
      showError('তালিকা লোড করা যায়নি (' + err.message + ') — ইন্টারনেট বা ফাইল-পথ ঠিক আছে কি না দেখুন।');
    }));

  const search = $('#kSearch');
  if (search) {
    search.addEventListener('input', () => { state.q = search.value.trim(); if (state.data) render(); });
    $('#kSearchClear')?.addEventListener('click', () => { search.value = ''; state.q = ''; if (state.data) render(); search.focus(); });
  }
  const onlyPlay = $('#kPlayable');
  if (onlyPlay) onlyPlay.addEventListener('change', () => { state.playable = onlyPlay.checked; if (state.data) render(); });
})();
