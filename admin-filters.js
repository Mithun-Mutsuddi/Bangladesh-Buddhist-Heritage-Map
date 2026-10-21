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
function allDistricts() { return (tree||[]).flatMap(d=>d.districts||[]); }
function divisions() { const v=$('divisionFilter')?.value||'all'; return (tree||[]).filter(d=>v==='all'||bnName(d)===v); }
function districts() { const v=$('districtFilter')?.value||'all'; return divisions().flatMap(d=>d.districts||[]).filter(d=>v==='all'||bnName(d)===v); }
function upazilas() { const v=$('upazilaFilter')?.value||'all'; return districts().flatMap(d=>d.upazilas||[]).filter(u=>v==='all'||bnName(u)===v); }
function norm(value) { return String(value||'').normalize('NFC').toLocaleLowerCase('bn').replace(/[\s\u200c\u200d-]+/g,' ').trim(); }
function inferLocalityMetadata() {
 const records=Array.isArray(window.destinations)?window.destinations:[];
 records.forEach(place=>{
  if(!place || !place.district) return;
  const d=allDistricts().find(item=>norm(bnName(item))===norm(place.district));
  if(!d) return;
  const searchable=norm([place.name,place.summary].filter(Boolean).join(' '));
  if(!place.upazila) {
   const hits=(d.upazilas||[]).filter(u=>{const bn=norm(u.bn_name),en=norm(u.name);return (bn.length>2&&searchable.includes(bn))||(en.length>3&&searchable.includes(en));});
   if(hits.length===1) { place.upazila=bnName(hits[0]); place.adminLocationStatus='text-match-unverified'; }
  }
  if(place.upazila && !place.union) {
   const parent=(d.upazilas||[]).find(u=>norm(bnName(u))===norm(place.upazila));
   if(parent) {
    const unionHits=(parent.unions||[]).filter(u=>{const bn=norm(u.bn_name),en=norm(u.name);return (bn.length>3&&searchable.includes(bn))||(en.length>4&&searchable.includes(en));});
    if(unionHits.length===1) { place.union=bnName(unionHits[0]); place.adminLocationStatus='text-match-unverified'; }
   }
  }
 });
}
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
function refreshRecordLists() {
 const records=Array.isArray(window.destinations)?window.destinations:[];
 const div=$('divisionFilter')?.value||'all', dist=$('districtFilter')?.value||'all', up=$('upazilaFilter')?.value||'all';
 const selected=records.filter(p=>(div==='all'||p.division===div)&&(dist==='all'||p.district===dist)&&(up==='all'||p.upazila===up));
 refill($('districtFilter'),records.filter(p=>div==='all'||p.division===div).map(p=>p.district),'সব জেলা',true);
 refill($('upazilaFilter'),selected.map(p=>p.upazila),'সব উপজেলা',true);
 refill($('thanaFilter'),selected.map(p=>p.thana),'সব থানা (রেকর্ডভিত্তিক)',true);
 refill($('unionFilter'),selected.map(p=>p.union),'সব ইউনিয়ন (রেকর্ডভিত্তিক)',true);
}
function refreshCategories() {
 const select=$('categoryFilter'); if(!select)return;
 /* একক, স্থির ক্যাটাগরি-তালিকা — পুরোনো এলোমেলো লেবেল আর দেখানো হয় না */
 const ORDER=[
  'বিহার',
  'প্রত্নাঞ্চল ও প্রত্ন নিদর্শন',
  'বুদ্ধ স্মৃতিচিহ্ন/জাদী/স্তূপ',
  'ভাবনাকেন্দ্র',
  'অরণ্যকুঠি',
  'বৌদ্ধ সংঘ/সমিতি/সংগঠনসমূহ',
  'বৌদ্ধ শিক্ষা প্রতিষ্ঠান (পালি টোল, স্কুল, কলেজ, ক্রীড়া ও সাংস্কৃতিক)',
  'সংগ্রহশালা ও সংরক্ষণ',
  'সামাজিক সেবা ও কল্যাণ প্রতিষ্ঠান (অনাথালয়, শিশু সদন)',
  'বৃদ্ধাশ্রম',
  'শশ্মান',
  'লোকালয়/পল্লী',
  'যাচাইধীন/অতিরিক্ত সূত্র প্রয়োজন'
 ];
 const previous=select.value||'all';
 select.replaceChildren(new Option('সব ক্যাটাগরি','all'), ...ORDER.map(c=>new Option(c,c)));
 if([...select.options].some(o=>o.value===previous)) select.value=previous;
}
async function loadGeo() {
 if(tree) return tree;
 if(!loadPromise) loadPromise=fetch(source,{mode:'cors',cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(data=>{
  if(!Array.isArray(data))throw new Error('প্রশাসনিক ডেটার ফরম্যাট সঠিক নয়');
  tree=data; inferLocalityMetadata(); refill($('divisionFilter'),tree.map(bnName),'সব বিভাগ',true); refreshAll(true); refreshCategories();
  const note=document.querySelector('.admin-filter-note'); if(note)note.textContent='প্রশাসনিক তালিকা লোড হয়েছে। বিদ্যমান স্থানের উপজেলা/ইউনিয়ন/থানা তথ্য প্রমাণসহ যোগ না থাকলে ওই ফিল্টারে ফল নাও আসতে পারে।';
  return tree;
 }).catch(err=>{loadPromise=null;refreshRecordLists(); refreshCategories(); const note=document.querySelector('.admin-filter-note');if(note)note.textContent='প্রশাসনিক তালিকা এখন লোড করা যায়নি ('+err.message+'); বিদ্যমান রেকর্ড থেকে জেলা/থানা/ইউনিয়ন ফিল্টার সচল আছে; পরে আবার চেষ্টা হবে.';throw err;});
 return loadPromise;
}
document.addEventListener('DOMContentLoaded',()=>{
 refreshRecordLists(); refreshCategories(); setTimeout(()=>loadGeo().catch(()=>{}),900);
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