/* Browser-local Historical Archive. Files are private to this browser until exported and reviewed. */
(function () {
'use strict';
var $ = function(id){ return document.getElementById(id); };
var DB_NAME='buddhistHeritageHistoricalArchive', STORE='records', dbPromise=null, pendingFile=null;
var objectUrls=[];
var fields=[
 ['title','archiveTitle'],['type','archiveType'],['place','archivePlace'],
 ['historicDate','archiveHistoricDate'],['captureDate','archiveCaptureDate'],
 ['photographer','archivePhotographer'],['collector','archiveCollector'],
 ['uploader','archiveUploader'],['contact','archiveContact'],
 ['description','archiveDescription'],['url','archiveUrl']
];
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function bn(n){return String(n).replace(/\d/g,function(d){return '০১২৩৪৫৬৭৮৯'[Number(d)];});}
function setStatus(msg,isError){var el=$('archiveStatus');if(el){el.textContent=msg;el.classList.toggle('is-error',!!isError);}}
function openDb(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise(function(resolve,reject){
  if(!window.indexedDB)return reject(new Error('এই ব্রাউজারে IndexedDB সমর্থিত নয়।'));
  var req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=function(){if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'});};
  req.onsuccess=function(){resolve(req.result);};
  req.onerror=function(){reject(req.error||new Error('IndexedDB খোলা যায়নি'));};
 });
 return dbPromise;
}
function getAll(){
 return openDb().then(function(db){return new Promise(function(resolve,reject){
  var req=db.transaction(STORE,'readonly').objectStore(STORE).getAll();
  req.onsuccess=function(){resolve((req.result||[]).sort(function(a,b){return b.createdAt-a.createdAt;}));};
  req.onerror=function(){reject(req.error);};
 });});
}
function save(record){
 return openDb().then(function(db){return new Promise(function(resolve,reject){
  var tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);
  tx.oncomplete=function(){resolve(record);};tx.onerror=function(){reject(tx.error||new Error('সংরক্ষণ ব্যর্থ'));};tx.onabort=function(){reject(tx.error||new Error('সংরক্ষণ বাতিল'));};
 });});
}
function remove(id){
 return openDb().then(function(db){return new Promise(function(resolve,reject){
  var tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);
  tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};
 });});
}
function makeId(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'archive-'+Date.now()+'-'+Math.random().toString(36).slice(2);}
function collect(){
 var r={id:makeId(),createdAt:Date.now(),file:pendingFile||null,filename:pendingFile?pendingFile.name:'',mimeType:pendingFile?pendingFile.type:'',size:pendingFile?pendingFile.size:0};
 fields.forEach(function(pair){r[pair[0]]=$(pair[1])?$(pair[1]).value.trim():'';});
 return r;
}
function safeUrl(value){try{var u=new URL(value,location.href);return ['https:','http:'].indexOf(u.protocol)>=0?u.href:'';}catch(e){return '';}}
function sizeLabel(n){if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB';}
function blobUrl(blob){var u=URL.createObjectURL(blob);objectUrls.push(u);return u;}
function mediaMarkup(r){
 var file=r.file instanceof Blob?r.file:null, type=file?(file.type||r.mimeType||''):'';
 if(file){
  var url=blobUrl(file), name=r.filename||'';
  if(type.indexOf('image/')===0)return '<a class="archive-media-link" href="'+url+'" target="_blank" rel="noopener"><img class="archive-preview-image" src="'+url+'" alt="'+esc(r.title)+'" loading="lazy"></a>';
  if(type.indexOf('video/')===0)return '<video class="archive-player" controls preload="metadata" src="'+url+'">এই ব্রাউজারে ভিডিও প্লেয়ার সমর্থিত নয়।</video>';
  if(type.indexOf('audio/')===0)return '<audio class="archive-player" controls preload="metadata" src="'+url+'">এই ব্রাউজারে অডিও প্লেয়ার সমর্থিত নয়।</audio>';
  if(type==='application/pdf'||/\.pdf$/i.test(name))return '<iframe class="archive-pdf" title="'+esc(r.title)+'" src="'+url+'#toolbar=1&navpanes=0"></iframe><a href="'+url+'" target="_blank" rel="noopener">PDF নতুন ট্যাবে খুলুন ↗</a>';
  if(type.indexOf('text/')===0||/\.(txt|md)$/i.test(name))return '<button type="button" class="archive-read-text" data-read-text="'+esc(r.id)+'">লিখিত নথি পড়ুন ↧</button><pre class="archive-text-preview" id="archive-text-'+esc(r.id)+'" hidden></pre>';
  return '<a href="'+url+'" download="'+esc(name)+'">ফাইল খুলুন/ডাউনলোড করুন ↧</a>';
 }
 var url=safeUrl(r.url||'');if(!url)return '';
 if(r.type==='image')return '<a class="archive-media-link" href="'+esc(url)+'" target="_blank" rel="noopener"><img class="archive-preview-image" src="'+esc(url)+'" alt="'+esc(r.title)+'" loading="lazy" onerror="this.hidden=true"></a>';
 if(r.type==='audio'&&(/\.(mp3|ogg|wav|m4a|aac|opus)([?#]|$)/i.test(url)))return '<audio class="archive-player" controls preload="none" src="'+esc(url)+'">অডিও প্লেয়ার সমর্থিত নয়। <a href="'+esc(url)+'">শুনুন</a></audio>';
 if(r.type==='video'){
  var id='';
  var match=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  if(match)id=match[1];
  if(id)return '<div class="archive-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/'+esc(id)+'" title="'+esc(r.title)+'" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
 }
 if(r.type==='pdf'&&/\.pdf([?#]|$)/i.test(url))return '<iframe class="archive-pdf" title="'+esc(r.title)+'" src="'+esc(url)+'#toolbar=1&navpanes=0"></iframe><a href="'+esc(url)+'" target="_blank" rel="noopener">PDF নতুন ট্যাবে খুলুন ↗</a>';
 return '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">মূল লিংক খুলুন ↗</a>';
}
function render(){
 return getAll().then(function(records){
  var list=$('archiveList');if(!list)return;
  objectUrls.forEach(function(u){URL.revokeObjectURL(u);});objectUrls=[];
  $('archiveCount').textContent=bn(records.length);
  if(!records.length){list.innerHTML='<p class="draft-empty">এখনো কোনো ঐতিহাসিক উপাদান নেই। ফর্মে প্রথম রেকর্ড যোগ করুন।</p>';return;}
  list.innerHTML=records.map(function(r){
   var meta=[r.place,r.historicDate?'ঘটনা/নথির তারিখ: '+r.historicDate:'',r.captureDate?'ধারণের তারিখ: '+r.captureDate:'',r.photographer?'আলোকচিত্রী/রেকর্ডকারী: '+r.photographer:'',r.collector?'সংগ্রহকারী: '+r.collector:'',r.uploader?'আপলোডকারী: '+r.uploader:''].filter(Boolean).map(esc);
   var icons={image:'▧',video:'▷',audio:'♫',pdf:'▤',text:'¶',link:'↗'};
   var created=new Date(r.createdAt).toLocaleDateString('bn-BD');
   return '<article class="archive-record" data-record-id="'+esc(r.id)+'"><div class="archive-record-heading"><span class="archive-type-icon" aria-hidden="true">'+(icons[r.type]||'▤')+'</span><div><h4>'+esc(r.title)+'</h4><p class="archive-meta">'+esc(String(r.type||'').toUpperCase())+' · যোগ: '+esc(created)+(r.filename?' · '+esc(r.filename)+' · '+sizeLabel(r.size||0):'')+'</p></div><button class="archive-delete" type="button" data-archive-delete="'+esc(r.id)+'" aria-label="এই রেকর্ড মুছুন">×</button></div>'+(meta.length?'<p class="archive-record-meta">'+meta.join(' · ')+'</p>':'')+(r.description?'<p class="archive-record-description">'+esc(r.description)+'</p>':'')+mediaMarkup(r)+(r.contact?'<p class="archive-record-meta">যোগাযোগ/ঠিকানা: '+esc(r.contact)+'</p>':'')+'</article>';
  }).join('');
 }).catch(function(error){
  var list=$('archiveList');if(list)list.innerHTML='<p class="archive-error">আর্কাইভ খোলা যায়নি: '+esc(error.message)+'</p>';
  setStatus(error.message,true);
 });
}
function download(blob,name){
 var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},30000);
}
function metadata(r){var x={};Object.keys(r).forEach(function(k){if(k!=='file')x[k]=r[k];});return x;}
function exportJson(){
 return getAll().then(function(records){
  var data={schema:'bangladesh-buddhist-heritage-archive/v1',exportedAt:new Date().toISOString(),records:records.map(metadata)};
  download(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),'buddhist-historical-archive.json');
 });
}
function exportZip(){
 if(typeof JSZip==='undefined')return Promise.reject(new Error('ZIP লাইব্রেরি লোড হয়নি। নেটওয়ার্ক যাচাই করে আবার চেষ্টা করুন।'));
 return getAll().then(function(records){
  if(!records.length)throw new Error('ZIP তৈরির আগে অন্তত একটি রেকর্ড যোগ করুন।');
  var zip=new JSZip(),media=zip.folder('media'),manifest=[];
  records.forEach(function(r){
   var item=metadata(r);
   if(r.file instanceof Blob){
    var safe=(r.filename||'file.bin').replace(/[^a-zA-Z0-9._-]/g,'_');
    var filename=r.id+'-'+safe;media.file(filename,r.file);item.exportedFile='media/'+filename;
   }
   manifest.push(item);
  });
  zip.file('archive.json',JSON.stringify({schema:'bangladesh-buddhist-heritage-archive/v1',exportedAt:new Date().toISOString(),count:manifest.length,records:manifest},null,2));
  zip.file('README.txt','বাংলাদেশের বৌদ্ধ ঐতিহাসিক আর্কাইভ — কমিউনিটি খসড়া\n\narchive.json-এ metadata রয়েছে এবং media/ ফোল্ডারে ফাইল রয়েছে। প্রকাশের আগে তারিখ, উৎস, কপিরাইট/অনুমতি ও ব্যক্তিগত তথ্য যাচাই করুন। এই ZIP নিজে থেকে ওয়েবসাইটে প্রকাশিত নয়।\n');
  return zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:4}});
 }).then(function(blob){download(blob,'buddhist-historical-archive.zip');});
}
function submitIssue(){
 var r=collect(),body=[
 '## Historical archive submission','- Type: '+r.type,'- Related place: '+(r.place||'Not provided'),
 '- Historic/event date: '+(r.historicDate||'Unknown / not provided'),'- Capture/recording date: '+(r.captureDate||'Not provided'),
 '- Photographer/recorder: '+(r.photographer||'Unknown / not provided'),'- Collector: '+(r.collector||'Not provided'),
 '- Submitted by: '+(r.uploader||'Not provided'),'- Contact/address (only if safe to publish): '+(r.contact||'Not provided'),
 '- Source URL: '+(r.url||'Not provided'),'- File selected locally: '+(r.filename||'No file selected; attach manually after opening the issue'),
 '','### Description / history',r.description||'Not provided','','Attach the selected media manually after the issue opens. Do not upload material without permission; corroborate provenance and dates before public release.'
 ].join('\n');
 var url='https://github.com/Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map/issues/new?title='+encodeURIComponent('[Historical Archive] '+r.title)+'&body='+encodeURIComponent(body);
 window.open(url,'_blank','noopener,noreferrer');
}
document.addEventListener('DOMContentLoaded',function(){
 var input=$('archiveFile');
 if(input)input.addEventListener('change',function(){
  pendingFile=input.files&&input.files[0]||null;var hint=document.querySelector('.archive-hint');
  if(pendingFile&&pendingFile.size>75*1024*1024){pendingFile=null;input.value='';if(hint)hint.textContent='ফাইল ৭৫ MB-এর বেশি। ছোট কপি বা মূল ওয়েব লিংক ব্যবহার করুন।';setStatus('ফাইলটি বড়; ৭৫ MB-এর মধ্যে ফাইল বেছে নিন অথবা লিংক দিন।',true);return;}
  if(hint&&pendingFile)hint.textContent=pendingFile.name+' · '+sizeLabel(pendingFile.size)+' — সংরক্ষণের পর এই ডিভাইসে প্রিভিউ করা যাবে।';
  if(pendingFile)setStatus('ফাইল নির্বাচন হয়েছে; খসড়া সংরক্ষণ চাপুন।');
 });
 if($('archiveForm'))$('archiveForm').addEventListener('reset',function(){pendingFile=null;if(input)input.value='';});
 if($('archiveForm'))$('archiveForm').addEventListener('submit',function(event){
  event.preventDefault();var r=collect();if(!r.title){setStatus('শিরোনাম লিখুন।',true);return;}
  save(r).then(function(){setStatus('এই ডিভাইসে খসড়া সংরক্ষিত হয়েছে। ZIP export না করা/প্রকাশ না করা পর্যন্ত অন্যরা দেখতে পাবেন না।');$('archiveForm').reset();return render();}).catch(function(error){setStatus('সংরক্ষণ করা যায়নি: '+error.message,true);});
 });
 if($('archiveExport'))$('archiveExport').addEventListener('click',function(){exportZip().then(function(){setStatus('আর্কাইভ ZIP তৈরি হয়েছে। এটি যাচাই করে repository-তে প্রকাশ করুন।');}).catch(function(e){setStatus(e.message,true);});});
 if($('archiveJsonExport'))$('archiveJsonExport').addEventListener('click',function(){exportJson().catch(function(e){setStatus(e.message,true);});});
 if($('archiveSubmit'))$('archiveSubmit').addEventListener('click',submitIssue);
 if($('archiveList'))$('archiveList').addEventListener('click',function(event){
  var del=event.target.closest('[data-archive-delete]');
  if(del){if(!confirm('এই আর্কাইভ রেকর্ডটি এই ডিভাইস থেকে মুছবেন?'))return;remove(del.dataset.archiveDelete).then(render).then(function(){setStatus('রেকর্ডটি এই ডিভাইস থেকে মুছে ফেলা হয়েছে।');}).catch(function(e){setStatus('রেকর্ড মুছতে সমস্যা: '+e.message,true);});return;}
  var read=event.target.closest('[data-read-text]');
  if(read)getAll().then(function(records){var r=records.find(function(x){return x.id===read.dataset.readText;});var target=$('archive-text-'+r.id);if(!target)return;if(target.hidden){return r.file.text().then(function(t){target.textContent=t;target.hidden=false;read.textContent='লিখিত নথি লুকান ↑';});}target.hidden=true;read.textContent='লিখিত নথি পড়ুন ↧';});
 });
 render();
});
})();