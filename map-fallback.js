(function () {
'use strict';
var SEED=[
 {name:'পাহাড়পুর সোমপুর মহাবিহার',district:'নওগাঁ',coords:[25.03197,88.97700]},
 {name:'শালবন বিহার',district:'কুমিল্লা',coords:[23.42676,91.13673]},
 {name:'বুদ্ধ ধাতু জাদি (স্বর্ণমন্দির)',district:'বান্দরবান',coords:[22.19540,92.21780]},
 {name:'রাজবন বিহার',district:'রাঙামাটি',coords:[22.66203,92.17097]},
 {name:'ধর্মরাজিকা বৌদ্ধ মহাবিহার',district:'ঢাকা',coords:[23.72890,90.43250]},
 {name:'নন্দনকানন বৌদ্ধ বিহার',district:'চট্টগ্রাম',coords:[22.35850,91.83120]},
 {name:'রামু বৌদ্ধ ঐতিহ্যাঞ্চল',district:'কক্সবাজার',coords:[21.45490,92.09980]},
 {name:'বাসু বিহার প্রত্নস্থল',district:'বগুড়া',coords:[25.04740,89.32380]},
 {name:'ময়নামতি বৌদ্ধ প্রত্নাঞ্চল',district:'কুমিল্লা',coords:[23.43320,91.13200]}
];
var JS_CDNS=[
 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
];
var cssLoaded=false, rescuePos=null, rescueControlsBound=false;
function $(id){return document.getElementById(id);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function searchUrl(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);}
function note(msg){var n=$('mapActionStatus');if(n)n.textContent=msg;}
function locations(){
 var raw=Array.isArray(window.destinations)?window.destinations:SEED;
 var arr=raw.map(function(p,i){
  var c=Array.isArray(p.coords)?p.coords:[p.latitude||p.lat,p.longitude||p.lng],lat=Number(c[0]),lng=Number(c[1]);
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat < -90||lat>90||lng < -180||lng>180||(lat===0&&lng===0))return null;
  return {id:String(p.id||('rescue-'+i)),name:String(p.name||p.title||'বৌদ্ধ ঐতিহ্যস্থান'),district:String(p.district||''),division:String(p.division||''),coords:[lat,lng],approx:!!(p.pinApproximate||p.verificationPending)};
 }).filter(Boolean);
 return arr.length?arr:SEED;
}
function addCss(){
 if(!$('heritageMapRescueCss')){
  var style=document.createElement('style');style.id='heritageMapRescueCss';
  style.textContent='#map{display:block;width:100%;height:clamp(340px,62vh,560px);min-height:320px;background:#f8eddd}#map .leaflet-container{width:100%;height:100%;font:inherit}.heritage-rescue-icon{background:transparent;border:0}.heritage-rescue-wheel{display:grid;place-items:center;width:32px;height:32px;border:2px solid #fff6e8;border-radius:50%;color:#fff8e5;background:#a84608;box-shadow:0 3px 11px #0005;font-size:21px}.heritage-rescue-fallback{height:100%;min-height:320px;overflow:auto;box-sizing:border-box;padding:16px;color:#422f1d;background:#fff8ed;font-size:13px;line-height:1.7}.heritage-rescue-fallback strong{display:block;margin-bottom:7px;font-size:15px}.heritage-rescue-fallback p{margin:6px 0 12px}.heritage-rescue-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;max-height:230px;overflow:auto}.heritage-rescue-links a{padding:8px;border:1px solid #ead2b2;border-radius:9px;color:#873b06;background:white;text-decoration:none;font-size:11px}.heritage-rescue-action{margin:3px 5px 3px 0;padding:9px 12px;border:1px solid #d5b38c;border-radius:10px;color:#873b06;background:white;font:inherit;font-size:12px;cursor:pointer}';
  document.head.appendChild(style);
 }
 if(!cssLoaded){
  cssLoaded=true;
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';l.setAttribute('data-heritage-map-rescue-css','1');
  var custom=document.querySelector('link[href*="styles.css"]');
  if(custom&&custom.parentNode)custom.parentNode.insertBefore(l,custom);else document.head.appendChild(l);
  l.onerror=function(){var b=document.createElement('link');b.rel='stylesheet';b.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';document.head.appendChild(b);};
 }
}
function loadLib(url){
 return new Promise(function(resolve,reject){
  var s=document.createElement('script'),done=false;
  var timer=setTimeout(function(){if(done)return;done=true;s.remove();reject(new Error('Leaflet CDN timeout'));},6500);
  s.src=url;s.async=true;
  s.onload=function(){if(done)return;done=true;clearTimeout(timer);window.L&&typeof window.L.map==='function'?resolve():reject(new Error('Leaflet unavailable'));};
  s.onerror=function(){if(done)return;done=true;clearTimeout(timer);s.remove();reject(new Error('Leaflet CDN failed'));};
  document.head.appendChild(s);
 });
}
async function ensureL(){
 if(window.L&&typeof window.L.map==='function')return true;
 for(var i=0;i<JS_CDNS.length;i++){try{await loadLib(JS_CDNS[i]);if(window.L&&typeof window.L.map==='function')return true;}catch(e){console.warn('Map backup CDN failed:',e);}}
 return !!(window.L&&typeof window.L.map==='function');
}
function addTiles(map){
 if(typeof window.attachHeritageTileLayer==='function'){try{window.attachHeritageTileLayer(map);return;}catch(e){console.warn(e);}}
 var list=[
  {url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',opts:{subdomains:['a','b','c'],maxZoom:19,attribution:'&copy; OpenStreetMap'}},
  {url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',opts:{subdomains:'abcd',maxZoom:20,attribution:'&copy; OpenStreetMap &copy; CARTO'}},
  {url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',opts:{maxZoom:19,attribution:'&copy; Esri'}}
 ];
 var idx=0,layer=null,loaded=0,errors=0,timer=null;
 function mount(){
  if(timer)clearTimeout(timer);if(layer){try{map.removeLayer(layer);}catch(_){}}
  if(idx>=list.length){note('ম্যাপ টাইল সার্ভার সাড়া দিচ্ছে না; ধর্মচক্র পিনে চাপ দিয়ে Google Maps-এ গন্তব্য খুলুন।');return;}
  loaded=0;errors=0;layer=window.L.tileLayer(list[idx].url,list[idx].opts);window.__heritageTileLayer=layer;
  layer.on('tileload',function(){loaded++;});layer.on('tileerror',function(){errors++;if(errors>=3&&loaded<2){idx++;mount();}});
  layer.addTo(map);timer=setTimeout(function(){if(loaded<2&&idx<list.length){idx++;mount();}},6500);
 }
 mount();
 window.refreshHeritageMapTiles=function(){try{map.invalidateSize({pan:false});if(layer)layer.redraw();}catch(_){}};
}
function hasVisibleMap(container,map){return !!(map&&container.querySelector('.leaflet-pane'));}
function addPins(map,container){
 if(container.querySelectorAll('.leaflet-marker-icon').length)return;
 var L=window.L,layer=window.__heritageMarkerLayer;
 try{if(layer&&typeof layer.clearLayers==='function')layer.clearLayers();else layer=null;}catch(_){layer=null;}
 if(!layer){layer=typeof L.markerClusterGroup==='function'?L.markerClusterGroup({chunkedLoading:false,maxClusterRadius:42,disableClusteringAtZoom:13,showCoverageOnHover:false}):L.layerGroup();layer.addTo(map);}
 else if(map.hasLayer&&!map.hasLayer(layer))layer.addTo(map);
 var markers=locations().map(function(p){
  var icon=L.divIcon({className:'heritage-rescue-icon',html:'<span class="heritage-rescue-wheel" aria-hidden="true">☸</span>',iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-18]});
  var m=L.marker(p.coords,{icon:icon,title:p.name,alt:p.name});
  m.bindPopup('<div class="heritage-popup"><strong>'+esc(p.name)+'</strong><p>'+esc([p.district,p.division].filter(Boolean).join(' · '))+'</p>'+(p.approx?'<p>⚠ পিন আনুমানিক / যাচাইাধীন।</p>':'')+'<a href="'+searchUrl(p.name+(p.district?', '+p.district:'')+', Bangladesh')+'" target="_blank" rel="noopener noreferrer">Google Maps-এ স্থান খুঁজুন ↗</a></div>');
  return m;
 });
 if(typeof layer.addLayers==='function')layer.addLayers(markers);else markers.forEach(function(m){layer.addLayer(m);});
 window.__heritageMarkerLayer=layer;window.__heritageFallbackMarkerLayer=layer;
}
function showLinkFallback(container){
 var links=locations().slice(0,20).map(function(p){return '<a href="'+searchUrl(p.name+(p.district?', '+p.district:'')+', Bangladesh')+'" target="_blank" rel="noopener noreferrer">'+esc(p.name)+' ☸</a>';}).join('');
 container.innerHTML='<div class="heritage-rescue-fallback"><strong>ইন্টার‌্যাকটিভ ম্যাপ লোড করা যায়নি</strong><p>সাদা অংশের বদলে নিচের ধর্মচক্র লিংকগুলো দিয়ে গন্তব্য খুলুন। ইন্টারনেট/CDN সংযোগ ঠিক হলে “আবার চেষ্টা” চাপুন।</p><button class="heritage-rescue-action" data-heritage-rescue="locate">◎ আমার অবস্থান</button><button class="heritage-rescue-action" data-heritage-rescue="retry">↻ আবার চেষ্টা</button><div class="heritage-rescue-links">'+links+'</div></div>';
}
function locate(){
 if(!navigator.geolocation||!window.isSecureContext){note('অবস্থান জানতে HTTPS সাইট ও ব্রাউজারের Location permission চালু করুন।');return;}
 note('আপনার অবস্থান শনাক্ত করা হচ্ছে…');
 navigator.geolocation.getCurrentPosition(function(pos){
  var lat=pos.coords.latitude,lng=pos.coords.longitude;rescuePos={lat:lat,lng:lng};var map=window.__heritageLeafletMap;
  if(window.L&&map&&hasVisibleMap($('map'),map)){
   if(window.__heritageRescueUserMarker){try{window.__heritageRescueUserMarker.remove();}catch(_){}}
   var icon=window.L.divIcon({className:'heritage-rescue-icon',html:'<span class="heritage-rescue-wheel">●</span>',iconSize:[22,22],iconAnchor:[11,11]});
   window.__heritageRescueUserMarker=window.L.marker([lat,lng],{icon:icon}).addTo(map).bindPopup('আপনার বর্তমান অবস্থান');map.setView([lat,lng],12,{animate:false});map.invalidateSize({pan:false});
   note('আপনার অবস্থান ম্যাপে দেখানো হয়েছে।');
  }else{note('আপনার অবস্থান পাওয়া গেছে; Google Maps-এ খুলুন।');var w=window.open(searchUrl(lat+','+lng),'_blank');if(w)w.opener=null;}
 },function(err){note(err&&err.code===1?'অবস্থান অনুমতি বন্ধ আছে—Site settings → Location → Allow করুন।':'অবস্থান পাওয়া যায়নি। GPS/Location চালু করে আবার চেষ্টা করুন।');},{enableHighAccuracy:false,timeout:15000,maximumAge:60000});
}
function bindFallbackControls(){
 if(rescueControlsBound||window.__heritageCoreScriptReady)return;rescueControlsBound=true;
 var mapNode=$('map');
 if(mapNode)mapNode.addEventListener('click',function(e){var b=e.target.closest('[data-heritage-rescue]');if(!b)return;e.preventDefault();if(b.dataset.heritageRescue==='locate')locate();if(b.dataset.heritageRescue==='retry')repair();});
 var locateButton=$('locateMe');if(locateButton)locateButton.addEventListener('click',locate);
 var refresh=$('refreshMap');if(refresh)refresh.addEventListener('click',function(){repair();if(window.refreshHeritageMapLayout)window.refreshHeritageMapLayout();});
 var atm=$('nearbyAtm');if(atm)atm.addEventListener('click',function(){var target=rescuePos?rescuePos.lat+','+rescuePos.lng:'Bangladesh';var w=window.open(searchUrl('ATM near '+target),'_blank');if(w)w.opener=null;});
 document.querySelectorAll('[data-map-service]').forEach(function(b){b.addEventListener('click',function(){var labels={medical:'emergency hospital clinic',pharmacy:'pharmacy',hotel:'hotel guest house',transport:'bus train launch ticket counter',police:'police station',fire:'fire service station'};var target=rescuePos?rescuePos.lat+','+rescuePos.lng:'Bangladesh';var w=window.open(searchUrl((labels[b.dataset.mapService]||'service')+' near '+target),'_blank');if(w)w.opener=null;else note('পপ-আপ বন্ধ থাকলে browser pop-up Allow করুন; অথবা নতুন ট্যাবে Google Maps খুলুন।');});});
}
async function repair(){
 var container=$('map');if(!container||container.dataset.mapRescueBusy==='1')return;
 container.dataset.mapRescueBusy='1';addCss();
 try{
  if(!(await ensureL())){showLinkFallback(container);bindFallbackControls();return;}
  var map=window.__heritageLeafletMap||null;
  if(map&&!hasVisibleMap(container,map)){try{map.remove();}catch(_){}container._leaflet_id=undefined;map=null;window.__heritageLeafletMap=null;window.__heritageMarkerLayer=null;}
  if(!map){container.innerHTML='';container._leaflet_id=undefined;map=window.L.map(container,{scrollWheelZoom:false,preferCanvas:true}).setView([23.685,90.3563],7);window.__heritageLeafletMap=map;addTiles(map);}
  else{try{map.invalidateSize({pan:false});}catch(_){}if(!window.__heritageTileLayer&&!window.attachHeritageTileLayer)addTiles(map);}
  addPins(map,container);
  setTimeout(function(){try{map.invalidateSize({pan:false});}catch(_){}if(container.querySelectorAll('.leaflet-marker-icon').length===0)addPins(map,container);},700);
  bindFallbackControls();
 }catch(err){console.error('Map rescue failed:',err);showLinkFallback(container);bindFallbackControls();}
 finally{container.dataset.mapRescueBusy='0';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair,{once:true});else repair();
window.addEventListener('load',function(){setTimeout(repair,700);});
setTimeout(repair,2200);
})();