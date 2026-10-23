const {test,expect}=require('@playwright/test');

const seenKey='charyabhumiWelcomeSeenV1';
const profileKey='charyabhumiWelcomeProfileV1';
const social='বৌদ্ধ সামাজিক প্রতিষ্ঠান';
async function ready(page){
  await expect(page.locator('#placeGrid .cb-place-card').first()).toBeVisible({timeout:20000});
  await expect(page.locator('#dashStatus')).toContainText('৩,২১৮',{timeout:20000});
}
async function suppressWelcome(page){
  await page.addInitScript(key=>sessionStorage.setItem(key,'1'),seenKey);
}
async function openDetails(page,id){
  await page.locator(`[data-card="${id}"] [data-action="details"]`).click();
  await expect(page.locator('#placeDialog')).toBeVisible();
}
async function expectImagesLoaded(locator){
  await locator.first().waitFor({state:'visible'});
  await locator.evaluateAll(async imgs=>{
    await Promise.all(imgs.map(img=>new Promise(resolve=>{
      if(img.complete)return resolve();
      img.addEventListener('load',resolve,{once:true});
      img.addEventListener('error',resolve,{once:true});
      img.scrollIntoView({block:'center'});
    })));
  });
  const states=await locator.evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),width:img.naturalWidth})));
  expect(states.every(x=>x.width>0),JSON.stringify(states)).toBe(true);
}

test('welcome is graphical, personalized, local-only, session-once and reduced-motion safe',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    window.__geoCalls=0;
    Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition(){window.__geoCalls++;}}});
  });
  await page.goto('/index.html?welcome=1');
  const dialog=page.locator('#welcomeDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('svg')).toBeVisible();
  await expect(page.locator('#welcomeFestivalTitle')).not.toBeEmpty();
  await expect(page.locator('#welcomeDate')).toContainText('ঢাকার সময়');
  await expect(page.locator('#cbFooter')).toContainText('মিথুন মুৎসুদ্দী');
  await expect(page.locator('#cbFooter')).not.toContainText('মিঠুন মুৎসুদ্দি');
  const sinceCount=await page.locator('#cbFooter').evaluate(el=>(el.textContent.match(/শুরু:/g)||[]).length);
  expect(sinceCount).toBe(1);
  expect(await page.evaluate(()=>window.__geoCalls)).toBe(0);
  expect(await page.locator('.cb-welcome-wheel').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.locator('#welcomeName').fill('আশা');
  await page.locator('#welcomeLocation').fill('কেশবপুর, যশোর');
  await page.locator('#welcomeForm button[type="submit"]').click();
  await expect(page.locator('#welcomeTitle')).toContainText('আশা');
  await expect(page.locator('#welcomeText')).toContainText('কেশবপুর, যশোর');
  const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),profileKey);
  expect(stored).toEqual({name:'আশা',location:'কেশবপুর, যশোর'});
  await page.locator('#welcomeExplore').click();
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(dialog).not.toBeVisible();
  await page.goto('/index.html?welcome=1');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#welcomeName')).toHaveValue('আশা');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('fixed festival and greeting use Dhaka time',async({page})=>{
  await page.addInitScript(()=>{
    const RealDate=Date;
    const fixed=new RealDate('2026-02-21T04:00:00Z').getTime(); // 10:00 in Dhaka
    class MockDate extends RealDate{
      constructor(...args){super(...(args.length?args:[fixed]));}
      static now(){return fixed;}
    }
    Object.setPrototypeOf(MockDate,RealDate);
    window.Date=MockDate;
  });
  await page.goto('/index.html?welcome=1');
  await expect(page.locator('#welcomeTime')).toContainText('শুভ সকাল');
  await expect(page.locator('#welcomeFestivalTitle')).toHaveText('আন্তর্জাতিক মাতৃভাষা দিবসের শ্রদ্ধাঞ্জলি');
  await expect(page.locator('#welcomeDialog')).toHaveAttribute('data-festival','festival');
});

test('geolocation is click-only; denial is helpful and success stores division, not coordinates',async({page})=>{
  await page.addInitScript(()=>{
    window.__geoCalls=0;window.__geoMode='deny';
    Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition(ok,fail){
      window.__geoCalls++;
      if(window.__geoMode==='deny')fail({code:1});
      else ok({coords:{latitude:23.8103,longitude:90.4125}});
    }}});
  });
  await page.goto('/index.html?welcome=1');
  await expect(page.locator('#welcomeDialog')).toBeVisible();
  expect(await page.evaluate(()=>window.__geoCalls)).toBe(0);
  await page.locator('#welcomeLocate').click();
  await expect(page.locator('#welcomeLocateStatus')).toContainText('অনুমতি পাওয়া যায়নি');
  await page.evaluate(()=>{window.__geoMode='allow';});
  await page.locator('#welcomeLocate').click();
  await expect(page.locator('#welcomeLocation')).toHaveValue('ঢাকা');
  await expect(page.locator('#welcomeLocateStatus')).toContainText('স্থানাঙ্ক সংরক্ষণ করা হয়নি');
  const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),profileKey);
  expect(stored.location).toBe('ঢাকা');
  expect(stored).not.toHaveProperty('coords');
  expect(stored).not.toHaveProperty('latitude');
});

