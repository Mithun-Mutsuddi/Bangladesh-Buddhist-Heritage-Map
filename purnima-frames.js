/* চর্যাভূমি — সোশ্যাল মিডিয়া ফ্রেম স্টুডিও v2 (2026-10-25)
   জলরং ব্যাকড্রপ + রঙিন পেন্সিল লেখা; ছবি নিজে নিজে মাস্কড হবে;
   Cover ফটো (FB/Twitter/LinkedIn/YouTube) সহ চার ধরনের কার্ড।
   সব ব্রাউজারে চলবে — Chrome, Firefox, Safari, Edge, Mobile Safari, Android, iPad */
(function () {
  'use strict';
  if (!window.MX) return;
  var MX = window.MX;

  /* ========== উৎসব/প্রসঙ্গ থিম (জলরং প্যালেট) ==========
     auto = স্বয়ংক্রিয় (আজকের উৎসব);
     বাকিগুলো বারো পূর্ণিমা + সাধারণ শুভেচ্ছা প্রসঙ্গ (জন্মদিন, বিয়ে, নববর্ষ, ইত্যাদি) */
  var FESTIVALS = [
    { id: 'auto',      name: 'স্বয়ংক্রিয় (আজকের উৎসব)', icon: '✨',
      wc: ['#1a3a2e','#2a6b55','#f5c76a'], ac:'#f5c76a', tx:'#fff8e6', deco:'lotus',
      title:'শুভ পূর্ণিমা', blessing:'এই পবিত্র দিনে জীবনে শান্তি, মৈত্রী ও করুণা বিরাজ করুক।' },
    { id: 'citta',     name: 'চৈত্র পূর্ণিমা', icon: '✨',
      wc:['#1a4a5c','#4f8ea3','#ffd57a'], ac:'#ffd57a', tx:'#fff8e6', deco:'star',
      title:'শুভ চৈত্র পূর্ণিমা', blessing:'চৈত্র সংক্রান্তিতে নতুন বছরের সূচনা হোক মঙ্গলময়।' },
    { id: 'vesakha',   name: 'বুদ্ধ পূর্ণিমা (বৈশাখী)', icon: '☸️',
      wc:['#3a1505','#a64a1d','#ffbd57'], ac:'#ffbd57', tx:'#fff5dc', deco:'buddha',
      title:'শুভ বুদ্ধ পূর্ণিমা', blessing:'বুদ্ধের জন্ম, বোধি ও মহাপরিনির্বাণের পুণ্যস্মরণে সব প্রাণী সুখী হোক।' },
    { id: 'jettha',    name: 'জ্যৈষ্ঠ পূর্ণিমা', icon: '🌿',
      wc:['#2d4f1a','#4d7a2a','#e8c963'], ac:'#e8c963', tx:'#fff5dc', deco:'leaf',
      title:'শুভ জ্যৈষ্ঠ পূর্ণিমা', blessing:'প্রকৃতির সবুজ শ্যামলতায় হৃদয় ভরে উঠুক।' },
    { id: 'asalha',    name: 'আষাঢ়ী পূর্ণিমা', icon: '☸️',
      wc:['#102f30','#286a52','#f2c760'], ac:'#f5c76a', tx:'#fff8e6', deco:'dharma',
      title:'শুভ আষাঢ়ী পূর্ণিমা', blessing:'প্রথম ধর্মচক্র প্রবর্তনের পুণ্যস্মরণে মঙ্গল।' },
    { id: 'vassa',     name: 'বর্ষাবাস', icon: '🌧️',
      wc:['#142e3d','#2a5a78','#b5d6e8'], ac:'#c0e4f0', tx:'#f0f8ff', deco:'rain',
      title:'শুভ বর্ষাবাস', blessing:'তিন মাস সংযম-সাধনায় আত্মশুদ্ধি ও মঙ্গল হোক।' },
    { id: 'savana',    name: 'শ্রাবণী পূর্ণিমা', icon: '🌧️',
      wc:['#142e3d','#3a6a88','#b5d6e8'], ac:'#c0e4f0', tx:'#f0f8ff', deco:'rain',
      title:'শুভ শ্রাবণী পূর্ণিমা', blessing:'বর্ষার শান্ত ধারায় হৃদয় পবিত্র হোক।' },
    { id: 'potthapada',name: 'মধু পূর্ণিমা (ভাদ্র)', icon: '🍯',
      wc:['#4a2d08','#9e6b18','#f9d870'], ac:'#f9d870', tx:'#fff5dc', deco:'honey',
      title:'শুভ মধু পূর্ণিমা', blessing:'পারিলেয়্যক বনের মধুদান স্মরণে প্রাণীর প্রতি মৈত্রী বিরাজ করুক।' },
    { id: 'assayuja',  name: 'প্রবারণা পূর্ণিমা', icon: '🏮',
      wc:['#3a0f10','#8a2a2a','#ffb060'], ac:'#ffb060', tx:'#fff5e8', deco:'lantern',
      title:'শুভ প্রবারণা পূর্ণিমা', blessing:'বর্ষাবাস সমাপ্তির পুণ্যে জীবন মঙ্গলময় হোক; ফানুসের আলোয় অন্ধকার দূর হোক।' },
    { id: 'kathina',   name: 'কঠিন চীবর দান', icon: '🧵',
      wc:['#4a2a0a','#7a4a18','#e5b960'], ac:'#f5c76a', tx:'#fff5dc', deco:'thread',
      title:'কঠিন চীবর দানের শুভেচ্ছা', blessing:'সংঘের প্রতি শ্রদ্ধা ও দান-পুণ্যে জীবন ধন্য হোক।' },
    { id: 'kattika',   name: 'কার্তিক পূর্ণিমা', icon: '🕯️',
      wc:['#3a1d05','#7a4a20','#ffc870'], ac:'#ffc870', tx:'#fff5dc', deco:'lamp',
      title:'শুভ কার্তিক পূর্ণিমা', blessing:'সারিপুত্তের স্মরণে প্রজ্ঞা ও করুণার পথে চলুন।' },
    { id: 'maggasira', name: 'অগ্রহায়ণ পূর্ণিমা', icon: '🌳',
      wc:['#1f3a1a','#3d6a2a','#a8d470'], ac:'#c9e494', tx:'#f5fff0', deco:'tree',
      title:'শুভ অগ্রহায়ণ পূর্ণিমা', blessing:'মহাবোধিবৃক্ষের শাখা প্রেরণ স্মরণে বোধি লাভের পথে অগ্রসর হই।' },
    { id: 'phussa',    name: 'পৌষ পূর্ণিমা', icon: '🏝️',
      wc:['#0a2a3f','#1a5a7a','#82c8e5'], ac:'#b0e0ff', tx:'#f0f8ff', deco:'wave',
      title:'শুভ পৌষ পূর্ণিমা', blessing:'শীতের স্নিগ্ধ সকালে মঙ্গলময় হোক প্রতিটি ক্ষণ।' },
    { id: 'magha',     name: 'মাঘী পূর্ণিমা', icon: '🕊️',
      wc:['#23234a','#4a4a8a','#d0d0ff'], ac:'#fff8e6', tx:'#fff8e6', deco:'dove',
      title:'শুভ মাঘী পূর্ণিমা', blessing:'সংঘের ঐক্য ও চারটি সংগ্রহ-বস্তুর পুণ্যস্মরণে মঙ্গল।' },
    { id: 'phagguna',  name: 'ফাল্গুনী পূর্ণিমা', icon: '🌸',
      wc:['#5a1a3a','#a04070','#ffb0c8'], ac:'#ffd0e0', tx:'#fff5f8', deco:'flower',
      title:'শুভ ফাল্গুনী পূর্ণিমা', blessing:'বসন্তের রঙে রাঙা হৃদয়ে সব প্রাণী সুখী হোক।' },
    { id: 'halakarsana',name:'হলকর্ষণ উৎসব', icon:'🌾',
      wc:['#3a4a10','#6a8020','#e8d050'], ac:'#f5e080', tx:'#fffaf0', deco:'grain',
      title:'শুভ হলকর্ষণ', blessing:'কৃষিকর্মের শুভারম্ভে সুফল ও সমৃদ্ধি আসুক।' },

    /* ========== সাধারণ শুভেচ্ছা প্রসঙ্গ (উৎসব ছাড়াও) ========== */
    { id: 'birthday',  name:'🎂 জন্মদিন', icon:'🎂',
      wc:['#3a0f3a','#8a3a6a','#ffd0a8'], ac:'#ffe0a0', tx:'#fff8f0', deco:'star',
      title:'শুভ জন্মদিন', blessing:'জন্মদিনে হৃদয় ভরে থাক ভালোবাসা আর আনন্দ; আগামী বছর সুন্দর হোক।' },
    { id: 'naming',    name:'👶 নামকরণ', icon:'👶',
      wc:['#0f2a3a','#2a5a78','#c8e2f0'], ac:'#ffe7c6', tx:'#fffdf6', deco:'lotus',
      title:'নামকরণের শুভেচ্ছা', blessing:'নবজাতকের দীর্ঘায়ু, সুস্বাস্থ্য ও মঙ্গলময় জীবন কামনা করি।' },
    { id: 'karnavedha',name:'👂 কর্ণছেদন', icon:'👂',
      wc:['#3a2a0f','#7a5a20','#f0d480'], ac:'#ffe8a8', tx:'#fffbe8', deco:'flower',
      title:'কর্ণছেদনের শুভেচ্ছা', blessing:'মঙ্গল সংস্কারে শিশুর মঙ্গল ও কল্যাণ হোক।' },
    { id: 'hathekhori',name:'✍️ হাতেখড়ি / বিদ্যারম্ভ', icon:'✍️',
      wc:['#1a3a2e','#3a6e52','#ffe6a8'], ac:'#ffd872', tx:'#fffbea', deco:'leaf',
      title:'হাতেখড়ির শুভেচ্ছা', blessing:'অক্ষরজ্ঞান ও বিদ্যার পথে শিশুর সফল যাত্রা শুরু হোক।' },
    { id: 'wedding_groom',name:'💍 বিবাহ — বরকে', icon:'🤵',
      wc:['#0f1e3a','#3a5a8a','#e8d89a'], ac:'#ffd86a', tx:'#fff8e6', deco:'flower',
      title:'বিবাহের শুভেচ্ছা (বর)', blessing:'দাম্পত্য জীবনে পরস্পর শ্রদ্ধা, বিশ্বাস ও মৈত্রী বজায় থাক।' },
    { id: 'wedding_bride',name:'💍 বিবাহ — কনেকে', icon:'👰',
      wc:['#4a0f3a','#a04574','#ffb8c8'], ac:'#ffe0a0', tx:'#fff6f8', deco:'flower',
      title:'বিবাহের শুভেচ্ছা (কনে)', blessing:'নতুন জীবনে ভালোবাসা ও সুখ-শান্তি সদা বিরাজ করুক।' },
    { id: 'edu',       name:'🎓 শিক্ষাগত অর্জন', icon:'🎓',
      wc:['#1a2a4a','#3a5a8a','#ffcf80'], ac:'#ffe090', tx:'#fff8e6', deco:'star',
      title:'অভিনন্দন', blessing:'কঠোর পরিশ্রমের এই সাফল্যে আন্তরিক অভিনন্দন; আগামী পথ মঙ্গলময় হোক।' },
    { id: 'career',    name:'💼 পেশাগত সফলতা', icon:'💼',
      wc:['#1a3a2e','#2a6a5a','#c8e4a4'], ac:'#ffd770', tx:'#fffaf0', deco:'star',
      title:'পেশাগত সাফল্যের অভিনন্দন', blessing:'কর্মক্ষেত্রে এই সাফল্য আরো বড় সাফল্যের সূচনা হোক।' },
    { id: 'travel',    name:'✈️ ভ্রমণ', icon:'✈️',
      wc:['#0e3646','#2c758c','#bfe0ec'], ac:'#ffd070', tx:'#f8fcfd', deco:'wave',
      title:'শুভ যাত্রা', blessing:'ভ্রমণ সুন্দর, নিরাপদ ও স্মৃতিময় হোক; সুস্থভাবে ফিরে আসুন।' },
    { id: 'recovery',  name:'🙏 রোগমুক্তি / সুস্থতা', icon:'🙏',
      wc:['#1a3a1f','#3e6c3e','#e0e8a4'], ac:'#ffe090', tx:'#f8ffec', deco:'lotus',
      title:'দ্রুত আরোগ্য কামনা', blessing:'শীঘ্র সুস্থ হয়ে উঠুন; সব শক্তি ও সাহস বজায় থাকুক।' },
    { id: 'shramanera',name:'🧘 শ্রামণ্যের গৃহীত (শ্রমণের দীক্ষা)', icon:'🧘',
      wc:['#2a2a10','#6a6830','#f3dfa0'], ac:'#ffd878', tx:'#fffbe4', deco:'dharma',
      title:'শ্রামণ্য গ্রহণের শুভাশীষ', blessing:'সাধনার পথে বুদ্ধের আদর্শ অনুসরণে শান্তি লাভ হোক।' },
    { id: 'upasampada',name:'☸️ উপসম্পদা (ভিক্ষু অভিষেক)', icon:'☸️',
      wc:['#2a1505','#8a5a1a','#f5cd80'], ac:'#ffd870', tx:'#fff7e0', deco:'buddha',
      title:'উপসম্পদার শুভাশীষ', blessing:'উপসম্পদা গ্রহণে বিনয়, শীল ও প্রজ্ঞায় পূর্ণ হোক সাধনা জীবন।' },
    { id: 'condolence',name:'🕊️ শোক জ্ঞাপন', icon:'🕊️',
      wc:['#1a1a2a','#3a3a4a','#a8a8c8'], ac:'#d0d0e0', tx:'#eeeef5', deco:'dove',
      title:'গভীর শোক ও সমবেদনা', blessing:'দিবঙ্গত আত্মার সদ্গতি কামনা করি; শোকসন্তপ্ত পরিবারের প্রতি সমবেদনা।' },
    { id: 'result',    name:'📝 ফলাফলের শুভেচ্ছা', icon:'📝',
      wc:['#1a2a4a','#305a8a','#ffd888'], ac:'#ffd888', tx:'#fff8ec', deco:'star',
      title:'ফলাফলের জন্য শুভকামনা', blessing:'শুভ ফলাফলের মাধ্যমে পরিশ্রম সার্থক হোক।' },
    { id: 'retirement',name:'🌅 অবসর', icon:'🌅',
      wc:['#3a1f0a','#8a5020','#ffb978'], ac:'#ffd88a', tx:'#fff5e2', deco:'star',
      title:'অবসরের শুভেচ্ছা', blessing:'কর্মময় জীবনের সমাপ্তিতে সুখী, স্বাস্থ্যকর ও আনন্দময় দিন কামনা করি।' },
    { id: 'noboborsho_bn',name:'🌾 বাংলা নববর্ষ (পহেলা বৈশাখ)', icon:'🌾',
      wc:['#3a2a10','#8a6020','#ffd070'], ac:'#ffe090', tx:'#fff8dc', deco:'grain',
      title:'শুভ নববর্ষ', blessing:'নতুন বছর আনুক জীবনে সুখ, শান্তি, সমৃদ্ধি ও মঙ্গল।' },
    { id: 'noboborsho_en',name:'🎆 ইংরেজি নববর্ষ (১ জানুয়ারি)', icon:'🎆',
      wc:['#0a1a4a','#2a4a8a','#d0dfff'], ac:'#ffcf70', tx:'#fff8e6', deco:'star',
      title:'হ্যাপি নিউ ইয়ার', blessing:'নতুন বছর সব স্বপ্ন পূরণ করুক; শান্তি ও আনন্দ বিরাজ করুক।' },
    { id: 'noboborsho_chakma',name:'🌺 চাকমা নববর্ষ (ফুলবিজু)', icon:'🌺',
      wc:['#3a0f2a','#8a3058','#ffb8d0'], ac:'#ffda8a', tx:'#fff8f0', deco:'flower',
      title:'ফুলবিজুর শুভেচ্ছা', blessing:'পার্বত্য চট্টগ্রামের ফুলবিজু উৎসবে সবার জীবন মঙ্গলময় হোক।' },
    { id: 'noboborsho_marma',name:'🌼 মারমা নববর্ষ (সাংগ্রাই)', icon:'🌼',
      wc:['#2a0f3a','#7a2a8a','#ffc8e0'], ac:'#ffd870', tx:'#fff6fa', deco:'lotus',
      title:'সাংগ্রাইয়ের শুভেচ্ছা', blessing:'মারমা সম্প্রদায়ের নববর্ষ সাংগ্রাইয়ে সবার জীবনে সুখ-শান্তি ফিরে আসুক।' }
  ];
  var FEST_BY_ID = {};
  FESTIVALS.forEach(function(f){ FEST_BY_ID[f.id]=f; });

  var BN_FONT = '"Noto Sans Bengali","Hind Siliguri","SolaimanLipi","Kalpurush","Siyam Rupali","Vrinda","Arial Unicode MS",system-ui,sans-serif';

  /* ========== utility ========== */
  function bn(n){return MX.bn(n);}
  function esc(s){return MX.esc(s);}
  function fileToImg(file){
    return new Promise(function(res){
      if(!file) return res(null);
      var r = new FileReader();
      r.onload = function(e){ loadImage(e.target.result, res); };
      r.onerror = function(){ res(null); };
      r.readAsDataURL(file);
    });
  }
  function loadImage(src, cb){
    var img = new Image();
    img.crossOrigin='anonymous';
    img.onload=function(){cb(img);};
    img.onerror=function(){cb(null);};
    img.src=src;
  }
  function rrect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }
  function roundImg(ctx,img,x,y,w,h,r){
    ctx.save(); rrect(ctx,x,y,w,h,r); ctx.clip();
    if(img){var s=Math.max(w/img.width,h/img.height);ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);}
    else{ctx.fillStyle='#eaddc2';ctx.fillRect(x,y,w,h);}
    ctx.restore();
  }
  function circleImg(ctx,img,cx,cy,r){
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
    if(img){var s=Math.max(r*2/img.width,r*2/img.height);ctx.drawImage(img,cx-r+(r*2-img.width*s)/2,cy-r+(r*2-img.height*s)/2,img.width*s,img.height*s);}
    else{ctx.fillStyle='#eaddc2';ctx.fillRect(cx-r,cy-r,r*2,r*2);}
    ctx.restore();
  }
  /* জলরং background paint */
  function paintWatercolor(ctx,w,h,colors){
    /* base */
    var g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,colors[0]);g.addColorStop(0.5,colors[1]);g.addColorStop(1,colors[2]);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    /* translucent color blobs */
    var blobs=[
      {x:.15,y:.2,r:.4,c:'rgba(255,255,255,.12)'},
      {x:.8,y:.3,r:.35,c:'rgba(0,0,0,.10)'},
      {x:.3,y:.8,r:.45,c:'rgba(255,220,140,.15)'},
      {x:.7,y:.8,r:.3,c:'rgba(255,255,255,.10)'},
      {x:.5,y:.5,r:.5,c:'rgba(255,255,255,.06)'}
    ];
    blobs.forEach(function(b){
      var rg=ctx.createRadialGradient(w*b.x,h*b.y,0,w*b.x,h*b.y,w*b.r);
      rg.addColorStop(0,b.c);rg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(w*b.x,h*b.y,w*b.r,0,Math.PI*2);ctx.fill();
    });
    /* paper grain noise (subtle) */
    ctx.save();ctx.globalAlpha=.05;
    for(var i=0;i<Math.min(w*h/800,2500);i++){
      ctx.fillStyle=Math.random()>.5?'#fff':'#000';
      ctx.fillRect(Math.random()*w,Math.random()*h,1,1);
    }
    ctx.restore();
  }
  /* Pencil sketch text shadow effect */
  function pencilText(ctx,text,x,y,size,color,align,weight){
    ctx.save();
    ctx.font=(weight||'700')+' '+size+'px '+BN_FONT;
    ctx.textAlign=align||'center';
    ctx.fillStyle=color;
    /* pencil multi-stroke effect — ছোট লেখায় (যেমন স্বাক্ষর) jitter কম রাখি যেন স্পষ্ট থাকে */
    var j = size >= 28 ? 1.2 : 0.4;
    ctx.globalAlpha = size >= 28 ? .18 : .12;
    for(var i=0;i<3;i++){
      ctx.fillText(text,x+(Math.random()*j*2-j),y+(Math.random()*j*2-j));
    }
    ctx.globalAlpha=1;
    ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=3;ctx.shadowOffsetY=1;
    ctx.fillText(text,x,y);
    ctx.restore();
  }
  /* Draw Dharmachakra */
  function drawDharma(ctx,cx,cy,r,color){
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineCap='round';
    ctx.lineWidth=Math.max(2,r*.09);
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,r*.68,0,Math.PI*2);ctx.stroke();
    for(var i=0;i<8;i++){
      var a=i/8*Math.PI*2-Math.PI/2;
      ctx.lineWidth=Math.max(2,r*.06);
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r*.22,cy+Math.sin(a)*r*.22);
      ctx.lineTo(cx+Math.cos(a)*r*.92,cy+Math.sin(a)*r*.92);ctx.stroke();
    }
    ctx.lineWidth=Math.max(3,r*.12);
    for(var j=0;j<4;j++){
      var a2=j/4*Math.PI*2-Math.PI/2;
      ctx.beginPath();ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(a2)*r,cy+Math.sin(a2)*r);ctx.stroke();
    }
    ctx.beginPath();ctx.arc(cx,cy,r*.2,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  /* Lotus */
  function drawLotus(ctx,cx,cy,size,color){
    ctx.save();ctx.fillStyle=color;ctx.globalAlpha=.45;
    for(var i=0;i<10;i++){
      var a=i/10*Math.PI*2;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(a);
      ctx.beginPath();ctx.ellipse(0,-size*.55,size*.2,size*.5,0,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(cx,cy,size*.18,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  /* ধ্যানরত বুদ্ধমূর্তি (জলরং ধাঁচের সিলুয়েট) — শুধু রূপরেখা ও শান্ত-অবয়ব */
  function drawBuddha(ctx,cx,cy,size,color,fill){
    ctx.save();
    ctx.translate(cx,cy);
    ctx.fillStyle=fill||'rgba(255,240,210,.9)';
    ctx.strokeStyle=color;ctx.lineWidth=Math.max(1.5,size*.02);
    /* পদ্মাসনের নিচে বেদি */
    ctx.beginPath();
    ctx.moveTo(-size*.9, size*.55);
    ctx.bezierCurveTo(-size*.5,size*.42,size*.5,size*.42,size*.9,size*.55);
    ctx.lineTo(size*.7,size*.7);ctx.lineTo(-size*.7,size*.7);ctx.closePath();
    ctx.fillStyle=fill||'rgba(255,240,210,.85)';ctx.fill();ctx.stroke();
    /* শরীর (উত্তরাসঙ/চীবর) — বাঁকা কাঁধ */
    ctx.beginPath();
    ctx.fillStyle=fill||'rgba(255,240,210,.9)';
    ctx.moveTo(-size*.42,size*.55);
    ctx.bezierCurveTo(-size*.6,size*.05,-size*.4,-size*.25,-size*.2,-size*.3);
    ctx.lineTo(size*.2,-size*.3);
    ctx.bezierCurveTo(size*.4,-size*.25,size*.6,size*.05,size*.42,size*.55);
    ctx.closePath();
    ctx.fill();ctx.stroke();
    /* হাত (ধ্যান মুদ্রা — কোলের উপর) */
    ctx.beginPath();ctx.ellipse(0,size*.3,size*.25,size*.09,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    /* মাথা */
    ctx.beginPath();ctx.arc(0,-size*.5,size*.24,0,Math.PI*2);ctx.fill();ctx.stroke();
    /* উষ্ণীষ (মাথার উপর গোলাকার মুকুট) */
    ctx.beginPath();ctx.arc(0,-size*.78,size*.08,0,Math.PI*2);ctx.fill();ctx.stroke();
    /* কেশের রেখা (মাথার বাঁক) */
    ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,size*.012);
    for(var hi=0;hi<8;hi++){
      var a=Math.PI+(hi/7)*Math.PI;
      ctx.beginPath();ctx.arc(0,-size*.5,size*.24,a,a+.1);ctx.stroke();
    }
    /* প্রভামণ্ডল (মাথার চারপাশে হলদে আভা) */
    ctx.globalAlpha=.25;ctx.fillStyle=color;
    ctx.beginPath();ctx.arc(0,-size*.55,size*.4,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.5;
    ctx.beginPath();ctx.arc(0,-size*.55,size*.35,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  /* Decorative ornaments per festival */
  function drawDecor(ctx,deco,w,h,ac){
    ctx.save();
    switch(deco){
      case 'dharma':
        drawDharma(ctx,w*.15,h*.18,Math.min(w,h)*.08,ac);
        drawDharma(ctx,w*.85,h*.18,Math.min(w,h)*.06,ac);
        break;
      case 'buddha':
        /* উপরে ছোট বুদ্ধ মূর্তি (পটভূমির অলঙ্করণ হিসেবে) */
        ctx.save();ctx.globalAlpha=.28;
        drawBuddha(ctx,w*.5,h*.28,Math.min(w,h)*.18,ac,'rgba(255,230,170,.35)');
        ctx.restore();
        drawDharma(ctx,w*.12,h*.15,Math.min(w,h)*.06,ac);
        drawDharma(ctx,w*.88,h*.15,Math.min(w,h)*.06,ac);
        drawLotus(ctx,w*.1,h*.88,w*.15,ac);
        drawLotus(ctx,w*.9,h*.88,w*.15,ac);
        break;
      case 'lotus':
        drawLotus(ctx,w*.1,h*.2,w*.2,ac);
        drawLotus(ctx,w*.9,h*.9,w*.22,ac);
        break;
      case 'lantern':
        for(var i=0;i<6;i++){
          var lx=w*(.1+i*.15), ly=h*(.08+(i%3)*.04);
          ctx.globalAlpha=.6;ctx.fillStyle=ac;
          ctx.beginPath();ctx.ellipse(lx,ly,w*.03,w*.045,0,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle=ac;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(lx,ly+w*.04);ctx.lineTo(lx,ly+w*.06);ctx.stroke();
        }
        ctx.globalAlpha=1;
        break;
      case 'leaf':
      case 'tree':
        drawLotus(ctx,w*.05,h*.2,w*.15,'rgba(170,220,100,.6)');
        drawLotus(ctx,w*.95,h*.9,w*.2,'rgba(200,240,130,.45)');
        break;
      case 'flower':
        for(var k=0;k<10;k++){
          ctx.globalAlpha=.35;ctx.fillStyle=ac;
          ctx.beginPath();ctx.arc(w*(.08+Math.random()*.84),h*(.1+Math.random()*.8),Math.random()*14+7,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        break;
      case 'rain':
        ctx.strokeStyle='rgba(200,230,240,.4)';ctx.lineWidth=1;
        for(var r=0;r<60;r++){ctx.beginPath();var rx=Math.random()*w,ry=Math.random()*h*.6;ctx.moveTo(rx,ry);ctx.lineTo(rx-3,ry+12);ctx.stroke();}
        break;
      case 'star':
        ctx.fillStyle='rgba(255,255,255,.55)';
        for(var s=0;s<60;s++){ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h*.5,Math.random()*2+.5,0,Math.PI*2);ctx.fill();}
        break;
      case 'lamp':
        ctx.fillStyle=ac;ctx.globalAlpha=.6;
        for(var p=0;p<9;p++){var px=w*(.08+p*.105);ctx.beginPath();ctx.arc(px,h*.05,8,0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=1;
        break;
      case 'wave':
        ctx.strokeStyle=ac;ctx.globalAlpha=.3;ctx.lineWidth=2;
        for(var wv=0;wv<5;wv++){
          ctx.beginPath();
          for(var xx=0;xx<=w;xx+=20){
            var yy=h*.85+wv*14+Math.sin(xx*.02+wv)*10;
            if(xx===0)ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);
          }
          ctx.stroke();
        }
        ctx.globalAlpha=1;
        break;
      case 'honey':
        ctx.fillStyle=ac;ctx.globalAlpha=.35;
        for(var hh=0;hh<8;hh++){
          ctx.beginPath();ctx.arc(w*(.1+Math.random()*.8),h*(.15+Math.random()*.7),Math.random()*10+6,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        break;
      case 'thread':
        ctx.strokeStyle=ac;ctx.globalAlpha=.45;ctx.lineWidth=2;
        for(var t=0;t<5;t++){
          ctx.beginPath();
          var sx=w*(.05+t*.22),sy=h*.1;
          ctx.moveTo(sx,sy);
          for(var yy=sy;yy<h*.9;yy+=10)ctx.lineTo(sx+Math.sin(yy*.05+t)*8,yy);
          ctx.stroke();
        }
        ctx.globalAlpha=1;
        break;
      case 'dove':
        ctx.save();ctx.globalAlpha=.4;ctx.fillStyle=ac;
        ctx.beginPath();
        ctx.moveTo(w*.7,h*.22);
        ctx.bezierCurveTo(w*.78,h*.18,w*.88,h*.16,w*.93,h*.24);
        ctx.bezierCurveTo(w*.82,h*.24,w*.75,h*.3,w*.7,h*.3);
        ctx.closePath();ctx.fill();
        ctx.restore();
        break;
      case 'grain':
        ctx.fillStyle=ac;ctx.globalAlpha=.5;
        for(var g=0;g<18;g++){
          var gx=w*(.05+Math.random()*.9),gy=h*(.8+Math.random()*.15);
          ctx.beginPath();ctx.ellipse(gx,gy,3,8,Math.random()*.4,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        break;
    }
    ctx.restore();
  }

  /* ========== canvas scaling helpers ========== */
  function setupHiDPICanvas(canvas,w,h){
    var dpr=window.devicePixelRatio||1;
    canvas.width=w*dpr;canvas.height=h*dpr;
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    var ctx=canvas.getContext('2d');
    ctx.scale(dpr,dpr);
    return ctx;
  }

  /* ========== Current festival key ========== */
  function currentKey(selId){
    var v=selId?document.getElementById(selId).value:'auto';
    if(!v||v==='auto'){
      try{return (window.CharyabhumiPurnimaData && CharyabhumiPurnimaData.getCurrentFestival())||'vesakha';}catch(e){return'vesakha';}
    }
    return v;
  }

  /* ========== 1. Profile Picture Frame ========== */
  function renderPP(){
    var canvas=document.getElementById('ppCanvas');if(!canvas)return;
    var SIZE=800;
    var ctx=setupHiDPICanvas(canvas,SIZE,SIZE);
    var key=currentKey('ppFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var nameEl=document.getElementById('ppName');
    var photoFile=document.getElementById('ppPhoto');
    fileToImg(photoFile&&photoFile.files&&photoFile.files[0]).then(function(photo){
      paintWatercolor(ctx,SIZE,SIZE,f.wc);
      drawDecor(ctx,f.deco,SIZE,SIZE,f.ac);
      /* outer ring */
      ctx.save();ctx.strokeStyle=f.ac;ctx.lineWidth=10;ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=15;
      ctx.beginPath();ctx.arc(SIZE/2,SIZE/2,SIZE*.42,0,Math.PI*2);ctx.stroke();ctx.restore();
      /* inner ring dashed pencil */
      ctx.save();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=2;ctx.setLineDash([4,6]);
      ctx.beginPath();ctx.arc(SIZE/2,SIZE/2,SIZE*.39,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      /* photo */
      circleImg(ctx,photo,SIZE/2,SIZE/2,SIZE*.35);
      /* festival label top */
      pencilText(ctx,f.icon+' '+f.name,SIZE/2,SIZE*.12,42,f.tx,'center','800');
      /* bottom brand */
      pencilText(ctx,'চর্যাভূমি · বাংলাদেশ বৌদ্ধ ঐতিহ্য',SIZE/2,SIZE*.94,28,f.ac,'center','700');
      if(nameEl&&nameEl.value.trim()){
        pencilText(ctx,nameEl.value.trim(),SIZE/2,SIZE*.87,26,f.tx,'center','600');
      }else{
        pencilText(ctx,f.title,SIZE/2,SIZE*.87,28,f.tx,'center','600');
      }
      /* tiny dots */
      ctx.save();ctx.fillStyle='rgba(255,255,255,.35)';
      for(var i=0;i<40;i++){
        var a=Math.PI*2*i/40+Math.random()*.1,r=SIZE*.42+Math.random()*SIZE*.03;
        ctx.beginPath();ctx.arc(SIZE/2+Math.cos(a)*r,SIZE/2+Math.sin(a)*r,Math.random()*2+.8,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    });
  }

  /* ========== 2. Selfie Frame ========== */
  function renderSelfie(){
    var canvas=document.getElementById('selfieCanvas');if(!canvas)return;
    var ratio=document.getElementById('selfieRatio').value;
    var W=720,H=ratio==='story'?1280:(ratio==='post'?900:720);
    var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('selfieFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var photoFile=document.getElementById('selfiePhoto');
    fileToImg(photoFile&&photoFile.files&&photoFile.files[0]).then(function(photo){
      /* image covers whole canvas with gradient overlay */
      ctx.save();
      if(photo){var s=Math.max(W/photo.width,H/photo.height);ctx.drawImage(photo,(W-photo.width*s)/2,(H-photo.height*s)/2,photo.width*s,photo.height*s);}
      else{paintWatercolor(ctx,W,H,f.wc);drawDecor(ctx,f.deco,W,H,f.ac);}
      ctx.restore();
      /* top & bottom translucent gradient strips */
      var gT=ctx.createLinearGradient(0,0,0,H*.28);gT.addColorStop(0,'rgba(0,0,0,.72)');gT.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gT;ctx.fillRect(0,0,W,H*.28);
      var gB=ctx.createLinearGradient(0,H*.7,0,H);gB.addColorStop(0,'rgba(0,0,0,0)');gB.addColorStop(1,'rgba(0,0,0,.82)');
      ctx.fillStyle=gB;ctx.fillRect(0,H*.7,W,H*.3);
      /* decorations */
      drawDharma(ctx,W*.12,H*.1,32,f.ac);drawDharma(ctx,W*.88,H*.1,32,f.ac);
      drawLotus(ctx,W*.07,H*.4,W*.12,f.ac);drawLotus(ctx,W*.93,H*.7,W*.14,f.ac);
      pencilText(ctx,f.icon+' '+f.name,W/2,H*.09,54,f.ac,'center','800');
      pencilText(ctx,f.title+'র শুভেচ্ছা',W/2,H*.09+50,26,'#fff','center','600');
      pencilText(ctx,'☸ চর্যাভূমি · বাংলাদেশ বৌদ্ধ ঐতিহ্য',W/2,H*.90,30,f.ac,'center','700');
      pencilText(ctx,(f.blessing||'সব প্রাণী সুখী হোক').slice(0,40)+'…',W/2,H*.95,22,'rgba(255,255,255,.85)','center','500');
      /* border */
      ctx.save();ctx.strokeStyle=f.ac;ctx.lineWidth=8;
      ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=10;
      ctx.strokeRect(4,4,W-8,H-8);ctx.restore();
    });
  }

  /* ========== 3. Greeting Card (১:১, ছবি-সহ) ========== */
  function renderGreeting(){
    var canvas=document.getElementById('grCanvas');if(!canvas)return;
    var W=1080,H=1080;var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('grFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var to=(document.getElementById('grTo').value||'').trim();
    var from=(document.getElementById('grFrom').value||'').trim();
    var msg=(document.getElementById('grMsg').value||'').trim();
    var photoFile=document.getElementById('grPhoto');
    fileToImg(photoFile&&photoFile.files&&photoFile.files[0]).then(function(photo){
      paintWatercolor(ctx,W,H,f.wc);
      drawDecor(ctx,f.deco,W,H,f.ac);
      /* শীর্ষ প্রতীক */
      if(f.deco==='buddha'){
        drawBuddha(ctx,W/2,185,100,f.wc[0],'rgba(255,245,220,.94)');
      }else{
        drawDharma(ctx,W/2,170,60,f.ac);
        drawLotus(ctx,W*.12,H*.08,W*.14,f.ac);drawLotus(ctx,W*.88,H*.08,W*.14,f.ac);
      }
      /* শিরোনাম — পরিষ্কার সাদা অক্ষর */
      ctx.save();
      ctx.font='800 60px '+BN_FONT;ctx.fillStyle='#fff2cc';ctx.textAlign='center';
      ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=10;ctx.shadowOffsetY=2;
      ctx.fillText(f.icon+' '+f.title,W/2,320);
      ctx.restore();
      /* কাগজের কার্ড */
      var cardX=64,cardY=360,cardW=W-128,cardH=H-420;
      ctx.save();
      ctx.fillStyle='rgba(253,246,227,.97)';
      ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=20;ctx.shadowOffsetY=6;
      rrect(ctx,cardX,cardY,cardW,cardH,26);ctx.fill();ctx.restore();
      ctx.save();ctx.strokeStyle=f.ac;ctx.lineWidth=4;rrect(ctx,cardX,cardY,cardW,cardH,26);ctx.stroke();ctx.restore();
      var pad=46,phW,phH,textX,curY,textMaxW,bodySize,lineH;
      if(photo){
        phW=cardW*.38;phH=cardH-90;
        roundImg(ctx,photo,cardX+pad,cardY+45,phW,phH,18);
        textX=cardX+pad*2+phW;
        curY=cardY+80;
        textMaxW=cardX+cardW-pad-textX;
        bodySize=30;lineH=42;
      }else{
        textX=cardX+pad;
        curY=cardY+90;
        textMaxW=cardW-2*pad;
        bodySize=34;lineH=48;
      }
      ctx.save();ctx.textAlign='left';
      if(to){
        ctx.font='700 32px '+BN_FONT;ctx.fillStyle='#5a3a1a';
        ctx.fillText('প্রিয়, '+to,textX,curY);curY+=64;
      }
      ctx.font='500 '+bodySize+'px '+BN_FONT;ctx.fillStyle='#3b2a14';
      var def=f.blessing||'এই পবিত্র দিনে আপনার ও আপনার পরিবারের সুখ, শান্তি ও মঙ্গল কামনা করি।';
      wrapDraw(ctx,msg||def,textX,curY,textMaxW,lineH,'left','#3b2a14');
      ctx.restore();
      if(from){
        ctx.save();ctx.font='700 28px '+BN_FONT;ctx.fillStyle=f.wc[1];ctx.textAlign='right';
        ctx.fillText('— '+from,cardX+cardW-pad,cardY+cardH-40);ctx.restore();
      }
    });
  }

  function wrapDraw(ctx,text,x,y,maxW,lh,align,color){
    var words=String(text).split(/(\s+)/),line='',lines=[];
    for(var i=0;i<words.length;i++){
      var test=line+words[i];
      if(ctx.measureText(test).width>maxW&&line){lines.push(line.trim());line=words[i].trim();}
      else line=test;
    }
    if(line.trim())lines.push(line.trim());
    ctx.fillStyle=color;
    ctx.textAlign=align||'left';
    lines.forEach(function(l,k){ctx.fillText(l,x,y+k*lh);});
  }

  /* ========== 4. Cover Photo (FB Cover 820×312 / Twitter 1500×500 / LinkedIn 1584×396 / YT 2560×1440) ========== */
  function renderCover(){
    var canvas=document.getElementById('cvCanvas');if(!canvas)return;
    var pf=document.getElementById('cvPlatform').value;
    var W,H;
    switch(pf){
      case 'fb': W=1640;H=624;break;
      case 'tw': W=1500;H=500;break;
      case 'li': W=1584;H=396;break;
      case 'yt': W=2560;H=640;break;
      case 'ig': W=1080;H=566;break;
      default: W=1640;H=624;
    }
    var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('cvFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var photoFile=document.getElementById('cvPhoto');
    var msg=(document.getElementById('cvMsg').value||'').trim()||f.title;
    fileToImg(photoFile&&photoFile.files&&photoFile.files[0]).then(function(photo){
      if(photo){
        /* photo blurred backdrop */
        ctx.save();ctx.filter='blur(16px) saturate(.85)';
        var s=Math.max(W/photo.width,H/photo.height)*1.3;
        ctx.drawImage(photo,(W-photo.width*s)/2,(H-photo.height*s)/2,photo.width*s,photo.height*s);
        ctx.restore();
        /* overlay dark */
        ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);
        /* color wash */
        var og=ctx.createLinearGradient(0,0,W,H);
        og.addColorStop(0,f.wc[0]+'cc');og.addColorStop(.5,f.wc[1]+'88');og.addColorStop(1,f.wc[2]+'cc');
        ctx.fillStyle=og;ctx.fillRect(0,0,W,H);
      } else {
        paintWatercolor(ctx,W,H,f.wc);
      }
      drawDecor(ctx,f.deco,W,H,f.ac);
      /* left side logo circle with photo/emblem */
      var cx=H*.55,cy=H*.5,r=H*.32;
      ctx.save();ctx.fillStyle=f.ac+'33';ctx.beginPath();ctx.arc(cx,cy,r*1.3,0,Math.PI*2);ctx.fill();ctx.restore();
      if(photo){
        ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
        var ss=Math.max(r*2/photo.width,r*2/photo.height);
        ctx.drawImage(photo,cx-r+(r*2-photo.width*ss)/2,cy-r+(r*2-photo.height*ss)/2,photo.width*ss,photo.height*ss);
        ctx.restore();
      } else {
        ctx.save();ctx.fillStyle='#fff8e6';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.restore();
        drawDharma(ctx,cx,cy,r*.6,f.wc[0]);
      }
      ctx.save();ctx.strokeStyle=f.ac;ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.restore();
      /* text right */
      var tx=cx+r+60;
      pencilText(ctx,f.icon+' '+f.name,tx,cy-30,Math.min(68,H*.18),f.ac,'left','800');
      /* wrap msg */
      ctx.save();ctx.font='700 '+Math.min(36,H*.09)+'px '+BN_FONT;ctx.fillStyle=f.tx;ctx.textAlign='left';
      wrapDraw(ctx,msg,tx,cy+20,W-tx-40,Math.min(44,H*.1),'left',f.tx);
      ctx.restore();
      pencilText(ctx,'☸ চর্যাভূমি · বাংলাদেশ বৌদ্ধ ঐতিহ্য মানচিত্র',tx,H-40,24,'rgba(255,255,255,.88)','left','600');
    });
  }

  /* ========== 5. Postcard ========== */
  function renderPostcard(){
    var canvas=document.getElementById('pcCanvas');if(!canvas)return;
    var W=1200,H=750;var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('pcFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var photoFile=document.getElementById('pcPhoto');
    var msg=(document.getElementById('pcMsg').value||'').trim()||(f.title+' — আন্তরিক শুভেচ্ছা');
    fileToImg(photoFile&&photoFile.files&&photoFile[0]).then(function(photo){
      paintWatercolor(ctx,W,H,f.wc);
      /* left panel */
      var px=50,py=50,pw=W*.44,ph=H-100;
      ctx.save();ctx.fillStyle='rgba(255,246,227,.15)';rrect(ctx,px-6,py-6,pw+12,ph+12,20);ctx.fill();ctx.restore();
      roundImg(ctx,photo,px,py,pw,ph,18);
      if(!photo){drawDharma(ctx,px+pw/2,py+ph/2-30,90,f.ac);
        drawLotus(ctx,px+pw/2,py+ph-80,80,f.ac);}
      /* right text */
      var rx=pw+100,ry=90;
      pencilText(ctx,f.icon,rx,ry-20,56,f.tx,'left','400');
      pencilText(ctx,f.title,rx+80,ry-10,48,f.ac,'left','800');
      ctx.save();ctx.font='600 28px '+BN_FONT;ctx.fillStyle=f.tx;ctx.textAlign='left';
      wrapDraw(ctx,msg,rx,ry+60,W-rx-70,42,'left',f.tx);
      ctx.font='400 22px '+BN_FONT;ctx.fillStyle='rgba(255,255,255,.82)';
      wrapDraw(ctx,f.blessing||'এই পবিত্র দিনে জীবনে শান্তি, মৈত্রী ও করুণা বিরাজ করুক। সব প্রাণী সুখী হোক।',rx,ry+200,W-rx-70,34,'left','rgba(255,255,255,.82)');
      ctx.restore();
      /* stamp */
      ctx.save();ctx.fillStyle='rgba(245,199,106,.92)';ctx.beginPath();ctx.arc(W-100,H-100,52,0,Math.PI*2);ctx.fill();
      drawDharma(ctx,W-100,H-100,34,f.wc[0]);
      ctx.fillStyle=f.tx;ctx.font='600 17px '+BN_FONT;ctx.textAlign='center';ctx.fillText('চর্যাভূমি',W-100,H-35);ctx.restore();
    });
  }

  /* ========== 6. ভিউ কার্ড (৪:৬ পোর্ট্রেট, আধুনিক কার্ড — ছবি+টেক্সট, কালার কাস্টম) ========== */
  function renderViewcard(){
    var canvas=document.getElementById('vcCanvas');if(!canvas)return;
    var W=1200,H=1800;var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('vcFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var photoFile=document.getElementById('vcPhoto');
    var title=(document.getElementById('vcTitle').value||'').trim()||f.icon+' '+f.title;
    var msg=(document.getElementById('vcMsg').value||'').trim()||(f.blessing||'শুভেচ্ছা');
    var from=(document.getElementById('vcFrom').value||'').trim();
    var bg=document.getElementById('vcBg').value||'#f5e6c8';
    var fg=document.getElementById('vcFg').value||'#2a1504';
    var ac=document.getElementById('vcAc').value||f.ac;
    fileToImg(photoFile&&photoFile.files&&photoFile.files[0]).then(function(photo){
      /* পুরো ব্যাকগ্রাউন্ড */
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
      /* জলরং edge blobs (ac-রঙে) */
      ctx.save();ctx.globalAlpha=.12;
      [[.2,.2,400,ac],[.8,.15,350,ac],[.15,.85,420,ac],[.85,.8,380,ac]].forEach(function(b){
        var g=ctx.createRadialGradient(W*b[0],H*b[1],0,W*b[0],H*b[1],b[2]);
        g.addColorStop(0,b[3]);g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*b[0],H*b[1],b[2],0,Math.PI*2);ctx.fill();
      });
      ctx.restore();
      /* উপরে বড় ছবি (বর্গাকার) */
      var imgY=140,imgX=100,imgW=W-200,imgH=imgW;
      if(photo){
        roundImg(ctx,photo,imgX,imgY,imgW,imgH,24);
      }else{
        ctx.save();ctx.fillStyle=ac+'22';
        rrect(ctx,imgX,imgY,imgW,imgH,24);ctx.fill();
        ctx.strokeStyle=ac;ctx.lineWidth=4;rrect(ctx,imgX,imgY,imgW,imgH,24);ctx.stroke();ctx.restore();
        drawDharma(ctx,W/2,imgY+imgH/2-40,150,ac);
        drawLotus(ctx,W/2,imgY+imgH-100,140,ac);
      }
      /* টাইটেল */
      ctx.save();ctx.font='800 72px '+BN_FONT;ctx.fillStyle=fg;ctx.textAlign='center';
      ctx.shadowColor='rgba(0,0,0,.12)';ctx.shadowBlur=4;
      wrapDraw(ctx,title,W/2,imgY+imgH+100,W-160,84,'center',fg);
      ctx.restore();
      /* বার্তা */
      ctx.save();ctx.font='500 36px '+BN_FONT;ctx.fillStyle=fg;ctx.textAlign='center';ctx.globalAlpha=.85;
      wrapDraw(ctx,msg,W/2,imgY+imgH+260,W-200,52,'center',fg);
      ctx.restore();
      /* স্বাক্ষর/নাম */
      if(from){
        ctx.save();ctx.font='700 34px '+BN_FONT;ctx.fillStyle=ac;ctx.textAlign='center';
        ctx.fillText('— '+from,W/2,H-120);ctx.restore();
      }
      /* নিচে চর্যাভূমি সিল */
      ctx.save();ctx.font='500 22px '+BN_FONT;ctx.fillStyle=fg;ctx.globalAlpha=.55;ctx.textAlign='center';
      ctx.fillText('☸ চর্যাভূমি',W/2,H-60);ctx.restore();
    });
  }

  /* ========== 7. ডাকটিকেট (স্ট্যাম্প, দানাদার কিনারা) ========== */
  function renderStamp(){
    var canvas=document.getElementById('stCanvas');if(!canvas)return;
    var W=900,H=1080;var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('stFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var photoFile=document.getElementById('stPhoto');
    var price=(document.getElementById('stPrice').value||'১০ টাকা').trim();
    var country=(document.getElementById('stCountry').value||'বাংলাদেশ').trim();
    var year=(document.getElementById('stYear').value||'').trim();
    var bg=document.getElementById('stBg').value||f.wc[1];
    fileToImg(photoFile&&photoFile.files&&photoFile.files[0]).then(function(photo){
      /* বাইরের সাদা ব্যাক (পারফোরেশন নিচে দেখাবো) */
      ctx.fillStyle='#f2efe4';ctx.fillRect(0,0,W,H);
      var m=60,iw=W-2*m,ih=H-2*m;
      /* রঙিন অংশ */
      ctx.fillStyle=bg;rrect(ctx,m,m,iw,ih,10);ctx.fill();
      /* জলরং প্রভা (ক্লিপ করে অফসেটে) */
      ctx.save();rrect(ctx,m,m,iw,ih,10);ctx.clip();ctx.translate(m,m);
      paintWatercolor(ctx,iw,ih,[f.wc[0]||bg,bg,f.wc[2]||f.ac]);
      drawDecor(ctx,f.deco,iw,ih,f.ac);
      ctx.restore();
      /* দেশের নাম */
      ctx.save();ctx.font='800 70px '+BN_FONT;ctx.fillStyle='#fff';ctx.textAlign='left';
      ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=6;
      ctx.fillText(country,m+40,m+80);
      ctx.restore();
      /* মূল্যমান (top-right) */
      ctx.save();ctx.font='800 58px '+BN_FONT;ctx.fillStyle='#fff';ctx.textAlign='right';
      ctx.fillText(price,W-m-40,m+80);ctx.restore();
      /* মাঝের বৃত্ত (ছবি/প্রতীক) */
      var cx=W/2,cy=H/2,r=Math.min(iw,ih)*.28;
      ctx.save();ctx.fillStyle='rgba(255,248,230,.94)';ctx.beginPath();ctx.arc(cx,cy,r+8,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,r+8,0,Math.PI*2);ctx.stroke();ctx.restore();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
      if(photo){var s=Math.max(r*2/photo.width,r*2/photo.height);
        ctx.drawImage(photo,cx-r+(r*2-photo.width*s)/2,cy-r+(r*2-photo.height*s)/2,photo.width*s,photo.height*s);
      }else{ctx.fillStyle=f.ac+'33';ctx.fillRect(cx-r,cy-r,r*2,r*2);drawDharma(ctx,cx,cy,r*.65,f.wc[0]);}
      ctx.restore();
      ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.restore();
      /* নিচে উৎসবের নাম */
      ctx.save();ctx.font='700 44px '+BN_FONT;ctx.fillStyle='#fff';ctx.textAlign='center';
      ctx.fillText(f.name,cx,H-m-90);ctx.restore();
      if(year){ctx.save();ctx.font='500 28px '+BN_FONT;ctx.fillStyle='rgba(255,255,255,.85)';ctx.textAlign='center';
        ctx.fillText(year,cx,H-m-50);ctx.restore();}
      /* পারফোরেশন (সাদা ছিদ্র) */
      ctx.fillStyle='#f2efe4';
      for(var s=0;s<iw;s+=28){
        ctx.beginPath();ctx.arc(m+s,m,8,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(m+s,H-m,8,0,Math.PI*2);ctx.fill();
      }
      for(var sy=0;sy<ih;sy+=28){
        ctx.beginPath();ctx.arc(m,m+sy,8,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(W-m,m+sy,8,0,Math.PI*2);ctx.fill();
      }
    });
  }

  /* ========== 8. খাম (envelope, landscape, ফ্ল্যাপ সহ) ========== */
  function renderEnvelope(){
    var canvas=document.getElementById('evCanvas');if(!canvas)return;
    var W=1800,H=1200;var ctx=setupHiDPICanvas(canvas,W,H);
    var key=currentKey('evFestival');var f=FEST_BY_ID[key]||FEST_BY_ID.vesakha;
    var to=(document.getElementById('evTo').value||'').trim()||'প্রাপকের নাম';
    var addr=(document.getElementById('evAddr').value||'').trim()||'প্রাপকের ঠিকানা';
    var from=(document.getElementById('evFrom').value||'').trim()||'প্রেরক';
    var bg=document.getElementById('evBg').value||'#fdf5e2';
    var ln=document.getElementById('evLine').value||'#c0392b';
    /* ব্যাকগ্রাউন্ড */
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    /* পাতলা প্যাটার্ন (ছোট ফোঁটা) */
    ctx.save();ctx.globalAlpha=.08;ctx.fillStyle=ln;
    for(var i=0;i<120;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*3+1,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    /* খামের কিনারা */
    ctx.save();ctx.strokeStyle=ln;ctx.lineWidth=4;ctx.strokeRect(40,40,W-80,H-80);ctx.restore();
    /* ফ্ল্যাপ (ত্রিভুজ, ভাঁজ) */
    ctx.save();ctx.fillStyle=bg;ctx.strokeStyle=ln;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(40,40);ctx.lineTo(W/2,H*.42);ctx.lineTo(W-40,40);ctx.closePath();
    ctx.fill();ctx.stroke();
    /* ফ্ল্যাপের ট্রায়াঙ্গেল শ্যাডো */
    ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(60,50);ctx.lineTo(W/2,H*.41);ctx.lineTo(W-60,50);ctx.stroke();
    ctx.restore();
    /* স্ট্যাম্পের জায়গা (উপর ডান কোণে) */
    ctx.save();ctx.strokeStyle=ln;ctx.lineWidth=3;ctx.setLineDash([8,6]);
    ctx.strokeRect(W-320,80,220,220);ctx.setLineDash([]);
    ctx.font='400 22px '+BN_FONT;ctx.fillStyle=ln;ctx.textAlign='center';
    ctx.fillText('ডাকটিকেট',W-210,320);
    ctx.restore();
    /* প্রাপকের ঠিকানা লাইন */
    var aX=W*.28,aY=H*.55;
    ctx.save();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;
    for(var ll=0;ll<4;ll++){ctx.beginPath();ctx.moveTo(aX,aY+ll*70);ctx.lineTo(W-120,aY+ll*70);ctx.stroke();}
    ctx.restore();
    /* প্রেরক (উপর বাম) */
    ctx.save();ctx.font='600 26px '+BN_FONT;ctx.fillStyle='#3b2a14';ctx.textAlign='left';
    ctx.fillText('প্রেরক: '+from,80,110);ctx.restore();
    /* প্রাপক */
    ctx.save();ctx.font='800 52px '+BN_FONT;ctx.fillStyle='#2a1504';ctx.textAlign='left';
    ctx.fillText(to,aX,aY-20);
    ctx.font='500 30px '+BN_FONT;
    wrapDraw(ctx,addr,aX,aY+40,W-120-aX,44,'left','#3b2a14');
    ctx.restore();
    /* নিচে চর্যাভূমি সিল (ছোট) */
    ctx.save();ctx.font='500 20px '+BN_FONT;ctx.fillStyle=ln;ctx.textAlign='center';ctx.globalAlpha=.7;
    ctx.fillText('☸ চর্যাভূমি · '+f.name,W/2,H-55);ctx.restore();
  }

  /* ========== Tabs ========== */
  function setupTabs(){
    var btns=document.querySelectorAll('.frame-tab');
    var panels={pp:'framePanelPP',selfie:'framePanelSelfie',greeting:'framePanelGreeting',postcard:'framePanelPostcard',viewcard:'framePanelViewcard',stamp:'framePanelStamp',envelope:'framePanelEnvelope',cover:'framePanelCover'};
    btns.forEach(function(b){
      b.addEventListener('click',function(){
        btns.forEach(function(x){x.classList.remove('active');});
        b.classList.add('active');
        var id=b.dataset.tab;
        Object.keys(panels).forEach(function(k){var el=document.getElementById(panels[k]);if(el)el.hidden=(k!==id);});
        renderAll();
      });
    });
  }

  function populateSelects(){
    ['ppFestival','selfieFestival','grFestival','pcFestival','vcFestival','stFestival','evFestival','cvFestival'].forEach(function(id){
      var sel=document.getElementById(id);if(!sel)return;
      sel.innerHTML=FESTIVALS.map(function(f){
        var label=(f.id==='auto'?f.icon+' '+f.name:f.name);
        return'<option value="'+f.id+'">'+label+'</option>';
      }).join('');
      sel.value='auto';
      sel.addEventListener('change',renderAll);
    });
  }

  function bindInputs(){
    ['ppPhoto','selfiePhoto','grPhoto','pcPhoto','vcPhoto','stPhoto','cvPhoto'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('change',renderAll);});
    ['ppName','grTo','grFrom','grMsg','pcMsg','vcTitle','vcMsg','vcFrom','stPrice','stCountry','stYear','evTo','evAddr','evFrom','cvMsg'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',renderAll);});
    ['vcBg','vcFg','vcAc','stBg','evBg','evLine'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',renderAll);});
    var sr=document.getElementById('selfieRatio');if(sr)sr.addEventListener('change',renderSelfie);
    var cv=document.getElementById('cvPlatform');if(cv)cv.addEventListener('change',renderCover);
  }

  function dl(canvasId,name){
    var c=document.getElementById(canvasId);if(!c)return;
    try{var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=name;a.click();
      MX.toast('ছবিটি ডাউনলোড হচ্ছে');}
    catch(e){MX.toast('ডাউনলোড সমস্যা: '+e.message);}
  }

  function renderAll(){
    try{renderPP();renderSelfie();renderGreeting();renderPostcard();renderViewcard();renderStamp();renderEnvelope();renderCover();}catch(e){console&&console.error&&console.error(e);}
  }

  /* ========== Share buttons ========== */
  function shareText(){
    return 'চর্যাভূমি — বাংলাদেশ বৌদ্ধ ঐতিহ্য মানচিত্র। প্রতিষ্ঠাতা ও পরিচালক: মিথুন মুৎসুদ্দী। বাংলাদেশের বৌদ্ধবিহার, তীর্থস্থান, প্রত্নস্থল, উৎসব-পঞ্জিকা ও শিক্ষামূলক গাইড।';
  }
  function shareUrl(){return location.href;}
  function setupShare(){
    var url=shareUrl(),txt=shareText();
    var btns={
      'share-fb':'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url)+'&quote='+encodeURIComponent(txt),
      'share-tw':'https://twitter.com/intent/tweet?text='+encodeURIComponent(txt)+'&url='+encodeURIComponent(url),
      'share-wa':'https://api.whatsapp.com/send?text='+encodeURIComponent(txt+' '+url),
      'share-li':'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url)+'&summary='+encodeURIComponent(txt)
    };
    Object.keys(btns).forEach(function(id){
      var b=document.getElementById(id);if(!b)return;
      b.addEventListener('click',function(e){e.preventDefault();window.open(btns[id],'sharer','width=680,height=520');});
    });
    var cp=document.getElementById('share-copy');
    if(cp)cp.addEventListener('click',function(){MX.copyText(txt+'\n'+url,'শেয়ার লিংক ও টেক্সট কপি হয়েছে ✓');});
    var nat=document.getElementById('share-native');
    if(nat){
      if(!(navigator.share)){nat.style.display='none';}
      else nat.addEventListener('click',function(){navigator.share({title:'চর্যাভূমি — বাংলাদেশ বৌদ্ধ ঐতিহ্য মানচিত্র',text:txt,url:url}).catch(function(){});});
    }
  }

  function boot(){
    if(!document.getElementById('ppCanvas'))return;
    populateSelects();bindInputs();setupTabs();setupShare();
    var dlMap={
      ppDownload:['ppCanvas','charyabhumi-profile.png'],
      selfieDownload:['selfieCanvas','charyabhumi-selfie.png'],
      grDownload:['grCanvas','charyabhumi-greeting.png'],
      pcDownload:['pcCanvas','charyabhumi-postcard.png'],
      vcDownload:['vcCanvas','charyabhumi-viewcard.png'],
      stDownload:['stCanvas','charyabhumi-stamp.png'],
      evDownload:['evCanvas','charyabhumi-envelope.png'],
      cvDownload:['cvCanvas','charyabhumi-cover.png']
    };
    Object.keys(dlMap).forEach(function(id){
      var b=document.getElementById(id);if(!b)return;
      b.addEventListener('click',function(){dl(dlMap[id][0],dlMap[id][1]);});
    });
    var r=document.getElementById('ppRefresh');if(r)r.addEventListener('click',function(){renderPP();MX.toast('নতুন করে তৈরি হয়েছে');});
    var wait=setInterval(function(){if(window.CharyabhumiPurnimaData){clearInterval(wait);renderAll();}},120);
    setTimeout(renderAll,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
