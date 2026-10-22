/* চর্যাভূমি — “দর্শন চিত্রে ও চার্টে” (philosophy.html-এর ভেতরে)
   ডেটা: data/darshan.json
   নকশা: টপিকভিত্তিক ইনলাইন SVG/HTML ডায়াগ্রাম; কোনো বাইরের ছবি বা লাইব্রেরি নেই।
   নোড/ধাপ/বারে ক্লিক বা কীবোর্ডে Enter/Space দিলে ব্যাখ্যা-প্যানেল বদলায়।
   অ্যানিমেশন কেবল সাজসজ্জামূলক; prefers-reduced-motion থাকলে CSS-এ বন্ধ থাকে। */
(function () {
  'use strict';

  var DATA = 'data/darshan.json?v=20261022d1';
  var NODES = {};       /* vizId -> {nodes, idx, timer, playing} */
  var started = false;
  var loaded = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>\"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function bn(n) {
    return Number(n).toLocaleString('bn-BD', { maximumFractionDigits: 0 });
  }
  function isExternal(u) { return /^https?:\/\//i.test(u || ''); }
  function polar(cx, cy, r, deg) {
    var rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function nodeInfoHtml(node, idx) {
    return '<p class="cb-d-info-kicker">ধাপ ' + bn(idx + 1) +
      (node.s ? ' · ' + esc(node.s) : '') + '</p>' +
      '<h4>' + esc(node.n) + (node.p ? ' <span>' + esc(node.p) + '</span>' : '') + '</h4>' +
      '<p>' + esc(node.d || '') + '</p>';
  }

  function registerNodes(viz, vizId) {
    if (viz && viz.nodes && viz.nodes.length) {
      NODES[vizId] = { nodes: viz.nodes, idx: 0, timer: null, playing: false };
    }
  }

  function infoPanel(viz, vizId) {
    if (!viz.nodes || !viz.nodes.length) return '';
    return '<div class="cb-d-info" id="' + esc(vizId) + '-info" aria-live="polite">' +
      nodeInfoHtml(viz.nodes[0], 0) + '</div>';
  }

  function wheelSvg(viz, vizId) {
    var cx = 380, cy = 380, ringR = 272;
    var arrows = '';
    var nodes = '';
    viz.nodes.forEach(function (node, i) {
      var angle = i * 360 / viz.nodes.length;
      var p = polar(cx, cy, ringR, angle);
      var mid = polar(cx, cy, ringR, angle + 180 / viz.nodes.length);
      arrows += '<path class="cb-d-wheel-arrow" transform="translate(' +
        mid.x.toFixed(1) + ' ' + mid.y.toFixed(1) + ') rotate(' +
        (angle + 180 / viz.nodes.length).toFixed(1) +
        ')" d="M -8 -11 L 12 0 L -8 11 Z"></path>';
      var labelSize = String(node.n).length > 8 ? 18 : 21;
      nodes += '<g class="cb-d-wheel-node g' + Number(node.g || 0) +
        (i === 0 ? ' is-active' : '') +
        '" data-d-node data-viz="' + esc(vizId) + '" data-idx="' + i +
        '" tabindex="0" role="button" aria-pressed="' + (i === 0 ? 'true' : 'false') +
        '" aria-label="' + esc((i + 1) + '. ' + node.n + ' — ব্যাখ্যা দেখুন') + '">' +
        '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="58"></circle>' +
        '<text class="cb-d-wheel-num" x="' + p.x.toFixed(1) + '" y="' + (p.y - 10).toFixed(1) + '">' + bn(i + 1) + '</text>' +
        '<text class="cb-d-wheel-label" x="' + p.x.toFixed(1) + '" y="' + (p.y + 20).toFixed(1) +
        '" font-size="' + labelSize + '">' + esc(node.n) + '</text>' +
        '</g>';
    });
    return '<svg class="cb-d-wheel-svg" viewBox="0 0 760 760" role="group" aria-label="বারো নিদানের বৃত্তাকার ভবচক্র ডায়াগ্রাম">' +
      '<circle class="cb-d-wheel-outer" cx="380" cy="380" r="352"></circle>' +
      '<circle class="cb-d-wheel-spin" cx="380" cy="380" r="330"></circle>' +
      '<circle class="cb-d-wheel-ring" cx="380" cy="380" r="272"></circle>' +
      arrows +
      '<circle class="cb-d-wheel-center" cx="380" cy="380" r="132"></circle>' +
      '<text class="cb-d-wheel-center-kicker" x="380" y="326">তিন অকুশলমূল</text>' +
      '<text class="cb-d-wheel-center-main" x="380" y="374">লোভ · দ্বেষ · মোহ</text>' +
      '<text class="cb-d-wheel-center-sub" x="380" y="414">শর্ত থাকলে দুঃখ ওঠে</text>' +
      '<text class="cb-d-wheel-center-sub" x="380" y="442">শর্ত থামলে দুঃখ থামে</text>' +
      nodes + '</svg>';
  }

  function flowHtml(viz, vizId, kind) {
    return '<div class="cb-d-flow ' + esc(kind || '') + '">' + viz.nodes.map(function (node, i) {
      return '<button type="button" class="cb-d-node' + (i === 0 ? ' is-active' : '') +
        '" data-d-node data-viz="' + esc(vizId) + '" data-idx="' + i +
        '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
        '<span class="cb-d-node-num">' + bn(i + 1) + '</span>' +
        '<strong>' + esc(node.n) + '</strong>' +
        (node.p ? '<small>' + esc(node.p) + '</small>' : '') +
        (node.s ? '<em>' + esc(node.s) + '</em>' : '') +
        '</button>';
    }).join('') + '</div>';
  }

  function barsHtml(viz, vizId) {
    var max = 1;
    viz.nodes.forEach(function (node) { max = Math.max(max, Number(node.v || 0)); });
    return '<div class="cb-d-bars">' + viz.nodes.map(function (node, i) {
      var pct = Math.max(4, Math.round(Number(node.v || 0) * 100 / max));
      return '<button type="button" class="cb-d-bar' + (i === 0 ? ' is-active' : '') +
        '" data-d-node data-viz="' + esc(vizId) + '" data-idx="' + i +
        '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
        '<span class="cb-d-bar-label"><strong>' + esc(node.n) + '</strong>' +
        (node.p ? '<small>' + esc(node.p) + '</small>' : '') + '</span>' +
        '<span class="cb-d-bar-track"><i style="--w:' + pct + '%"></i></span>' +
        '<b>' + bn(node.v || 0) + '</b></button>';
    }).join('') + '</div>';
  }

  function planesHtml(viz) {
    return '<div class="cb-d-planes">' + (viz.groups || []).map(function (g, gi) {
      return '<section class="cb-d-plane-group p' + gi + '">' +
        '<h4>' + esc(g.title) + '</h4>' +
        (g.subtitle ? '<p>' + esc(g.subtitle) + '</p>' : '') +
        '<ol>' + (g.items || []).map(function (x) {
          var human = String(x.n || '').indexOf('মনুস্স') !== -1;
          return '<li' + (human ? ' class="is-human"' : '') + '><strong>' + esc(x.n) + '</strong>' +
            (x.p ? '<span>' + esc(x.p) + '</span>' : '') +
            (x.s ? '<small>' + esc(x.s) + '</small>' : '') + '</li>';
        }).join('') + '</ol></section>';
    }).join('') + '</div>';
  }

  function treeHtml(viz) {
    return '<div class="cb-d-tree">' + (viz.groups || []).map(function (g) {
      return '<section class="cb-d-tree-col"><h4>' + esc(g.title) + '</h4>' +
        (g.subtitle ? '<p class="cb-d-tree-sub">' + esc(g.subtitle) + '</p>' : '') +
        '<div class="cb-d-tree-items">' + (g.items || []).map(function (x) {
          return '<article><strong>' + esc(x.n) + '</strong>' +
            (x.s ? '<p>' + esc(x.s) + '</p>' : '') + '</article>';
        }).join('') + '</div></section>';
    }).join('') + '</div>';
  }

  function tableHtml(t) {
    if (!t) return '';
    return '<div class="cb-table-wrap"><table class="cb-table">' +
      (t.caption ? '<caption>' + esc(t.caption) + '</caption>' : '') +
      '<thead><tr>' + (t.head || []).map(function (h) {
        return '<th>' + esc(h) + '</th>';
      }).join('') + '</tr></thead><tbody>' +
      (t.rows || []).map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function listsHtml(lists) {
    if (!lists || !lists.length) return '';
    return lists.map(function (l) {
      return '<section class="cb-d-list"><h4>' + esc(l.title) + '</h4>' +
        '<div class="cb-d-chips">' + (l.items || []).map(function (x) {
          return '<span>' + esc(x) + '</span>';
        }).join('') + '</div></section>';
    }).join('');
  }

  function visualHtml(viz, topicId) {
    if (!viz) return '';
    var vizId = 'viz-' + topicId;
    registerNodes(viz, vizId);
    var body = '';
    if (viz.type === 'wheel') {
      body = '<div class="cb-d-wheel-layout"><div>' + wheelSvg(viz, vizId) +
        '<div class="cb-d-controls" aria-label="নিদান বদলানোর নিয়ন্ত্রণ">' +
        '<button type="button" data-d-prev="' + esc(vizId) + '">← আগের</button>' +
        '<button type="button" data-d-play="' + esc(vizId) + '" aria-pressed="false">▶ স্বয়ংক্রিয় ঘোরান</button>' +
        '<button type="button" data-d-next="' + esc(vizId) + '">পরের →</button></div></div>' +
        infoPanel(viz, vizId) + '</div>';
    } else if (viz.type === 'bars') {
      body = barsHtml(viz, vizId) + infoPanel(viz, vizId);
    } else if (viz.type === 'planes') {
      body = planesHtml(viz);
    } else if (viz.type === 'tree') {
      body = treeHtml(viz);
    } else if (viz.type === 'steps') {
      body = flowHtml(viz, vizId, 'is-steps') + infoPanel(viz, vizId);
    } else {
      body = flowHtml(viz, vizId, 'is-flow') + infoPanel(viz, vizId);
    }
    return '<figure class="cb-d-viz cb-d-viz-' + esc(viz.type || 'flow') + '">' +
      (viz.title ? '<div class="cb-d-viz-title">' + esc(viz.title) + '</div>' : '') +
      body +
      (viz.caption ? '<figcaption class="cb-d-caption">' + esc(viz.caption) + '</figcaption>' : '') +
      '</figure>';
  }

  function sourceLinks(list) {
    if (!list || !list.length) return '';
    return '<div class="cb-prac-srcs">' + list.map(function (s) {
      var ext = isExternal(s.u) ? ' target="_blank" rel="noopener"' : '';
      return '<a class="cb-chip" href="' + esc(s.u) + '"' + ext + '>' + esc(s.t) + ' ↗</a>';
    }).join(' ') + '</div>';
  }

  function topicHtml(x) {
    var meta = [];
    if (x.ref) meta.push('<span class="cb-prac-ref">' + esc(x.ref) + '</span>');
    if (x.status) meta.push('<span class="cb-prac-status">' + esc(x.status) + '</span>');
    if (x.pali) meta.push('<span class="cb-prac-pali-name">' + esc(x.pali) + '</span>');

    var body = '';
    if (x.intro) body += '<p>' + esc(x.intro) + '</p>';
    if (x.formula) {
      body += '<figure class="cb-prac-verse"><figcaption>মূল পালি পদ</figcaption>' +
        '<blockquote>' + esc(x.formula).replace(/\n/g, '<br>') + '</blockquote></figure>';
    }
    body += visualHtml(x.visual, x.id);
    if (x.table) body += tableHtml(x.table);
    if (x.lists) body += listsHtml(x.lists);
    if (x.points && x.points.length) {
      body += '<ul class="cb-prac-points">' + x.points.map(function (p) {
        return '<li>' + esc(p) + '</li>';
      }).join('') + '</ul>';
    }
    if (x.practice) body += '<p class="cb-note"><b>চর্চা:</b> ' + esc(x.practice) + '</p>';
    body += sourceLinks(x.sources);

    return '<details class="cb-prac cb-d-topic" id="darshan-' + esc(x.id) + '"' +
      (x.open ? ' open' : '') + ' data-darshan-topic>' +
      '<summary><span class="cb-prac-title">' + esc(x.title) + '</span>' +
      (x.summary ? '<span class="cb-d-summary">' + esc(x.summary) + '</span>' : '') +
      (meta.length ? '<span class="cb-prac-meta">' + meta.join(' ') + '</span>' : '') +
      '</summary><div class="cb-prac-body">' + body + '</div></details>';
  }

  function setNode(vizId, idx) {
    var rec = NODES[vizId];
    if (!rec || !rec.nodes.length) return;
    idx = (idx + rec.nodes.length) % rec.nodes.length;
    rec.idx = idx;
    var all = document.querySelectorAll('[data-d-node][data-viz="' + vizId + '"]');
    Array.prototype.forEach.call(all, function (el) {
      var on = Number(el.getAttribute('data-idx')) === idx;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var info = $(vizId + '-info');
    if (info) {
      info.classList.remove('is-changing');
      /* ছোট ফেড পুনরায় চালাতে reflow */
      void info.offsetWidth;
      info.innerHTML = nodeInfoHtml(rec.nodes[idx], idx);
      info.classList.add('is-changing');
    }
  }

  function stopPlay(vizId) {
    var rec = NODES[vizId];
    if (!rec) return;
    if (rec.timer) window.clearInterval(rec.timer);
    rec.timer = null;
    rec.playing = false;
    var btn = document.querySelector('[data-d-play="' + vizId + '"]');
    if (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = '▶ স্বয়ংক্রিয় ঘোরান';
    }
  }

  function togglePlay(vizId, btn) {
    var rec = NODES[vizId];
    if (!rec) return;
    if (rec.playing) { stopPlay(vizId); return; }
    rec.playing = true;
    if (btn) {
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = '⏸ থামান';
    }
    rec.timer = window.setInterval(function () {
      setNode(vizId, rec.idx + 1);
    }, 2600);
  }

  function setupInteractions(root) {
    root.addEventListener('click', function (ev) {
      var jump = ev.target.closest ? ev.target.closest('[data-darshan-jump]') : null;
      if (jump) {
        var target = $(jump.getAttribute('data-darshan-jump'));
        if (target) {
          ev.preventDefault();
          target.open = true;
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          try { window.history.replaceState(null, '', '#' + target.id); } catch (e) {}
        }
        return;
      }

      var play = ev.target.closest ? ev.target.closest('[data-d-play]') : null;
      if (play) { togglePlay(play.getAttribute('data-d-play'), play); return; }
      var prev = ev.target.closest ? ev.target.closest('[data-d-prev]') : null;
      if (prev) {
        var pv = prev.getAttribute('data-d-prev');
        stopPlay(pv); setNode(pv, NODES[pv].idx - 1); return;
      }
      var next = ev.target.closest ? ev.target.closest('[data-d-next]') : null;
      if (next) {
        var nv = next.getAttribute('data-d-next');
        stopPlay(nv); setNode(nv, NODES[nv].idx + 1); return;
      }
      var node = ev.target.closest ? ev.target.closest('[data-d-node]') : null;
      if (node) {
        var vizId = node.getAttribute('data-viz');
        stopPlay(vizId);
        setNode(vizId, Number(node.getAttribute('data-idx') || 0));
      }
    });

    root.addEventListener('keydown', function (ev) {
      var node = ev.target.closest ? ev.target.closest('[data-d-node]') : null;
      if (!node || node.tagName === 'BUTTON') return;
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        stopPlay(node.getAttribute('data-viz'));
        setNode(node.getAttribute('data-viz'), Number(node.getAttribute('data-idx') || 0));
      }
    });

    root.addEventListener('toggle', function (ev) {
      var d = ev.target;
      if (d && d.tagName === 'DETAILS' && !d.open) {
        d.querySelectorAll('[data-d-node]').forEach(function (n) {
          stopPlay(n.getAttribute('data-viz'));
        });
      }
      if (d && d.tagName === 'DETAILS' && d.open) {
        d.querySelectorAll('.cb-d-viz').forEach(function (v) { v.classList.add('inview'); });
      }
    }, true);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('inview');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      root.querySelectorAll('.cb-d-viz').forEach(function (v) { io.observe(v); });
    } else {
      root.querySelectorAll('.cb-d-viz').forEach(function (v) { v.classList.add('inview'); });
    }
  }

  function openFromHash() {
    if (!window.location.hash) return;
    var id = window.location.hash.slice(1);
    var el = $(id);
    if (el && el.hasAttribute('data-darshan-topic')) {
      el.open = true;
      window.setTimeout(function () {
        el.scrollIntoView({ block: 'start' });
      }, 30);
    }
  }

  function render(d) {
    var title = $('darshanTitle'); if (title) title.textContent = d.title || 'দর্শন চিত্রে ও চার্টে';
    var lead = $('darshanLead'); if (lead) lead.textContent = d.lead || '';
    var how = $('darshanHow'); if (how) how.textContent = d.how_to || '';
    var note = $('darshanNote'); if (note) note.textContent = d.disclaimer || '';

    var stats = $('darshanStats');
    if (stats && d.stats) {
      stats.innerHTML = d.stats.map(function (s) {
        return '<div class="cb-d-stat"><strong>' + esc(s.n) + '</strong><span>' + esc(s.label) + '</span></div>';
      }).join('');
    }

    var jump = $('darshanJump');
    if (jump) {
      var links = [];
      (d.groups || []).forEach(function (g) {
        (g.topics || []).forEach(function (t) {
          links.push('<button type="button" data-darshan-jump="darshan-' + esc(t.id) + '">' + esc(t.title) + '</button>');
        });
      });
      jump.innerHTML = '<p>সরাসরি বিষয়ে যান</p><div>' + links.join('') + '</div>';
    }

    var box = $('darshanGroups');
    if (!box) return;
    box.innerHTML = (d.groups || []).map(function (g) {
      return '<section class="cb-d-group" id="darshan-group-' + esc(g.id) + '">' +
        '<div class="cb-d-group-head"><h3>' + esc(g.title) + '</h3>' +
        (g.intro ? '<p>' + esc(g.intro) + '</p>' : '') + '</div>' +
        (g.topics || []).map(topicHtml).join('') + '</section>';
    }).join('');

    var section = $('darshan');
    if (section) setupInteractions(section);
    loaded = true;
    openFromHash();
  }

  function start() {
    if (started) return;
    started = true;
    fetch(DATA).then(function (r) {
      if (!r.ok) throw new Error('darshan ' + r.status);
      return r.json();
    }).then(render).catch(function (err) {
      console.error('[darshan]', err);
      var box = $('darshanGroups');
      if (box) box.innerHTML = '<p class="cb-note">দর্শন চিত্রের তথ্য লোড করা যায়নি। সংযোগ যাচাই করে পাতাটি আবার রিফ্রেশ করুন।</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var section = $('darshan');
    if (!section || !$('darshanGroups')) return;

    if (window.location.hash && window.location.hash.indexOf('#darshan') === 0) {
      start();
    } else if ('IntersectionObserver' in window) {
      var lazy = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          lazy.disconnect();
          start();
        }
      }, { rootMargin: '900px 0px' });
      lazy.observe(section);
    } else {
      start();
    }

    window.addEventListener('hashchange', function () {
      start();
      if (loaded) openFromHash();
    });

    var openStates = null;
    window.addEventListener('beforeprint', function () {
      start();
      openStates = [];
      section.querySelectorAll('details[data-darshan-topic]').forEach(function (d) {
        openStates.push(d.open);
        d.open = true;
      });
    });
    window.addEventListener('afterprint', function () {
      if (!openStates) return;
      section.querySelectorAll('details[data-darshan-topic]').forEach(function (d, i) {
        d.open = !!openStates[i];
      });
      openStates = null;
    });
  });
})();
