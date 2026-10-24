/* চর্যাভূমি — শ্রদ্ধাদান, শপ, আইনি ও জাদুঘর ডেস্ক (§১০, §৭)
   নিরাপত্তা-নীতি: verified=true ও methods থাকলেই শুধু নম্বর দেখাবে। */
(function () {
  'use strict';
  if (!window.MX) return;
  MX.trackLocal('support.html');

  var CFG = null, RES = null, atlasSites = [];
  var INTENT_KEY = 'cb.donations.intent.v1', CART_KEY = 'cb.shop.cart.v1', RED_KEY = 'cb.fieldreports.v1';

  function methodLabel(key) {
    var f = (CFG.methods_info || []).filter(function (m) { return m.key === key; })[0];
    return f ? f.label_bn : key;
  }

  function renderDonateCard() {
    var id = MX.$('donateSite').value;
    var entry = (CFG.sites || []).filter(function (s) { return s.site_id === id; })[0];
    var box = MX.$('donateCard');
    var selEl = MX.$('donateSite');
    var siteName = entry ? entry.site_name_bn : (selEl.options[selEl.selectedIndex] ? selEl.options[selEl.selectedIndex].text : id);
    if (!entry) {
      box.innerHTML = '<div class="mx-note"><b>' + MX.esc(siteName) + ':</b> এই স্থানের যাচাইকৃত দান-তথ্য সাইটে এখনো যোগ হয়নি। দান করতে চাইলে বিহার কর্তৃপক্ষের সঙ্গে সরাসরি (কার্টাজে গিয়ে বা অফিসিয়াল যোগাযোগে) মাধ্যম জেনে নিন। ইন্টারনেটে পাওয়া কোনো নম্বরে যাচাই ছাড়া টাকা পাঠাবেন না। <a href="index.html#explore">ড্যাশবোর্ডে এই বিহার খুঁজুন →</a></div>';
      return;
    }
    if (entry.verified && entry.methods && entry.methods.length) {
      box.innerHTML = '<article class="mx-card" style="border:2px solid var(--cb-gold)">' +
        '<span class="mx-badge green">✓ যাচাইকৃত (' + MX.esc(entry.verified_at || '') + ')</span>' +
        '<h3>🙏 ' + MX.esc(entry.site_name_bn) + '</h3>' +
        entry.methods.map(function (m) {
          return '<p><b>' + MX.esc(methodLabel(m.key)) + ':</b> ' + (m.account_name ? MX.esc(m.account_name) + '<br>' : '') +
            '<span class="mx-donate-num">' + MX.esc(m.number) + '</span> ' +
            '<button type="button" class="cb-btn sm" data-copy-num="' + MX.esc(m.number) + '">📋 নম্বর কপি</button>' +
            (m.branch ? '<br><span class="mx-meta">' + MX.esc(m.branch) + '</span>' : '') + '</p>';
        }).join('') +
        (entry.note_bn ? '<p>' + MX.esc(entry.note_bn) + '</p>' : '') +
        '<p class="mx-mini">পাঠানোর আগে বিহারের অফিসে ফোনে নম্বরটি আবার মিলিয়ে নিন।</p></article>';
      box.querySelectorAll('[data-copy-num]').forEach(function (b) {
        b.addEventListener('click', function () { MX.copyText(b.dataset.copyNum, 'নম্বর কপি হয়েছে — নিজের পেমেন্ট অ্যাপে নাম মিলিয়ে পাঠান'); });
      });
    } else {
      box.innerHTML = '<div class="mx-note"><b>' + MX.esc(entry.site_name_bn) + ':</b> ' + MX.esc(entry.note_bn || 'যাচাইকৃত মাধ্যম এখনো যোগ হয়নি।') +
        '<br><span class="mx-mini">সাইট-মালিকের জন্য: প্রতিষ্ঠানের লিখিত অনুমতিতে নম্বর পেলে data/support-config.json-এ verified=true দিয়ে যোগ করুন।</span></div>';
    }
  }

  function renderIntents() {
    var list = MX.getLocal(INTENT_KEY, []);
    MX.$('intentList').innerHTML = list.length
      ? '<ul>' + list.map(function (x, i) {
          return '<li>' + MX.esc(x.date) + ' · ' + MX.esc(x.site) + ' · ' + MX.money(x.amount) + ' · ' + MX.esc(x.method) + (x.purpose ? ' · ' + MX.esc(x.purpose) : '') +
            ' <button type="button" class="cb-mini-btn" data-del-intent="' + i + '">মুছুন</button></li>';
        }).join('') + '</ul><p class="mx-mini">মোট রেকর্ডকৃত ইচ্ছা: ' + MX.money(list.reduce(function (a, x) { return a + (+x.amount || 0); }, 0)) + ' (শুধু নিজের ডায়েরি)</p>'
      : '';
    document.querySelectorAll('[data-del-intent]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = MX.getLocal(INTENT_KEY, []); l.splice(+b.dataset.delIntent, 1); MX.setLocal(INTENT_KEY, l); renderIntents();
      });
    });
  }

  function renderCart() {
    var cart = MX.getLocal(CART_KEY, []);
    var items = CFG.shop.items || [];
    var total = 0, hasPriced = false;
    MX.$('cartList').innerHTML = cart.length ? '<ul>' + cart.map(function (id) {
      var it = items.filter(function (x) { return x.id === id; })[0];
      if (!it) return '';
      if (it.price_bdt) { total += it.price_bdt; hasPriced = true; }
      return '<li>' + MX.esc(it.name_bn) + ' — ' + (it.price_bdt == null ? 'দাম ঘোষণা বাকি' : MX.money(it.price_bdt)) + '</li>';
    }).join('') + '</ul>' + (hasPriced ? '<p>মোট (নির্ধারিত মূল্যের পণ্যের): ' + MX.money(total) + '</p>' : '') +
      '<p class="mx-mini">ডেমো: এখানে পেমেন্ট/চেকআউট হয় না। ফ্রি উপকরণগুলোর কার্ড থেকেই ডাউনলোড/প্রিন্ট করতে পারবেন।</p>'
      : '<p class="mx-meta">তালিকা খালি — কার্ড থেকে “আগ্রহী” বোতামে যোগ করুন।</p>';
  }

  function renderRed() {
    var list = MX.getLocal(RED_KEY, []);
    MX.$('redList').innerHTML = list.length ? '<h4>সংরক্ষিত খসড়া (' + MX.bn(list.length) + 'টি)</h4><ul>' + list.map(function (r, i) {
      return '<li><b>' + MX.esc(r.site_id) + '</b> · ' + MX.esc(r.type) + ' · ' + MX.esc(r.date_observed) + ' · মাত্রা: ' + MX.esc(r.level) +
        ' <button type="button" class="cb-mini-btn" data-del-red="' + i + '">মুছুন</button><br><span class="mx-meta">' + MX.esc(r.description.slice(0, 140)) + '…</span></li>';
    }).join('') + '</ul>' : '';
    document.querySelectorAll('[data-del-red]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = MX.getLocal(RED_KEY, []); l.splice(+b.dataset.delRed, 1); MX.setLocal(RED_KEY, l); renderRed();
      });
    });
  }

  Promise.all([
    MX.fetchJson('data/support-config.json?v=20261024g'),
    MX.fetchJson('data/research-plus.json?v=20261024g'),
    MX.fetchJson('data/atlas-sites.json?v=20261024g')
  ]).then(function (res) {
    CFG = res[0]; RES = res[1]; atlasSites = res[2].sites || [];

    /* সতর্কতা */
    MX.$('donateWarnings').innerHTML = '<div class="mx-warn"><h3 style="margin-top:0">⚠️ টাকা পাঠানোর আগে অবশ্যই পড়ুন</h3><ul style="margin:0">' +
      CFG.security_warnings.map(function (w) { return '<li>' + MX.esc(w) + '</li>'; }).join('') + '</ul></div>';

    /* স্থান তালিকা: config-এ থাকা + Atlas স্থান */
    var opts = [];
    (CFG.sites || []).forEach(function (s) { opts.push([s.site_id, s.site_name_bn]); });
    atlasSites.forEach(function (s) { if (!opts.some(function (o) { return o[0] === s.id; })) opts.push([s.id, s.name.bn]); });
    MX.$('donateSite').innerHTML = opts.map(function (o) { return '<option value="' + MX.esc(o[0]) + '">' + MX.esc(o[1]) + '</option>'; }).join('');
    var params = new URLSearchParams(location.search);
    var wanted = params.get('site');
    if (wanted && !opts.some(function (o) { return o[0] === wanted; })) {
      var nm = params.get('name') || wanted;
      opts.unshift([wanted, nm + ' (কার্ড থেকে এসেছেন)']);
      MX.$('donateSite').innerHTML = opts.map(function (o) { return '<option value="' + MX.esc(o[0]) + '">' + MX.esc(o[1]) + '</option>'; }).join('');
    }
    if (wanted && opts.some(function (o) { return o[0] === wanted; })) MX.$('donateSite').value = wanted;
    MX.$('donateSite').addEventListener('change', renderDonateCard);
    renderDonateCard();

    /* মাধ্যমের ব্যবহারবিধি */
    MX.$('donateMethodsInfo').innerHTML = '<div class="mx-grid">' + CFG.methods_info.map(function (m) {
      return '<article class="mx-card"><h3>' + MX.esc(m.label_bn) + '</h3><p>' + MX.esc(m.how_bn) + '</p></article>';
    }).join('') + '</div>';

    /* ফান্ড */
    var F = CFG.site_fund;
    MX.$('fundInfo').innerHTML = '<article class="mx-card"><h3>' + MX.esc(F.name_bn) + '</h3><p>' + MX.esc(F.goal_bn) + '</p><p>' + MX.esc(F.transparency_bn) + '</p>' +
      '<p><b>বর্তমান অবস্থা:</b> ' + (F.methods && F.methods.length ? 'সক্রিয় মাধ্যম আছে' : 'কোনো পেমেন্ট মাধ্যম সক্রিয় নেই — সাইটটি আপাতত সম্পূর্ণ স্বেচ্ছাসেবায় চলছে।') + '</p></article>';

    /* শপ */
    MX.$('shopStatus').innerHTML = '<div class="mx-note">' + MX.esc(CFG.shop.status_bn) + '</div>';
    MX.$('shopGrid').innerHTML = CFG.shop.items.map(function (it) {
      return '<article class="mx-card"><span class="mx-badge gold">' + MX.esc(it.kind) + '</span>' +
        '<h3>' + MX.esc(it.name_bn) + '</h3><p>' + MX.esc(it.note) + '</p>' +
        '<p><b>' + (it.price_bdt == null ? 'মূল্য: ঘোষণা বাকি' : (it.price_bdt === 0 ? 'মূল্য: ফ্রি' : 'মূল্য: ' + MX.money(it.price_bdt))) + '</b></p>' +
        '<div class="mx-btns"><a class="cb-btn sm" href="' + MX.esc(it.link) + '">দেখুন/নিন →</a>' +
        '<button type="button" class="cb-btn sm ghost" data-cart-add="' + MX.esc(it.id) + '">🧺 আগ্রহী</button></div></article>';
    }).join('');
    document.querySelectorAll('[data-cart-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var cart = MX.getLocal(CART_KEY, []);
        if (cart.indexOf(b.dataset.cartAdd) < 0) cart.push(b.dataset.cartAdd);
        MX.setLocal(CART_KEY, cart); renderCart(); MX.toast('আগ্রহের তালিকায় যোগ হয়েছে');
      });
    });
    renderCart();

    /* স্পন্সর */
    var SP = CFG.sponsor_policy;
    MX.$('sponsorInfo').innerHTML = '<article class="mx-card"><span class="mx-badge ' + (SP.enabled ? 'green' : 'red') + '">' + (SP.enabled ? 'চালু' : 'বর্তমানে বন্ধ') + '</span><p>' + MX.esc(SP.policy_bn) + '</p>' +
      ((SP.slots || []).length ? SP.slots.map(function (s) { return '<div class="mx-note"><b>স্পন্সরড:</b> ' + MX.esc(s) + '</div>'; }).join('') : '<p class="mx-meta">কোনো সক্রিয় ব্যানার স্লট নেই।</p>') + '</article>';

    /* আইনি */
    var L = RES.legal_framework;
    MX.$('legalInfo').innerHTML = '<div class="mx-note">' + MX.esc(L.note_bn) + '</div>' +
      '<div class="mx-grid">' + L.acts.map(function (a) {
        return '<article class="mx-card"><h3>⚖️ ' + MX.esc(a.name) + '</h3><p>' + MX.esc(a.desc) + '</p></article>';
      }).join('') + '</div>' +
      '<h3>গেজেট-রেকর্ডে যা যা থাকা দরকার (স্থানপ্রতি চেকলিস্ট)</h3><div class="mx-scroll"><table class="mx-table"><thead><tr><th>তথ্যঘর</th><th>বর্তমান অবস্থা</th></tr></thead><tbody>' +
      L.fields.map(function (f) { return '<tr><td>' + MX.esc(f) + '</td><td><span class="mx-badge red">সংগ্রহাধীন — DoA থেকে যাচাই করুন</span></td></tr>'; }).join('') +
      '</tbody></table></div>';
    MX.$('redlistIntro').innerHTML = '<div class="mx-note">' + MX.esc(L.redlist_intro) + '</div>';

    MX.$('siteLegalTable').innerHTML = '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>স্থান</th><th>আইনি অবস্থা (Atlas)</th><th>UNESCO অবস্থা</th><th>কর্তৃপক্ষ</th></tr></thead><tbody>' +
      atlasSites.map(function (s) {
        return '<tr><td><b>' + MX.esc(s.name.bn) + '</b></td><td>' + MX.esc((s.legal && s.legal.bn) || '—') + '</td><td>' + MX.esc((s.unesco && s.unesco.bn) || '—') + '</td><td>' + MX.esc((s.authority && s.authority.bn) || '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    MX.$('redSite').innerHTML = atlasSites.map(function (s) { return '<option value="' + MX.esc(s.id) + '">' + MX.esc(s.name.bn) + '</option>'; }).join('') + '<option value="other">অন্যান্য / তালিকায় নেই</option>';
    renderRed();

    /* জাদুঘর */
    MX.$('museumGrid').innerHTML = RES.museums.map(function (m) {
      return '<article class="mx-card"><h3>🏛️ ' + MX.esc(m.name_bn) + '</h3><p><b>যা আছে:</b> ' + MX.esc(m.holds) + '</p>' +
        '<p class="mx-meta">ক্যাটালগ সম্পর্কে: ' + MX.esc(m.catalog_note) + '</p>' +
        '<div class="mx-btns"><a class="cb-btn sm ghost" target="_blank" rel="noopener" href="' + MX.esc(m.url) + '">জাদুঘরের তথ্য ↗</a></div></article>';
    }).join('');
    MX.$('siteMuseumTable').innerHTML = '<div class="mx-scroll"><table class="mx-table"><thead><tr><th>প্রত্নস্থল</th><th>প্রাপ্ত নিদর্শন কোথায় (Atlas রেকর্ড)</th><th>উল্লেখ্য প্রাপ্তি</th></tr></thead><tbody>' +
      atlasSites.map(function (s) {
        var mus = (s.museums || []).map(function (m) { return MX.esc(m.bn || m); }).join('<br>');
        var finds = (s.finds || []).slice(0, 3).map(function (f) { return MX.esc(f.bn || f); }).join(' · ');
        return '<tr><td><b>' + MX.esc(s.name.bn) + '</b></td><td>' + mus + '<br><span class="mx-meta">অ্যাকসেশন/ক্যাটালগ নম্বর: জাদুঘরে যাচাই করুন (বসানো হয়নি)</span></td><td>' + finds + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }).catch(function () {
    MX.$('donateWarnings').innerHTML = '<p class="mx-meta">তথ্য লোড হয়নি।</p>';
  });

  /* ইচ্ছা-রেকর্ড ফর্ম */
  MX.$('intentForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var amt = parseFloat(MX.$('intentAmount').value);
    if (!amt || amt <= 0) { MX.toast('পরিমাণ লিখুন'); return; }
    var sel = MX.$('donateSite');
    var list = MX.getLocal(INTENT_KEY, []);
    list.unshift({
      date: new Date().toISOString().slice(0, 10),
      site: sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : sel.value,
      site_id: sel.value, amount: amt,
      method: MX.$('intentMethod').value,
      purpose: MX.$('intentPurpose').value.trim().slice(0, 80)
    });
    MX.setLocal(INTENT_KEY, list.slice(0, 100));
    renderIntents();
    MX.toast('রেকর্ড করা হয়েছে — এবার নিজের পেমেন্ট অ্যাপ থেকে যাচাইকৃত নম্বরে পাঠান');
  });
  renderIntents();

  /* কার্ট */
  MX.$('cartExport').addEventListener('click', function () {
    MX.download('my-shop-interest.json', JSON.stringify(MX.getLocal(CART_KEY, []), null, 2), 'application/json');
  });
  MX.$('cartClear').addEventListener('click', function () { MX.setLocal(CART_KEY, []); renderCart(); });

  /* রেড-লিস্ট ফর্ম */
  MX.$('redForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!MX.$('redConsent').checked) { MX.toast('আগে সম্মতির ঘরে টিক দিন'); return; }
    var text = MX.$('redText').value.trim();
    if (text.length < 20) { MX.toast('পর্যবেক্ষণ একটু বিস্তারিত লিখুন (কমপক্ষে ২০ অক্ষর)'); return; }
    var list = MX.getLocal(RED_KEY, []);
    list.unshift({
      site_id: MX.$('redSite').value, type: MX.$('redType').value,
      date_observed: MX.$('redDate').value || new Date().toISOString().slice(0, 10),
      level: MX.$('redLevel').value, description: text.slice(0, 1200),
      created_at: new Date().toISOString(), status: 'draft-local',
      note: 'Website draft only — submit to Department of Archaeology / local administration. Call 999 for emergencies.'
    });
    MX.setLocal(RED_KEY, list.slice(0, 100));
    MX.$('redText').value = ''; MX.$('redConsent').checked = false;
    renderRed();
    MX.toast('খসড়া সংরক্ষিত — JSON এক্সপোর্ট করে DoA-তে জমা দিন; জরুরি ক্ষতি হলে ৯৯৯');
  });
  MX.$('redExport').addEventListener('click', function () {
    MX.download('field-reports-redlist.json', JSON.stringify({ exported_at: new Date().toISOString(), reports: MX.getLocal(RED_KEY, []) }, null, 2), 'application/json');
  });
})();
