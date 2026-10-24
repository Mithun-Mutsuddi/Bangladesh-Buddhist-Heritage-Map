/* চর্যাভূমি — PWA নিবন্ধন ও (ঐচ্ছিক) অ্যানালিটিক্স লোডার
   GA শুধু config.js-এ gaMeasurementId দেওয়া থাকলেই লোড হয়। */
(function () {
  'use strict';
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* SW ছাড়াও সাইট চলবে */ });
    });
  }
  var cfg = window.CHARYABHUMI_CONFIG || {};
  if (cfg.gaMeasurementId) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.gaMeasurementId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.gaMeasurementId, { anonymize_ip: true });
  }
  /* ইনস্টল প্রম্পট — Heritage Lab পাতার বোতামের জন্য ইভেন্ট ধরে রাখা */
  window.__cbInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__cbInstallPrompt = e;
    document.dispatchEvent(new CustomEvent('cb-install-available'));
  });
})();
