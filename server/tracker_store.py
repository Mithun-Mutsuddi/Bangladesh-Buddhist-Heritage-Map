"""Optional private map-snapshot store for a local STDIO MCP client.

No web login, cloud sync or public HTTP service is implied. Private routes/media
are never imported. Put CHARJAVUMI_DB outside any static web root.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import sqlite3
import time
import unicodedata
import uuid

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / 'data/tracker-places.json').read_text())['places']
PLACES = {p['id']: p for p in CATALOG}
DISTRICTS = json.loads((ROOT / 'data/tracker-districts.geojson').read_text())['features']
DISTRICT_IDS = {f['properties']['shapeName'] for f in DISTRICTS}


def normalize(value: str) -> str:
    return unicodedata.normalize('NFC', value).lower().replace('য়', 'য়').replace('ড়', 'ড়').replace('ঢ়', 'ঢ়').strip()


def district_key(value: str) -> str:
    value = normalize(value)
    return {'রাঙ্গামাটি': 'রাঙামাটি', 'মুন্সিগঞ্জ': 'মুন্সীগঞ্জ', 'নেত্রকোনা': 'নেত্রকোণা'}.get(value, value)


DISTRICT_NAMES = {district_key(f['properties']['bn']): f['properties']['shapeName'] for f in DISTRICTS}


class Store:
    def __init__(self, path: str | Path):
        path = Path(path).expanduser().resolve()
        if path == ROOT or ROOT in path.parents:
            raise ValueError('Private database must be OUTSIDE the static website repository.')
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.path = path
        with self.connect() as con:
            con.executescript('''
                CREATE TABLE IF NOT EXISTS maps(id TEXT PRIMARY KEY, name TEXT NOT NULL,
                    visited TEXT NOT NULL, districts TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
                CREATE TABLE IF NOT EXISTS tokens(hash TEXT PRIMARY KEY, map_id TEXT NOT NULL,
                    scope TEXT NOT NULL CHECK(scope IN ('read','write')), expires REAL NOT NULL,
                    revoked INTEGER NOT NULL DEFAULT 0);
                CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, map_id TEXT NOT NULL,
                    at REAL NOT NULL, place_id TEXT NOT NULL, visited INTEGER NOT NULL, revision INTEGER NOT NULL);
            ''')
        os.chmod(path, 0o600)

    def connect(self):
        con = sqlite3.connect(self.path)
        con.row_factory = sqlite3.Row
        return con

    def import_snapshot(self, state: dict) -> str:
        if state.get('version') != 1:
            raise ValueError('Unsupported tracker state')
        visited = sorted({x for x in state.get('visited', []) if isinstance(x, str) and x in PLACES})
        districts = sorted({x for x in state.get('districts', []) if isinstance(x, str) and x in DISTRICT_IDS})
        map_id = str(uuid.uuid4())
        with self.connect() as con:
            con.execute('INSERT INTO maps VALUES(?,?,?,?,1)', (map_id, str(state.get('name', ''))[:40], json.dumps(visited), json.dumps(districts)))
        return map_id

    def issue_token(self, map_id: str, scope: str = 'read', days: int = 30) -> str:
        if scope not in ('read', 'write') or not 1 <= days <= 90:
            raise ValueError('Scope must be read/write and expiry 1–90 days')
        token = secrets.token_urlsafe(32)
        with self.connect() as con:
            if not con.execute('SELECT id FROM maps WHERE id=?', (map_id,)).fetchone():
                raise ValueError('Unknown map')
            con.execute('INSERT INTO tokens VALUES(?,?,?,?,0)', (self.digest(token), map_id, scope, time.time() + days * 86400))
        return token

    @staticmethod
    def digest(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    def _authorize(self, con, token: str, write=False):
        if not token:
            raise PermissionError('No map token configured. Public tools remain available.')
        row = con.execute('SELECT * FROM tokens WHERE hash=? AND revoked=0 AND expires>?', (self.digest(token), time.time())).fetchone()
        if not row or (write and row['scope'] != 'write'):
            raise PermissionError('Map token is invalid, expired, revoked, or lacks write scope.')
        return row

    def read(self, token: str) -> dict:
        with self.connect() as con:
            auth = self._authorize(con, token)
            row = con.execute('SELECT * FROM maps WHERE id=?', (auth['map_id'],)).fetchone()
        visited = json.loads(row['visited'])
        districts = set(json.loads(row['districts']))
        districts.update(DISTRICT_NAMES[district_key(PLACES[p]['district'])] for p in visited if district_key(PLACES[p]['district']) in DISTRICT_NAMES)
        return {'map_id': row['id'], 'name': row['name'], 'visited': visited, 'manual_districts': json.loads(row['districts']), 'districts': sorted(districts), 'total': len(PLACES), 'count': len(visited), 'remaining': len(PLACES) - len(visited), 'completion_percent': round(len(visited)/len(PLACES)*100, 1), 'revision': row['revision'], 'scope': auth['scope'], 'note': 'Imported local snapshot, not live browser data. Routes and journals are not available.'}

    def update(self, token: str, place_id: str, visited: bool, expected_revision: int, confirmed: bool = False) -> dict:
        if not confirmed:
            raise ValueError('Ask the user to confirm the exact place and change first.')
        if place_id not in PLACES or not isinstance(visited, bool):
            raise ValueError('Unknown place ID or invalid visit status')
        with self.connect() as con:
            con.execute('BEGIN IMMEDIATE')
            auth = self._authorize(con, token, write=True)
            row = con.execute('SELECT * FROM maps WHERE id=?', (auth['map_id'],)).fetchone()
            if row['revision'] != expected_revision:
                raise ValueError('Map changed. Read the latest revision and reconfirm before updating.')
            values = set(json.loads(row['visited']))
            values.add(place_id) if visited else values.discard(place_id)
            revision = row['revision'] + 1
            con.execute('UPDATE maps SET visited=?, revision=? WHERE id=?', (json.dumps(sorted(values)), revision, row['id']))
            con.execute('INSERT INTO audit(map_id,at,place_id,visited,revision) VALUES(?,?,?,?,?)', (row['id'], time.time(), place_id, int(visited), revision))
        return self.read(token)

    def revoke_map(self, map_id: str):
        with self.connect() as con:
            con.execute('UPDATE tokens SET revoked=1 WHERE map_id=?', (map_id,))


def default_path():
    return os.environ.get('CHARJAVUMI_DB', str(Path.home() / '.charjavumi-private' / 'maps.sqlite'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', default=default_path())
    sub = parser.add_subparsers(dest='command', required=True)
    imp = sub.add_parser('import'); imp.add_argument('backup')
    issue = sub.add_parser('issue'); issue.add_argument('map_id'); issue.add_argument('--scope', choices=['read','write'], default='read'); issue.add_argument('--days', type=int, default=30)
    revoke = sub.add_parser('revoke'); revoke.add_argument('map_id')
    export = sub.add_parser('merge'); export.add_argument('original_backup'); export.add_argument('output')
    args = parser.parse_args(); store = Store(args.db)
    if args.command == 'import':
        raw = json.loads(Path(args.backup).read_text())
        if raw.get('format') != 'charjavumi-backup': raise ValueError('Expected a tracker backup')
        print(store.import_snapshot(raw['state']))
    elif args.command == 'issue':
        print(store.issue_token(args.map_id, args.scope, args.days))
    elif args.command == 'revoke':
        store.revoke_map(args.map_id); print('Tokens revoked.')
    elif args.command == 'merge':
        data = store.read(os.environ.get('CHARJAVUMI_MAP_TOKEN',''))
        raw = json.loads(Path(args.original_backup).read_text())
        if raw.get('format') != 'charjavumi-backup': raise ValueError('Expected a tracker backup')
        raw['state']['visited'] = data['visited']; raw['state']['districts'] = data['manual_districts']
        dest = Path(args.output).expanduser().resolve()
        if ROOT in dest.parents: raise ValueError('Private backup output must be outside the website repository')
        dest.write_text(json.dumps(raw, ensure_ascii=False)); os.chmod(dest,0o600)
        print('Merged visits into backup; journal and media preserved. Restore manually in the tracker.')


if __name__ == '__main__':
    main()
