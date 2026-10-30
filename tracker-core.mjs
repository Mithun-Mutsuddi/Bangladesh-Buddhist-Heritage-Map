// Pure tracker logic; shared by the UI and node:test. No network or storage side effects.
export const STORAGE_KEY = 'charjavumi.tracker.v1';
export const CANONICAL_URL = 'https://mithun-mutsuddi.github.io/Bangladesh-Buddhist-Heritage-Map/tracker.html';
export const normalize = value => String(value ?? '').normalize('NFC').toLowerCase().replace(/য়/g,'য়').replace(/ড়/g,'ড়').replace(/ঢ়/g,'ঢ়').replace(/\s+/g,' ').trim();
export const districtKey = value => ({'রাঙ্গামাটি':'রাঙামাটি','মুন্সিগঞ্জ':'মুন্সীগঞ্জ','চাপাইনবাবগঞ্জ':'চাঁপাইনবাবগঞ্জ','নেত্রকোনা':'নেত্রকোণা','ব্রাহ্মনবাড়িয়া':'ব্রাহ্মণবাড়িয়া'}[normalize(value)] || normalize(value));
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) { try {const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
export function freshState(){return {version:1,name:'',language:'bn',visited:[],districts:[],buddies:[],routes:[],lastSaved:null};}
export function validateState(raw, knownSites, knownDistricts){
 if(!raw || raw.version!==1 || typeof raw!=='object') throw new Error('This is not a supported tracker backup.');
 const s=freshState();s.name=String(raw.name||'').slice(0,40);s.language=raw.language==='bn'?'bn':'en';
 s.visited=[...new Set((Array.isArray(raw.visited)?raw.visited:[]).filter(id=>typeof id==='string'&&knownSites.has(id)))];
 s.districts=[...new Set((Array.isArray(raw.districts)?raw.districts:[]).filter(id=>typeof id==='string'&&knownDistricts.has(id)))];
 s.buddies=(Array.isArray(raw.buddies)?raw.buddies:[]).filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string').slice(0,100).map(x=>({id:x.id.slice(0,100),name:x.name.slice(0,60)}));
 let total=0;
 s.routes=(Array.isArray(raw.routes)?raw.routes:[]).slice(0,200).map(r=>({id:String(r.id||'').slice(0,100),started:validDate(r.started),ended:validDate(r.ended),points:(Array.isArray(r.points)?r.points:[]).filter(p=>{total++;return total<=50000&&p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180&&Number.isFinite(p.time)&&Math.abs(p.time)<=8640000000000000&&Number.isFinite(p.accuracy)&&p.accuracy>=0;}).map(p=>({lat:p.lat,lng:p.lng,time:p.time,accuracy:p.accuracy}))}));
 return s;
}
function validDate(x){return typeof x==='string'&&Number.isFinite(Date.parse(x))?x:null;}
export function visitedDistricts(state, places, districts){
 const result=new Set(state.districts);const visited=new Set(state.visited);
 const byName=new Map(districts.map(f=>[districtKey(f.properties.bn),f.properties.shapeName]));
 for(const p of places) if(visited.has(p.id)&&byName.has(districtKey(p.district)))result.add(byName.get(districtKey(p.district)));
 return result;
}
export function stats(state, places, districts){
 const known=new Set(places.map(p=>p.id));const count=new Set(state.visited.filter(id=>known.has(id))).size;
 const d=visitedDistricts(state,places,districts).size;
 return {sites:count,total:places.length,remaining:places.length-count,percent:places.length?Math.round(count/places.length*1000)/10:0,districts:d,districtRemaining:64-d,districtPercent:Math.round(d/64*100),distance:state.routes.reduce((n,r)=>n+routeDistance(r.points),0),badge:badge(count)};
}
export function badge(n){return n>=100?'Heritage Guardian':n>=25?'Heritage Wanderer':n>=5?'Curious Explorer':'New Explorer';}
export function haversine(a,b){const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLon=(b.lng-a.lng)*r;const q=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(Math.max(0,1-q)));}
export function routeDistance(points){return points.reduce((sum,p,i)=>sum+(i?haversine(points[i-1],p):0),0);}
/* জিপিএস-নির্ভুলতার স্তর — ‘ভালো’ আর ‘কেবল আন্দাজ’ আলাদা করে দেখানো হয়,
   যাতে ৫০ মিটার-নির্ভুল পয়েন্টকে সঠিক স্থানের প্রমাণ ভাবা না হয়। */
export const ACCURACY_LIMIT_METRES = 80;
export function accuracyTier(metres){
 if(!Number.isFinite(metres)||metres<0)return 'unknown';
 if(metres<=10)return 'excellent';
 if(metres<=30)return 'good';
 if(metres<=ACCURACY_LIMIT_METRES)return 'fair';
 return 'poor';
}
export function accuracyLabel(metres){
 return {excellent:'চমৎকার (±১০ মি)',good:'ভালো (±৩০ মি)',fair:'মোটামুটি (±৮০ মি)',poor:'দুর্বল (>৮০ মি — নেওয়া হয় না)',unknown:'অজানা'}[accuracyTier(metres)];
}
export function routeAccuracy(points){
 if(!points.length)return {tier:'unknown',median:null,accepted:0,rejected:0};
 const acc=points.map(p=>p.accuracy).sort((a,b)=>a-b);
 const median=acc[Math.floor(acc.length/2)];
 return {tier:accuracyTier(median),median,accepted:points.filter(p=>p.accuracy<=ACCURACY_LIMIT_METRES).length,rejected:points.filter(p=>p.accuracy>ACCURACY_LIMIT_METRES).length};
}
export function acceptPoint(points,p){
 if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>90||Math.abs(p.lng)>180||!Number.isFinite(p.accuracy)||p.accuracy>ACCURACY_LIMIT_METRES||p.accuracy<0||!Number.isFinite(p.time))return false;
 const last=points.at(-1);if(!last)return true;
 const seconds=(p.time-last.time)/1000,km=haversine(last,p);
 return seconds>=5&&km>=.015&&km/seconds*3600<200;
}
function inRing(lng,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>lat)!==(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
export function inGeometry(lng,lat,g){const polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];return polys.some(p=>inRing(lng,lat,p[0])&&!p.slice(1).some(h=>inRing(lng,lat,h)));}
export function mapProject(lng,lat){return [112+(lng-88.0)*100,38+(26.75-lat)*88];}
export function geometryPath(g){const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;return polys.map(p=>p.map(r=>r.map(([lng,lat],i)=>`${i?'L':'M'}${mapProject(lng,lat).map(v=>v.toFixed(1)).join(',')}`).join('')+'Z').join('')).join('');}
export function shareSnapshot(state, places, districts, includeName=true){const x=stats(state,places,districts);return {v:1,name:includeName?state.name.slice(0,40):'Explorer',sites:x.sites,total:x.total,districts:[...visitedDistricts(state,places,districts)],badge:x.badge};}
export function encodeShare(snapshot){const bytes=new TextEncoder().encode(JSON.stringify(snapshot));let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function decodeShare(str,knownDistricts){if(str.length>12000)throw Error('Share link is too long.');const raw=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(str.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));if(raw.v!==1||!Number.isInteger(raw.sites)||!Number.isInteger(raw.total)||raw.sites<0||raw.total<raw.sites||raw.total>100000)throw Error('Invalid progress card.');return {v:1,name:String(raw.name||'Explorer').slice(0,40),sites:raw.sites,total:raw.total,districts:[...new Set((Array.isArray(raw.districts)?raw.districts:[]).filter(d=>knownDistricts.has(d)))],badge:badge(raw.sites)};}
export function routeGeoJSON(routes){return {type:'FeatureCollection',features:routes.filter(r=>r.points.length).map(r=>({type:'Feature',properties:{started:r.started,ended:r.ended,accuracy_metres:r.points.map(p=>p.accuracy),accuracy_tier:routeAccuracy(r.points).tier,accuracy_median_metres:routeAccuracy(r.points).median,timestamps:r.points.map(p=>new Date(p.time).toISOString())},geometry:r.points.length===1?{type:'Point',coordinates:[r.points[0].lng,r.points[0].lat]}:{type:'LineString',coordinates:r.points.map(p=>[p.lng,p.lat])}}))};}
