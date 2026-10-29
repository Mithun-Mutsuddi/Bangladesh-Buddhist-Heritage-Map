/* Deprecated on 2026-10-22.
   The former second dashboard/map implementation was removed so the site has
   exactly one dashboard: index.html + dashboard.js. This file is intentionally
   inert if an old cached page still requests it. */
(function () {
  'use strict';
  if (window.console && console.info) console.info('[Charyabhumi] Legacy dashboard script disabled; use index.html#explore.');
})();
