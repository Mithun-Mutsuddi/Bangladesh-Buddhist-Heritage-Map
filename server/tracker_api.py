"""Optional same-origin tracker + AI host. No cloud accounts or visit uploads.

Run from repository root:
  uvicorn server.tracker_api:app --host 0.0.0.0 --port 8000
OPENAI_API_KEY stays server-side. For production add an authenticated gateway,
billing caps, distributed rate limiting and HTTPS; this limiter is per process.
"""
from collections import defaultdict, deque
import json
from pathlib import Path
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from server import sanghamitra_api as guide

ROOT = Path(__file__).resolve().parents[1]
for p in json.loads((ROOT/'data/tracker-places.json').read_text())['places']:
    if p['id'] not in guide.SITES:
        guide.SITES[p['id']] = {**p, 'source_url': p['source'], 'source_label': p['sourceLabel'],
            'verification_note': 'Approximate location; confirm locally.' if p['approx'] else 'Confirm current access locally.'}

app = FastAPI(title='Charjavumi Tracker API', version='1.0.0')
requests = defaultdict(deque)

@app.middleware('http')
async def protect(request: Request, call_next):
    if request.url.path == '/api/chat' and request.method == 'POST':
        origin = request.headers.get('origin')
        # Same-origin only; deploy reverse proxy with correct trusted Host scheme.
        if origin and origin.rstrip('/') != str(request.base_url).rstrip('/'):
            return JSONResponse({'detail':'Cross-origin AI requests are disabled.'},status_code=403)
        try:
            size = int(request.headers.get('content-length','0') or '0')
        except ValueError:
            return JSONResponse({'detail':'Invalid content length'},status_code=400)
        if size > 8192:
            return JSONResponse({'detail':'Request too large'},status_code=413)
        peer = request.client.host if request.client else 'unknown'
        now = time.monotonic()
        if len(requests)>10000:
            for key in list(requests):
                if not requests[key] or now-requests[key][-1]>60: requests.pop(key,None)
        bucket = requests[peer]
        while bucket and now-bucket[0]>60: bucket.popleft()
        if len(bucket)>=10: return JSONResponse({'detail':'Please wait before asking again.'},status_code=429,headers={'Retry-After':'60'})
        bucket.append(now)
    response = await call_next(request)
    response.headers['X-Content-Type-Options']='nosniff'
    response.headers['Referrer-Policy']='strict-origin-when-cross-origin'
    return response

@app.get('/', include_in_schema=False)
async def home():
    return RedirectResponse('/tracker.html')

app.include_router(guide.app.router)

class PublicFiles(StaticFiles):
    async def get_response(self,path,scope):
        parts=Path(path).parts
        if any(x.startswith('.') for x in parts) or (parts and parts[0] in ('server','tests','tools','node_modules','docs')) or Path(path).suffix.lower() not in ('.html','.js','.mjs','.css','.json','.geojson','.svg','.png','.jpg','.jpeg','.webp','.ttf','.woff2','.ico','.pdf'):
            raise HTTPException(404)
        return await super().get_response(path,scope)

app.mount('/',PublicFiles(directory=ROOT,html=True),name='public')
