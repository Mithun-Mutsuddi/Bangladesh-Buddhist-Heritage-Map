/* রাউন্ড ১৩ — উৎসব-আচারের সচল চিত্র (নিজস্ব আঁকা SVG + CSS অ্যানিমেশন)
   culture.js এন্ট্রি রেন্ডার করার পর mount() ডাকে; প্রতিটি <div data-anim="...">-এর
   ভেতরে একটি SVG বসে। কোনো বাইরের ছবি বা লাইব্রেরি লাগে না — সবই ইনলাইন ভেক্টর।
   ব্যবহারকারীর ‘কম অ্যানিমেশন’ সেটিং সম্মান করা হয় (culture-2026.css-এ prefers-reduced-motion)। */
(function () {
  'use strict';

  var BN = "'Noto Sans Bengali','Hind Siliguri',system-ui,sans-serif";

  function caption(t, dark) {
    if (dark) {
      return '<g><rect x="0" y="272" width="800" height="28" fill="#0b1220" opacity=".55"/>' +
        '<text x="20" y="291" font-family="' + BN + '" font-size="12.5" fill="#ffeec8">' + t + '</text></g>';
    }
    return '<text x="20" y="291" font-family="' + BN + '" font-size="12.5" fill="#5c4526">' + t + '</text>';
  }

  /* ---------- ১. কল্পতরু: শাখায় দানসামগ্রী ফুটে ওঠে ---------- */
  function kolpotoru() {
    var gifts = [
      [352, 74, '#c9532f', 'robe'], [420, 70, '#4b7bb5', 'pack'], [488, 78, '#2f7d32', 'pack'],
      [300, 96, '#e2a33a', 'circ'], [540, 100, '#8e5bb5', 'pack'], [332, 120, '#c9532f', 'circ'],
      [466, 124, '#4b7bb5', 'circ'], [398, 104, '#e2a33a', 'robe'], [276, 128, '#2f7d32', 'circ'],
      [556, 132, '#c9532f', 'pack']
    ].map(function (g, i) {
      var x = g[0], y = g[1], shape;
      if (g[3] === 'circ') shape = '<circle cx="0" cy="0" r="8" fill="' + g[2] + '" stroke="#7a3a1a" stroke-width="1"/>';
      else if (g[3] === 'pack') shape = '<rect x="-10" y="-7" width="20" height="15" rx="3" fill="' + g[2] + '"/>' +
        '<path d="M-10 -2 h20" stroke="#fff" stroke-width="1.4" opacity=".55"/>';
      else shape = '<path d="M-9 -6 h18 l-3 13 h-12 z" fill="' + g[2] + '"/><path d="M-4 -6 q4 -6 8 0" stroke="#7a3a1a" stroke-width="1.4" fill="none"/>';
      return '<g class="anim-pop" style="animation-delay:' + (i * 0.42).toFixed(2) + 's">' +
        '<line x1="' + x + '" y1="' + (y - 22) + '" x2="' + x + '" y2="' + (y - 7) + '" stroke="#8a6a3a" stroke-width="1.4"/>' +
        '<g transform="translate(' + x + ',' + y + ')">' + shape + '</g></g>';
    }).join('');
    var leaf = function (x, y, r) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="14" ry="7" fill="#3f8b45" opacity=".9" transform="rotate(' + r + ' ' + x + ' ' + y + ')"/>';
    };
    return '<svg viewBox="0 0 800 300" role="img" aria-label="কল্পতরু — শাখায় চীবর, খাবার ও দান-নোট ঝুলছে">' +
      '<defs><radialGradient id="kpg" cx=".5" cy="0" r=".95"><stop offset="0" stop-color="#fff6df"/><stop offset="1" stop-color="#f3ddb2"/></radialGradient></defs>' +
      '<rect width="800" height="300" fill="url(#kpg)"/>' +
      '<circle cx="700" cy="52" r="26" fill="#ffd479" class="anim-bob"/>' +
      '<path d="M0 268 q400 -18 800 0 v32 H0 z" fill="#e9d3a6" opacity=".55"/>' +
      /* মূল দণ্ড ও শাখা */
      '<g stroke="#8a6a3a" stroke-width="9" stroke-linecap="round" fill="none">' +
        '<path d="M400 262 V64"/>' +
        '<path d="M400 120 C360 104 330 100 300 96"/>' +
        '<path d="M400 120 C440 104 470 100 500 96"/>' +
        '<path d="M400 166 C356 154 320 150 282 146"/>' +
        '<path d="M400 166 C444 154 480 150 518 146"/>' +
        '<path d="M400 212 C364 204 334 200 306 198"/>' +
        '<path d="M400 212 C436 204 466 200 494 198"/>' +
      '</g>' +
      '<g stroke="#a5804e" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9">' +
        '<path d="M352 104 C346 92 348 84 352 74"/>' +
        '<path d="M452 104 C458 94 456 84 452 74"/>' +
        '<path d="M330 152 C326 142 328 134 332 120"/>' +
        '<path d="M474 152 C478 144 476 136 472 124"/>' +
      '</g>' +
      /* পাতা */
      [leaf(292, 90, -12), leaf(508, 90, 12), leaf(272, 140, -16), leaf(528, 140, 16),
       leaf(296, 192, -10), leaf(504, 192, 10), leaf(400, 56, 0)].join('') +
      gifts +
      /* গাঁদা-মালা */
      '<g fill="#e8a33a" opacity=".95">' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
          var a = -0.6 + i * 0.17;
          return '<circle cx="' + (400 + Math.sin(a) * 46) + '" cy="' + (150 + Math.cos(a) * 46) + '" r="4"/>';
        }).join('') +
      '</g>' +
      /* ভিত ও প্রদীপ */
      '<path d="M330 262 h140" stroke="#b07a34" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M348 262 l-18 26 M452 262 l18 26" stroke="#b07a34" stroke-width="6" stroke-linecap="round"/>' +
      '<g><ellipse cx="300" cy="272" rx="20" ry="9" fill="#c98a4a"/><ellipse cx="500" cy="272" rx="20" ry="9" fill="#c98a4a"/></g>' +
      '<g class="anim-flicker"><path d="M400 274 q-7 -14 0 -26 q7 12 0 26" fill="#f0a83a"/>' +
      '<circle cx="400" cy="262" r="13" fill="#f0a83a" opacity=".22"/></g>' +
      caption('কল্পতরু · শাখায় চীবর, খাদ্য ও দান-নোট ঝোলে — নিজস্ব অঙ্কন') +
      '</svg>';
  }

  /* ---------- ২. ড্রাগন মহারথ: চাকা ঘোরে, ফানুস ওঠে ---------- */
  function dragon() {
    var lanterns = '';
    for (var i = 0; i < 9; i++) {
      lanterns += '<g class="anim-up" style="animation-delay:' + (i * 0.75).toFixed(2) + 's">' +
        '<path d="M' + (50 + i * 84) + ' 60 l8 6 v14 l-8 6 l-8 -6 v-14 z" fill="#ffce6a"/>' +
        '<circle cx="' + (50 + i * 84) + '" cy="72" r="13" fill="#ffce6a" opacity=".16"/></g>';
    }
    var scale = '';
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 7; c++) {
        scale += '<circle cx="' + (300 + c * 26) + '" cy="' + (196 + r * 12) + '" r="7" fill="none" stroke="#ffd479" stroke-width="1.6" opacity="' + (0.55 - r * 0.12) + '"/>';
      }
    }
    return '<svg viewBox="0 0 800 300" role="img" aria-label="ড্রাগন আকৃতির মহারথ — চাকা ঘুরছে, প্রদীপ জ্বলছে, ফানুস উঠছে">' +
      '<defs><linearGradient id="dgn" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#16213d"/><stop offset=".62" stop-color="#33294f"/><stop offset="1" stop-color="#6b3f3a"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#dgn)"/>' +
      '<circle cx="716" cy="48" r="17" fill="#ffe9b5"/><circle cx="716" cy="48" r="30" fill="#ffe9b5" opacity=".1"/>' +
      lanterns +
      /* লেজ (আলাদা, দোলে) */
      '<g class="anim-bob">' +
        '<path d="M640 214 C690 206 706 168 676 148 C702 176 690 196 656 202" fill="none" stroke="#c9532f" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M676 148 l-6 -18 l16 8 z" fill="#e2c15c"/>' +
      '</g>' +
      /* দেহ */
      '<g class="anim-drive">' +
        '<path d="M300 232 C300 208 316 192 348 190 H604 C632 190 648 200 652 214 C648 230 632 238 604 238 H348 C318 238 300 240 300 232 z" fill="#c9532f" stroke="#8f3d08" stroke-width="2.5"/>' +
        scale +
        /* মাথা */
        '<path d="M300 236 C264 236 240 224 228 206 C222 196 224 186 232 182 C246 176 262 182 268 192 C276 184 292 182 302 188 C312 178 330 178 338 188 L336 226 C330 234 316 236 300 236 z" fill="#e07a3a" stroke="#8f3d08" stroke-width="2.5"/>' +
        '<path d="M232 182 C222 166 226 152 238 146 C236 160 240 170 250 176" fill="#e2c15c" stroke="#8f3d08" stroke-width="2"/>' +
        '<circle cx="262" cy="196" r="5" fill="#2a1f19"/><circle cx="263" cy="195" r="1.6" fill="#fff"/>' +
        '<path d="M228 206 q-16 6 -22 18 q16 -6 30 -6" fill="#e2c15c" stroke="#8f3d08" stroke-width="2"/>' +
        '<path d="M236 214 l4 10 M248 216 l3 10 M260 217 l3 9" stroke="#fff6df" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M246 208 q10 6 22 4" stroke="#8f3d08" stroke-width="1.6" fill="none"/>' +
        /* পিঠের কাঁটা */
        '<path d="M360 190 l-8 -18 l18 12 M396 188 l-6 -20 l16 14 M432 188 l-6 -20 l16 14 M468 190 l-6 -18 l16 12" fill="#e2c15c" stroke="#8f3d08" stroke-width="1.6"/>' +
      '</g>' +
      /* মণ্ডপ ও বুদ্ধ */
      '<g class="anim-drive">' +
        '<rect x="420" y="120" width="132" height="70" rx="4" fill="#f6e3bd" stroke="#b07a34" stroke-width="3"/>' +
        '<path d="M412 120 h148 l-18 -22 h-112 z" fill="#c9532f" stroke="#8f3d08" stroke-width="2.5"/>' +
        '<path d="M486 98 v-16" stroke="#e2c15c" stroke-width="4"/><circle cx="486" cy="78" r="5" fill="#e2c15c"/>' +
        '<circle cx="486" cy="152" r="15" fill="#e0a12e" stroke="#b07a34" stroke-width="2"/>' +
        '<rect x="466" y="166" width="40" height="10" rx="3" fill="#d9a04a"/>' +
        '<g fill="#ffce6a"><circle cx="436" cy="184" r="3.4"/><circle cx="458" cy="186" r="3.4"/><circle cx="514" cy="186" r="3.4"/><circle cx="536" cy="184" r="3.4"/></g>' +
      '</g>' +
      /* চাকা */
      '<g><circle cx="352" cy="242" r="23" fill="#3a2a1c" stroke="#8a6a3a" stroke-width="4"/>' +
        '<circle cx="560" cy="242" r="23" fill="#3a2a1c" stroke="#8a6a3a" stroke-width="4"/></g>' +
      '<g class="anim-wheel"><circle cx="352" cy="242" r="16" fill="none" stroke="#e2c15c" stroke-width="3" stroke-dasharray="5 7"/></g>' +
      '<g class="anim-wheel"><circle cx="560" cy="242" r="16" fill="none" stroke="#e2c15c" stroke-width="3" stroke-dasharray="5 7"/></g>' +
      '<path d="M0 272 h800" stroke="#e2c15c" stroke-width="2" opacity=".28"/>' +
      caption('মহারথ · ড্রাগন আকৃতি, মাঝে বুদ্ধমূর্তি, চারপাশে প্রদীপ — নিজস্ব অঙ্কন', true) +
      '</svg>';
  }

  /* ---------- ৩. কল্পজাহাজ: নদীতে জাহাজ দোলে, প্রদীপ ভাসে ---------- */
  function kolpojahaj() {
    var lamps = '';
    for (var i = 0; i < 10; i++) {
      lamps += '<g class="anim-drift" style="animation-delay:' + (i * 0.8).toFixed(1) + 's">' +
        '<ellipse cx="' + (40 + i * 46) + '" cy="' + (216 + (i % 3) * 12) + '" rx="4" ry="3" fill="#ffd479"/>' +
        '<circle cx="' + (40 + i * 46) + '" cy="' + (216 + (i % 3) * 12) + '" r="8" fill="#ffd479" opacity=".15"/></g>';
    }
    return '<svg viewBox="0 0 800 300" role="img" aria-label="নদীতে কল্পজাহাজ ভাসছে, প্রদীপ ভেসে যাচ্ছে, আকাশে ফানুস">' +
      '<defs><linearGradient id="riv" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1b2a4a"/><stop offset=".55" stop-color="#27476b"/><stop offset="1" stop-color="#0e1b30"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#riv)"/>' +
      '<circle cx="668" cy="56" r="24" fill="#fff2cc"/><circle cx="668" cy="56" r="38" fill="#fff2cc" opacity=".12"/>' +
      '<path d="M0 190 q120 -26 240 0 q120 26 240 0 q120 -26 320 0 v110 H0 z" fill="#12314d" opacity=".85"/>' +
      '<g class="anim-up" style="animation-delay:.2s"><ellipse cx="140" cy="96" rx="6" ry="8" fill="#ffce6a"/></g>' +
      '<g class="anim-up" style="animation-delay:1.4s"><ellipse cx="300" cy="80" rx="6" ry="8" fill="#ffce6a"/></g>' +
      '<g class="anim-up" style="animation-delay:2.6s"><ellipse cx="480" cy="100" rx="6" ry="8" fill="#ffce6a"/></g>' +
      '<g class="anim-bob">' +
        '<path d="M250 196 q70 34 140 0 l-16 26 q-54 20 -108 0 z" fill="#c9532f" stroke="#f0c06a" stroke-width="2"/>' +
        '<path d="M268 182 h104 l12 14 h-128 z" fill="#e9a94a" stroke="#8f3d08" stroke-width="2"/>' +
        '<line x1="320" y1="136" x2="320" y2="182" stroke="#e2c15c" stroke-width="4"/>' +
        '<path d="M320 140 l34 16 l-34 14 z" fill="#5aa0c0"/>' +
        '<rect x="304" y="158" width="32" height="24" rx="3" fill="#fff3d6" opacity=".9"/>' +
      '</g>' +
      '<g class="anim-bob" style="animation-delay:.9s">' +
        '<path d="M480 214 q50 24 100 0 l-12 20 q-38 14 -76 0 z" fill="#4b7bb5" stroke="#f0c06a" stroke-width="2"/>' +
        '<line x1="530" y1="178" x2="530" y2="214" stroke="#e2c15c" stroke-width="3"/>' +
        '<path d="M530 182 l24 12 l-24 10 z" fill="#a7d8e8"/>' +
      '</g>' +
      lamps +
      '<path d="M0 258 q100 -14 200 0 q100 14 200 0 q100 -14 200 0 q100 14 200 0" stroke="#7fb3d5" stroke-width="2" fill="none" opacity=".4" class="anim-wave"/>' +
      caption('কল্পজাহাজ ও প্রদীপ ভাসানো — নিজস্ব অঙ্কন', true) +
      '</svg>';
  }

  /* ---------- ৪. প্রদীপ ও ফানুস: শিখা কাঁপে, ফানুস ওঠে ---------- */
  function prodip() {
    var row = '';
    for (var i = 0; i < 11; i++) {
      var x = 120 + i * 48;
      row += '<g><path d="M' + (x - 10) + ' 240 q10 14 20 0 z" fill="#b07a34"/>' +
        '<g class="anim-flicker" style="animation-delay:' + (i * 0.23).toFixed(2) + 's">' +
        '<path d="M' + x + ' 232 q-7 -12 0 -22 q7 10 0 22" fill="#ffb347"/>' +
        '<circle cx="' + x + '" cy="222" r="10" fill="#ffb347" opacity=".2"/></g></g>';
    }
    return '<svg viewBox="0 0 800 300" role="img" aria-label="সারি সারি প্রদীপ জ্বলছে এবং ফানুস আকাশে উঠছে">' +
      '<defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#101b34"/><stop offset="1" stop-color="#3a2b46"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#night)"/>' +
      '<circle cx="640" cy="60" r="30" fill="#fff4d0"/><circle cx="640" cy="60" r="48" fill="#fff4d0" opacity=".1"/>' +
      '<g class="anim-up" style="animation-delay:0s"><path d="M200 150 l16 12 v26 l-16 12 l-16 -12 v-26 z" fill="#ffd479" opacity=".95"/></g>' +
      '<g class="anim-up" style="animation-delay:1.8s"><path d="M420 140 l16 12 v26 l-16 12 l-16 -12 v-26 z" fill="#ffe3a8" opacity=".95"/></g>' +
      '<g class="anim-up" style="animation-delay:3.4s"><path d="M540 160 l14 10 v22 l-14 10 l-14 -10 v-22 z" fill="#ffd479" opacity=".9"/></g>' +
      '<g stroke="#c8b48a" stroke-width="3" fill="none" opacity=".5"><path d="M60 246 h680"/></g>' +
      row +
      '<path d="M0 268 h800" stroke="#1b2a4a" stroke-width="16"/>' +
      caption('হাজার প্রদীপ ও আকাশ-প্রদীপ (ফানুস) — নিজস্ব অঙ্কন', true) +
      '</svg>';
  }

  /* ---------- ৫. জল খেলা: ছিটা জলের ফোঁটা ও ভেলা ---------- */
  function jol() {
    var drops = '';
    for (var i = 0; i < 14; i++) {
      var x = 200 + (i % 7) * 34 + (i > 6 ? 12 : 0);
      drops += '<circle class="anim-splash" style="animation-delay:' + (i * 0.28).toFixed(2) + 's" cx="' + x + '" cy="150" r="' + (3 + (i % 3)) + '" fill="#bfe6ff"/>';
    }
    return '<svg viewBox="0 0 800 300" role="img" aria-label="জল খেলায় জলের ছিটা উড়ছে, ফুলের ভেলা ভাসছে">' +
      '<defs><linearGradient id="day" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#eaf6ff"/><stop offset=".7" stop-color="#cfeaf7"/><stop offset="1" stop-color="#8fc3d8"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#day)"/>' +
      '<circle cx="128" cy="66" r="26" fill="#ffe08a"/>' +
      '<path d="M640 120 q30 -50 60 0 q-30 22 -60 0" fill="#7fb36b"/>' +
      drops +
      '<g class="anim-bob">' +
        '<path d="M320 200 q60 30 120 0 l-14 24 q-46 18 -92 0 z" fill="#5aa0c0" stroke="#2f6f8a" stroke-width="2"/>' +
        '<g fill="#e0788f"><circle cx="350" cy="196" r="6"/><circle cx="372" cy="190" r="6"/><circle cx="394" cy="196" r="6"/></g>' +
        '<g fill="#f2c94c"><circle cx="361" cy="188" r="5"/><circle cx="384" cy="188" r="5"/></g>' +
      '</g>' +
      '<g class="anim-bob" style="animation-delay:.7s">' +
        '<path d="M540 216 q44 22 88 0 l-10 18 q-34 14 -68 0 z" fill="#7bb9a0" stroke="#2f6f8a" stroke-width="2"/>' +
        '<g fill="#f2c94c"><circle cx="566" cy="212" r="5"/><circle cx="588" cy="212" r="5"/><circle cx="608" cy="212" r="5"/></g>' +
      '</g>' +
      '<path d="M0 236 q100 -16 200 0 q100 16 200 0 q100 -16 200 0 q100 16 200 0 v70 H0 z" fill="#6fb0c9" opacity=".7"/>' +
      '<path d="M0 258 q100 -12 200 0 q100 12 200 0 q100 -12 200 0 q100 12 200 0" stroke="#eaf6ff" stroke-width="2" fill="none" opacity=".7" class="anim-wave"/>' +
      caption('জল খেলা ও ফুলের ভেলা — নিজস্ব অঙ্কন') +
      '</svg>';
  }

  /* ---------- ৬. ফুল-প্রদীপ ভাসানো ---------- */
  function fulprodip() {
    var floats = '';
    for (var i = 0; i < 8; i++) {
      floats += '<g class="anim-drift" style="animation-delay:' + (i * 0.9).toFixed(1) + 's">' +
        '<path d="M' + (90 + i * 66) + ' ' + (206 + (i % 3) * 16) + ' q22 12 44 0 l-6 8 q-16 8 -32 0 z" fill="#5aa86b"/>' +
        '<g fill="#f2c94c"><circle cx="' + (112 + i * 66) + '" cy="' + (202 + (i % 3) * 16) + '" r="4"/></g>' +
        '<g fill="#e0788f"><circle cx="' + (104 + i * 66) + '" cy="' + (200 + (i % 3) * 16) + '" r="5"/><circle cx="' + (122 + i * 66) + '" cy="' + (201 + (i % 3) * 16) + '" r="5"/></g>' +
        '</g>';
    }
    return '<svg viewBox="0 0 800 300" role="img" aria-label="কলাপাতার ভেলায় ফুল ও প্রদীপ নদীতে ভেসে যাচ্ছে">' +
      '<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#20182e"/><stop offset=".5" stop-color="#3d2a44"/><stop offset="1" stop-color="#0f1524"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#dusk)"/>' +
      '<circle cx="150" cy="60" r="22" fill="#f7e6b8"/><circle cx="150" cy="60" r="34" fill="#f7e6b8" opacity=".12"/>' +
      floats +
      '<path d="M0 214 q100 -14 200 0 q100 14 200 0 q100 -14 200 0 q100 14 200 0" stroke="#8fa8c8" stroke-width="2" fill="none" opacity=".35" class="anim-wave"/>' +
      '<path d="M60 196 q14 -16 28 0 q-14 10 -28 0" fill="#f6d3a0" opacity=".25"/>' +
      caption('নদীতে ফুল ও প্রদীপ ভাসানো — নিজস্ব অঙ্কন', true) +
      '</svg>';
  }

  /* ---------- ৭. বাঁশ খেলা ---------- */
  function bash() {
    return '<svg viewBox="0 0 800 300" role="img" aria-label="দুই বাঁশ তালে বাজছে, মাঝখানে নর্তকী লাফাচ্ছেন">' +
      '<defs><linearGradient id="field" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#f7f1dd"/><stop offset="1" stop-color="#e8dcbf"/></linearGradient></defs>' +
      '<rect width="800" height="300" fill="url(#field)"/>' +
      '<circle cx="700" cy="58" r="24" fill="#ffe08a"/>' +
      '<g class="anim-snapL"><rect x="150" y="196" width="230" height="12" rx="6" fill="#c9a35c" stroke="#8a6a3a" stroke-width="2"/></g>' +
      '<g class="anim-snapR"><rect x="420" y="196" width="230" height="12" rx="6" fill="#c9a35c" stroke="#8a6a3a" stroke-width="2"/></g>' +
      '<g><rect x="150" y="222" width="230" height="12" rx="6" fill="#b8933f" stroke="#8a6a3a" stroke-width="2"/>' +
      '<rect x="420" y="222" width="230" height="12" rx="6" fill="#b8933f" stroke="#8a6a3a" stroke-width="2"/></g>' +
      '<g class="anim-hop">' +
        '<circle cx="400" cy="150" r="13" fill="#8a5a3a"/>' +
        '<path d="M400 163 v34" stroke="#8a5a3a" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M400 174 l-22 18 M400 174 l22 18" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M400 196 l-14 26 M400 196 l14 26" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M400 170 l-20 -10 M400 170 l20 -10" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M386 158 q14 -12 28 0 l-4 26 q-10 6 -20 0 z" fill="#c9532f"/>' +
      '</g>' +
      /* দুই প্রান্তে বসা খেলোয়াড়, হাতে বাঁশের মাথা */
      '<g>' +
        '<circle cx="120" cy="198" r="12" fill="#8a5a3a"/>' +
        '<path d="M120 210 q-14 10 -14 26 v18" stroke="#8a5a3a" stroke-width="8" stroke-linecap="round" fill="none"/>' +
        '<path d="M106 236 q14 8 28 0" stroke="#8a5a3a" stroke-width="7" fill="none"/>' +
        '<path d="M132 222 l22 6 M108 222 l14 8" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="680" cy="198" r="12" fill="#8a5a3a"/>' +
        '<path d="M680 210 q14 10 14 26 v18" stroke="#8a5a3a" stroke-width="8" stroke-linecap="round" fill="none"/>' +
        '<path d="M666 236 q14 8 28 0" stroke="#8a5a3a" stroke-width="7" fill="none"/>' +
        '<path d="M668 222 l-22 6 M692 222 l-14 8" stroke="#8a5a3a" stroke-width="6" stroke-linecap="round"/>' +
      '</g>' +
      '<g fill="none" stroke="#8a6a3a" stroke-width="2" opacity=".5">' +
        '<path d="M96 250 v-20 M144 250 v-20 M656 250 v-20 M704 250 v-20"/></g>' +
      '<g fill="#2f7d32" opacity=".55"><ellipse cx="80" cy="250" rx="40" ry="12"/><ellipse cx="720" cy="252" rx="46" ry="14"/></g>' +
      caption('বাঁশ খেলা · তালে তালে বাঁশ, মাঝখানে পা — নিজস্ব অঙ্কন') +
      '</svg>';
  }

  var T = {
    kolpotoru: kolpotoru, dragon: dragon, kolpojahaj: kolpojahaj,
    prodip: prodip, jol: jol, fulprodip: fulprodip, bash: bash
  };

  var mounted = 0;
  function mount(scope) {
    var box = scope || document;
    var nodes = box.querySelectorAll('.cul-anim[data-anim]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.getAttribute('data-done') === '1') continue;
      var fn = T[n.getAttribute('data-anim')];
      if (!fn) continue;
      n.innerHTML = fn();
      n.setAttribute('data-done', '1');
      mounted++;
    }
  }

  window.CultureFestAnim = { mount: mount, count: function () { return mounted; } };
})();
