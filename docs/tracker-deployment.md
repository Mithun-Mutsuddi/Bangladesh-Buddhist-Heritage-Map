# Charjavumi Travel Tracker — deployment & handover

Built as an additive upgrade to **Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map**, based on commit `9aaa69c2e5f67038794820c012609d50da5a68f9` (23 October 2026). The original homepage, directory, calendar, literature, quiz, and archive remain intact. The new tracker is `tracker.html`; the homepage and common navigation link to it.

## What works now

| Feature | Implementation / limits |
|---|---|
| Bangladesh map | Bundled geoBoundaries geometry for all 64 districts. Click or use keyboard/checklist to toggle. No map API key, tiles, CDN, or location permission required for browsing. |
| Heritage directory | 3,218 unique existing directory IDs. Latest base records override older dashboard entries. This is **not 3,218 independently verified temples**: the original directory includes institutions, research leads and approximate locations. |
| Visits & progress | Separate site and district counts; remaining counts; completion percentage; badges. Visiting a site derives its district. A district visit does not mark all temples there. Removing a district with visited sites asks before removing those site marks. |
| GPS recorder | Explicit opt-in, HTTPS browser geolocation, accuracy filtering, 15 m movement threshold, outlier rejection, local route storage, map trace, distance, GeoJSON export. District transit can be recorded automatically. **Foreground only**, not native/background tracking. GPS does not silently mark temples visited. |
| Private journal | Date, place, text, companions, JPEG/PNG/WebP photos and MP4/WebM videos in IndexedDB; edit/delete; reload persistence. Up to 6 attachments, 20 MB each, 60 MB per entry. Browser quotas can be lower. |
| Companions | Local names attached to entries. No messages, invitations or multi-user sync. |
| Share cards | Canvas PNG/JPG export without remote images; native file-sharing when supported; downloadable fallback; optional display name; shareable, read-only progress snapshot. No routes, journal or media included. Shared district lists are intentionally disclosed. |
| Backup | JSON export including local state, routes, media and journal; validated restore with replacement confirmation; transactional journal replacement. Import capped at 100 MB file / 75 MB decoded media. Larger libraries should be exported and archived but cannot currently be restored as one file. |
| SanghaMitra local guide | Searches Bengali names, existing English aliases and IDs; reads public record introductions and sources; statistics only with explicit local consent; exact-place buttons for manual changes. **Not a generative model** when online AI is off. |
| Voice | Device speech synthesis and optional browser speech recognition. Bangla/English and other selected voice locales depend on installed browser voices. Recognition may use the browser vendor’s service, with a separate consent prompt. No guaranteed male/female voice, age, or universal translation. |
| Festivals | Ten existing lunar/local-date festival entries, calendar links and respectful-visit guidance. No invented Gregorian festival schedule. |
| Language | Bengali/English navigation, dashboard and core messages. Directory content is mainly Bengali; some settings and technical messages remain English. |
| Optional online AI | Existing source-aware server API, a same-origin host, and full tracker catalog context. Requires server-only provider credentials. No private route/journal access. |
| Optional MCP | Tested local STDIO server with public lookup and scoped-token private **snapshot** tools. Explicit confirmation, revision checking, token expiry/revocation and audit log. Not browser/cloud sync. |

### Deliberately not represented as connected

Cloud sign-in, remote storage, live travel buddies, public trip pages, native background location, world/Europe/state maps, Google Maps Platform APIs, 3D/Street View embedding, travel/flight booking feeds, analytics, Sentry, Supabase and hosted MCP are **not provisioned**. Google Maps and Street View buttons are external links, not scraped live data or API integrations. Street View coverage is not guaranteed.

Do not add location analytics, third-party trackers or live sharing without an explicit privacy design. A scraped coordinate is not a verified monastery entrance. Decommissioned emergency products are not dependencies of this site.

## 1. Static deployment (no account/API key needed)

