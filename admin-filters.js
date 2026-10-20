/* Lazy-loading cascading Bangladesh admin filters. Geography data are administrative references, not place verification. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const source = 'https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json';
let tree = null, loadPromise = null;
function bnName(x) { return String((x && (x.bn_name || x.name)) || '').trim(); }
function uniqueSorted(values) { const seen = new Set(); return values.filter(v => v && !seen.has(v) && seen.add(v)).sort((a,b)=>a.localeCompare(b,'bn')); }
function refill(el, values, prompt, keep) {
 if (!el) return;
 const old = keep ? el.value : 'all';
 const opts = [new Option(prompt,'all'), ...uniqueSorted(values).map(v=>new Option(v,v))];
 el.replaceChildren(...opts); if (opts.some(o=>o.value===old)) el.value=old;
}
function divisions() { const v=$('divisionFilter')?.value||'all'; return (tree||[]).filter(d=>v==='all'||bnName(d)===v); }
function districts() { const v=$('districtFilter')?.value||'all'; return divisions().flatMap(d=>d.districts||[]).filter(d=>v==='all'||bnName(d)===v); }
function upazilas() { const v=$('upazilaFilter')?.value||'all'; return districts().flatMap(d=>d.upazilas||[]).filter(u=>v==='all'||bnName(u)===v); }
function runSearch() { const input=$('placeSearch'); if(input)input.dispatchEvent(new Event('input',{bubbles:true})); }
function refreshAll(keep) {
 refill($('districtFilter'), divisions().flatMap(d=>d.districts||[]).map(bnName),'সব জেলা',keep);
 refill($('upazilaFilter'), districts().flatMap(d=>d.upazilas||[]).map(bnName),'সব উপজেলা',keep);
 refill($('unionFilter'), upazilas().flatMap(u=>[...(u.unions||[]),...(u.pourashavas||[])].map(bnName)),'সব ইউনিয়ন / পৌরসভা',keep);
 const div=$('divisionFilter')?.value||'all', dist=$('districtFilter')?.value||'all', up=$('upazilaFilter')?.value||'all';
 const records=Array.isArray(window.destinations)?window.destinations:[];
 const thanaValues=records.filter(p=>(div==='all'||p.division===div)&&(dist==='all'||p.district===dist)&&(up==='all'||p.upazila===up)).map(p=>p.thana);
 refill($('thanaFilter'),thanaValues,'সব থানা (রেকর্ডভিত্তিক)',keep);
}
async function loadGeo() {
 if(tree) return tree;
 if(!loadPromise) loadPromise=fetch(source,{mode:'cors',cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(data=>{
  if(!Array.isArray(data))throw new Error('প্রশাসনিক ডেটার ফরম্যাট সঠিক নয়');
  tree=data; refill($('divisionFilter'),tree.map(bnName),'সব বিভাগ',true); refreshAll(true);
  const note=document.querySelector('.admin-filter-note'); if(note)note.textContent='প্রশাসনিক তালিকা লোড হয়েছে। বিদ্যমান স্থানের উপজেলা/ইউনিয়ন/থানা তথ্য প্রমাণসহ যোগ না থাকলে ওই ফিল্টারে ফল নাও আসতে পারে।';
  return tree;
 }).catch(err=>{loadPromise=null;const note=document.querySelector('.admin-filter-note');if(note)note.textContent='প্রশাসনিক তালিকা এখন লোড করা যায়নি ('+err.message+'); বিভাগ/জেলা ফিল্টার ব্যবহার করুন, পরে আবার চেষ্টা হবে.';throw err;});
 return loadPromise;
}
document.addEventListener('DOMContentLoaded',()=>{
 setTimeout(()=>loadGeo().catch(()=>{}),900);
 $('divisionFilter')?.addEventListener('change',()=>{if(tree){refreshAll(false);runSearch();}});
 $('districtFilter')?.addEventListener('change',()=>{
  if(!tree)return;
  refill($('upazilaFilter'),districts().flatMap(d=>d.upazilas||[]).map(bnName),'সব উপজেলা',false);
  refill($('unionFilter'),upazilas().flatMap(u=>[...(u.unions||[]),...(u.pourashavas||[])].map(bnName)),'সব ইউনিয়ন / পৌরসভা',false);
  const div=$('divisionFilter')?.value||'all', dist=$('districtFilter')?.value||'all';
  const records=Array.isArray(window.destinations)?window.destinations:[];
  refill($('thanaFilter'),records.filter(p=>(div==='all'||p.division===div)&&(dist==='all'||p.district===dist)).map(p=>p.thana),'সব থানা (রেকর্ডভিত্তিক)',false);
  runSearch();
 });
 $('upazilaFilter')?.addEventListener('change',()=>{
  if(!tree)return;
  refill($('unionFilter'),upazilas().flatMap(u=>[...(u.unions||[]),...(u.pourashavas||[])].map(bnName)),'সব ইউনিয়ন / পৌরসভা',false);
  const div=$('divisionFilter')?.value||'all', dist=$('districtFilter')?.value||'all', up=$('upazilaFilter')?.value||'all';
  const records=Array.isArray(window.destinations)?window.destinations:[];
  refill($('thanaFilter'),records.filter(p=>(div==='all'||p.division===div)&&(dist==='all'||p.district===dist)&&(up==='all'||p.upazila===up)).map(p=>p.thana),'সব থানা (রেকর্ডভিত্তিক)',false);
  runSearch();
 });
 $('thanaFilter')?.addEventListener('change',runSearch);
 $('unionFilter')?.addEventListener('change',runSearch);
});
})();