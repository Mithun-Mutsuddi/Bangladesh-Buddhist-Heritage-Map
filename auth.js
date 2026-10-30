/* চর্যাভূমি — সহজ Sign in / Sign up (local-first, no server)
   - কোনো সার্ভারে পাসওয়ার্ড যায় না; demo auth শুধু localStorage এ
   - Sign in/up করলে 'charyabhumi:auth' event -> welcome-fixed.js শুনে welcome খুলবে
   - বিশেষ দিন ছাড়াও লগইনের পর welcome দেখা যাবে (ব্যবহারকারীর অনুরোধ)
*/
(function(){
  'use strict';
  var AUTH_KEY='charyabhumiAuthV1';
  var PROFILE_KEY='charyabhumiWelcomeProfileV1';
  var JUST_AUTH_KEY='charyabhumiJustAuthV1';

  function getAuth(){
    try{ return JSON.parse(localStorage.getItem(AUTH_KEY)||'null'); }catch(_){ return null; }
  }
  function setAuth(obj){
    try{ localStorage.setItem(AUTH_KEY, JSON.stringify(obj)); }catch(_){}
    try{ sessionStorage.setItem(JUST_AUTH_KEY,'1'); }catch(_){}
    // welcome কে জানাও
    try{ window.dispatchEvent(new CustomEvent('charyabhumi:auth', {detail:obj})); }catch(_){
      try{ window.dispatchEvent(new Event('charyabhumi:auth')); }catch(_){}
    }
    renderAuthState();
  }
  function clearAuth(){
    try{ localStorage.removeItem(AUTH_KEY); }catch(_){}
    try{ sessionStorage.removeItem(JUST_AUTH_KEY); }catch(_){}
    renderAuthState();
  }
  function renderAuthState(){
    var a=getAuth();
    var badge=document.getElementById('authBadge');
    var signBtn=document.getElementById('authSignBtn');
    var signBtn2=document.getElementById('authSignBtn2');
    var outBtn=document.getElementById('authOutBtn');
    var outBtn2=document.getElementById('authOutBtn2');
    var nameSlots=document.querySelectorAll('[data-auth-name]');
    if(a && a.signedIn){
      if(badge){ badge.textContent='👤 '+ (a.name||'অতিথি'); badge.hidden=false; }
      if(signBtn) signBtn.hidden=true;
      if(signBtn2) signBtn2.hidden=true;
      if(outBtn) outBtn.hidden=false;
      if(outBtn2) outBtn2.hidden=false;
      nameSlots.forEach(function(el){ el.textContent=a.name||'প্রিয় অতিথি'; });
    } else {
      if(badge) badge.hidden=true;
      if(signBtn) signBtn.hidden=false;
      if(signBtn2) signBtn2.hidden=false;
      if(outBtn) outBtn.hidden=true;
      if(outBtn2) outBtn2.hidden=true;
      nameSlots.forEach(function(el){ el.textContent='প্রিয় অতিথি'; });
    }
  }

  function ensureDialog(){
    if(document.getElementById('authDialog')) return document.getElementById('authDialog');
    var d=document.createElement('dialog');
    d.id='authDialog';
    d.className='cb-auth';
    d.innerHTML=
      '<div class="cb-auth-head"><h3>🔐 Sign in / Sign up</h3><button type="button" class="cb-auth-close" data-auth-close aria-label="বন্ধ">×</button></div>'+
      '<p class="cb-auth-note">এটি ডেমো লগইন — কোনো সার্ভারে পাসওয়ার্ড যায় না। নাম ও ইমেইল এই ব্রাউজারেই থাকে। Sign in/up করলে বিশেষ Welcome Note দেখা যাবে।</p>'+
      '<div class="cb-auth-tabs"><button type="button" data-tab="in" class="is-active">Sign in</button><button type="button" data-tab="up">Sign up</button></div>'+
      '<form id="authForm">'+
        '<label>নাম <input id="authName" type="text" maxlength="60" placeholder="মিথুন মুৎসুদ্দী" required></label>'+
        '<label>ইমেইল <input id="authEmail" type="email" maxlength="120" placeholder="name@example.com" required></label>'+
        '<label>পাসওয়ার্ড <input id="authPass" type="password" minlength="4" maxlength="64" placeholder="••••" required></label>'+
        '<label id="authConfirmWrap" hidden>পাসওয়ার্ড নিশ্চিত <input id="authConfirm" type="password" minlength="4" maxlength="64" placeholder="••••"></label>'+
        '<button type="submit" class="cb-btn solid" id="authSubmit">Sign in</button>'+
        '<button type="button" class="cb-auth-google" id="authGoogle">◎ Google দিয়ে চালিয়ে যান (ডেমো)</button>'+
        '<p class="cb-auth-privacy">Sign in/up করলে <code>charyabhumiAuthV1</code> localStorage এ সেভ হবে। Firebase/Google OAuth যুক্ত করতে চাইলে <code>config.js</code> এ firebaseConfig বসান।</p>'+
      '</form>';
    document.body.appendChild(d);
    d.addEventListener('click', function(e){
      if(e.target.hasAttribute('data-auth-close')) closeAuth();
      if(e.target===d) closeAuth();
    });
    d.querySelectorAll('[data-tab]').forEach(function(b){
      b.addEventListener('click', function(){
        d.querySelectorAll('[data-tab]').forEach(function(x){ x.classList.remove('is-active'); });
        b.classList.add('is-active');
        var isUp=b.getAttribute('data-tab')==='up';
        document.getElementById('authConfirmWrap').hidden=!isUp;
        document.getElementById('authSubmit').textContent=isUp ? 'Sign up' : 'Sign in';
      });
    });
    document.getElementById('authForm').addEventListener('submit', function(e){
      e.preventDefault();
      var name=document.getElementById('authName').value.trim().slice(0,60);
      var email=document.getElementById('authEmail').value.trim().slice(0,120);
      var pass=document.getElementById('authPass').value;
      var confirm=document.getElementById('authConfirm').value;
      var isUp=d.querySelector('[data-tab].is-active').getAttribute('data-tab')==='up';
      if(!name || !email || !pass){ alert('সব ঘর পূরণ করুন।'); return; }
      if(isUp && pass!==confirm){ alert('পাসওয়ার্ড মিলছে না।'); return; }
      // profile update (welcome এ ব্যবহার হবে)
      try{
        var prof=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
        prof.name=name; prof.location=prof.location||'';
        localStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
        if(window.CharyabhumiWelcome) window.CharyabhumiWelcome.render();
      }catch(_){}
      setAuth({signedIn:true, name:name, email:email, provider:'local', time: Date.now()});
      closeAuth();
      // সাথে সাথে welcome খুলবে (welcome-fixed.js শুনছে)
      setTimeout(function(){
        if(window.CharyabhumiWelcome) window.CharyabhumiWelcome.open();
      }, 200);
    });
    document.getElementById('authGoogle').addEventListener('click', function(){
      var name=document.getElementById('authName').value.trim() || 'Google অতিথি';
      var email=document.getElementById('authEmail').value.trim() || 'google-demo@example.com';
      setAuth({signedIn:true, name:name, email:email, provider:'google-demo', time: Date.now()});
      closeAuth();
      setTimeout(function(){ if(window.CharyabhumiWelcome) window.CharyabhumiWelcome.open(); }, 200);
    });
    return d;
  }
  function openAuth(){
    var d=ensureDialog();
    if(typeof d.showModal==='function') d.showModal(); else d.setAttribute('open','');
  }
  function closeAuth(){
    var d=document.getElementById('authDialog');
    if(!d) return;
    if(d.open && typeof d.close==='function') d.close(); else d.removeAttribute('open');
  }
  // Header buttons
  document.addEventListener('DOMContentLoaded', function(){
    renderAuthState();
    document.querySelectorAll('[data-auth-open]').forEach(function(b){ b.addEventListener('click', openAuth); });
    document.querySelectorAll('[data-auth-out]').forEach(function(b){ b.addEventListener('click', function(){ clearAuth(); alert('Signed out — local auth মুছে ফেলা হয়েছে।'); }); });
  });
  // expose
  window.CharyabhumiAuth={ open: openAuth, close: closeAuth, getAuth: getAuth, clearAuth: clearAuth };
})();
