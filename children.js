/* চর্যাভূমি শিশু বিভাগ — dependency-free, local-first interactions */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const bn = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]);
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const shuffle = values => {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  /* Gentle hero motion: a visible pause control and OS reduced-motion support. */
  const heroMotion = $('#heroMotion');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = reducedMotion.matches;
  const paintMotion = () => {
    document.body.classList.toggle('motion-paused', motionPaused);
    heroMotion.setAttribute('aria-pressed', String(motionPaused));
    heroMotion.textContent = motionPaused ? 'অ্যানিমেশন চালু করুন' : 'অ্যানিমেশন থামান';
  };
  heroMotion.addEventListener('click', () => { motionPaused = !motionPaused; paintMotion(); });
  paintMotion();

  /* Native dialog helpers. */
  const openDialog = dialog => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  $$('[data-dialog-close]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialogClose);
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    });
  });
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      if (!inside) dialog.close();
    });
  });

  /* Accessible ancient/hypothetical vs present comparison. */
  const timeDialog = $('#timeDialog');
  const compare = $('#compare');
  const compareRange = $('#compareRange');
  const setCompare = value => {
    const safe = Math.max(0, Math.min(100, Number(value)));
    compare.style.setProperty('--split', `${safe}%`);
    compareRange.value = String(safe);
    compareRange.setAttribute('aria-valuetext', `${bn(safe)} শতাংশ সম্ভাব্য reconstruction, ${bn(100-safe)} শতাংশ বর্তমান ছবি`);
  };
  $('#timeOpen').addEventListener('click', () => openDialog(timeDialog));
  compareRange.addEventListener('input', () => setCompare(compareRange.value));
  $$('[data-compare]').forEach(button => button.addEventListener('click', () => setCompare(button.dataset.compare)));
  setCompare(50);

  /* Local mini-comic viewer; the PDF remains available without the slideshow. */
  const comicDialog = $('#comicDialog');
  const comicImage = $('#comicPageImage');
  const comicStatus = $('#comicStatus');
  const comicPlay = $('#comicPlay');
  const comicCaptions = [
    'বনে হরিণরা শিকারের ভয়ে আতঙ্কিত। বনরাজা ভাবল—সবাইকে রক্ষা করতে হবে।',
    'বনরাজা দলকে সাহস দিয়ে শান্তিপূর্ণ পথ বেছে নিল এবং রাজার কাছে গিয়ে বলল—শিকার নয়, বনে শান্তি হোক।',
    'রাজা হরিণদের ক্ষতি না করার প্রতিশ্রুতি দিলেন। সাহস আর কথা সবাইকে বাঁচাল।'
  ];
  let comicPage = 0;
  let comicTimer = 0;
  const stopComic = () => {
    window.clearInterval(comicTimer);
    comicTimer = 0;
    comicPlay.setAttribute('aria-pressed', 'false');
    comicPlay.textContent = 'স্লাইডশো';
  };
  const showComicPage = index => {
    comicPage = Math.max(0, Math.min(2, index));
    comicImage.src = `assets/children/previews/banyan-deer-mini-comic-page${comicPage + 1}.jpg`;
    comicImage.alt = `বনরাজার সাহস মিনি-কমিক, পাতা ${bn(comicPage + 1)}: ${comicCaptions[comicPage]}`;
    comicStatus.textContent = `${bn(comicPage + 1)} / ${bn(3)} পাতা · ${comicCaptions[comicPage]}`;
    $('#comicPrev').disabled = comicPage === 0;
    $('#comicNext').disabled = comicPage === 2;
  };
  const openComic = () => { stopComic(); showComicPage(0); openDialog(comicDialog); };
  $('#comicPrev').addEventListener('click', () => showComicPage(comicPage - 1));
  $('#comicNext').addEventListener('click', () => showComicPage(comicPage + 1));
  comicPlay.addEventListener('click', () => {
    if (comicTimer) { stopComic(); return; }
    if (comicPage === 2) showComicPage(0);
    comicPlay.setAttribute('aria-pressed', 'true');
    comicPlay.textContent = 'স্লাইডশো থামান';
    comicTimer = window.setInterval(() => {
      if (comicPage >= 2) { stopComic(); return; }
      showComicPage(comicPage + 1);
    }, 4600);
  });
  comicDialog.addEventListener('close', stopComic);
  showComicPage(0);

  /* Rights-aware media shelf. External items open at their source, never rehosted. */
  let mediaItems = [];
  let mediaFilter = 'all';
  const mediaSymbols = {comic:'▤', book:'📖', 'comic-book-scan':'🖼️', 'illustrated-book':'✏️', 'commercial-comic':'🛍️', animation:'🎬', cartoon:'🎞️', 'interactive-art-story':'🎨'};
  const mediaBackgrounds = ['#e4f2e9','#fff0ce','#e4eef6','#f1e8f5','#fff0e6','#e2f1ef','#e8edf7','#f4ecd9'];
  const mediaCard = (item, index) => {
    const localComic = item.view === 'local:comic';
    const image = localComic
      ? '<img src="assets/children/previews/banyan-deer-mini-comic-page1.jpg" alt="" width="1240" height="1754">'
      : `<span class="media-symbol" aria-hidden="true">${mediaSymbols[item.kind] || '▱'}</span>`;
    const rightsClass = item.status === 'search-indexed' ? 'search' : (item.kind === 'commercial-comic' || item.formats.includes('watch') ? 'protected' : '');
    const mainAction = localComic
      ? '<button class="cb-btn solid" type="button" data-open-comic>পড়ো ও স্লাইডশো</button>'
      : `<a class="cb-btn solid" href="${esc(item.view)}" target="_blank" rel="noopener">${item.formats.includes('watch') ? 'মূল উৎসে দেখো ↗' : 'পড়া/official lead ↗'}</a>`;
    const download = item.download
      ? `<a class="cb-btn" href="${esc(item.download)}" ${item.download.startsWith('assets/') ? 'download' : 'target="_blank" rel="noopener"'}>${item.download.startsWith('assets/') ? 'PDF ডাউনলোড' : 'উৎসের download ↗'}</a>`
      : '';
    const statusNote = item.status === 'search-indexed'
      ? '<p class="kids-media-note">Search/source lead—বর্তমান availability অভিভাবক যাচাই করবেন।</p>' : '';
    return `<article class="kids-media-card" data-media-id="${esc(item.id)}">
      <div class="kids-media-art" style="--card-bg:${mediaBackgrounds[index % mediaBackgrounds.length]}">${image}<span class="media-format">${esc(item.kind.replaceAll('-',' '))}</span></div>
      <div class="kids-media-body">
        <h3>${esc(item.title)}</h3>
        <p class="kids-media-meta">${esc(item.language)} · ${esc(item.age)}</p>
        <p>${esc(item.description)}</p>
        <p class="kids-rights ${rightsClass}">${esc(item.rights)}</p>
        <div class="kids-media-actions">${mainAction}${download}</div>
        <p class="kids-media-note">সূত্র: <a href="${esc(item.sourceUrl)}" ${item.sourceUrl.startsWith('assets/') ? 'target="_blank" rel="noopener"' : 'target="_blank" rel="noopener"'}>${esc(item.source)}</a></p>
        ${statusNote}
      </div>
    </article>`;
  };
  const renderMedia = () => {
    const visible = mediaFilter === 'all' ? mediaItems : mediaItems.filter(item => item.formats.includes(mediaFilter));
    $('#mediaGrid').innerHTML = visible.map((item, index) => mediaCard(item, index)).join('');
    $('#mediaCount').textContent = `${bn(visible.length)}টি দেখানো হচ্ছে · মোট ${bn(mediaItems.length)}টি যাচাইকৃত/সূত্র-চিহ্নিত lead`;
  };
  $$('[data-media-filter]').forEach(button => {
    button.addEventListener('click', () => {
      mediaFilter = button.dataset.mediaFilter;
      $$('[data-media-filter]').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      renderMedia();
    });
  });
  $('#mediaGrid').addEventListener('click', event => {
    if (event.target.closest('[data-open-comic]')) openComic();
  });

  /* Jataka, heritage and safety quiz. */
  const quizData = [
    {q:'“বনরাজার সাহস” গল্পে বনরাজা কীভাবে সবাইকে বাঁচাল?', a:['শুধু নিজে পালিয়ে','সাহস ও শান্তিপূর্ণ কথা দিয়ে','সব হরিণকে লুকিয়ে চিরদিনের মতো'], correct:1, why:'বনরাজা নিজের দল এবং অন্য প্রাণীদের কথা ভেবে সাহসের সঙ্গে শান্তিপূর্ণ সমাধান খুঁজল।'},
    {q:'সোমপুরের নতুন digital reconstruction ছবিটিকে কী বলা ঠিক?', a:['একটি সম্ভাব্য শিক্ষামূলক রূপ','১০০০ বছর আগের নির্ভুল ছবি','পুরোনো ক্যামেরায় তোলা ছবি'], correct:0, why:'এটি AI-assisted hypothetical illustration—নির্ভুল নকশা বা প্রত্নতাত্ত্বিক প্রমাণ নয়।'},
    {q:'বাস্তব প্রত্নস্থলে পুরোনো কিছু দেখলে কী করা উচিত?', a:['টেনে তুলে বাড়ি নেওয়া','খুঁড়ে আরও বের করা','স্পর্শ না করে কর্তৃপক্ষকে জানানো'], correct:2, why:'বস্তুর স্তর ও অবস্থান গুরুত্বপূর্ণ। না খুঁড়ে, না সরিয়ে দায়িত্বশীল কর্তৃপক্ষকে জানাতে হবে।'},
    {q:'পালি chant, Buddha kirtan ও আধুনিক বৌদ্ধ গান—এই তিনটি কি সবসময় এক?', a:['হ্যাঁ, নাম বদলালেই হলো','না, প্রসঙ্গ·কথা·সুর আলাদা হতে পারে','সব গানই পালি'], correct:1, why:'অঞ্চল, সম্প্রদায় ও ধরনভেদে কথা, অর্থ, ছন্দ এবং সুর ভিন্ন হয়।'},
    {q:'শিশুদের lantern craft-এ নিরাপদ আলো কোনটি?', a:['Battery LED tea-light','মোমবাতি','Fuel cell'], correct:0, why:'এই কাজে আগুন বা sky-lantern release নেই; শুধু battery LED ব্যবহার করা হয়।'},
    {q:'প্রত্নতত্ত্ববিদ শুধু বস্তু বের করেন—এ কথা কেন অসম্পূর্ণ?', a:['তাঁরা শুধু মুদ্রা খোঁজেন','স্তর, অবস্থান, পরিমাপ ও নথিও রাখেন','তাঁরা কখনো ছবি তুলেন না'], correct:1, why:'বস্তুর চারপাশের প্রসঙ্গ না রাখলে ইতিহাসের গুরুত্বপূর্ণ তথ্য হারিয়ে যায়।'}
  ];
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let quizComplete = false;
  const renderQuiz = () => {
    const item = quizData[quizIndex];
    quizAnswered = false;
    $('#quizProgress').textContent = `প্রশ্ন ${bn(quizIndex + 1)} / ${bn(quizData.length)}`;
    $('#quizScore').textContent = `${bn(quizScore)} / ${bn(quizData.length)} সঠিক`;
    $('#quizQuestion').textContent = item.q;
    $('#quizFeedback').textContent = '';
    $('#quizNext').hidden = true;
    $('#quizAnswers').innerHTML = item.a.map((answer, index) => `<button type="button" data-answer="${index}">${bn(index + 1)}. ${esc(answer)}</button>`).join('');
  };
  $('#quizAnswers').addEventListener('click', event => {
    const button = event.target.closest('[data-answer]');
    if (!button || quizAnswered || quizComplete) return;
    quizAnswered = true;
    const answer = Number(button.dataset.answer);
    const item = quizData[quizIndex];
    const correct = answer === item.correct;
    if (correct) quizScore += 1;
    $$('[data-answer]', $('#quizAnswers')).forEach((choice, index) => {
      choice.disabled = true;
      if (index === item.correct) choice.classList.add('correct');
      if (index === answer && !correct) choice.classList.add('wrong');
    });
    $('#quizScore').textContent = `${bn(quizScore)} / ${bn(quizData.length)} সঠিক`;
    $('#quizFeedback').textContent = `${correct ? 'ঠিক ধরেছ!' : 'এবার মিলল না—কোনো অসুবিধা নেই।'} ${item.why}`;
    $('#quizNext').hidden = false;
    $('#quizNext').textContent = quizIndex === quizData.length - 1 ? 'ফলাফল দেখি' : 'পরের প্রশ্ন';
    $('#quizNext').focus();
  });
  $('#quizNext').addEventListener('click', () => {
    if (quizComplete) {
      quizIndex = 0; quizScore = 0; quizComplete = false; renderQuiz(); return;
    }
    if (quizIndex < quizData.length - 1) { quizIndex += 1; renderQuiz(); return; }
    quizComplete = true;
    $('#quizQuestion').textContent = `তোমার ফল: ${bn(quizScore)} / ${bn(quizData.length)}`;
    $('#quizAnswers').innerHTML = '';
    $('#quizFeedback').textContent = quizScore >= 5 ? 'চমৎকার! এবার comic বা virtual archaeology-তে ফিরে নতুন কিছু খুঁজে দেখো।' : 'ভালো চেষ্টা! ব্যাখ্যাগুলো আরেকবার পড়ে আবার খেললে শেখা আরও পাকা হবে।';
    $('#quizNext').textContent = 'আবার খেলি';
    $('#quizNext').hidden = false;
  });
  renderQuiz();

  /* Memory game: real buttons, visible Bengali names, no timer or account. */
  const memorySymbols = [
    {id:'wheel', icon:'☸', label:'ধর্মচক্র'}, {id:'lotus', icon:'✿', label:'পদ্ম'},
    {id:'stupa', icon:'♜', label:'স্তূপ'}, {id:'leaf', icon:'☘', label:'বোধি পাতা'},
    {id:'bell', icon:'♪', label:'ঘণ্টা'}, {id:'terracotta', icon:'◈', label:'টেরাকোটা'}
  ];
  let memoryDeck = [];
  let memoryFirst = null;
  let memoryLock = false;
  let memoryMoves = 0;
  let memoryMatches = 0;
  let memoryTimers = [];
  const memoryButton = index => $(`.memory-card[data-card="${index}"]`);
  const setCardLabel = (card, open) => {
    const item = memoryDeck[Number(card.dataset.card)];
    card.setAttribute('aria-label', `কার্ড ${bn(Number(card.dataset.card) + 1)} · ${open ? item.label : 'বন্ধ'}`);
    card.setAttribute('aria-pressed', String(open));
  };
  const resetMemory = () => {
    memoryTimers.forEach(timer => window.clearTimeout(timer));
    memoryTimers = [];
    memoryDeck = shuffle(memorySymbols.flatMap(item => [item, item]));
    memoryFirst = null; memoryLock = false; memoryMoves = 0; memoryMatches = 0;
    $('#memoryMoves').textContent = '০ চাল';
    $('#memoryStatus').textContent = 'একটি কার্ড খুলে শুরু করো।';
    $('#memoryGrid').innerHTML = memoryDeck.map((item, index) => `<button class="memory-card" type="button" data-card="${index}" aria-pressed="false" aria-label="কার্ড ${bn(index + 1)} · বন্ধ"><span class="memory-inner"><span class="memory-closed" aria-hidden="true">?</span><span class="memory-value" aria-hidden="true"><b>${item.icon}</b><small>${item.label}</small></span></span></button>`).join('');
  };
  const openMemoryCard = card => { card.classList.add('revealed'); setCardLabel(card, true); };
  const closeMemoryCard = card => { card.classList.remove('revealed'); setCardLabel(card, false); };
  $('#memoryGrid').addEventListener('click', event => {
    const card = event.target.closest('.memory-card');
    if (!card || memoryLock || card.classList.contains('matched') || card.classList.contains('revealed')) return;
    openMemoryCard(card);
    if (memoryFirst === null) { memoryFirst = Number(card.dataset.card); $('#memoryStatus').textContent = 'এবার জোড়ার আরেকটি কার্ড খুঁজো।'; return; }
    const second = Number(card.dataset.card);
    const firstCard = memoryButton(memoryFirst);
    memoryMoves += 1;
    $('#memoryMoves').textContent = `${bn(memoryMoves)} চাল`;
    const matched = memoryDeck[memoryFirst].id === memoryDeck[second].id;
    memoryLock = true;
    const timer = window.setTimeout(() => {
      if (matched) {
        [firstCard, card].forEach(item => { item.classList.remove('revealed'); item.classList.add('matched'); item.disabled = true; item.setAttribute('aria-label', `${memoryDeck[Number(item.dataset.card)].label} · মিলে গেছে`); });
        memoryMatches += 1;
        $('#memoryStatus').textContent = memoryMatches === memorySymbols.length ? `সব জোড়া মিলেছে! ${bn(memoryMoves)} চালে খেলা শেষ।` : `${memoryDeck[second].label}-এর জোড়া মিলেছে!`;
      } else {
        closeMemoryCard(firstCard); closeMemoryCard(card);
        $('#memoryStatus').textContent = 'এই দুটি আলাদা—আবার চেষ্টা করো।';
      }
      memoryFirst = null; memoryLock = false;
    }, matched ? 430 : 850);
    memoryTimers.push(timer);
  });
  $('#memoryReset').addEventListener('click', resetMemory);
  resetMemory();

  /* Canvas scratch-off with an equivalent non-scratch reveal. */
  const digCanvas = $('#digCanvas');
  const digContext = digCanvas ? digCanvas.getContext('2d', {willReadFrequently:true}) : null;
  let digging = false;
  let digMoves = 0;
  let digDone = false;
  const finishDig = () => {
    digDone = true;
    if (digContext) digContext.clearRect(0, 0, digCanvas.width, digCanvas.height);
    $('#digHint').hidden = true;
    $('#digProgress').value = 100;
    $('#digProgress').textContent = '১০০%';
    $('#digPercent').textContent = '১০০%';
    $('#digDiscovery').hidden = false;
  };
  const updateDigProgress = () => {
    if (!digContext || digDone) return;
    const pixels = digContext.getImageData(0, 0, digCanvas.width, digCanvas.height).data;
    let clear = 0; let samples = 0;
    for (let y = 0; y < digCanvas.height; y += 18) {
      for (let x = 0; x < digCanvas.width; x += 18) {
        samples += 1;
        if (pixels[(y * digCanvas.width + x) * 4 + 3] < 60) clear += 1;
      }
    }
    const percent = Math.min(100, Math.round(clear / samples * 100));
    $('#digProgress').value = percent;
    $('#digProgress').textContent = `${bn(percent)}%`;
    $('#digPercent').textContent = `${bn(percent)}%`;
    if (percent >= 52) finishDig();
  };
  const resetDig = () => {
    digDone = false; digging = false; digMoves = 0;
    $('#digDiscovery').hidden = true;
    $('#digHint').hidden = false;
    $('#digProgress').value = 0; $('#digProgress').textContent = '০%'; $('#digPercent').textContent = '০%';
    if (!digContext) return;
    digContext.globalCompositeOperation = 'source-over';
    const soil = digContext.createLinearGradient(0, 0, 0, digCanvas.height);
    soil.addColorStop(0, '#a67a48'); soil.addColorStop(.5, '#85613d'); soil.addColorStop(1, '#63472f');
    digContext.fillStyle = soil; digContext.fillRect(0, 0, digCanvas.width, digCanvas.height);
    let seed = 37;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 230; i += 1) {
      digContext.fillStyle = random() > .5 ? 'rgba(238,206,147,.20)' : 'rgba(53,36,25,.18)';
      digContext.beginPath();
      digContext.ellipse(random() * 720, random() * 420, 2 + random() * 10, 1 + random() * 4, random() * Math.PI, 0, Math.PI * 2);
      digContext.fill();
    }
    digContext.strokeStyle = 'rgba(55,36,22,.22)'; digContext.lineWidth = 2;
    for (let y = 85; y < 420; y += 85) { digContext.beginPath(); digContext.moveTo(0, y); digContext.bezierCurveTo(170, y-18, 460, y+20, 720, y-5); digContext.stroke(); }
    digContext.fillStyle = 'rgba(255,250,231,.92)';
    digContext.font = '600 24px "Noto Sans Bengali", sans-serif';
    digContext.fillText('ডিজিটাল মাটির স্তর', 28, 48);
    digContext.font = '16px "Noto Sans Bengali", sans-serif';
    digContext.fillText('ঘষে নথিচিত্র উন্মোচন করো · বাস্তব খনন নয়', 28, 78);
  };
  const digPoint = event => {
    const rect = digCanvas.getBoundingClientRect();
    return {x:(event.clientX - rect.left) * digCanvas.width / rect.width, y:(event.clientY - rect.top) * digCanvas.height / rect.height};
  };
  let lastDigPoint = null;
  const scratch = (from, to) => {
    if (!digContext || digDone) return;
    digContext.globalCompositeOperation = 'destination-out';
    // The soil texture uses translucent strokes; reset to an opaque source or
    // destination-out would only remove 22% of the soil on each pass.
    digContext.strokeStyle = '#000'; digContext.globalAlpha = 1;
    digContext.lineCap = 'round'; digContext.lineJoin = 'round'; digContext.lineWidth = 62;
    digContext.beginPath(); digContext.moveTo(from.x, from.y); digContext.lineTo(to.x, to.y); digContext.stroke();
  };
  if (digCanvas) digCanvas.addEventListener('pointerdown', event => {
    if (digDone || !digContext) return;
    event.preventDefault(); digging = true; lastDigPoint = digPoint(event);
    digCanvas.setPointerCapture(event.pointerId); scratch(lastDigPoint, lastDigPoint);
    $('#digHint').hidden = true;
  });
  if (digCanvas) digCanvas.addEventListener('pointermove', event => {
    if (!digging || digDone) return;
    event.preventDefault();
    const next = digPoint(event); scratch(lastDigPoint, next); lastDigPoint = next;
    digMoves += 1;
    if (digMoves % 7 === 0) updateDigProgress();
  });
  const stopDigging = () => { if (digging) updateDigProgress(); digging = false; };
  if (digCanvas) digCanvas.addEventListener('pointerup', stopDigging);
  digCanvas.addEventListener('pointercancel', stopDigging);
  if ($('#digReveal')) $('#digReveal').addEventListener('click', finishDig);
  if ($('#digReset')) $('#digReset').addEventListener('click', resetDig);
  if (digCanvas) resetDig();

  /* Colouring: separate transparent paint layer means erasing preserves line art. */
  const artCanvas = $('#artCanvas');
  const artContext = artCanvas.getContext('2d');
  const paintLayer = document.createElement('canvas');
  paintLayer.width = artCanvas.width; paintLayer.height = artCanvas.height;
  const paintContext = paintLayer.getContext('2d');
  const artBase = new Image();
  let artReady = false;
  let artDrawing = false;
  let artLast = null;
  let artColour = '#b3543f';
  let artErasing = false;
  const artInfo = {
    buddha:{file:'buddha-colouring.png', text:'সরল শিক্ষামূলক বুদ্ধ রেখাচিত্র; নির্দিষ্ট প্রাচীন মূর্তির নকল নয়। শ্রদ্ধার সঙ্গে রং করো।'},
    vante:{file:'vante-colouring.png', text:'ভান্তে/ভিক্ষুর সাধারণ রেখাচিত্র—কোনো বাস্তব ব্যক্তির portrait নয়।'},
    ambedkar:{file:'ambedkar-colouring.png', text:'ড. বি. আর. আম্বেদকরের ১৯২২ সালের public-domain portrait থেকে outline; মূল ছবি Wikimedia Commons।'},
    somapura:{file:'somapura-colouring.png', text:'সোমপুরের স্তরযুক্ত কেন্দ্রীয় মন্দির থেকে অনুপ্রাণিত সরল স্থাপত্য-রেখা।'},
    'dharma-wheel':{file:'dharma-wheel-colouring.png', text:'আট তিঁরের ধর্মচক্রের সরল colouring exercise।'},
    lotus:{file:'lotus-colouring.png', text:'পদ্ম একাধিক দক্ষিণ এশীয় ঐতিহ্যে ব্যবহৃত হয়; এটি একটি art exercise।'},
    stupa:{file:'stupa-colouring.png', text:'স্তূপের সরল আকৃতি—বিভিন্ন অঞ্চলে স্থাপত্যরূপ ভিন্ন।'},
    'stupa-dot-to-dot':{file:'stupa-dot-to-dot.png', text:'১ থেকে ১৭ পর্যন্ত ক্রমে বিন্দু মিলাও; হালকা রেখা নিজে যাচাই করতে সাহায্য করবে।'}
  };
  const renderArt = () => {
    artContext.globalCompositeOperation = 'source-over';
    artContext.fillStyle = '#fff'; artContext.fillRect(0, 0, artCanvas.width, artCanvas.height);
    if (artReady) artContext.drawImage(artBase, 0, 0, artCanvas.width, artCanvas.height);
    artContext.globalCompositeOperation = 'multiply';
    artContext.drawImage(paintLayer, 0, 0);
    artContext.globalCompositeOperation = 'source-over';
  };
  const loadArt = key => {
    const info = artInfo[key];
    artReady = false;
    $('#artDescription').textContent = info.text;
    paintContext.clearRect(0, 0, paintLayer.width, paintLayer.height);
    renderArt();
    artBase.onload = () => { artReady = true; renderArt(); };
    artBase.src = `assets/children/art/${info.file}`;
  };
  const artPoint = event => {
    const rect = artCanvas.getBoundingClientRect();
    return {x:(event.clientX - rect.left) * artCanvas.width / rect.width, y:(event.clientY - rect.top) * artCanvas.height / rect.height};
  };
  const paintStroke = (from, to) => {
    paintContext.globalCompositeOperation = artErasing ? 'destination-out' : 'source-over';
    paintContext.strokeStyle = artColour; paintContext.fillStyle = artColour;
    paintContext.lineWidth = Number($('#brushSize').value) * (artErasing ? 1.35 : 1);
    paintContext.lineCap = 'round'; paintContext.lineJoin = 'round';
    paintContext.beginPath(); paintContext.moveTo(from.x, from.y); paintContext.lineTo(to.x, to.y); paintContext.stroke();
    if (from.x === to.x && from.y === to.y && !artErasing) { paintContext.beginPath(); paintContext.arc(from.x, from.y, paintContext.lineWidth/2, 0, Math.PI*2); paintContext.fill(); }
    renderArt();
  };
  artCanvas.addEventListener('pointerdown', event => {
    event.preventDefault(); artDrawing = true; artLast = artPoint(event);
    artCanvas.setPointerCapture(event.pointerId); paintStroke(artLast, artLast);
  });
  artCanvas.addEventListener('pointermove', event => {
    if (!artDrawing) return;
    event.preventDefault(); const next = artPoint(event); paintStroke(artLast, next); artLast = next;
  });
  artCanvas.addEventListener('pointerup', () => { artDrawing = false; });
  artCanvas.addEventListener('pointercancel', () => { artDrawing = false; });
  $('#artSelect').addEventListener('change', event => loadArt(event.target.value));
  $$('.colour-palette [data-color]').forEach(button => {
    button.addEventListener('click', () => {
      artColour = button.dataset.color; artErasing = false;
      $('#artEraser').setAttribute('aria-pressed', 'false'); $('#artEraser').textContent = 'রাবার';
      $$('.colour-palette [data-color]').forEach(other => other.classList.toggle('active', other === button));
    });
  });
  $('#brushSize').addEventListener('input', event => { $('#brushOutput').textContent = bn(event.target.value); });
  $('#artEraser').addEventListener('click', event => {
    artErasing = !artErasing;
    event.currentTarget.setAttribute('aria-pressed', String(artErasing));
    event.currentTarget.textContent = artErasing ? 'রং করার তুলি' : 'রাবার';
  });
  $('#artReset').addEventListener('click', () => { paintContext.clearRect(0, 0, paintLayer.width, paintLayer.height); renderArt(); });
  $('#artDownload').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'charyabhumi-my-art.png'; link.href = artCanvas.toDataURL('image/png'); link.click();
  });
  loadArt('buddha');

  /* Craft tabs and four-step original SVG diagrams. */
  let cultureItems = [];
  let craftIndex = 0;
  let craftStep = 0;
  let craftTimer = 0;
  const stopCraft = () => {
    window.clearInterval(craftTimer); craftTimer = 0;
    $('#craftPlay').setAttribute('aria-pressed', 'false'); $('#craftPlay').textContent = 'ধাপে animation';
  };
  const svgWrap = (title, content) => `<title id="craftSvgTitle">${esc(title)}</title><rect x="4" y="4" width="592" height="322" rx="24" fill="#fffaf0" stroke="#d9cba9" stroke-width="3"/><path d="M30 282Q190 245 330 282T570 272" fill="none" stroke="#d9e7d7" stroke-width="24"/>${content}<text x="574" y="309" text-anchor="end" font-family="Noto Sans Bengali,sans-serif" font-size="12" fill="#6a766c">শিক্ষামূলক diagram · নির্ভুল আচার-নকশা নয়</text>`;
  const craftGraphic = (item, step) => {
    const label = `<g font-family="Noto Sans Bengali,sans-serif" fill="#174b43"><text x="28" y="42" font-size="18" font-weight="700">ধাপ ${bn(step+1)}</text></g>`;
    if (item.id === 'lantern') {
      const stages = [
        '<rect x="205" y="75" width="190" height="170" rx="5" fill="#f5c96d" stroke="#8a5430" stroke-width="4"/><path d="M300 75v170" stroke="#8a5430" stroke-width="3" stroke-dasharray="9 8"/><path d="M245 115l25 25-25 25m110-50l-25 25 25 25" fill="none" stroke="#fff" stroke-width="8"/>',
        '<path d="M190 100Q300 50 410 100v135Q300 285 190 235Z" fill="#f5c96d" stroke="#8a5430" stroke-width="4"/><ellipse cx="300" cy="100" rx="110" ry="35" fill="#ffe7a4" stroke="#8a5430" stroke-width="4"/><path d="M300 65v-30" stroke="#5a4b36" stroke-width="4"/>',
        '<path d="M300 28v55" stroke="#5a4b36" stroke-width="4"/><path d="M205 105Q300 62 395 105v125Q300 280 205 230Z" fill="#f5c96d" stroke="#8a5430" stroke-width="4"/><ellipse cx="300" cy="105" rx="95" ry="30" fill="#ffe7a4" stroke="#8a5430" stroke-width="4"/><circle cx="300" cy="217" r="20" fill="#fff" stroke="#6a8c80" stroke-width="3"/><path d="M285 218q15-30 30 0" fill="none" stroke="#e0a53c" stroke-width="4"/>',
        '<path d="M300 22v55" stroke="#5a4b36" stroke-width="4"/><path d="M205 100Q300 57 395 100v130Q300 280 205 230Z" fill="#ef9f76" stroke="#8a5430" stroke-width="4"/><ellipse cx="300" cy="100" rx="95" ry="30" fill="#ffd1b6" stroke="#8a5430" stroke-width="4"/><g fill="#fff3b0"><path d="M260 140l8 16 18 3-13 13 3 18-16-8-16 8 3-18-13-13 18-3Z"/><circle cx="340" cy="165" r="18"/></g><circle cx="300" cy="222" r="17" fill="#fff" stroke="#6a8c80" stroke-width="3"/>'
      ];
      return svgWrap(`${item.title}, ধাপ ${bn(step+1)}`, label + stages[step]);
    }
    if (item.id === 'mandala') {
      let art = '<g transform="translate(300 166)" fill="none" stroke="#76547f" stroke-width="3">';
      [35,75,115].slice(0, step+1).forEach(r => { art += `<circle r="${r}"/>`; });
      if (step >= 1) for (let i=0;i<8;i+=1) art += `<path d="M0 0L0-115" transform="rotate(${i*45})"/>`;
      if (step >= 2) for (let i=0;i<8;i+=1) art += `<path d="M0-38Q-25-70 0-96Q25-70 0-38Z" transform="rotate(${i*45})" fill="${step>=3?'#e6b9d6':'#fffaf0'}"/>`;
      art += '<circle r="7" fill="#d99b2b"/></g>';
      return svgWrap(`${item.title}, ধাপ ${bn(step+1)}`, label + art);
    }
    if (item.id === 'mask') {
      const stages = [
        '<path d="M185 95L235 60 300 82 365 60 415 95 395 225 300 270 205 225Z" fill="#d9e8dc" stroke="#435d4d" stroke-width="4" stroke-dasharray="10 7"/>',
        '<path d="M185 95L235 60 300 82 365 60 415 95 395 225 300 270 205 225Z" fill="#d9e8dc" stroke="#435d4d" stroke-width="4"/><path d="M225 135q35-35 60 5-35 35-60-5Zm150 0q-35-35-60 5 35 35 60-5Z" fill="#fff" stroke="#435d4d" stroke-width="4"/>',
        '<path d="M185 95L235 60 300 82 365 60 415 95 395 225 300 270 205 225Z" fill="#7fb59a" stroke="#435d4d" stroke-width="4"/><path d="M225 135q35-35 60 5-35 35-60-5Zm150 0q-35-35-60 5 35 35 60-5Z" fill="#fff" stroke="#435d4d" stroke-width="4"/><path d="M260 210q40 35 80 0M230 70l-25-35m165 35 25-35" fill="none" stroke="#7c4b35" stroke-width="6"/>',
        '<path d="M185 85L235 50 300 72 365 50 415 85 395 215 300 260 205 215Z" fill="#7fb59a" stroke="#435d4d" stroke-width="4"/><path d="M225 125q35-35 60 5-35 35-60-5Zm150 0q-35-35-60 5 35 35 60-5Z" fill="#fff" stroke="#435d4d" stroke-width="4"/><path d="M260 200q40 35 80 0M230 60l-25-35m165 35 25-35M300 260v55" fill="none" stroke="#7c4b35" stroke-width="6"/>'
      ];
      return svgWrap(`${item.title}, ধাপ ${bn(step+1)}`, label + stages[step]);
    }
    if (item.id === 'bowl') {
      const waves = '<g fill="none" stroke="#4e8290" stroke-width="5" stroke-linecap="round"><path d="M170 115q-30 45 0 90M430 115q30 45 0 90M135 90q-50 70 0 140M465 90q50 70 0 140"/></g>';
      const bowl = '<path d="M205 145h190q-12 110-95 110t-95-110Z" fill="#d8a74e" stroke="#765829" stroke-width="4"/><ellipse cx="300" cy="145" rx="95" ry="28" fill="#f5d27f" stroke="#765829" stroke-width="4"/>';
      const paper = '<rect x="185" y="70" width="230" height="195" rx="8" fill="#fff" stroke="#79958b" stroke-width="3"/><path d="M235 205q65-120 130 0M220 225q80-75 160 0" fill="none" stroke="#648ca0" stroke-width="5"/>';
      return svgWrap(`${item.title}, ধাপ ${bn(step+1)}`, label + [bowl, bowl+waves, paper, paper+'<g font-family="Noto Sans Bengali,sans-serif" font-size="18" fill="#174b43"><text x="300" y="112" text-anchor="middle">শব্দ · observation · sound-art</text></g>'][step]);
    }
    if (item.id === 'origami') {
      const stages = [
        '<rect x="205" y="65" width="190" height="190" fill="#ef9caa" stroke="#874b57" stroke-width="4"/><path d="M205 65l190 190m0-190L205 255" stroke="#fff" stroke-width="3" stroke-dasharray="8 7"/>',
        '<rect x="205" y="65" width="190" height="190" fill="#ef9caa" stroke="#874b57" stroke-width="4"/><path d="M205 65l95 95 95-95M205 255l95-95 95 95" fill="#f7c1ca" stroke="#874b57" stroke-width="3"/>',
        '<g transform="translate(300 165)"><path d="M0 20Q-85-80-110 15-65 55 0 20Z" fill="#ef9caa" stroke="#874b57" stroke-width="3"/><path d="M0 20Q85-80 110 15 65 55 0 20Z" fill="#ef9caa" stroke="#874b57" stroke-width="3"/><path d="M0 20Q-50-105 0-125 50-105 0 20Z" fill="#f7c1ca" stroke="#874b57" stroke-width="3"/></g>',
        '<g transform="translate(300 165)"><path d="M0 20Q-105-85-130 20-75 75 0 20Z" fill="#d97591" stroke="#874b57" stroke-width="3"/><path d="M0 20Q105-85 130 20 75 75 0 20Z" fill="#d97591" stroke="#874b57" stroke-width="3"/><path d="M0 20Q-55-120 0-140 55-120 0 20Z" fill="#f3aabd" stroke="#874b57" stroke-width="3"/><path d="M0 20Q-40-70 0-88 40-70 0 20Z" fill="#ffe1a5" stroke="#874b57" stroke-width="3"/></g>'
      ];
      return svgWrap(`${item.title}, ধাপ ${bn(step+1)}`, label + stages[step]);
    }
    const deer = '<g fill="#33473f"><ellipse cx="285" cy="175" rx="80" ry="43"/><circle cx="360" cy="128" r="30"/><path d="M230 200l-15 75h18l25-72m70-5 20 77h18l-10-88M350 105l-15-45 30 35m10 8 35-35-15 48"/></g>';
    const screen = '<rect x="150" y="65" width="300" height="205" rx="5" fill="#fff" stroke="#789185" stroke-width="5"/>';
    const light = '<path d="M65 150L235 85v180L65 180Z" fill="#ffe59a" opacity=".65"/><circle cx="58" cy="165" r="24" fill="#f5c75e" stroke="#8a6a2b" stroke-width="4"/>';
    return svgWrap(`${item.title}, ধাপ ${bn(step+1)}`, label + [deer, screen+deer+'<path d="M285 215v75" stroke="#75533b" stroke-width="7"/>', light+screen+'<g transform="translate(60 5) scale(.8)">'+deer+'</g>', light+screen+deer+'<path d="M285 215v75" stroke="#75533b" stroke-width="7"/>'][step]);
  };
  const renderCraft = () => {
    const item = cultureItems[craftIndex];
    if (!item) return;
    $('#craftLab').hidden = false;
    $('#craftEyebrow').textContent = `Craft ${bn(craftIndex+1)} / ${bn(cultureItems.length)} · সম্পর্ক → তৈরি`;
    $('#craftTitle').textContent = item.title;
    $('#craftRelationship').textContent = item.relationship;
    $('#craftMaterials').textContent = item.materials;
    $('#craftSafety').textContent = item.safety;
    $('#craftSource').textContent = `${item.sourceLabel} ↗`;
    $('#craftSource').href = item.sourceUrl;
    craftStep = Math.max(0, Math.min(item.steps.length - 1, craftStep));
    $('#craftSvg').innerHTML = craftGraphic(item, craftStep);
    $('#craftStepStatus').textContent = `ধাপ ${bn(craftStep+1)}: ${item.steps[craftStep]}`;
    $('#craftStepList').innerHTML = item.steps.map((text, index) => `<li class="${index === craftStep ? 'active' : ''}">${esc(text)}</li>`).join('');
    $('#craftPrev').disabled = craftStep === 0;
    $('#craftNext').disabled = craftStep === item.steps.length - 1;
    const audio = $('#craftAudio');
    if (item.audio) {
      audio.hidden = false;
      audio.innerHTML = `<strong>Synthesized digital bell</strong> · প্রকৃত singing-bowl recording নয়।<audio controls preload="none" src="${esc(item.audio)}">আপনার browser audio চালাতে পারছে না।</audio>`;
    } else { audio.hidden = true; audio.innerHTML = ''; }
    const stage = $('#craftStage');
    stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap');
  };
  const selectCraft = (index, focus = false) => {
    stopCraft(); craftIndex = index; craftStep = 0;
    $$('#craftTabs [role="tab"]').forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    $('#craftLab').setAttribute('aria-labelledby', `craft-tab-${cultureItems[index].id}`);
    renderCraft();
  };
  const renderCraftTabs = () => {
    $('#craftTabs').innerHTML = cultureItems.map((item, index) => `<button type="button" role="tab" id="craft-tab-${esc(item.id)}" aria-controls="craftLab" aria-selected="${index===0}" tabindex="${index===0?0:-1}">${esc(item.title)}</button>`).join('');
    $('#craftLab').setAttribute('role', 'tabpanel');
    $$('#craftTabs [role="tab"]').forEach((tab, index) => {
      tab.addEventListener('click', () => selectCraft(index));
      tab.addEventListener('keydown', event => {
        if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % cultureItems.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + cultureItems.length) % cultureItems.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = cultureItems.length - 1;
        selectCraft(next, true);
      });
    });
    selectCraft(0);
  };
  $('#craftPrev').addEventListener('click', () => { stopCraft(); craftStep -= 1; renderCraft(); });
  $('#craftNext').addEventListener('click', () => { stopCraft(); craftStep += 1; renderCraft(); });
  $('#craftPlay').addEventListener('click', () => {
    if (craftTimer) { stopCraft(); return; }
    const item = cultureItems[craftIndex]; if (!item) return;
    if (craftStep === item.steps.length - 1) craftStep = 0;
    $('#craftPlay').setAttribute('aria-pressed', 'true'); $('#craftPlay').textContent = 'Animation থামান';
    renderCraft();
    craftTimer = window.setInterval(() => {
      if (craftStep >= item.steps.length - 1) { stopCraft(); return; }
      craftStep += 1; renderCraft();
    }, 2300);
  });

  /* Source-aware chant list; only the original local song has local audio. */
  const chantTypeLabels = {'pali-chant':'পালি chant excerpt', 'regional-lead':'সংস্কৃতি-সূত্র lead', 'original-song':'নতুন শিক্ষামূলক গান', 'external-listening':'Search-indexed listening lead'};
  const renderChants = chants => {
    $('#chantList').innerHTML = chants.map(item => `<article class="chant-card">
      <div><span class="kids-chip">${esc(chantTypeLabels[item.type] || item.type)}</span><h3>${esc(item.title)}</h3><p class="chant-text">${esc(item.text).replace(/\n/g,'<br>')}</p><p>${esc(item.meaning)}</p></div>
      <div><p class="chant-tune"><strong>কথা ও সুর:</strong> ${esc(item.tune)}</p>${item.audio ? `<div class="chant-audio"><audio controls preload="none" src="${esc(item.audio)}">Audio চালানো যাচ্ছে না।</audio><p>শুধু synthesized melody guide—কণ্ঠস্বর বা ঐতিহ্যবাহী recording নয়।</p></div>` : ''}${item.download ? `<a class="cb-btn" href="${esc(item.download)}" download>কথা ও notation PDF</a>` : ''}${item.view ? `<a class="cb-btn solid" href="${esc(item.view)}" target="_blank" rel="noopener">মূল ভিডিওতে শুনুন ↗</a>` : ''}${item.rights ? `<p class="kids-media-note">${esc(item.rights)}</p>` : ''}<p>সূত্র: <a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">${esc(item.sourceLabel)} ↗</a></p></div>
    </article>`).join('');
  };

  /* One local registry drives media, craft and listening content. */
  fetch('data/children-content.json?v=20261024d')
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(data => {
      if (data.schema !== '2026-10-24.children.v1' || !Array.isArray(data.media) || !Array.isArray(data.culture) || !Array.isArray(data.chants)) throw new Error('Unexpected content schema');
      mediaItems = data.media; cultureItems = data.culture;
      renderMedia(); renderCraftTabs(); renderChants(data.chants);
    })
    .catch(error => {
      console.error('Children content could not be loaded:', error);
      $('#mediaCount').textContent = 'তালিকা লোড হয়নি; নিচের স্থানীয় ফাইলগুলো এখনও ব্যবহার করা যায়।';
      $('#mediaGrid').innerHTML = '<p class="kids-warning"><a href="assets/children/pdf/banyan-deer-mini-comic.pdf">মিনি-কমিক</a> · <a href="assets/children/pdf/children-art-pack.pdf">Art pack</a> · <a href="assets/children/pdf/somapura-paper-model.pdf">Paper model</a> · <a href="assets/children/pdf/maitri-original-song.pdf">Original song</a></p>';
      $('#craftLab').hidden = true;
      $('#chantList').innerHTML = '<p class="kids-warning">সূত্র-তালিকা এখন পাওয়া যাচ্ছে না। পুরোনো বা অজানা উৎসের গান/কীর্তন কপি না করে পরে আবার চেষ্টা করুন।</p>';
    });
})();
