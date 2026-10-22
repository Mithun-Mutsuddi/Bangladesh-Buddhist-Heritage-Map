(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const bn = v => String(v).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  const places = () => Array.isArray(window.destinations) ? window.destinations : [];
  const mapsSearch = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  const placeQuery = p => [p && p.name, p && p.upazila, p && p.district, 'Bangladesh'].filter(Boolean).join(', ');
  const byPlaceId = id => places().find(p => p.id === id) || null;
  const validCoords = p => Array.isArray(p && p.coords) && p.coords.length === 2 &&
    Number.isFinite(Number(p.coords[0])) && Number.isFinite(Number(p.coords[1])) &&
    Number(p.coords[0]) >= -90 && Number(p.coords[0]) <= 90 &&
    Number(p.coords[1]) >= -180 && Number(p.coords[1]) <= 180;
  let eventsCache = [];
  let noteToCopy = '';

  function addSections() {
    if (!$('festival-tracker')) {
      const el = document.createElement('section');
      el.id = 'festival-tracker'; el.className = 'upgrade-section wrap';
      el.innerHTML = '<div class="upgrade-heading"><div><p class="upgrade-kicker">CULTURE & CALENDAR</p><h2>বৌদ্ধ উৎসব ও সাংস্কৃতিক ক্যালেন্ডার</h2><p>বুদ্ধ পূর্ণিমা, কঠিন চীবর দান, মাঘী পূর্ণিমা, আষাঢ়ী পূর্ণিমা, বর্ষাবাস ও স্থানীয় বিহার-অনুষ্ঠান। চন্দ্রপঞ্জিকা ও স্থানীয় সংঘের ঘোষণায় দিন বদলাতে পারে।</p></div><span class="upgrade-emblem" aria-hidden="true">☸</span></div><div class="upgrade-toolbar"><label class="upgrade-search"><span>⌕</span><input id="festivalSearch" type="search" placeholder="উৎসব খুঁজুন / Search festivals" aria-label="উৎসব খুঁজুন"></label><label class="upgrade-select"><span>ভাষা / Language</span><select id="festivalLanguage"><option value="bn">বাংলা</option><option value="en">English</option></select></label></div><p class="upgrade-caution">তারিখের সতর্কতা: কোনো Gregorian তারিখ এখানে অনুমান করে দেখানো হয় না। ভ্রমণের আগে সংশ্লিষ্ট বিহারের আনুষ্ঠানিক ঘোষণা যাচাই করুন।</p><div id="festivalGrid" class="festival-grid" aria-live="polite"><div class="upgrade-skeleton">উৎসবের তথ্য লোড হচ্ছে…</div></div>';
      const explore = $('explore');
      const map = $('map-section');
      if (explore) explore.after(el);
      else if (map) map.closest('section')?.after(el);
      else ($('historical-archive') || document.querySelector('footer'))?.before(el);
    }
    if (!$('travel-guide')) {
      const el = document.createElement('section');
      el.id = 'travel-guide'; el.className = 'upgrade-section wrap';
      el.innerHTML = '<div class="upgrade-heading"><div><p class="upgrade-kicker">ROUTES · STAYS · LOCAL SERVICES</p><h2>ভ্রমণ রুট, হোটেল ও স্থানীয় সেবা</h2><p>আপনার যাত্রার শুরু, গন্তব্য ও চলাচলের ধরন বেছে Google Maps-এ রুট খুঁজুন। হোটেল, খাবার, চিকিৎসা, পুলিশ, ফায়ার সার্ভিস ও পরিবহন—সব লিংক নাম-ভিত্তিক live search খুলবে।</p></div><span class="upgrade-emblem" aria-hidden="true">⌖</span></div><div class="travel-layout"><form id="travelRouteForm" class="upgrade-panel"><h3>আপনার যাত্রা পরিকল্পনা করুন</h3><label>কোথা থেকে যাত্রা শুরু করবেন? <input id="travelOrigin" required maxlength="200" placeholder="যেমন: Dhaka / ঢাকা"></label><label>গন্তব্য <select id="travelDestination" required><option value="">স্থান নির্বাচন করুন…</option></select></label><label>যাতায়াতের ধরন <select id="travelMode"><option value="driving">গাড়ি / Driving</option><option value="transit">গণপরিবহন / Transit</option><option value="walking">হাঁটা / Walking</option><option value="bicycling">সাইকেল / Cycling</option></select></label><button class="upgrade-primary" type="submit">Google Maps-এ রুট দেখুন ↗</button><p class="upgrade-small">পিন আনুমানিক হলে গন্তব্যের নাম দিয়ে অনুসন্ধান খোলে, স্থানাঙ্কে সরাসরি রুট নয়। সময়, ভাড়া ও সড়কের অবস্থা নিশ্চিত নয়।</p><p id="routeStatus" class="upgrade-status" role="status" aria-live="polite"></p></form><div class="upgrade-panel service-panel"><h3>গন্তব্যের কাছে কী খুঁজবেন?</h3><p id="serviceTarget" class="service-target">প্রথমে একটি গন্তব্য নির্বাচন করুন।</p><div class="service-link-grid"><a data-service="hotel" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><span>⌂</span><strong>হোটেল / রিসোর্ট</strong><small>Stay options</small></a><a data-service="food" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><span>♨</span><strong>খাবার / রেস্তোরাঁ</strong><small>Food nearby</small></a><a data-service="medical" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><span>✚</span><strong>হাসপাতাল / ক্লিনিক</strong><small>Medical nearby</small></a><a data-service="police" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><span>✦</span><strong>পুলিশ স্টেশন</strong><small>Police station</small></a><a data-service="fire" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><span>♨</span><strong>ফায়ার সার্ভিস</strong><small>Fire service</small></a><a data-service="transport" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"><span>⇄</span><strong>বাস / ট্রেন / পরিবহন</strong><small>Transport</small></a></div><div class="upgrade-caution compact">মানচিত্রের ফলাফল বর্তমান খোলা থাকা, সেবার মান বা জরুরি সহায়তার নিশ্চয়তা নয়। জরুরি পরিস্থিতিতে বাংলাদেশের জাতীয় জরুরি সেবা ৯৯৯ ব্যবহার করুন।</div></div></div>';
      const festival = $('festival-tracker');
      if (festival) festival.after(el); else ($('historical-archive') || document.querySelector('footer'))?.before(el);
    }
    if (!$('community-contact')) {
      const el = document.createElement('section');
      el.id = 'community-contact'; el.className = 'upgrade-section wrap';
      el.innerHTML = '<div class="upgrade-heading"><div><p class="upgrade-kicker">COMMUNITY KNOWLEDGE · CONTACT</p><h2>কমিউনিটি ও যোগাযোগ</h2><p>স্থানীয় নাম, সংশোধিত GPS, ঐতিহাসিক ছবি, মৌখিক ইতিহাস, উৎস-লিংক বা উৎসবের যাচাইকৃত ঘোষণা যোগ করে বাংলাদেশের বৌদ্ধ ঐতিহ্য নথিভুক্ত করতে সাহায্য করুন।</p></div><span class="upgrade-emblem" aria-hidden="true">✉</span></div><div class="community-upgrade-grid"><article class="upgrade-panel"><span class="community-number">01</span><h3>নতুন তথ্য বা সংশোধনী দিন</h3><p>স্থানীয়/সরকারি সূত্র, যাচাইয়ের তারিখ এবং স্থানাঙ্কের নির্ভুলতা লিখুন। ব্যক্তিগত তথ্য বা অনুমতি ছাড়া ছবি প্রকাশ করবেন না।</p><a class="upgrade-primary as-link" href="https://github.com/Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map/issues/new/choose" target="_blank" rel="noopener noreferrer">GitHub-এ সংশোধনী জমা দিন ↗</a></article><article class="upgrade-panel"><span class="community-number">02</span><h3>ঐতিহাসিক ছবি ও স্মৃতি</h3><p>ছবি তোলার তারিখ, আলোকচিত্রী, সংগ্রহকারী, আপলোডকারী, ছবির ইতিহাস, লাইসেন্স/অনুমতি এবং বিবরণ উল্লেখ করুন।</p><a class="upgrade-secondary as-link" href="#historical-archive">ঐতিহাসিক আর্কাইভ খুলুন ↓</a></article><article class="upgrade-panel"><span class="community-number">03</span><h3>ভ্রমণকারীদের সহায়তা</h3><p>প্রবেশের নিয়ম, পরিবহন, স্থানীয় ভাড়া বা সেবার তথ্য শেয়ার করুন; তথ্যটি কখন যাচাই করেছেন তা লিখুন। রিভিউ আগে খসড়া হিসেবে থাকবে।</p><a class="upgrade-secondary as-link" href="#reviews">ভ্রমণ রিভিউ দিন ↓</a></article></div><div class="community-report-bar"><div><strong>তথ্য পাঠানোর সংক্ষিপ্ত নোট তৈরি করুন</strong><p>নিচের ফর্মে তথ্য লিখুন; এটি স্বয়ংক্রিয়ভাবে প্রকাশ করে না। কপি করে GitHub submission-এ যুক্ত করুন।</p></div><form id="communityNoteForm" class="community-note-form"><label>বিষয় <input id="communityTopic" required maxlength="160" placeholder="যেমন: বিহারের নামের সংশোধন"></label><label>তথ্য ও সূত্র <textarea id="communityNote" required rows="3" maxlength="3000" placeholder="তথ্যের বিবরণ, উৎস URL, যাচাইয়ের তারিখ ও GPS-এর নির্ভুলতা"></textarea></label><div class="community-note-actions"><button class="upgrade-primary" type="submit">নোট তৈরি করুন</button><button class="upgrade-secondary" id="copyCommunityNote" type="button">নোট কপি করুন</button></div><p id="communityNoteStatus" class="upgrade-status" aria-live="polite" role="status"></p></form></div>';
      const travel = $('travel-guide');
      if (travel) travel.after(el); else ($('historical-archive') || document.querySelector('footer'))?.before(el);
    }
    if (!$('sanghamitra-moved-note')) {
      const el = document.createElement('aside');
      el.id='sanghamitra-moved-note'; el.className='upgrade-caution sangha-moved-note';
      /* সংঘমিত্র চ্যাট এখন নতুন হোমপেজে (index.html#sanghamitra, sanghamitra.js) —
         এই এমবেডেড উইজেটটি ইচ্ছাকৃতভাবে খুলে নেওয়া হলো; নিচে পথনির্দেশ মাত্র। */
      el.innerHTML = '☸ <strong>সংঘমিত্র সহায়ক এখন নতুন হোমপেজে:</strong> <a href="index.html#sanghamitra">হোমের সংঘমিত্র সেকশনে যান →</a> সেখানে শিশুর ধর্মীয় নাম ও প্রতিষ্ঠান/স্থানের নামের সাজেশনও যোগ হয়েছে।';
      const community = $('community-contact');
      const reportBar = community && community.querySelector('.community-report-bar');
      if (reportBar) reportBar.insertAdjacentElement('afterend', el);
      else if (community) community.append(el);
      else {
        const footer = document.querySelector('footer');
        if (footer) footer.before(el); else document.body.append(el);
      }
    }
  }

  function setupMapRecovery() {
    const container = $('map');
    if (!container) return;
    const all = places();
    const pins = all.filter(validCoords);
    const queryFor = p => mapsSearch(placeQuery(p));
    const popup = p => '<div class="heritage-popup"><strong>' + esc(p.name) + '</strong><p>' + esc([p.district,p.division].filter(Boolean).join(' · ')) + '</p>' +
      ((p.pinApproximate || p.verificationPending) ? '<p class="popup-warning">⚠ পিন আনুমানিক; গেটের GPS নয়।</p>' : '') +
      '<a href="' + queryFor(p) + '" target="_blank" rel="noopener noreferrer">Google Maps-এ স্থান খুঁজুন ↗</a></div>';
    function statusNote(fallback) {
      let note = $('mapRuntimeStatus');
      if (!note) { note=document.createElement('p'); note.id='mapRuntimeStatus'; note.className='map-runtime-status'; container.insertAdjacentElement('afterend',note); }
      const approx = pins.filter(p=>p.pinApproximate || p.verificationPending).length;
      note.textContent = bn(all.length) + 'টি রেকর্ডের মধ্যে ' + bn(pins.length) + 'টির স্থানাঙ্ক আছে; এর মধ্যে ' + bn(approx) + 'টি আনুমানিক বা যাচাইাধীন। কাছাকাছি পিন গুচ্ছবদ্ধ থাকতে পারে—জুম বাড়ান.' + (fallback?' বিকল্প ম্যাপ স্তর চালু হয়েছে।':'');
    }
    if (!window.L) {
      const names = all.slice(0,8).map(p=>'<a href="' + queryFor(p) + '" target="_blank" rel="noopener noreferrer">' + esc(p.name) + ' ↗</a>').join('');
      container.innerHTML = '<div class="map-library-fallback"><strong>ইন্টার‌্যাকটিভ ম্যাপ লাইব্রেরি লোড হয়নি</strong><p>CDN বা সংযোগ ব্লক হলে পিন দেখা যায় না। আপাতত স্থাননাম দিয়ে Google Maps-এ খুঁজুন।</p><button type="button" id="mapFallbackLocate" class="button button-dark button-small">◎ আমার অবস্থান খুঁজুন</button><p id="mapFallbackLocation" role="status" aria-live="polite"></p><div>' + names + '</div></div>';
      const locationButton = $('mapFallbackLocate');
      locationButton?.addEventListener('click',()=>{
        if(!navigator.geolocation){alert('এই ব্রাউজারে অবস্থান শনাক্ত করা যায় না।');return;}
        if(!window.isSecureContext){alert('অবস্থান শনাক্ত করতে HTTPS সাইট খুলুন.');return;}
        locationButton.disabled=true;locationButton.textContent='অবস্থান খোঁজা হচ্ছে…';
        navigator.geolocation.getCurrentPosition(pos=>{
          locationButton.disabled=false;locationButton.textContent='◎ আমার অবস্থান খুঁজুন';
          const lat=pos.coords.latitude,lng=pos.coords.longitude,url=mapsSearch(lat+','+lng),output=$('mapFallbackLocation');
          if(output)output.innerHTML='অবস্থান: '+lat.toFixed(5)+', '+lng.toFixed(5)+' · <a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Google Maps-এ খুলুন ↗</a>';
        },err=>{
          locationButton.disabled=false;locationButton.textContent='◎ আমার অবস্থান খুঁজুন';
          alert(err.code===1?'Browser Site settings → Location → Allow করুন.':err.code===3?'অবস্থানের অনুরোধের সময় শেষ হয়েছে; আবার চেষ্টা করুন.':'Device Location/GPS চালু আছে কি না দেখুন.');
        },{enableHighAccuracy:false,timeout:15000,maximumAge:60000});
      });
      statusNote(true); return;
    }
    let map = window.__heritageLeafletMap || null;
    // A prior error handler may have replaced the map's DOM but left a stale Leaflet instance.
    // Recreate the instance whenever its panes are no longer inside the visible map container.
    if(map && !container.querySelector('.leaflet-pane')){
      try{map.remove();}catch(_){}
      // Leaflet sets this internal guard on the container; clear it if remove() was interrupted.
      container._leaflet_id = undefined;
      map=null;
      window.__heritageLeafletMap=null;
      window.__heritageMarkerLayer=null;
      window.__heritageFallbackMarkerLayer=null;
    }
    let madeFallback = false;
    if (!map) {
      container.innerHTML = '';
      map = window.L.map(container,{scrollWheelZoom:false,preferCanvas:true}).setView([23.685,90.3563],7);
      window.__heritageLeafletMap = map;
      if(window.attachHeritageTileLayer)window.attachHeritageTileLayer(map);
      else window.__heritageTileLayer=window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,updateWhenIdle:true,keepBuffer:3,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'}).addTo(map);
      madeFallback=true;
    }
    function addRecoveryPins(layer) {
      if (!layer || !pins.length) return;
      pins.forEach(p=>{
        const markerIcon=window.L.divIcon({className:'heritage-fallback-marker',html:'<span aria-hidden="true">☸</span>',iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-17]});
        const marker=window.L.marker([Number(p.coords[0]),Number(p.coords[1])],{icon:markerIcon,title:p.name,alt:p.name});
        marker.bindPopup(popup(p),{maxWidth:290});
        marker.on('click',()=>{ if(typeof window.selectPlace==='function') window.selectPlace(p.id,false,false); });
        layer.addLayer(marker);
      });
    }
    if (pins.length && madeFallback) {
      // The main app failed before it could mount its marker layer; create a dedicated layer.
      const layer = typeof window.L.markerClusterGroup==='function'
        ? window.L.markerClusterGroup({chunkedLoading:false,maxClusterRadius:40,disableClusteringAtZoom:13,showCoverageOnHover:false})
        : window.L.layerGroup();
      addRecoveryPins(layer);
      layer.addTo(map);
      window.__heritageFallbackMarkerLayer=layer;
      window.__heritageMarkerLayer=layer;
    } else if (pins.length) {
      // app.js uses chunked marker loading. Don't add a second pin layer before it finishes,
      // otherwise searching cannot clear the duplicate markers. Recover only if still empty.
      setTimeout(()=>{
        if(container.querySelectorAll('.leaflet-marker-icon').length>0)return;
        const activeLayer=window.__heritageMarkerLayer;
        if(activeLayer){
          try{activeLayer.clearLayers();addRecoveryPins(activeLayer);window.__heritageFallbackMarkerLayer=null;}
          catch(error){console.warn('Could not repair the existing marker layer; creating a fallback.',error);}
          return;
        }
        const fallback=typeof window.L.markerClusterGroup==='function'
          ? window.L.markerClusterGroup({chunkedLoading:false,maxClusterRadius:40,disableClusteringAtZoom:13,showCoverageOnHover:false})
          : window.L.layerGroup();
        addRecoveryPins(fallback);fallback.addTo(map);
        window.__heritageFallbackMarkerLayer=fallback;
        window.__heritageMarkerLayer=fallback;
      },1000);
    }
    statusNote(madeFallback);
    const refresh = () => {
      try {
        map.invalidateSize({pan:false,debounceMoveend:true});
        if(window.__heritageTileLayer && typeof window.__heritageTileLayer.redraw==='function')window.__heritageTileLayer.redraw();
      } catch(_){}
    };
    setTimeout(refresh,120);
    setTimeout(refresh,500);
    setTimeout(refresh,1100);
    if(typeof ResizeObserver==='function' && !container.__heritageResizeObserver){
      container.__heritageResizeObserver=new ResizeObserver(refresh);
      container.__heritageResizeObserver.observe(container);
    }
    if(!container.__heritageResizeHandler){
      container.__heritageResizeHandler=refresh;
      window.addEventListener('resize',refresh,{passive:true});
      window.addEventListener('pageshow',refresh);
    }
    if (madeFallback) {
      const btn=document.createElement('button');
      btn.type='button'; btn.id='enhancedLocateMe'; btn.className='button button-dark button-small enhanced-locate'; btn.textContent='◎ আমার অবস্থান';
      const actions=container.parentElement && container.parentElement.querySelector('.map-bottom-actions');
      if(actions) actions.append(btn);
      btn.addEventListener('click',()=>{
        if(!navigator.geolocation){alert('এই ব্রাউজারে অবস্থান শনাক্ত করা যায় না। Google Maps-এ location চালু করুন।');return;}
        if(!window.isSecureContext){alert('Browser location সাধারণত HTTPS বা localhost-এ কাজ করে। প্রকাশিত HTTPS সাইট খুলে আবার চেষ্টা করুন।');return;}
        btn.disabled=true;btn.textContent='অবস্থান খোঁজা হচ্ছে…';
        navigator.geolocation.getCurrentPosition(pos=>{
          btn.disabled=false;btn.textContent='◎ আমার অবস্থান';const ll=[pos.coords.latitude,pos.coords.longitude];
          map.setView(ll,13,{animate:true});
          if(window.__heritageUserLocationMarker)window.__heritageUserLocationMarker.remove();
          window.__heritageUserLocationMarker=window.L.marker(ll).addTo(map).bindPopup('আপনার বর্তমান অবস্থান').openPopup();
        },err=>{
          btn.disabled=false;btn.textContent='◎ আমার অবস্থান';
          alert(err.code===1?'Browser site settings-এ Location → Allow করুন.':err.code===3?'অবস্থান অনুরোধের সময় শেষ হয়েছে; আবার চেষ্টা করুন.':'Device location ও browser permission যাচাই করুন.');
        },{enableHighAccuracy:false,timeout:15000,maximumAge:60000});
      });
    }
  }

  function setupTravel() {
    const select=$('travelDestination'); if(!select)return;
    const choices=[...places()].sort((a,b)=>(a.name||'').localeCompare(b.name||'','bn'));
    select.innerHTML='<option value="">স্থান নির্বাচন করুন…</option>'+choices.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+' — '+esc(p.district||'জেলা যাচাই করুন')+'</option>').join('');
    const queries={hotel:'hotels and guest houses near',food:'restaurants and food near',medical:'hospital clinic medical services near',police:'police station near',fire:'fire service station near',transport:'bus station train station transport near'};
    function updateServices(){
      const p=byPlaceId(select.value);
      const target=$('serviceTarget'); if(target)target.textContent=p?'নির্বাচিত স্থান: '+p.name+' · '+(p.district||''):'প্রথমে একটি গন্তব্য নির্বাচন করুন।';
      document.querySelectorAll('[data-service]').forEach(a=>{a.href=p?mapsSearch((queries[a.dataset.service]||'services near')+' '+placeQuery(p)):'https://www.google.com/maps';});
    }
    select.addEventListener('change',updateServices);updateServices();
    $('travelRouteForm')?.addEventListener('submit',event=>{
      event.preventDefault();
      const origin=$('travelOrigin').value.trim();const p=byPlaceId(select.value);
      if(!origin||!p){$('routeStatus').textContent='শুরুর স্থান ও গন্তব্য নির্বাচন করুন।';return;}
      const dest=(p.pinApproximate||p.verificationPending||!validCoords(p))?placeQuery(p):Number(p.coords[0])+','+Number(p.coords[1]);
      const url=new URL('https://www.google.com/maps/dir/');url.searchParams.set('api','1');url.searchParams.set('origin',origin);url.searchParams.set('destination',dest);url.searchParams.set('travelmode',$('travelMode').value);
      $('routeStatus').textContent=(p.pinApproximate||p.verificationPending||!validCoords(p))?'সতর্কতা: এই স্থানটির পিন আনুমানিক বা নেই; Google Maps-এ গন্তব্য যাচাই করুন।':'Google Maps-এ রুট খোলা হচ্ছে। সড়ক ও সময় যাত্রার দিন যাচাই করুন।';
      window.open(url.toString(),'_blank','noopener,noreferrer');
    });
  }

  function festivalCard(e, lang) {
    const en=lang==='en';
    const name=en?(e.festival_name_en||e.name_en||e.festival_name):e.festival_name;
    const desc=en?(e.description_en||e.description_bn):(e.description_bn||e.description);
    return '<article class="festival-card"><div class="festival-card-top"><span class="festival-icon" aria-hidden="true">☸</span><span class="festival-date-tag">'+(en?'LUNAR / LOCAL DATE':'চন্দ্রপঞ্জিকা / স্থানীয় তারিখ')+'</span></div><h3>'+esc(name||e.id)+'</h3><p>'+esc(desc||'')+'</p><dl><div><dt>'+(en?'Date':'তারিখ')+'</dt><dd>'+esc(e.lunar_date||'চন্দ্রপঞ্জিকা / local calendar')+'</dd></div><div><dt>'+(en?'Tradition':'ঐতিহ্য')+'</dt><dd>'+esc(e.tradition||'সম্প্রদায়ভেদে ভিন্ন')+'</dd></div></dl><p class="festival-warning">'+(en?'Confirm date with the host monastery before traveling.':'যাত্রার আগে সংশ্লিষ্ট বিহারের ঘোষণা থেকে তারিখ নিশ্চিত করুন।')+'</p></article>';
  }
  function renderFestivals(){
    const grid=$('festivalGrid');if(!grid)return;
    const q=($('festivalSearch')?.value||'').trim().toLocaleLowerCase('bn');const lang=$('festivalLanguage')?.value||'bn';
    const selected=eventsCache.filter(e=>!q||[e.festival_name,e.festival_name_en,e.lunar_date,e.description_bn,e.description_en,e.tradition].filter(Boolean).join(' ').toLocaleLowerCase('bn').includes(q));
    grid.innerHTML=selected.length?selected.map(e=>festivalCard(e,lang)).join(''):'<div class="upgrade-empty">কোনো উৎসব পাওয়া যায়নি / No festival matched.</div>';
  }
  async function setupFestivals(){
    const grid=$('festivalGrid');if(!grid)return;
    try{
      const response=await fetch(new URL('./data/events.json',document.baseURI),{cache:'no-store'});
      if(!response.ok)throw new Error('Events file unavailable');
      const raw=await response.json();eventsCache=Array.isArray(raw)?raw:(raw.events||[]);
      eventsCache=eventsCache.map(e=>({...e,festival_name_en:e.festival_name_en||e.name_en||'',description_en:e.description_en||e.description?.en||'',description_bn:e.description_bn||e.description||'',lunar_date:e.lunar_date||e.lunarDate||'',tradition:e.tradition||''}));
      renderFestivals();
    }catch(_){grid.innerHTML='<div class="upgrade-empty">উৎসবের তালিকা লোড হয়নি। সংযোগ যাচাই করুন বা সংশ্লিষ্ট বিহারের ঘোষণা দেখুন।</div>';}
    $('festivalSearch')?.addEventListener('input',renderFestivals);$('festivalLanguage')?.addEventListener('change',renderFestivals);
  }

  function setupCommunity(){
    $('communityNoteForm')?.addEventListener('submit',event=>{
      event.preventDefault();
      noteToCopy='বাংলাদেশ বৌদ্ধ ঐতিহ্য মানচিত্র — community correction\n\nবিষয়: '+$('communityTopic').value.trim()+'\n\nবিবরণ ও সূত্র:\n'+$('communityNote').value.trim()+'\n\nপ্রকাশের আগে উৎস, স্থানাঙ্ক এবং ব্যক্তিগত তথ্য যাচাই করুন।';
      $('communityNoteStatus').textContent='নোট তৈরি হয়েছে। “নোট কপি করুন” চাপুন, তারপর GitHub-এ সংশোধনী জমা দিন।';
    });
    $('copyCommunityNote')?.addEventListener('click',async()=>{
      if(!noteToCopy){$('communityNoteStatus').textContent='আগে বিষয় ও তথ্য লিখে “নোট তৈরি করুন” চাপুন।';return;}
      try{await navigator.clipboard.writeText(noteToCopy);$('communityNoteStatus').textContent='নোট কপি হয়েছে। GitHub submission-এ paste করুন.';}
      catch(_){window.prompt('নোটটি কপি করুন:',noteToCopy);}
    });
  }

  function setupSeoContent(){
    const detail=$('placeDetail');
    if(!detail)return;
    const render=()=>{
      const heading=detail.querySelector('h3');
      if(!heading)return;
      const selectedCard=document.querySelector('.place-card.is-selected');
      let p=selectedCard?byPlaceId(selectedCard.dataset.placeCard):null;
      if(!p)p=places().find(site=>site.name===heading.textContent)||null;
      if(!p)return;
      const existing=detail.querySelector('.seo-longform');
      if(existing&&existing.dataset.seoId===p.id)return;
      if(existing)existing.remove();
      const section=document.createElement('article');
      section.className='seo-longform';
      section.dataset.seoId=p.id;
      const title=document.createElement('h4');
      title.textContent='ইতিহাস ও বিস্তারিত ভ্রমণ গাইড';
      section.append(title);
      const intro=document.createElement('p');
      intro.className='seo-editorial-note';
      intro.textContent='স্থানভিত্তিক দীর্ঘ নিবন্ধটি পড়তে ক্লিক করুন। কিছু লেখা গবেষণার খসড়া; অনিশ্চিত তারিখ, প্রত্নতাত্ত্বিক দাবি, প্রবেশমূল্য ও GPS আগে যাচাই করুন।';
      section.append(intro);
      const button=document.createElement('button');
      button.type='button';button.className='seo-load-button';button.textContent='সম্পূর্ণ ইতিহাস ও ভ্রমণ নির্দেশিকা পড়ুন ↓';
      const status=document.createElement('p');status.className='seo-load-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
      button.addEventListener('click',async()=>{
        button.disabled=true;button.textContent='নিবন্ধ লোড হচ্ছে…';status.textContent='';
        try{
          if(typeof window.loadHeritageSeoArticle!=='function')throw new Error('SEO loader unavailable');
          const article=await window.loadHeritageSeoArticle(p.id);
          if(!article)throw new Error('এই স্থানের নিবন্ধ পাওয়া যায়নি');
          section.querySelectorAll('.seo-article-paragraph,.seo-source-links,.seo-article-title,.seo-article-status').forEach(node=>node.remove());
          const articleTitle=document.createElement('h4');articleTitle.className='seo-article-title';articleTitle.textContent=article.title||p.name;
          section.insertBefore(articleTitle,button);
          const editorial=document.createElement('p');editorial.className='seo-editorial-note seo-article-status';
          editorial.textContent=String(article.editorial_status||'').startsWith('draft')?'সম্পাদকীয় খসড়া · প্রকাশের আগে ঐতিহাসিক তথ্য, স্থানাঙ্ক ও সূত্র মানবসম্পাদনায় যাচাই করুন।':'উৎস-সংযুক্ত তথ্য · যাত্রার আগে পরিবর্তনশীল তথ্য যাচাই করুন।';
          section.insertBefore(editorial,button);
          String(article.content||'').split(/\n\s*\n/).filter(Boolean).forEach(text=>{
            const paragraph=document.createElement('p');paragraph.className='seo-article-paragraph';paragraph.textContent=text;section.insertBefore(paragraph,button);
          });
          const urls=Array.isArray(article.sources)?article.sources:[];
          if(urls.length){
            const links=document.createElement('div');links.className='seo-source-links';
            urls.filter(Boolean).slice(0,6).forEach((source,index)=>{
              const url=typeof source==='string'?source:source.url;
              if(!url)return;
              const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='তথ্যসূত্র '+(index+1)+' ↗';links.append(link);
            });
            section.insertBefore(links,button);
          }
          button.textContent='নিবন্ধ লোড হয়েছে ✓';button.disabled=true;button.setAttribute('aria-label','দীর্ঘ নিবন্ধ লোড করা হয়েছে');
          intro.remove();status.textContent='';
        }catch(error){
          console.warn('SEO article could not be loaded',error);
          button.disabled=false;button.textContent='আবার চেষ্টা করুন / Retry';
          status.textContent='নিবন্ধ লোড হয়নি। সংযোগ যাচাই করে আবার চেষ্টা করুন।';
        }
      });
      section.append(button,status);
      detail.append(section);
    };
    const observer=new MutationObserver(()=>render());
    observer.observe(detail,{childList:true,subtree:true});
    render();
  }

  function addMessage(content,role){
    const box=$('sanghaMessages');if(!box)return;
    const node=document.createElement('div');node.className='sangha-message '+role;node.innerHTML=content;box.append(node);box.scrollTop=box.scrollHeight;
  }
  function answerBot(query){
    const q=query.toLocaleLowerCase('bn');const data=places();
    const p=data.find(site=>[site.name,site.nameEn,site.district,site.upazila,site.summary].filter(Boolean).some(x=>q.includes(String(x).toLocaleLowerCase('bn'))));
    const en=/\b(how|where|route|travel|hotel|hospital|history|festival|police|fire|near|visit|etiquette|photo)\b/i.test(query);
    const intro=en?'Here is the most reliable guidance in this directory:':'এই ডিরেক্টরির তথ্যের ভিত্তিতে নির্দেশনা:';
    let answer='',links='';
    if(/festival|উৎসব|পূর্ণিমা|চীবর|কঠিন/.test(q)){
      answer=en?'Festival dates may follow a lunar calendar and local Sangha announcements. Confirm the Gregorian date with the host monastery; this tracker does not guess dates.':'উৎসবের দিন চন্দ্রপঞ্জিকা ও স্থানীয় সংঘের ঘোষণায় নির্ধারিত হতে পারে। Gregorian তারিখ সংশ্লিষ্ট বিহারের ঘোষণায় নিশ্চিত করুন; ক্যালেন্ডার অনুমান করে তারিখ দেয় না.';
      links='<a href="#festival-tracker">উৎসব ক্যালেন্ডার / Festival tracker ↗</a>';
    }else if(/hotel|food|restaurant|hospital|clinic|medical|police|fire|transport|হোটেল|খাবার|হাসপাতাল|চিকিৎসা|পুলিশ|ফায়ার|পরিবহন|বাস|ট্রেন/.test(q)){
      const target=p||byPlaceId($('travelDestination')?.value);
      if(target){
        const term=/hospital|clinic|medical|হাসপাতাল|চিকিৎসা/.test(q)?'hospital clinic near ':/police|পুলিশ/.test(q)?'police station near ':/fire|ফায়ার/.test(q)?'fire service near ':/hotel|হোটেল/.test(q)?'hotel near ':/food|restaurant|খাবার/.test(q)?'restaurant near ':'transport near ';
        answer=(en?'Search nearby services around ':'নির্বাচিত স্থানের কাছে সেবা খুঁজুন: ')+esc(target.name)+'. '+(en?'Map results do not guarantee opening or availability.':'মানচিত্রের ফলাফল খোলা থাকা বা সেবা পাওয়ার নিশ্চয়তা নয়.');
        links='<a href="'+mapsSearch(term+placeQuery(target))+'" target="_blank" rel="noopener noreferrer">কাছাকাছি সেবা খুঁজুন / Search nearby ↗</a> <a href="#travel-guide">ভ্রমণ গাইড / Travel guide ↗</a>';
      }else{answer=en?'Which heritage site or town should I search near?':'কোন বিহার বা শহরের কাছে সেবা খুঁজবেন?';links='<a href="#travel-guide">ভ্রমণ গাইড / Travel guide ↗</a>';}
    }else if(/route|travel|যাব|যেতে|রুট|যাতায়াত|দিকনির্দেশ|কীভাবে/.test(q)){
      answer=en?'Enter your starting place and choose a site in the travel planner. Approximate locations use name-based Google Maps search rather than a guessed gate coordinate.':'ভ্রমণ গাইডে শুরুর স্থান লিখে গন্তব্য বেছে নিন। আনুমানিক পিন হলে নির্দিষ্ট গেট ধরে রুট না দিয়ে নাম-ভিত্তিক Google Maps অনুসন্ধান হবে.';
      links='<a href="#travel-guide">রুট পরিকল্পনা / Plan route ↗</a>';
    }else if(/etiquette|conduct|respect|photo|picture|শিষ্টাচার|আচরণ|ছবি|জুতা|পোশাক/.test(q)){
      answer=en?'At an active monastery, dress modestly, speak quietly, follow shoe-removal instructions, ask permission before photographing people or ceremonies, and respect restricted areas.':'সক্রিয় বিহারে শালীন পোশাক পরুন, নীরব থাকুন, জুতা রাখার নিয়ম মানুন, মানুষ বা ধর্মীয় অনুষ্ঠানের ছবি তোলার আগে অনুমতি নিন এবং নিষিদ্ধ এলাকা এড়িয়ে চলুন.';
    }else if(/history|historic|architecture|archaeology|ইতিহাস|প্রত্ন|স্থাপত্য|পাল|মৌর্য|গুপ্ত|কুষাণ/.test(q)||p){
      if(p){
        answer=esc(p.name)+' — '+esc(p.summary||p.history||'');
        if(p.pinApproximate||p.verificationPending)answer+=' '+(en?'Coordinate warning: this pin is approximate, not a surveyed entrance.':'স্থানাঙ্ক সতর্কতা: এই পিন আনুমানিক, জরিপকৃত প্রবেশদ্বার নয়.');
        if(p.source)links+='<a href="'+esc(p.source)+'" target="_blank" rel="noopener noreferrer">তথ্যসূত্র / Source ↗</a> ';
        links+='<a href="'+mapsSearch(placeQuery(p))+'" target="_blank" rel="noopener noreferrer">Google Maps ↗</a>';
      }else{
        answer=en?'Bangladesh has Pala-period Buddhist monuments as well as modern living monasteries. Do not assign Maurya, Kushan, Gupta or Pala dates to a specific site without site-specific evidence.':'বাংলাদেশে পাল যুগের বৌদ্ধ প্রত্নস্থল এবং আধুনিক জীবন্ত বিহার—দুই ধরনের ঐতিহ্য আছে। নির্দিষ্ট প্রত্নতাত্ত্বিক প্রমাণ ছাড়া কোনো স্থানকে মৌর্য, কুষাণ, গুপ্ত বা পাল যুগের বলে দাবি করা ঠিক নয়.';
        links='<a href="#references">তথ্যসূত্র / Sources ↗</a>';
      }
    }else{
      answer=en?'I can help with heritage history, travel planning, nearby services, festivals and visitor etiquette. Include a site or town name for a more precise answer.':'আমি ঐতিহ্যের ইতিহাস, ভ্রমণ পরিকল্পনা, কাছাকাছি সেবা, উৎসব ও আচরণবিধি নিয়ে সাহায্য করতে পারি। নির্দিষ্ট উত্তরের জন্য বিহার বা শহরের নাম লিখুন.';
      links='<a href="#explore">স্থান খুঁজুন / Find a site ↗</a>';
    }
    return '<p>'+intro+'</p><p>'+answer+'</p>'+(links?'<div class="sangha-answer-links">'+links+'</div>':'');
  }
  async function sendBotMessage(query){
    const endpoint=String(window.SANGHAMITRA_API_URL||'').trim();
    if(!endpoint){addMessage(answerBot(query),'bot');return;}
    const input=$('sanghaInput');
    const lang=/[\u0980-\u09FF]/.test(query)?'bn':'en';
    const site=places().find(p=>[p.name,p.district,p.upazila].filter(Boolean).some(x=>query.toLocaleLowerCase('bn').includes(String(x).toLocaleLowerCase('bn'))));
    const pending=document.createElement('div');
    pending.className='sangha-message bot';pending.textContent=lang==='bn'?'উত্তর তৈরি হচ্ছে…':'Preparing an answer…';
    $('sanghaMessages').append(pending);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:query,language:lang,site_id:site?site.id:null})});
      if(!response.ok)throw new Error('API status '+response.status);
      const result=await response.json();
      pending.remove();
      addMessage('<p>'+esc(result.answer||result.response||'এই মুহূর্তে উত্তর পাওয়া যায়নি।')+'</p>'+(Array.isArray(result.sources)&&result.sources.length?'<div class="sangha-answer-links">'+result.sources.slice(0,5).map(s=>'<a href="'+esc(s.url||s)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||'তথ্যসূত্র')+' ↗</a>').join('')+'</div>':''),'bot');
    }catch(error){
      pending.remove();
      addMessage(answerBot(query)+'<p class="seo-editorial-note">লাইভ AI service পাওয়া যায়নি; এখানে স্থানীয় ডেমো সহায়ক ব্যবহার করা হয়েছে।</p>','bot');
      console.warn('SanghaMitra API unavailable; local fallback used.',error);
    }
  }

  function setupBot(){
    const panel=$('sanghaPanel'),toggle=$('sanghaToggle');
    toggle?.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('b').textContent=open?'−':'＋';if(open)$('sanghaInput')?.focus();});
    $('sanghaClose')?.addEventListener('click',()=>{panel.hidden=true;toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.querySelector('b').textContent='＋';});
    $('sanghaForm')?.addEventListener('submit',event=>{
      event.preventDefault();const q=$('sanghaInput').value.trim();if(!q)return;
      addMessage('<p>'+esc(q)+'</p>','user');$('sanghaInput').value='';
      sendBotMessage(q);
    });
    const quick={history:'বাংলাদেশের বৌদ্ধ ইতিহাস ও স্থাপত্য সম্পর্কে বলুন',route:'ঢাকা থেকে পাহাড়পুর যাওয়ার রুট কীভাবে পরিকল্পনা করব?',nearby:'নির্বাচিত স্থানের কাছে হাসপাতাল ও হোটেল কোথায়?',etiquette:'সক্রিয় বিহার ভ্রমণের আচরণবিধি কী?'};
    document.querySelectorAll('[data-sangha-quick]').forEach(btn=>btn.addEventListener('click',()=>{const q=quick[btn.dataset.sanghaQuick]||'বৌদ্ধ ঐতিহ্য সম্পর্কে বলুন';addMessage('<p>'+esc(q)+'</p>','user');addMessage(answerBot(q),'bot');}));
  }

  function init(){
    addSections();
    try{setupMapRecovery();}catch(e){console.error('Map recovery failed',e);const m=$('map');if(m)m.innerHTML='<div class="map-library-fallback"><strong>ম্যাপ শুরু করা যায়নি</strong><p>Google Maps-এ স্থাননাম অনুসন্ধান করুন বা পৃষ্ঠা reload করুন।</p></div>';}
    setupTravel();setupCommunity();setupFestivals();setupSeoContent(); /* setupBot() বাদ: চ্যাট এখন হোমে */
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();