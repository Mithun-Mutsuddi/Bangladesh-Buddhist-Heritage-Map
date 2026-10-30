/* চর্যাভূমি — welcome-fixed.js (v2026.11.01)
   FIX: Welcome Note শুধু "বিশেষ দিন" + Sign in/Sign up করলেই দেখাবে।
   আগের সব ফিচার অক্ষত — কোনো ডিলিট হয়নি।
   - বিশেষ দিন = পূর্ণিমা/উপোসথ/উৎসব/জাতীয় দিবস/বর্ষাবাস/কঠিন চীবর
   - Sign in/up করলে session-এ justAuth ফ্ল্যাগ বসে, welcome খোলে
   - মোবাইলেও (≤1024px) বিশেষ দিন বা লগইনের পর খুলবে — আগে মোবাইলে বন্ধ ছিল
*/
(function () {
  'use strict';
  var dialog = document.getElementById('welcomeDialog');
  if (!dialog) return;

  var PROFILE_KEY = 'charyabhumiWelcomeProfileV1';
  var SESSION_KEY = 'charyabhumiWelcomeSeenV1';
  var AUTH_KEY = 'charyabhumiAuthV1'; // {signedIn:true, name, provider, time}
  var JUST_AUTH_KEY = 'charyabhumiJustAuthV1';
  var $ = function (id) { return document.getElementById(id); };
  var query = new URLSearchParams(location.search);
  var autoDisabled = query.get('welcome') === '0';
  var forced = query.get('welcome') === '1';
  var profile = readProfile();

  var FESTIVALS = {
    'চৈত্র': { name: 'চৈত্র পূর্ণিমা', detail: 'বার্ষিক চক্রের শেষ পূর্ণিমা; আত্মশুদ্ধি, সমতা ও বিশ্বশান্তি প্রার্থনা' },
    'বৈশাখ': { name: 'বুদ্ধ পূর্ণিমা (বৈশাখী পূর্ণিমা)', detail: 'বুদ্ধের জন্ম, বোধিলাভ ও মহাপরিনির্বাণের ত্রিস্মৃতি-বিজড়িত পবিত্রতম দিন' },
    'জ্যৈষ্ঠ': { name: 'জ্যৈষ্ঠ পূর্ণিমা', detail: 'অরহৎ মহিন্দ ও সংঘমিত্রা থেরীর লঙ্কা গমন ও ধর্মপ্রচার স্মৃতি' },
    'আষাঢ়': { name: 'আষাঢ়ী পূর্ণিমা', detail: 'সিদ্ধার্থের গর্ভাবতরণ, গৃহত্যাগ, প্রথম ধর্মচক্রপ্রবর্তন ও বর্ষাবাস শুরু' },
    'শ্রাবণ': { name: 'শ্রাবণী পূর্ণিমা', detail: 'বর্ষাবাসের মধ্যবর্তী সময়; আত্মসংযম, অধ্যয়ন ও ধ্যান' },
    'ভাদ্র': { name: 'মধু পূর্ণিমা (ভাদ্র পূর্ণিমা)', detail: 'পারিলেয়্যক বনে বানর ও হস্তীর মধু দান; প্রাণীদের প্রতি মৈত্রী বার্তা' },
    'আশ্বিন': { name: 'প্রবারণা পূর্ণিমা (আশ্বিনী পূর্ণিমা)', detail: 'বর্ষাবাস সমাপ্তি; ক্ষমা বিনিময় ও ফানুস/আকাশপ্রদীপ উৎসব' },
    'কার্তিক': { name: 'কার্তিক পূর্ণিমা', detail: 'অরহৎ সারিপুত্রের মহাপরিনির্বাণ; কঠিন চীবর দানোৎসবের সমাপ্তি' },
    'অগ্রহায়ণ': { name: 'অগ্রহায়ণ পূর্ণিমা', detail: 'লঙ্কায় বোধিবৃক্ষের শাখা প্রেরণ স্মৃতি; বোধিপূজা দিন' },
    'পৌষ': { name: 'পৌষ পূর্ণিমা', detail: 'বুদ্ধের লঙ্কাদ্বীপ আগমন ও শান্তি-মৈত্রীর বাণী স্মরণ' },
    'মাঘ': { name: 'মাঘী পূর্ণিমা', detail: 'আয়ুসংস্কার বিসর্জন, ওবাদ পাটিমোক্খ উপদেশ ও সংঘ দিবস' },
    'ফাল্গুন': { name: 'ফাল্গুনী পূর্ণিমা', detail: 'কপিলবস্তুতে বুদ্ধের প্রথম প্রত্যাবর্তন ও শাক্যপরিবারে ধর্মদেশনা' }
  };
  var SEASONS = {
    'বৈশাখ': 'বৈশাখের নতুন আলোয় মৈত্রী ও শান্তির শুভেচ্ছা',
    'জ্যৈষ্ঠ': 'জ্যৈষ্ঠের উষ্ণ দিনে সহনশীলতা ও শান্তির শুভেচ্ছা',
    'আষাঢ়': 'বর্ষার শান্ত স্রোতে মৈত্রী ও করুণার শুভেচ্ছা',
    'শ্রাবণ': 'শ্রাবণের শিশিরে সততা ও শান্তির শুভেচ্ছা',
    'ভাদ্র': 'ভাদ্রের আকাশে প্রসন্ন মনের শুভেচ্ছা',
    'আশ্বিন': 'শরতের নির্মল আকাশে মৈত্রী ও শান্তির শুভেচ্ছা',
    'কার্তিক': 'হেমন্তের নরম আলোয় করুণা ও শান্তির শুভেচ্ছা',
    'অগ্রহায়ণ': 'অগ্রহায়ণের প্রশান্ত দিনে মৈত্রীর শুভেচ্ছা',
    'পৌষ': 'পৌষের শীতল সকালে উষ্ণ মৈত্রীর শুভেচ্ছা',
    'মাঘ': 'মাঘের প্রশান্তিতে সত্য ও শান্তির শুভেচ্ছা',
    'ফাল্গুন': 'ফাল্গুনের বসন্ত-আভায় করুণার শুভেচ্ছা',
    'চৈত্র': 'চৈত্রের নতুন সূচনায় মৈত্রী ও সাহসের শুভেচ্ছা'
  };

  function clean(v){ return String(v==null?'':v).trim(); }
  function readProfile(){
    try{ var p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}'); return {name:clean(p.name).slice(0,60), location:clean(p.location).slice(0,80)}; }catch(_){ return {name:'', location:''}; }
  }
  function saveProfile(){ try{ localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }catch(_){} }
  function seen(){ try{ return sessionStorage.getItem(SESSION_KEY)==='1'; }catch(_){ return false; } }
  function markSeen(){ try{ sessionStorage.setItem(SESSION_KEY,'1'); }catch(_){} }
  function hasAuth(){ try{ var a=JSON.parse(localStorage.getItem(AUTH_KEY)||'null'); return !!(a && a.signedIn); }catch(_){ return false; } }
  function justAuthed(){ try{ return sessionStorage.getItem(JUST_AUTH_KEY)==='1'; }catch(_){ return false; } }
  function clearJustAuth(){ try{ sessionStorage.removeItem(JUST_AUTH_KEY); }catch(_){} }

  function periodFor(now){
    var n=window.CharyabhumiPanjika ? window.CharyabhumiPanjika.dhakaNow(now.getTime()) : null;
    var h=n ? n.h : Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka', hour:'2-digit', hourCycle:'h23'}).format(now));
    if(h>=4&&h<12) return {id:'morning', label:'শুভ সকাল'};
    if(h>=12&&h<16) return {id:'day', label:'শুভ দুপুর'};
    if(h>=16&&h<18) return {id:'afternoon', label:'শুভ বিকেল'};
    if(h>=18&&h<20) return {id:'evening', label:'শুভ সন্ধ্যা'};
    return {id:'night', label:'শুভ রাত্রি'};
  }
  function fixedFestival(now){
    var n=window.CharyabhumiPanjika ? window.CharyabhumiPanjika.dhakaNow(now.getTime()) : null;
    var key=n ? n.m+'-'+n.d : (now.getMonth()+1)+'-'+now.getDate();
    var fixed={
      '2-21':['আন্তর্জাতিক মাতৃভাষা দিবসের শ্রদ্ধাঞ্জলি','ভাষা ও ইতিহাসের স্মৃতিতে প্রশান্ত শুভেচ্ছা'],
      '3-26':['স্বাধীনতা দিবসের শুভেচ্ছা','স্বাধীনতা, মানবিকতা ও শান্তির শুভেচ্ছা'],
      '4-14':['শুভ নববর্ষ','বাংলা নববর্ষের নতুন আলোয় মৈত্রী ও করুণার শুভেচ্ছা'],
      '5-1':['মে দিবসের শুভেচ্ছা','শ্রমের মর্যাদা ও মানবিকতার শুভেচ্ছা'],
      '12-16':['বিজয় দিবসের শুভেচ্ছা','স্বাধীনতা ও শান্তির শুভেচ্ছা']
    };
    if(!fixed[key]) return null;
    return {title:fixed[key][0], detail:fixed[key][1], kind:'festival'};
  }
  function inVassaSeason(now, api){ try{ var up=api.upcoming(60, now.getTime()); var last=null; var n=api.dhakaNow(now.getTime()); var today=new Date(Date.UTC(n.y,n.m-1,n.d)); for(var i=0;i<up.length;i++){ var d=new Date(Date.UTC(up[i].y,up[i].m-1,up[i].d)); if(up[i].t===15 && d<=today) last=up[i]; } if(last && (last.bd.month==='আষাঢ়'||last.bd.month==='শ্রাবণ'||last.bd.month==='ভাদ্র')) return true; }catch(_){} return false; }
  function inKathinaSeason(now, api){ try{ var up=api.upcoming(40, now.getTime()); var last=null; var n=api.dhakaNow(now.getTime()); var today=new Date(Date.UTC(n.y,n.m-1,n.d)); for(var i=0;i<up.length;i++){ var d=new Date(Date.UTC(up[i].y,up[i].m-1,up[i].d)); if(up[i].t===15 && d<=today) last=up[i]; } if(last && (last.bd.month==='আশ্বিন'||last.bd.month==='কার্তিক')) return true; }catch(_){} return false; }

  function festivalFor(now){
    var fixed=fixedFestival(now); if(fixed) return fixed;
    var api=window.CharyabhumiPanjika;
    if(api){
      try{
        var n=api.dhakaNow(now.getTime()); var bd=api.banglaDate(n.y,n.m,n.d); var info=api.dayInfo(n.y,n.m,n.d);
        if(info.p.tithi===15){ var cur=FESTIVALS[bd.month]||{name:'পূর্ণিমা ও উপোসথ', detail:'শীল, ধ্যান ও আত্মপর্যালোচনার শুভেচ্ছা'}; var postfix=/পূর্ণিমা$/.test(cur.name)?'র':'-এর'; return {title:cur.name+postfix+' শুভেচ্ছা', detail:cur.detail+' · তিথির হিসাব আনুমানিক; স্থানীয় পঞ্জিকা ও বিহারের ঘোষণা মিলিয়ে নিন', kind:'purnima'}; }
        if(info.p.tithi===30) return {title:'অমাবস্যা উপোসথের শুভেচ্ছা', detail:'অমাবস্যা তিথিতে অষ্টশীল পালন, আত্মসংযম ও ধ্যানের মঙ্গল কামনা', kind:'uposatha'};
        if(info.p.tithi===8||info.p.tithi===23) return {title:(info.p.tithi===8?'শুক্লা':'কৃষ্ণা')+' অষ্টমী উপোসথ', detail:'অষ্টমী উপোসথে অষ্টশীল পালন, বুদ্ধবন্দনা ও পুণ্যার্জনের শুভেচ্ছা', kind:'uposatha'};
        if(bd.month==='বৈশাখ' && bd.day<=4) return {title:'হলকর্ষণ উৎসবের শুভেচ্ছা', detail:'কৃষিনির্ভর বাংলার প্রাচীন ঐতিহ্য; বুদ্ধের শিশুকালীন জম্বু ধ্যান ও নবান্নের স্মরণ', kind:'festival'};
        if(inVassaSeason(now, api)) return {title:'বর্ষাবাসের শুভেচ্ছা', detail:'ভিক্ষুসংঘের তিন মাসের বর্ষাবাস চলছে — অধ্যয়ন, শীল ও ধ্যানের সময়', kind:'vassa'};
        if(inKathinaSeason(now, api)) return {title:'কঠিন চীবর দানোৎসবের শুভেচ্ছা', detail:'প্রবারণার পর এক চান্দ্রমাস — প্রতিটি বিহারে কঠিন চীবর দান অনুষ্ঠিত হয়', kind:'kathina'};
        var next=api.upcoming(46, now.getTime()).filter(function(x){ return x.t===15 && FESTIVALS[x.bd.month]; })[0];
        if(next && next.y===n.y && next.m===n.m && next.d===n.d+1){ var up=FESTIVALS[next.bd.month]; return {title:'আগামীকাল '+up.name, detail:'প্রস্তুতি ও শীল গ্রহণের জন্য মঙ্গল কামনা', kind:'purnima'}; }
        if(next){ var up2=FESTIVALS[next.bd.month]; return {title:'আসন্ন '+up2.name, detail:api.fmtDate(next).split(' · ')[0]+' · আনুমানিক পঞ্জিকা-হিসাব; স্থানীয় ঘোষণা যাচাই করুন', kind:'purnima'}; }
        return {title:SEASONS[bd.month]||'মৈত্রী ও শান্তির শুভেচ্ছা', detail:'আজকের পঞ্জিকা, তিথি ও আসন্ন পূর্ণিমা দেখতে ক্যালেন্ডার খুলুন', kind:'season'};
      }catch(_){}
    }
    return {title:'মৈত্রী ও শান্তির শুভেচ্ছা', detail:'উৎসব ও পূর্ণিমার হিসাব দেখতে চর্যাভূমির পঞ্জিকা খুলুন', kind:'season'};
  }

  // বিশেষ দিন কিনা?
  function isSpecialDay(now){
    var f=festivalFor(now);
    // পূর্ণিমা, অমাবস্যা, অষ্টমী, উৎসব, বর্ষাবাস, কঠিন চীবর, জাতীয় দিবস = বিশেষ
    var specialKinds=['purnima','uposatha','festival','vassa','kathina'];
    if(specialKinds.indexOf(f.kind)!==-1) return true;
    // fixed জাতীয় দিবসগুলোও festival kind এ আসে — তাই উপরের check এ ধরা পড়বে
    return false;
  }

  function dateLabel(now){
    try{ return new Intl.DateTimeFormat('bn-BD',{weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', timeZone:'Asia/Dhaka'}).format(now); }catch(_){ return now.toLocaleString('bn-BD'); }
  }
  function render(){
    var now=new Date(); var period=periodFor(now); var festival=festivalFor(now); var name=profile.name || (hasAuth() ? (JSON.parse(localStorage.getItem(AUTH_KEY)||'{}').name||'প্রিয় অতিথি') : 'প্রিয় অতিথি');
    dialog.setAttribute('data-period', period.id); dialog.setAttribute('data-festival', festival.kind);
    $('welcomeTime').textContent=period.label+' · '+(profile.location||'চর্যাভূমি');
    $('welcomeTitle').textContent=name+', চর্যাভূমিতে স্বাগতম';
    $('welcomeText').textContent=profile.location ? profile.location+' থেকে আপনার যাত্রায় হাজার বছরের পথ ধরে—বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস, মানচিত্র ও ভ্রমণ-পরিকল্পনার বাংলা নির্দেশিকায় স্বাগতম।' : 'হাজার বছরের পথ ধরে—বাংলাদেশের বৌদ্ধ ঐতিহ্য, ইতিহাস, মানচিত্র ও ভ্রমণ-পরিকল্পনার বাংলা নির্দেশিকায় আপনাকে স্বাগতম।';
    $('welcomeFestivalTitle').textContent=festival.title; $('welcomeFestivalDetail').textContent=festival.detail; $('welcomeDate').textContent='ঢাকার সময়: '+dateLabel(now)+' · উৎসব-হিসাব ঢাকার পঞ্জিকা অনুসারে';
    // বিশেষ দিন ব্যাজ
    var badge=$('welcomeSpecialBadge');
    if(badge){ badge.textContent=isSpecialDay(now) ? '🎉 আজ বিশেষ দিন' : '🌿 সাধারণ দিন'; badge.setAttribute('data-special', isSpecialDay(now) ? '1':'0'); }
  }
  function dropForcedParam(){ try{ if(!forced || !window.history || !history.replaceState) return; var p=new URLSearchParams(location.search); p.delete('welcome'); var s=p.toString(); history.replaceState(null,'', location.pathname+(s?'?'+s:'')+location.hash); forced=false; }catch(_){} }
  function closeWelcome(){ markSeen(); clearJustAuth(); dropForcedParam(); if(dialog.open && typeof dialog.close==='function') dialog.close(); else dialog.removeAttribute('open'); document.body.classList.remove('cb-welcome-open'); }
  function openWelcome(){
    if(dialog.open) return;
    if(window.CharyabhumiSanghaMitra) window.CharyabhumiSanghaMitra.close();
    render(); document.body.classList.add('cb-welcome-open');
    if(typeof dialog.showModal==='function') dialog.showModal(); else dialog.setAttribute('open','');
  }
  // Expose for auth.js
  window.CharyabhumiWelcome={ open: openWelcome, close: closeWelcome, render: render, isSpecialDay: isSpecialDay };

  var reopen=$('welcomeOpen'); if(reopen) reopen.addEventListener('click', openWelcome);
  $('welcomeName').value=profile.name; $('welcomeLocation').value=profile.location;
  $('welcomeForm').addEventListener('submit', function(e){
    e.preventDefault(); profile.name=clean($('welcomeName').value).slice(0,60); profile.location=clean($('welcomeLocation').value).slice(0,80); saveProfile(); render();
    $('welcomeLocateStatus').textContent='আপনার নাম ও এলাকাসহ শুভেচ্ছা তৈরি হয়েছে—শুধু এই ব্রাউজারে সংরক্ষিত।'; $('welcomeExplore').focus();
  });
  ['welcomeClose','welcomeDismiss','welcomeExplore'].forEach(function(id){ $(id).addEventListener('click', closeWelcome); });
  dialog.addEventListener('cancel', function(){ markSeen(); clearJustAuth(); });
  dialog.addEventListener('close', function(){ document.body.classList.remove('cb-welcome-open'); });

  var centers=[{name:'ঢাকা',lat:23.8103,lon:90.4125},{name:'চট্টগ্রাম',lat:22.3569,lon:91.7832},{name:'খুলনা',lat:22.8456,lon:89.5403},{name:'রাজশাহী',lat:24.3745,lon:88.6042},{name:'বরিশাল',lat:22.7010,lon:90.3535},{name:'সিলেট',lat:24.8949,lon:91.8687},{name:'রংপুর',lat:25.7439,lon:89.2752},{name:'ময়মনসিংহ',lat:24.7471,lon:90.4203}];
  $('welcomeLocate').addEventListener('click', function(){
    var status=$('welcomeLocateStatus'); if(!navigator.geolocation){ status.textContent='এই ব্রাউজারে অবস্থান-সেবা নেই; এলাকার নাম লিখতে পারেন।'; return; }
    var btn=this; btn.disabled=true; status.textContent='আপনার অনুমতি চাওয়া হচ্ছে…';
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat=pos.coords.latitude, lon=pos.coords.longitude;
      var nearest=centers.map(function(c){ var x=(c.lon-lon)*Math.cos((c.lat+lat)*Math.PI/360); var y=c.lat-lat; return {name:c.name, distance:x*x+y*y}; }).sort(function(a,b){return a.distance-b.distance;})[0];
      profile.location=nearest.name; $('welcomeLocation').value=nearest.name; saveProfile(); render();
      status.textContent='GPS থেকে নিকটতম বিভাগীয় অঞ্চল: '+nearest.name+' (আনুমানিক)। স্থানাঙ্ক সংরক্ষণ করা হয়নি—শুধু অঞ্চলের নাম রাখা হয়েছে।'; btn.disabled=false;
    }, function(err){ status.textContent=err.code===1 ? 'অবস্থানের অনুমতি পাওয়া যায়নি। চাইলে এলাকার নাম নিজে লিখুন।' : 'অবস্থান নির্ণয় করা যায়নি। এলাকার নাম লিখে চেষ্টা করুন।'; btn.disabled=false; }, {enableHighAccuracy:false, timeout:10000, maximumAge:300000});
  });

  // ------- নতুন লজিক: বিশেষ দিন + লগইন -------
  var mapDeepLink=/^#(?:explore|map-section|map)$/.test(location.hash);
  var assistantDeepLink=query.get('assistant')==='1' || location.hash==='#sanghamitra';
  var smallScreen=window.matchMedia('(max-width: 1024px)').matches;

  // Auth helper: বাইরে থেকে auth.js সেট করবে
  window.addEventListener('charyabhumi:auth', function(){
    try{ sessionStorage.setItem(JUST_AUTH_KEY,'1'); }catch(_){}
    // লগইনের পরপরই welcome খুলবে (যদি seen না হয়ে থাকে বা force)
    setTimeout(function(){ if(!autoDisabled && !mapDeepLink) openWelcome(); }, 300);
  });

  // সিদ্ধান্ত: কখন অটো-খুলবে?
  // 1) ?welcome=1 -> সবসময়
  // 2) ?welcome=0 / assistant/map link -> কখনো না
  // 3) বাকি: session seen না হলে + (বিশেষ দিন OR লগইন আছে OR এইমাত্র লগইন) হলে খুলবে
  //    - বিশেষ দিন হলে মোবাইলেও খুলবে (আগে মোবাইলে বন্ধ ছিল)
  //    - সাধারণ দিনে লগইন ছাড়া খুলবে না — ব্যবহারকারী বিরক্ত হবে না
  function shouldAutoOpen(){
    if(forced) return true;
    if(autoDisabled || assistantDeepLink || seen() || mapDeepLink) return false;
    var now=new Date();
    var special=isSpecialDay(now);
    var auth=hasAuth() || justAuthed();
    // বিশেষ দিন হলে ডেস্কটপ+মোবাইল সবখানে
    if(special) return true;
    // লগইন/সাইনআপ করলে সবখানে
    if(auth) return true;
    // সাধারণ দিন + লগইন নেই = খুলবে না (ব্যবহারকারীর অনুরোধ)
    return false;
  }

  if(shouldAutoOpen()){
    setTimeout(function(){
      var assistant=$('assistantPanel');
      if(!assistant || assistant.hidden) openWelcome();
    }, 450);
  } else {
    // সাধারণ দিনে কনসোলে নোট (ডিবাগ)
    try{ console.log('[Charyabhumi] Welcome auto-closed: সাধারণ দিন + লগইন নেই — বোতামে ক্লিক বা ?welcome=1 দিলে খুলবে।'); }catch(_){}
  }
})();
