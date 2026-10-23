"""Build tracker catalog without changing the upstream editorial datasets."""
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def load(n): return json.loads((R/'data'/n).read_text())
core={p['id']:p for p in load('dashboard-core.json')['places']}
for p in load('heritage-sites.json')['records']:
 c=p.get('location_lat_long') or {}
 q=core.get(p['id'],{})
 q.update(id=p['id'],name=p['name'],en=p.get('name_en') or q.get('en',''),district=p.get('district',''),division=p.get('division',''),category=p.get('category',''),coords=[c['latitude'],c['longitude']] if c.get('latitude') and c.get('longitude') else None,summary=p.get('summary') or '',history=p.get('history') or '',source=p.get('source_url') or '',sourceLabel=p.get('source_label') or '',approx=p.get('pin_approximate',True),verify=p.get('verification_status',''),trip=p.get('travel_note') or '')
 core[p['id']]=q
directory=load('dashboard-directory.json')
for row in directory['places']:
 p=dict(zip(directory['fields'],row))
 if p['id'] not in core:core[p['id']]={'id':p['id'],'name':p['n'],'en':'','district':p['ds'],'division':p['dv'],'category':p['cat'],'coords':p['c'],'summary':'সরকারি জেলা-ভিত্তিক তালিকা থেকে সংকলিত। বর্তমান নাম, অবস্থান ও প্রবেশাধিকার স্থানীয়ভাবে যাচাই করুন।','history':'','source':'https://brwt.gov.bd/pages/static-pages/6922dbb0933eb65569e0bdb6','sourceLabel':'Buddhist Religious Welfare Trust · '+p['pdf'],'approx':True,'verify':'Directory listing · approximate location','trip':''}
english={'somapura':'Somapura Mahavihara','paharpur':'Somapura Mahavihara','shalban':'Shalban Vihara','golden':'Buddha Dhatu Jadi','rajban':'Rajban Vihara','dharmarajika':'Dharmarajika Buddhist Mahavihara','nandan':'Nandankanan Buddhist Vihara','mainamati':'Mainamati'}
for p in core.values():
 if 'সোমপুর' in p['name'] or 'পাহাড়পুর' in p['name']: p['en']='Somapura Mahavihara'
 if p['id'] in english:p['en']=english[p['id']]
keys=['id','name','en','district','division','category','coords','summary','history','source','sourceLabel','approx','verify','trip']
places=[{k:p.get(k) for k in keys} for p in core.values()]
(R/'data/tracker-places.json').write_text(json.dumps({'version':1,'note':'Compiled directory, not a verified temple census. Approximate locations must be confirmed locally.','places':places},ensure_ascii=False,separators=(',',':')))
bn=['বাগেরহাট','বান্দরবান','বরগুনা','বরিশাল','ভোলা','বগুড়া','ব্রাহ্মণবাড়িয়া','চাঁদপুর','চট্টগ্রাম','চুয়াডাঙ্গা','কুমিল্লা','কক্সবাজার','ঢাকা','দিনাজপুর','ফরিদপুর','ফেনী','গাইবান্ধা','গাজীপুর','গোপালগঞ্জ','হবিগঞ্জ','জামালপুর','যশোর','ঝালকাঠি','ঝিনাইদহ','জয়পুরহাট','খাগড়াছড়ি','খুলনা','কিশোরগঞ্জ','কুড়িগ্রাম','কুষ্টিয়া','লক্ষ্মীপুর','লালমনিরহাট','মাদারীপুর','মাগুরা','মানিকগঞ্জ','মৌলভীবাজার','মেহেরপুর','মুন্সীগঞ্জ','ময়মনসিংহ','নওগাঁ','নড়াইল','নারায়ণগঞ্জ','নরসিংদী','নাটোর','চাঁপাইনবাবগঞ্জ','নেত্রকোণা','নীলফামারী','নোয়াখালী','পাবনা','পঞ্চগড়','পটুয়াখালী','পিরোজপুর','রাজবাড়ী','রাজশাহী','রাঙামাটি','রংপুর','সাতক্ষীরা','শরীয়তপুর','শেরপুর','সিরাজগঞ্জ','সুনামগঞ্জ','সিলেট','টাঙ্গাইল','ঠাকুরগাঁও']
geo=load('tracker-districts.geojson'); admin=load('bd-geo.json'); norm=lambda s:s.replace('য়','য়').replace('ড়','ড়').replace('ঢ়','ঢ়')
for f,b in zip(geo['features'],bn):
 f['properties']['bn']=b
 f['properties']['division']=next((v['n'] for v in admin for d in v['d'] if norm(d['n'])==norm(b)), 'অন্যান্য')
for f in geo['features']:
 if f['properties']['shapeName']=='Munshiganj':f['properties']['division']='ঢাকা'
 if f['properties']['shapeName']=='Rangamati':f['properties']['division']='চট্টগ্রাম'
(R/'data/tracker-districts.geojson').write_text(json.dumps(geo,ensure_ascii=False,separators=(',',':')))
print(len(places),'records;',len(geo['features']),'districts')
print([(f['properties']['bn'],f['properties']['division']) for f in geo['features'] if f['properties']['division']=='অন্যান্য'])
