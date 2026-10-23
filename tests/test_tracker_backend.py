import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from server.tracker_store import Store, ROOT

class PrivateStoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name)/'maps.sqlite')
        self.map_id = self.store.import_snapshot({'version':1,'name':'Explorer','visited':[],'districts':[]})
    def tearDown(self): self.temp.cleanup()
    def test_private_db_rejected_inside_static_root(self):
        with self.assertRaises(ValueError): Store(ROOT/'private'/'maps.sqlite')
    def test_read_scope_and_isolation(self):
        read = self.store.issue_token(self.map_id)
        self.assertEqual(self.store.read(read)['count'],0)
        with self.assertRaises(PermissionError):self.store.read('not-a-token')
        with self.assertRaises(PermissionError):self.store.update(read,'dharmarajika',True,1,True)
    def test_confirm_revision_and_revoke(self):
        token=self.store.issue_token(self.map_id,'write')
        with self.assertRaises(ValueError):self.store.update(token,'dharmarajika',True,1,False)
        result=self.store.update(token,'dharmarajika',True,1,True)
        self.assertEqual(result['count'],1);self.assertIn('Dhaka',result['districts'])
        with self.assertRaises(ValueError):self.store.update(token,'dharmarajika',False,1,True)
        self.assertEqual(self.store.update(token,'dharmarajika',False,2,True)['count'],0)
        self.store.revoke_map(self.map_id)
        with self.assertRaises(PermissionError):self.store.read(token)
    def test_expired_token_denied(self):
        token=self.store.issue_token(self.map_id)
        with self.store.connect() as con:con.execute('UPDATE tokens SET expires=0')
        with self.assertRaises(PermissionError):self.store.read(token)
    def test_no_private_media_or_routes_imported(self):
        mid=self.store.import_snapshot({'version':1,'visited':['dharmarajika','unknown'],'districts':['Dhaka'],'routes':[{'secret':1}],'journal':['secret']})
        data=self.store.read(self.store.issue_token(mid))
        self.assertNotIn('routes',data);self.assertNotIn('journal',data);self.assertEqual(data['visited'],['dharmarajika'])

class OptionalAPITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from fastapi.testclient import TestClient
        from server.tracker_api import app, requests
        requests.clear();cls.client=TestClient(app)
    def test_health_and_missing_key(self):
        from server import sanghamitra_api as guide
        self.assertEqual(self.client.get('/health').status_code,200)
        with patch.object(guide,'API_KEY',''):
            result=self.client.post('/api/chat',json={'message':'Dharmarajika','language':'en'})
            self.assertEqual(result.status_code,503)
    def test_private_and_dot_paths_not_served(self):
        for path in ('/.git/HEAD','/server/tracker_store.py','/server/private/secret.json','/.env'):
            self.assertEqual(self.client.get(path).status_code,404)
        self.assertEqual(self.client.get('/tracker.html').status_code,200)
    def test_cross_origin_chat_rejected(self):
        result=self.client.post('/api/chat',headers={'Origin':'https://untrusted.example'},json={'message':'Hi','language':'en'})
        self.assertEqual(result.status_code,403)
    def test_invalid_body_rejected(self):
        self.assertEqual(self.client.post('/api/chat',json={'message':''}).status_code,422)
    def test_rate_limit(self):
        from server.tracker_api import requests
        from server import sanghamitra_api as guide
        requests.clear()
        with patch.object(guide,'API_KEY',''):
            for _ in range(10):self.client.post('/api/chat',json={'message':'Hello','language':'en'})
            self.assertEqual(self.client.post('/api/chat',json={'message':'Hello','language':'en'}).status_code,429)
        requests.clear()

class MCPToolsTests(unittest.TestCase):
    def test_public_tools_and_missing_private_token(self):
        from server.tracker_mcp import list_maps,find_places,read_introduction,read_my_map
        self.assertEqual(list_maps()['maps'][0]['districts'],64)
        self.assertTrue(any(p['id']=='dharmarajika' for p in find_places('Dharmarajika')))
        self.assertIn('dharmarajika',read_introduction('dharmarajika')['source'])
        with patch.dict(os.environ,{'CHARJAVUMI_MAP_TOKEN':''}):
            with self.assertRaises(PermissionError):read_my_map()

if __name__=='__main__':unittest.main()
