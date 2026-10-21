/*!
 * photo-contribute.js
 * ১) data/heritage-photos.json থেকে সূত্রসহ (CC লাইসেন্স) আসল ছবি বসায়।
 * ২) ব্যবহারকারী/ভক্তদের নিজের তোলা ছবি যোগ করার ফর্ম দেয় — ছবি ব্রাউজারেই সংরক্ষিত হয়
 *    (localStorage), একটি "যোগাযোগ" লাইসেন্স-সম্মতি বাধ্যতামূলক, এবং "সব ছবি ডাউনলোড"
 *    বাটনে সম্পূর্ণ তালিকা JSON হিসেবে নামানো যায় যাতে অ্যাডমিন সাইটে যুক্ত করতে পারেন।
 */
(function () {
  'use strict';
  var KEY = 'bdHeritageCommunityPhotos.v1';
  var BN = '০১২৩৪৫৬৭৮৯';
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[+d]; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function store() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(obj) { try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) { alert('ছবি সংরক্ষণ করা যায়নি — ব্রাউজারের স্টোরেজ পূর্ণ হতে পারে।'); } }

  /* ---------- ১) সূত্রসহ ছবি ---------- */
  async function loadCurated() {
    try {
      var res = await fetch(new URL('data/heritage-photos.json', document.baseURI), { cache: 'force-cache' });
      if (!res.ok) return;
      var data = await res.json();
      var photos = data.photos || {};
      var list = window.destinations || [];
      var n = 0;
      list.forEach(function (p) {
        var hit = photos[String(p.id)];
        if (!hit || !hit.image) return;
        if (p.customImageUrl && p.customImageUrl.indexOf('assets/categories') === -1) return;
        p.customImageUrl = hit.image;
        p.source = hit.creditUrl || hit.image;
        p.sourceLabel = 'ছবি: ' + (hit.credit || 'Wikimedia Commons');
        p.photoLicense = hit.credit || '';
        n++;
      });
      window.__heritagePhotos = { curated: n };
      if (n && typeof window.renderPlaces === 'function') window.renderPlaces();
      console.info('সূত্রসহ ছবি যোগ হয়েছে', n);
    } catch (e) { console.warn('ছবির তালিকা লোড হয়নি', e); }
  }

  /* ---------- ২) ব্যবহারকারীর ছবি ---------- */
  function fileToDataUrl(file, maxSide, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { cb(null); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function panel(place) {
    var all = store();
    var mine = (all[place.id] || []);
    var wall = mine.length ? '<div class="community-photo-wall">' + mine.map(function (ph, i) {
      return '<figure class="community-photo"><img src="' + ph.data + '" alt="' + esc(place.name) + ' — কমিউনিটি ছবি" loading="lazy">' +
        '<figcaption><span>' + esc(ph.author || 'নামহীন') + '</span>' +
        (ph.license ? ' · ' + esc(ph.license) : '') +
        ' <button type="button" class="cp-remove" data-i="' + i + '">মুছুন</button></figcaption></figure>';
    }).join('') + '</div>' : '<p class="cp-empty">এই স্থানের কোনো কমিউনিটি ছবি এখনো যোগ হয়নি।</p>';
    return '<section class="photo-contribute" id="photoContribute">' +
      '<h3>📷 ছবি যোগ করুন</h3>' +
      '<p class="cp-note">আপনার তোলা ছবি এই ব্রাউজারে সংরক্ষিত থাকে (সার্ভারে আপলোড হয় না)। ছবির মালিক আপনি না হলে বা অনুমতি না থাকলে যোগ করবেন না।</p>' +
      wall +
      '<form class="cp-form">' +
      '<label>আপনার নাম <input type="text" name="author" required maxlength="60" placeholder="যেমন: মিথুন বড়ুয়া"></label>' +
      '<label>ছবি (JPG/PNG, সর্বোচ্চ ৫ MB) <input type="file" name="photo" accept="image/*" required></label>' +
      '<label>লাইসেন্স <select name="license"><option value="CC BY-SA 4.0">CC BY-SA 4.0 (অন্যরা ব্যবহার করতে পারবে, নামসহ)</option>' +
      '<option value="CC BY 4.0">CC BY 4.0</option><option value="সর্বস্বত্ব সংরক্ষিত">সর্বস্বত্ব সংরক্ষিত (শুধু এই সাইটে)</option></select></label>' +
      '<label class="cp-check"><input type="checkbox" name="consent" required> আমি নিশ্চিত করছি এই ছবিটি আমার তোলা অথবা ব্যবহারের অনুমতি আছে।</label>' +
      '<div class="cp-actions"><button type="submit" class="btn btn-primary">ছবি যোগ করুন</button>' +
      '<button type="button" class="btn btn-ghost cp-export">সব কমিউনিটি ছবি ডাউনলোড (JSON)</button></div>' +
      '<p class="cp-status" role="status"></p>' +
      '</form></section>';
  }

  function bindPanel(place, root) {
    var form = root.querySelector('.cp-form');
    if (!form) return;
    root.querySelectorAll('.cp-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var all = store(); var list = all[place.id] || [];
        list.splice(+btn.dataset.i, 1);
        if (list.length) all[place.id] = list; else delete all[place.id];
        save(all); refresh(place);
      });
    });
    var exportBtn = root.querySelector('.cp-export');
    if (exportBtn) exportBtn.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(store(), null, 1)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'community-photos.json';
      a.click(); URL.revokeObjectURL(a.href);
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = form.querySelector('.cp-status');
      var file = form.photo.files && form.photo.files[0];
      if (!file) { status.textContent = 'ছবি বেছে নিন।'; return; }
      if (file.size > 5 * 1024 * 1024) { status.textContent = 'ছবিটি ৫ MB-এর বেশি — ছোট ছবি দিন।'; return; }
      status.textContent = 'সংরক্ষণ হচ্ছে…';
      fileToDataUrl(file, 1200, function (data) {
        if (!data) { status.textContent = 'ছবিটি পড়া যায়নি।'; return; }
        var all = store();
        (all[place.id] = all[place.id] || []).push({
          author: form.author.value.trim(), license: form.license.value,
          data: data, placeName: place.name, district: place.district || '',
          addedAt: new Date().toISOString().slice(0, 10)
        });
        save(all);
        refresh(place);
        var st = document.querySelector('#photoContribute .cp-status');
        if (st) st.textContent = '✔ ছবি যোগ হয়েছে। ধন্যবাদ!';
      });
    });
  }

  function refresh(place) {
    var host = document.getElementById('photoContribute');
    if (!host) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = panel(place);
    var fresh = wrap.firstElementChild;
    host.replaceWith(fresh);
    bindPanel(place, fresh);
  }

  function inject() {
    var detail = document.getElementById('placeDetail');
    if (!detail || !window.currentPlace) return;
    if (document.getElementById('photoContribute')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = panel(window.currentPlace);
    var node = wrap.firstElementChild;
    var anchor = detail.querySelector('.detail-contact') || detail.querySelector('.detail-history') || detail.lastElementChild;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(node, anchor.nextSibling);
    else detail.appendChild(node);
    bindPanel(window.currentPlace, node);
  }

  async function run() {
    await loadCurated();
    document.addEventListener('heritage-detail-rendered', inject);
    document.addEventListener('bihar-additions-ready', inject);
    setTimeout(inject, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
