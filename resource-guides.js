/* Rights-aware external research, media, learning and travel gateways. */
(function () {
  'use strict';
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-resource-target]'));
  if (!targets.length) return;
  var LABELS = { research: 'Research', media: 'Media discovery', learning: 'Learning', travel: 'Travel planning' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLocaleLowerCase('bn').replace(/\s+/g, ' ').trim(); }
  function card(r) {
    return '<article class="resource-card" data-resource-card data-search="' + esc(norm([r.title, r.description, r.note, r.keywords, r.category].join(' '))) + '">' +
      '<div class="resource-card-top"><span>External service</span><b>' + esc(LABELS[r.category] || r.category) + '</b></div>' +
      '<h3>' + esc(r.title) + '</h3><p>' + esc(r.description) + '</p><small>' + esc(r.note) + '</small>' +
      '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">Official service খুলুন ↗</a></article>';
  }
  fetch('data/resource-guides.json?v=20261024e').then(function (r) { if (!r.ok) throw new Error('resource guides ' + r.status); return r.json(); }).then(function (data) {
    targets.forEach(function (target) {
      var categories = target.dataset.resourceTarget.split(',');
      var resources = (data.resources || []).filter(function (r) { return categories.indexOf(r.category) !== -1; });
      target.innerHTML = resources.map(card).join('');
      var section = target.closest('section') || target.parentElement;
      var input = section && section.querySelector('[data-resource-search]');
      if (input) input.addEventListener('input', function () {
        var q = norm(input.value), visible = 0;
        target.querySelectorAll('[data-resource-card]').forEach(function (cardNode) {
          var show = !q || cardNode.dataset.search.indexOf(q) !== -1;
          cardNode.hidden = !show; if (show) visible++;
        });
        target.setAttribute('aria-live', 'polite');
        target.dataset.visibleCount = visible;
      });
    });
  }).catch(function (err) {
    targets.forEach(function (target) { target.innerHTML = '<p class="resource-error">External resource index লোড হয়নি। মূল library/Atlas content অক্ষত আছে; আবার চেষ্টা করুন।</p>'; });
    if (window.console) console.warn(err.message);
  });
})();
