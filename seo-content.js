/* Lazy-load the editorial article JSON only when a visitor opens a site's long-form article. */
window.loadHeritageSeoArticle = (() => {
  let pending = null;
  return async (siteId) => {
    if (!pending) {
      pending = fetch(new URL('./data/heritage-seo-bn.json', document.baseURI), { cache: 'force-cache' })
        .then(response => {
          if (!response.ok) throw new Error('Could not load heritage article data');
          return response.json();
        })
        .then(payload => {
          const articles = Array.isArray(payload) ? payload : payload.articles;
          if (!Array.isArray(articles)) throw new Error('Invalid heritage article JSON');
          return new Map(articles.map(article => [article.id, article]));
        })
        .catch(error => { pending = null; throw error; });
    }
    const articles = await pending;
    return articles.get(String(siteId)) || null;
  };
})();