1. Back up your repository or create a feature branch.
2. Extract `charjavumi-tracker-update.zip` **into the repository root**, preserving paths. This is an overlay, not a standalone full repository.
3. Review changes to `index.html`, `brand.js`, `home.js` and `data/site-info.json`. They only add/update tracker navigation and description.
4. Commit and deploy through the existing GitHub Pages workflow, `main` / root. Nothing has been pushed or deployed by the agent.
5. Visit `https://mithun-mutsuddi.github.io/Bangladesh-Buddhist-Heritage-Map/tracker.html` after deployment.
6. Test in a normal HTTPS browser, not an embedded file viewer. Embedded previews may block GPS/microphone permissions; open in a separate tab if necessary.

No bundling step is required for the frontend. JavaScript uses browser ES modules; open through a web server, **not `file://`**. Font files, generated illustration and district geometry are bundled.

```bash
# From repository root. Preview / opens tracker.html; /index.html is the original home.
python tools/tracker_dev_server.py
# or npm start
```

The preview server binds `0.0.0.0:3000`. It is a development server, not an internet production backend. Standard static hosts may use `tracker.html` directly. Paths are relative and work under a repository subpath.

**Share links:** `CANONICAL_URL` in `tracker-core.mjs` is the intended GitHub Pages tracker address. Until the overlay is published there, a copied progress link will not resolve to the new page. Change that constant if moving the public site to another domain. A link’s fragment contains a readable, self-reported summary, not an access token; anyone with the link can read it and it cannot be revoked.

## 2. Optional online AI server

```bash
python -m venv .venv
# Activate your venv, then:
pip install -r requirements.txt
# Set OPENAI_API_KEY using your deployment provider's secret manager.
# Optional: OPENAI_MODEL, OPENAI_CHAT_COMPLETIONS_URL
uvicorn server.tracker_api:app --host 0.0.0.0 --port 8000
```

This serves `tracker.html` and `/api/chat` on the same origin. In the assistant, the visitor must explicitly enable online AI. Only the typed question, language and selected public site ID are sent. Provider keys never enter the frontend. If no key is configured, `/api/chat` returns **503**; the UI clearly reports this instead of fabricating a generated reply.

For a separate frontend host, reverse-proxy `/api/chat` to the API. Do not make browser requests to `localhost`. The included same-origin guard rejects cross-origin requests. Configure TLS, trusted forwarded headers, host validation and the reverse proxy correctly.

Before opening a paid model endpoint to the public, add **authenticated access or an abuse-control gateway, distributed rate limiting, spending limits, monitoring, and a retention/privacy policy**. The included 10 requests/minute per-peer limiter is a small single-process safeguard, not a production anti-abuse system. No provider call was made in validation because no live provider key was supplied.

## 3. Optional MCP (local STDIO, not a cloud connector)

```bash
pip install -r server/requirements-tracker.txt
python -m server.tracker_mcp
```

Public tools, no sign-in:
- `list_maps()` — Bangladesh catalog (world/Europe maps are not connected).
- `find_places(query, limit)` — Bengali names and available English aliases/IDs; not translation into every language.
- `read_introduction(place_id)` — summary, history, original source and verification caveat.

Private tools:
- `read_my_map()` — the token's imported snapshot, visit IDs, completion and revision.
- `set_place_visited(place_id, visited, expected_revision, confirmed_by_user)` — requires **write** scope and explicit confirmation; exactly one valid place ID per call. A district mention does not authorize mass updates.

### Connect your own snapshot safely

1. Export a private backup from the tracker.
2. Save it **outside the website directory**. Never commit it.
3. Import only its visits/name/districts into the private database:

```bash
python -m server.tracker_store import /absolute/private/path/backup.json
# Prints a real map ID; use that returned value in the next command.
python -m server.tracker_store issue YOUR_RETURNED_MAP_ID --scope read --days 30
# Prints a new secret once. Use --scope write only when needed.
```

The default database is `~/.charjavumi-private/maps.sqlite`, outside the web root, chmod 0600. Override with `CHARJAVUMI_DB` pointing outside the repository. The store rejects database paths inside the site directory. Token digests, not plaintext tokens, are stored. Tokens expire (1–90 days) and can be revoked.

Configure your MCP client to run Python with `-m server.tracker_mcp`, with its working directory set to this repository. Put `CHARJAVUMI_MAP_TOKEN` in that client's secure environment; optionally set `CHARJAVUMI_DB`. **Do not put tokens into prompts, tool arguments, frontend code, source control or publicly shared MCP config.** Start without a token for public lookup only.

