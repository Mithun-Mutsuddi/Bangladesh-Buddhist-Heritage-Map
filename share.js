/* চর্যাভূমি — শেয়ার ফিচার (2026-10-25) */
(function(){
  'use strict';
  function addMeta(name,content,property){
    var t=document.querySelector('meta['+(property?'property':'name')+'="'+name+'"]');
    if(!t){t=document.createElement('meta');if(property)t.setAttribute('property',name);else t.setAttribute('name',name);document.head.appendChild(t);}
    t.setAttribute('content',content);
  }
  function setShareMeta(){
    var title='চর্যাভূমি — বাংলাদেশ বৌদ্ধ ঐতিহ্য মানচিত্র';
    var desc='বাংলাদেশের বৌদ্ধবিহার, তীর্থস্থান, প্রত্নস্থল, ১২ পূর্ণিমার বিস্তারিত বিবরণ, সোশ্যাল মিডিয়া ফ্রেম ও অটো-পঞ্জিকা। প্রতিষ্ঠাতা ও পরিচালক: মিথুন মুৎসুদ্দী।';
    document.title=title;
    addMeta('description',desc);
    addMeta('og:title',title,true);
    addMeta('og:description',desc,true);
    addMeta('og:type','website',true);
    addMeta('og:url',location.href,true);
    addMeta('og:image',new URL('assets/brand/hero.svg',location.href).href,true);
    addMeta('og:site_name','চর্যাভূমি',true);
    addMeta('twitter:card','summary_large_image');
    addMeta('twitter:title',title);
    addMeta('twitter:description',desc);
    addMeta('twitter:image',new URL('assets/brand/hero.svg',location.href).href);
    addMeta('author','মিথুন মুৎসুদ্দী');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setShareMeta);
  else setShareMeta();
})();