test('institutions URL redirects to nine merged social records with unique filters',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await suppressWelcome(page);
  await page.goto('/institutions.html');
  await page.waitForURL(/index\.html\?category=/);
  await ready(page);
  await expect(page.locator('#categoryFilter')).toHaveValue(social);
  await expect(page.locator('#placeGrid .cb-place-card')).toHaveCount(9);
  await expect(page.locator('#resultsCount')).toContainText('৯টি');
  await expect(page.locator('body')).not.toContainText('নতুন ছয় বিভাগ');
  const duplicateValues=await page.locator('#divisionFilter,#districtFilter,#categoryFilter').evaluateAll(selects=>selects.flatMap(s=>{
    const values=Array.from(s.options).map(o=>o.value);return values.filter((v,i)=>values.indexOf(v)!==i);
  }));
  expect(duplicateValues).toEqual([]);
  await openDetails(page,'anoma-sangskritik-gosthi');
  await expect(page.locator('#placeDialogBody')).toContainText('২০২৪ কমিটি');
  await expect(page.locator('#placeDialogBody .cb-data-note summary')).toHaveText('তথ্য কেন আগে পাওয়া যায়নি');
  await expect(page.locator('#placeDialogBody .cb-data-note')).toContainText('পাওয়া যায়নি');
  await expect(page.locator('#placeDialogBody .cb-sources a')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('Dalijhara is searchable once and shows five local images, sources and separate official phones',async({page})=>{
  await page.goto('/index.html?welcome=0');
  await ready(page);
  await page.locator('#placeSearch').fill('দলিজহারা');
  await expect(page.locator('#placeGrid .cb-place-card')).toHaveCount(1);
  await expect(page.locator('[data-card="dalijhara-buddhist-bihara-temple"]')).toBeVisible();
  await openDetails(page,'dalijhara-buddhist-bihara-temple');
  await expect(page.locator('#placeDialogBody h3')).toHaveText('ডালিঝরা বৌদ্ধ বিহার কমপ্লেক্স');
  await expect(page.locator('#placeDialogBody .cb-gallery img')).toHaveCount(5);
  await expectImagesLoaded(page.locator('#placeDialogBody .cb-gallery img'));
  const tel=await page.locator('#placeDialogBody a[href^="tel:"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  expect(tel).toEqual(['tel:+8801773553460','tel:+8802477730136']);
  await expect(page.locator('#placeDialogBody')).toContainText('সাইট-নির্দিষ্ট ভান্তে নয়');
  await expect(page.locator('#placeDialogBody .cb-sources a')).toHaveCount(4);
  await expect(page.locator('#placeDialogBody')).toContainText('image-only scan');
});

test('multiple mobile numbers produce separate valid telephone links',async({page})=>{
  await page.goto('/index.html?welcome=0');
  await ready(page);
  await page.locator('#placeSearch').fill('আখালিয়া');
  await expect(page.locator('[data-card="sylhet-buddhist-bihar-akhaliya"]')).toBeVisible();
  await openDetails(page,'sylhet-buddhist-bihar-akhaliya');
  const tel=await page.locator('#placeDialogBody a[href^="tel:"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  expect(tel).toEqual(['tel:+8801711585391','tel:+8801819819653']);
});

test('new article and BD MAPS gallery render local media without mobile overflow',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/purna-chandra-tarai.html');
  await expect(page.locator('h1')).toContainText('নেপালের তরাইয়ে বাঙালির খোঁজ');
  await expect(page.locator('h1')).not.toContainText('লুম্বিনি ও কপিলবস্তু আবিষ্কারের নেপথ্যে');
  await expect(page.locator('.cb-story figure img')).toHaveCount(5);
  await expectImagesLoaded(page.locator('.cb-story figure img'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('/maps.html');
  await expect(page.locator('.cb-map-feature img, .cb-map-card img')).toHaveCount(3);
  await expectImagesLoaded(page.locator('.cb-map-feature img, .cb-map-card img'));
  await expect(page.locator('.cb-dalijhara-panel img')).toHaveCount(1);
  await expectImagesLoaded(page.locator('.cb-dalijhara-panel img'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