```bash
# Revoke all tokens for the map:
python -m server.tracker_store revoke YOUR_RETURNED_MAP_ID

# Apply MCP edits back to the browser manually:
# First export a fresh browser backup so the latest journal/media are preserved.
# CHARJAVUMI_MAP_TOKEN must already be present in your private shell environment.
python -m server.tracker_store merge /private/fresh-backup.json /private/updated-backup.json
# Restore updated-backup.json in the tracker settings after reviewing it.
```

There is **no automatic connection** between this SQLite snapshot and browser localStorage. Import creates a new snapshot, not a live mirror. Do not mistake this for production OAuth login or a hosted HTTP MCP server. A hosted service would need independently reviewed OAuth/resource authorization, session isolation, secure transport, retention, consent and deletion controls.

## 4. Privacy & operational behavior

- No tracker analytics or automatic GPS/network upload. The original site’s behavior is unchanged.
- Visitors choose when to start/stop recording. Routes may contain transit locations and are sensitive.
- Only non-approximate catalog pins appear as site dots on the overview map. Most directory entries are approximate and remain searchable in the checklist/directory.
- Nearby places are suggestions, not automatic temple visits. District counting is geometry-based and may be inaccurate near simplified boundaries or with noisy GPS.
- Device storage is not encrypted. Other people using the same browser profile can read it. Clearing site data removes it. Export backups regularly, especially before switching devices or domains.
- Local state uses `charjavumi.tracker.v1`; journal/media use `charjavumi.journal.v1` IndexedDB. This does not overwrite the original website’s tracker keys.
- Media backups may include original EXIF metadata. Keep them private. The progress card has no photos or EXIF.
- Site percentages refer to **catalog records**, district percentages to **64 district units**; neither measures geographical land area.
- Browsers cannot guarantee continuous recording while locked/backgrounded. No service worker or native tracker is claimed.
- The UI supports a 50,000-point GPS cap, 200 restored routes and 100 companions. Larger data needs a dedicated storage/backend design.
- A second-tab storage-change warning helps avoid overwriting, but simultaneous multi-tab editing is not a synchronization system.

## 5. Tests and maintenance

```bash
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:e2e
pip install -r server/requirements-tracker.txt
npm run test:backend
python tools/validate_heritage_data.py
```

The backend tests do not require a live AI key. Test geolocation is simulated; real-device lock-screen behavior cannot be guaranteed by desktop automation.

Regenerate the tracker catalog after an editorial data update:

```bash
python tools/build_tracker_data.py
```

`data/heritage-sites.json` takes precedence over `dashboard-core.json`; additional unique directory records are folded in from `dashboard-directory.json`. Source URLs and uncertainty remain attached. The existing source validator reports missing-source warnings; those are editorial backlog, not independently verified facts.

Map data provenance: geoBoundaries BGD ADM2, version `9469f09`, boundary year 2020; Bangladesh Bureau of Statistics / OCHA ROAP, CC BY 3.0 IGO. The bundle is for a travel overview, not legal boundary or navigation work. See `docs/tracker-attributions.md`.

## Next production milestones

1. **Authentication and private cloud sync:** owner-scoped database tables, tested row-level security, private media buckets, signed URLs, deletion/export workflows and consent audit.
2. **Trip sharing:** per-trip visibility, revocable read-only links, granular photo/route controls and default location redaction. Do not make precise live location public by default.
3. **Travel buddies:** explicit invitations, membership/role checks and collaborative journal edits; never automatically expose a friend's location.
4. **Hosted MCP:** OAuth/scoped resource access, revocation, per-user isolation and explicit write-confirmation UX.
5. **Verified data and translations:** entrance GPS fieldwork, editorial review of missing sources, additional English aliases, accessibility testing, and human-reviewed introductions.
6. **Native background tracking:** separate mobile implementation with OS-level permissions, battery controls, clear indicators and pause/delete controls.

This handover is a working local-first tracker and optional integration code, **not a claim that all requested third-party services have been connected or deployed**.
