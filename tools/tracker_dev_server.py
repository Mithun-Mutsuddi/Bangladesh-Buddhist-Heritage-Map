"""Local preview only. Production may serve tracker.html on any static host."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import os
os.chdir(Path(__file__).resolve().parents[1])
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=urlparse(self.path).path
  if any(p.startswith('.') for p in path.split('/') if p) or path.startswith('/server/private/'):
   self.send_error(404);return
  if path=='/':self.path='/tracker.html'
  super().do_GET()
 def end_headers(self):
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
  super().end_headers()
ThreadingHTTPServer(('0.0.0.0',3000),Handler).serve_forever()
