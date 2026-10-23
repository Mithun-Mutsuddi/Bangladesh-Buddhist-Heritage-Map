"""SanghaMitra MCP: local STDIO transport only; no public web endpoint.

Run: python -m server.tracker_mcp
Optional private-map token lives in the MCP client's secure environment, never
in tool arguments, chat messages, browser code, or a committed config file.
"""
import os
from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations
from server.tracker_store import Store, PLACES, CATALOG, normalize, default_path

mcp = FastMCP('Charjavumi SanghaMitra', instructions='Find public Bangladesh Buddhist heritage records. Never invent historical facts or imply that approximate coordinates are an entrance. Private maps are imported snapshots, NOT live browser data. Before a write, show the exact place and desired change and obtain explicit user confirmation. Never request or reveal tokens in chat.')
READ = ToolAnnotations(readOnlyHint=True, destructiveHint=False, openWorldHint=False)
WRITE = ToolAnnotations(readOnlyHint=False, destructiveHint=True, idempotentHint=False, openWorldHint=False)


def private_store():
    token = os.environ.get('CHARJAVUMI_MAP_TOKEN', '')
    if not token: raise PermissionError('Configure an owner-issued scoped token in the MCP client environment to access a private snapshot.')
    return Store(default_path()), token


@mcp.tool(annotations=READ)
def list_maps() -> dict:
    """List public maps without signing in."""
    return {'maps': [{'id': 'bangladesh-buddhist-heritage', 'name': 'Bangladesh Buddhist Heritage', 'places': len(PLACES), 'districts': 64}], 'world_europe_maps': 'Not connected'}


@mcp.tool(annotations=READ)
def find_places(query: str, limit: int = 10) -> list[dict]:
    """Search Bengali names, available English names/IDs, and district names. Not universal translation."""
    q = normalize(query)[:200]
    if not q: return []
    return [{'id': p['id'], 'name': p['name'], 'english_name': p['en'], 'district': p['district'], 'approximate_pin': bool(p['approx'])} for p in CATALOG if q in normalize(' '.join(str(p.get(k) or '') for k in ('id','name','en','district')))] [:max(1,min(25,limit))]


@mcp.tool(annotations=READ)
def read_introduction(place_id: str) -> dict:
    """Read a public heritage introduction with original source and verification caveats."""
    if place_id not in PLACES: raise ValueError('Unknown place ID. Call find_places first.')
    p = PLACES[place_id]
    return {k: p[k] for k in ('id','name','en','district','summary','history','source','sourceLabel','approx','verify')}


@mcp.tool(annotations=READ)
def read_my_map() -> dict:
    """Read visit IDs and completion stats from the token's imported snapshot. Requires read or write scope."""
    store, token = private_store()
    return store.read(token)


@mcp.tool(annotations=WRITE)
def set_place_visited(place_id: str, visited: bool, expected_revision: int, confirmed_by_user: bool = False) -> dict:
    """Update exactly one place after explicit user confirmation; requires write scope and current revision.

    Never treat a district trip as permission to mark all its temples. Browser
    maps are unchanged until the owner merges and restores the updated backup.
    """
    store, token = private_store()
    return store.update(token, place_id, visited, expected_revision, confirmed_by_user)


if __name__ == '__main__':
    mcp.run(transport='stdio')
