/* ছোট নেভিগেশন হেল্পার — যেসব পাতা app.js ছাড়া চলে (history/kings/contribution/institutions) */
(function () {
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
