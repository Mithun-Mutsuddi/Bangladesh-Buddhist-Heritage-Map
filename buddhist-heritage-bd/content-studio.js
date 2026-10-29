'use strict';

/* No-code local content studio. Public publishing remains an explicit GitHub upload. */
(() => {
  const DB_NAME = 'BuddhistHeritageContentStudio';
  const DB_VERSION = 1;
  const STORE = 'drafts';
  const MAX_FILE_BYTES = 35 * 1024 * 1024;
  const byId = id => document.getElementById(id);
  const memory = { published: [], drafts: [], objectUrls: new Map() };
  let dbPromise;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function digits(value) {
    return String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]);
  }
  function makeId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function status(message, kind = 'info') {
    const target = byId('studioStatus');
    if (!target) return;
    target.textContent = message;
    target.dataset.kind = kind;
  }
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('এই browser-এ IndexedDB পাওয়া যায়নি।')); return; }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('খসড়া storage খোলা যায়নি।'));
    });
    return dbPromise;
  }
  async function dbAction(mode, action, value) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const store = transaction.objectStore(STORE);
      let request;
      if (action === 'getAll') request = store.getAll();
      else if (action === 'put') request = store.put(value);
      else if (action === 'delete') request = store.delete(value);
      if (request) {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('ডেটা সংরক্ষণ করা যায়নি।'));
      }
      transaction.onerror = () => reject(transaction.error || new Error('ডেটা সংরক্ষণ করা যায়নি।'));
    });
  }
  function safeExternalUrl(raw) {
    if (!raw) return '';
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }
  function youtubeEmbed(raw) {
    const safe = safeExternalUrl(raw);
    if (!safe) return '';
    try {
      const url = new URL(safe);
      let id = '';
      if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be')) id = url.pathname.split('/').filter(Boolean)[0] || '';
      else if (url.hostname.includes('youtube.com')) id = url.searchParams.get('v') || (url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/) || [])[1] || '';
      return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
    } catch { return ''; }
  }
  function getPreviewUrl(post) {
    if (post.mediaBlob instanceof Blob) {
      if (!memory.objectUrls.has(post.id)) memory.objectUrls.set(post.id, URL.createObjectURL(post.mediaBlob));
      return memory.objectUrls.get(post.id);
    }
    return safeExternalUrl(post.mediaUrl) || (post.mediaPath ? post.mediaPath : '');
  }
  function publicRecord(post, mediaPath) {
    const record = {
      id: post.id,
      type: post.type || 'article',
      title: post.title || '',
      district: post.district || '',
      division: post.division || '',
      summary: post.summary || '',
      body: post.body || '',
      latitude: post.latitude !== null && post.latitude !== undefined && post.latitude !== '' && Number.isFinite(Number(post.latitude)) ? Number(post.latitude) : null,
      longitude: post.longitude !== null && post.longitude !== undefined && post.longitude !== '' && Number.isFinite(Number(post.longitude)) ? Number(post.longitude) : null,
      mediaUrl: safeExternalUrl(post.mediaUrl),
      mediaPath: mediaPath || post.mediaPath || '',
      mediaType: post.mediaType || '',
      mediaName: post.mediaName || '',
      sourceUrl: safeExternalUrl(post.sourceUrl),
      credit: post.credit || '',
      createdAt: post.createdAt || new Date().toISOString(),
      placeId: post.placeId || '',
      placeName: post.placeName || '',
      rating: Number.isFinite(Number(post.rating)) && Number(post.rating) > 0 ? Math.min(5, Math.max(1, Number(post.rating))) : null,
      visitDate: post.visitDate || '',
      author: post.author || ''
    };
    if (!Number.isFinite(record.latitude) || record.latitude < -90 || record.latitude > 90) record.latitude = null;
    if (!Number.isFinite(record.longitude) || record.longitude < -180 || record.longitude > 180) record.longitude = null;
    return record;
  }
  function contentTypeLabel(post) {
    if (post.type === 'place') return 'ম্যাপসহ স্থান';
    if (post.type === 'image') return 'ছবি';
    if (post.type === 'video') return 'ভিডিও';
    if (post.type === 'audio') return 'অডিও';
    if (post.type === 'review') return 'স্থান-ভ্রমণ রিভিউ';
    return 'লেখা';
  }
  function renderMedia(post) {
    const url = getPreviewUrl(post);
    const fileType = String(post.mediaType || '').toLowerCase();
    const kind = fileType.startsWith('image/') || post.type === 'image' ? 'image' : fileType.startsWith('video/') || post.type === 'video' ? 'video' : fileType.startsWith('audio/') || post.type === 'audio' ? 'audio' : '';
    if (url && kind === 'image') {
      return `<div class="community-media"><img src="${escapeHtml(url)}" alt="${escapeHtml(post.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('media-error')"></div>`;
    }
    if (url && kind === 'video') {
      const embed = youtubeEmbed(url);
      if (embed) return `<div class="community-media"><iframe src="${escapeHtml(embed)}" title="${escapeHtml(post.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
      if (post.mediaPath || post.mediaBlob || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return `<div class="community-media"><video src="${escapeHtml(url)}" controls preload="metadata"></video></div>`;
      return `<a class="community-media-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">▷ ভিডিও খুলুন ↗</a>`;
    }
    if (url && kind === 'audio') {
      if (post.mediaPath || post.mediaBlob || /\.(mp3|m4a|wav|ogg|aac|flac)(\?|$)/i.test(url)) return `<div class="community-audio"><audio src="${escapeHtml(url)}" controls preload="metadata"></audio></div>`;
      return `<a class="community-media-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">♫ অডিও শুনুন ↗</a>`;
    }
    if (url && post.type === 'article' && kind === '') return `<a class="community-media-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">📎 সংযুক্ত ফাইল খুলুন ↗</a>`;
    if (post.type === 'image') return '<div class="community-media media-placeholder">🪷<span>ছবি যোগ করা হয়নি</span></div>';
    if (post.type === 'video') return '<div class="community-media media-placeholder">▷<span>ভিডিও লিংক বা ফাইল যোগ করুন</span></div>';
    if (post.type === 'audio') return '<div class="community-audio media-placeholder">♫<span>অডিও লিংক বা ফাইল যোগ করুন</span></div>';
    return '';
  }
  function postCard(post, isDraft = false) {
    const media = renderMedia(post);
    const hasCoords = post.latitude !== null && post.latitude !== undefined && post.latitude !== '' && post.longitude !== null && post.longitude !== undefined && post.longitude !== '' && Number.isFinite(Number(post.latitude)) && Number.isFinite(Number(post.longitude));
    const location = [post.district, post.division].filter(Boolean).join(' · ');
    const maps = hasCoords ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${post.latitude},${post.longitude}`)}` : '';
    const articleText = post.body ? `<p class="community-body">${escapeHtml(post.body).replace(/\n/g, '<br>')}</p>` : '';
    const reference = safeExternalUrl(post.sourceUrl);
    const draftControls = isDraft ? `<div class="draft-card-actions"><span class="draft-only-label">খসড়া · শুধু এই ডিভাইসে</span><button type="button" class="text-button" data-delete-draft="${escapeHtml(post.id)}">খসড়া মুছুন ×</button></div>` : '';
    return `<article class="community-card ${isDraft ? 'is-draft' : ''}">
      ${media}
      <div class="community-card-body"><div class="community-card-meta"><span>${contentTypeLabel(post)}</span>${location ? `<span>⌖ ${escapeHtml(location)}</span>` : ''}</div>
      <h4>${escapeHtml(post.title)}</h4><p class="community-summary">${escapeHtml(post.summary || '')}</p>${articleText}
      <div class="community-card-links">${maps ? `<a href="${maps}" target="_blank" rel="noopener noreferrer">ম্যাপে দেখুন ↗</a>` : ''}${reference ? `<a href="${reference}" target="_blank" rel="noopener noreferrer">তথ্যসূত্র ↗</a>` : ''}${post.credit ? `<span>${escapeHtml(post.credit)}</span>` : ''}</div>${draftControls}</div>
    </article>`;
  }
  function renderFeed() {
    const feed = byId('communityFeed');
    if (!feed) return;
    const items = [
      ...memory.drafts.map(post => ({ post, draft: true })),
      ...memory.published.map(post => ({ post, draft: false }))
    ].sort((a, b) => String(b.post.createdAt || '').localeCompare(String(a.post.createdAt || '')));
    if (!items.length) {
      feed.innerHTML = '<div class="community-empty"><span>☸</span><strong>এখনো নতুন কনটেন্ট প্রকাশিত হয়নি</strong><p>উপরের Content Studio থেকে লেখা, ছবি, স্থান, ভিডিও বা অডিও যোগ করুন।</p></div>';
      return;
    }
    feed.innerHTML = items.map(item => postCard(item.post, item.draft)).join('');
  }
  function renderDraftList() {
    const holder = byId('draftList');
    if (!holder) return;
    byId('draftCount').textContent = digits(memory.drafts.length);
    if (!memory.drafts.length) {
      holder.innerHTML = '<p class="draft-empty">এখনো কোনো খসড়া নেই।</p>';
      return;
    }
    holder.innerHTML = memory.drafts.map(post => `<div class="draft-row"><div class="draft-type-icon">${post.type === 'place' ? '⌖' : post.type === 'image' ? '▧' : post.type === 'video' ? '▷' : post.type === 'audio' ? '♫' : 'Aa'}</div><div class="draft-row-copy"><strong>${escapeHtml(post.title)}</strong><small>${contentTypeLabel(post)}${post.mediaName ? ` · ${escapeHtml(post.mediaName)}` : ''}</small></div><button type="button" data-delete-draft="${escapeHtml(post.id)}" class="draft-delete" aria-label="খসড়া মুছুন">×</button></div>`).join('');
  }
  function safeFileName(filename) {
    const raw = String(filename || 'media').split(/[\\/]/).pop();
    const cleaned = raw.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(-100);
    return cleaned || 'media';
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.style.display = 'none';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  async function getPublishedContent() {
    try {
      const response = await fetch(new URL('./content.json', document.baseURI), { cache: 'no-store' });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : [];
    } catch { return []; }
  }
  async function refresh() {
    try {
      memory.drafts = await dbAction('readonly', 'getAll') || [];
      memory.drafts.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      memory.published = await getPublishedContent();
      renderDraftList(); renderFeed();
    } catch (error) {
      status(`খসড়া storage চালু করা যায়নি: ${error.message}। Chrome/Edge-এর আধুনিক browser-এ সাইটটি https:// দিয়ে খুলুন।`, 'error');
      renderFeed(); renderDraftList();
    }
  }
  function formRecord(form) {
    const file = byId('contentFile').files[0] || null;
    const type = byId('contentType').value;
    const record = {
      id: makeId(), type,
      title: byId('contentTitle').value.trim(),
      district: byId('contentDistrict').value.trim(),
      division: byId('contentDivision').value,
      summary: byId('contentSummary').value.trim(),
      body: byId('contentBody').value.trim(),
      latitude: byId('contentLat').value.trim() === '' ? null : Number(byId('contentLat').value),
      longitude: byId('contentLng').value.trim() === '' ? null : Number(byId('contentLng').value),
      mediaUrl: safeExternalUrl(byId('contentMediaUrl').value.trim()),
      mediaType: file?.type || '',
      mediaName: file?.name || '',
      mediaBlob: file,
      sourceUrl: safeExternalUrl(byId('contentSource').value.trim()),
      credit: byId('contentCredit').value.trim(),
      createdAt: new Date().toISOString()
    };
    if (!record.title || !record.summary) throw new Error('শিরোনাম ও সংক্ষিপ্ত পরিচিতি লিখুন।');
    if (byId('contentMediaUrl').value.trim() && !record.mediaUrl) throw new Error('মিডিয়া লিংকটি http:// অথবা https:// দিয়ে শুরু হওয়া বৈধ URL হতে হবে।');
    if (byId('contentSource').value.trim() && !record.sourceUrl) throw new Error('তথ্যসূত্রের URL সঠিক নয়।');
    if (file && file.size > MAX_FILE_BYTES) throw new Error('ফাইলটি ৩৫ MB-এর বেশি। বড় ভিডিও/অডিওর বদলে YouTube বা অন্য হোস্ট করা লিংক দিন।');
    if ((record.latitude !== null && (!Number.isFinite(record.latitude) || record.latitude < -90 || record.latitude > 90)) || (record.longitude !== null && (!Number.isFinite(record.longitude) || record.longitude < -180 || record.longitude > 180))) throw new Error('অক্ষাংশ ও দ্রাঘিমাংশ সঠিক সংখ্যায় লিখুন।');
    if ((record.latitude === null) !== (record.longitude === null)) throw new Error('ম্যাপ পয়েন্টের জন্য অক্ষাংশ ও দ্রাঘিমাংশ দুটোই দিতে হবে।');
    if (record.type === 'place' && (record.latitude === null || record.longitude === null)) throw new Error('নতুন স্থান ম্যাপে দেখাতে Latitude ও Longitude দুটোই দিন।');
    return record;
  }
  async function saveDraft(event) {
    event.preventDefault();
    try {
      const record = formRecord(event.currentTarget);
      await dbAction('readwrite', 'put', record);
      if (record.mediaBlob) {
        const help = byId('contentFileHelp');
        if (help) help.textContent = `${record.mediaName} · ${Math.round(record.mediaBlob.size / 1024)} KB`;
      }
      status('খসড়া সেভ হয়েছে। এটি এখন এই browser-এ প্রিভিউতে দেখা যাবে; সবার জন্য প্রকাশ করতে ZIP তৈরি করে GitHub-এ upload করুন।', 'success');
      event.currentTarget.reset();
      await refresh();
      byId('communityFeed')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    } catch (error) { status(error.message || 'খসড়া সেভ করা যায়নি।', 'error'); }
  }
  async function deleteDraft(id) {
    if (!id) return;
    const post = memory.drafts.find(item => item.id === id);
    if (!post || !confirm(`“${post.title}” খসড়াটি মুছে ফেলবেন?`)) return;
    await dbAction('readwrite', 'delete', id);
    const url = memory.objectUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    memory.objectUrls.delete(id);
    await refresh();
    status('খসড়াটি মুছে ফেলা হয়েছে।', 'success');
  }
  async function exportPackage() {
    const button = byId('exportContentPack');
    if (!window.JSZip) {
      status('ZIP তৈরির লাইব্রেরি লোড হয়নি। ইন্টারনেট সংযোগ যাচাই করে পেজ reload করুন।', 'error');
      return;
    }
    button.disabled = true;
    button.textContent = 'ZIP তৈরি হচ্ছে…';
    try {
      memory.drafts = await dbAction('readonly', 'getAll') || [];
      memory.published = await getPublishedContent();
      const zip = new JSZip();
      const uploads = zip.folder('assets/uploads');
      const posts = memory.published.map(post => publicRecord(post, post.mediaPath || ''));
      for (const draft of memory.drafts) {
        let mediaPath = draft.mediaPath || '';
        if (draft.mediaBlob instanceof Blob) {
          const filename = `${safeFileName(draft.id)}-${safeFileName(draft.mediaName || 'media')}`;
          mediaPath = `assets/uploads/${filename}`;
          uploads.file(filename, draft.mediaBlob, { binary: true });
        }
        posts.push(publicRecord(draft, mediaPath));
      }
      zip.file('content.json', JSON.stringify(posts, null, 2));
      const instructions = `বাংলাদেশের বৌদ্ধ ঐতিহ্যবাহী স্থান নির্দেশিকা — কনটেন্ট প্রকাশ\n\n১. এই ZIP extract করুন।\n২. Extract করা content.json এবং assets/uploads ফোল্ডার খুলুন।\n৩. GitHub repository Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map খুলুন।\n৪. Add file → Upload files নির্বাচন করুন। content.json এবং assets/uploads-এর ভেতরের media file-গুলো একই path-এ দিন।\n৫. content.json রিপ্লেস করার সতর্কতা এলে নতুন ফাইলটি রাখুন; পুরোনো কনটেন্ট এই ZIP-এ আগেই অন্তর্ভুক্ত করা হয়েছে।\n৬. নিচে Commit changes চাপুন। GitHub Pages নতুন কনটেন্ট দেখাতে কয়েক মিনিট লাগতে পারে।\n\nসতর্কতা: কনটেন্ট যাচাই করুন, ছবি/ভিডিওর অধিকার ও উৎস দিন এবং ব্যক্তিগত/সংবেদনশীল তথ্য প্রকাশ করবেন না। এই ZIP নিজে থেকে website-এ publish হয় না; GitHub-এ commit করতে হবে।\n`;
      zip.file('PUBLISH-INSTRUCTIONS.txt', instructions);
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } });
      downloadBlob(blob, 'buddhist-heritage-publication-pack.zip');
      status(`প্রকাশনার ZIP প্রস্তুত: ${digits(posts.length)}টি কনটেন্ট রেকর্ড। ZIP extract করে content.json ও assets/uploads GitHub-এ upload/commit করুন।`, 'success');
    } catch (error) {
      status(`ZIP তৈরি করা যায়নি: ${error.message || 'অজানা সমস্যা'}`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'প্রকাশনার ZIP তৈরি করুন ↓';
    }
  }
  async function downloadJsonBackup() {
    try {
      memory.drafts = await dbAction('readonly', 'getAll') || [];
      memory.published = await getPublishedContent();
      const all = [...memory.published.map(post => publicRecord(post)), ...memory.drafts.map(post => publicRecord(post))];
      downloadBlob(new Blob([JSON.stringify(all, null, 2)], { type: 'application/json;charset=utf-8' }), 'buddhist-heritage-content-backup.json');
      status('JSON ব্যাকআপ তৈরি হয়েছে। শুধু JSON ফাইলে আপলোড করা মিডিয়া অন্তর্ভুক্ত থাকে না—সেজন্য প্রকাশনার ZIP ব্যবহার করুন।', 'success');
    } catch (error) { status(`ব্যাকআপ তৈরি করা যায়নি: ${error.message}`, 'error'); }
  }
  async function importJson(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const records = Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : null;
      if (!records) throw new Error('JSON ফাইলে কনটেন্টের list পাওয়া যায়নি।');
      const existingDrafts = await dbAction('readonly', 'getAll') || [];
      const existingPublished = await getPublishedContent();
      const existing = new Set([...existingDrafts, ...existingPublished].map(post => post.id));
      let added = 0;
      for (const item of records) {
        if (!item || !item.title || existing.has(item.id)) continue;
        const post = publicRecord(item, item.mediaPath || '');
        post.mediaBlob = null;
        await dbAction('readwrite', 'put', post);
        added++;
      }
      await refresh();
      status(`${digits(added)}টি রেকর্ড খসড়া হিসেবে ইমপোর্ট হয়েছে। ZIP-এ mediaPath উল্লেখ থাকলেও সংশ্লিষ্ট media file GitHub-এ আছে কি না নিশ্চিত করুন।`, 'success');
    } catch (error) { status(`JSON ইমপোর্ট করা যায়নি: ${error.message}`, 'error'); }
    finally { byId('importContentJson').value = ''; }
  }
  function updateTypeHints() {
    const type = byId('contentType').value;
    const coordinateFields = byId('coordinateFields');
    coordinateFields.classList.toggle('coordinates-required', type === 'place');
    byId('contentLat').required = type === 'place';
    byId('contentLng').required = type === 'place';
    byId('contentMediaUrl').placeholder = type === 'video' ? 'YouTube বা সরাসরি ভিডিও URL' : type === 'audio' ? 'সরাসরি অডিও URL' : type === 'image' ? 'ছবির URL (ঐচ্ছিক)' : 'ছবি, সরাসরি ভিডিও/অডিও বা YouTube লিংক';
  }
  function init() {
    byId('contentForm')?.addEventListener('submit', saveDraft);
    byId('contentType')?.addEventListener('change', updateTypeHints);
    byId('contentForm')?.addEventListener('reset', () => setTimeout(updateTypeHints, 0));
    byId('contentFile')?.addEventListener('change', event => {
      const file = event.target.files[0];
      if (file && file.size > MAX_FILE_BYTES) {
        status('ফাইলটি ৩৫ MB-এর বেশি। একটি ছোট ফাইল বাছুন বা ভিডিও/অডিও লিংক ব্যবহার করুন।', 'error');
        event.target.value = '';
      } else if (file) status(`নির্বাচিত ফাইল: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`, 'info');
    });
    byId('exportContentPack')?.addEventListener('click', exportPackage);
    byId('downloadContentBackup')?.addEventListener('click', downloadJsonBackup);
    byId('importContentJson')?.addEventListener('change', event => importJson(event.target.files[0]));
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-delete-draft]');
      if (button) deleteDraft(button.dataset.deleteDraft).catch(error => status(error.message, 'error'));
    });
    updateTypeHints();
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
