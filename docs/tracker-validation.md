# Tracker validation — 23 October 2026

## Automated checks completed

**41 tests passed** in the workspace after the 23 October homepage/content update:

- `npm test`: **12/12** Node unit tests. Catalog uniqueness, district derivation, spelling aliases, safe restore validation, GPS accuracy/jitter/outlier filtering, polygon holes, full-country projection bounds, GeoJSON coordinate order, Unicode share snapshots, privacy exclusions and unsafe URL/HTML handling.
- `npm run test:e2e`: **18/18** Chromium Playwright tests. Seven new homepage/content tests cover the graphical session-once welcome, personalization persistence, Dhaka-time festivals, reduced motion, click-only geolocation denial/success, merged social-institution redirect and unique filters, Dalijhara search/gallery/sources/separate phone links, multiple mobiles, creator spelling, and mobile article/map rendering. Eleven tracker tests cover district toggles and reload persistence; Bengali/profile UI; sourced site details and visit removal; IndexedDB journal with image, reload/edit/delete; PNG/JPG downloads; assistant statistics consent; simulated GPS start/stop and automatic district; mobile navigation/overflow; backup visit-state restoration; cancellation of linked-district removal; shared-snapshot isolation; visible failure when online AI is not configured.
- `npm run test:backend`: **11/11** Python tests. Private DB blocked inside web root; token scope/isolation/expiry/revocation; required write confirmation and optimistic revisions; no route/media snapshot import; API health/unconfigured-provider response; hidden/private path denial; cross-origin rejection; invalid input and rate limiting; public MCP tools and denial without a private token.

Additional checks:
- Actual MCP STDIO client initialized the server, listed all five tools, and called `list_maps` successfully.
- `python tools/validate_heritage_data.py`: structural **PASS**, with inherited missing-source warnings. No historical fact-checking or field GPS verification is implied.
- `node --check tracker.js`, `node --check tracker-core.mjs`, and Python compilation: pass.
- `git diff --check`: pass.
- Desktop (1440 px) and mobile (390 px) screenshots inspected; no horizontal overflow in the tested tracker, article/map or welcome views. The updated Dalijhara crops and detail-gallery order were also visually reviewed.

## Important boundaries of these tests

- Tests ran in Chromium, not every mobile browser or native operating system. Safari/iOS storage, voice support, download UI and permission policies may differ.
- Geolocation was **simulated**. Real GPS accuracy, continuous background tracking, locked-screen operation and emergency reliability are not verified or promised.
- No live paid generative-AI request was made. The provider key is not configured; both API and UI disclose this.
- PNG/JPG file download behavior was exercised. Posting to social media accounts was not performed; native share depends on device support.
- Photo persistence was tested with a small image. The 20 MB file/60 MB entry limits are application caps, not a guarantee of available browser quota. Large backup/media stress testing is still appropriate before wider deployment.
- The map dataset and 3,218 directory entries are inherited/compiled sources. Approximate coordinates, missing sources and historical claims need ongoing editorial and local verification.
- No live GitHub push, GitHub Pages publication, third-party account provisioning, cloud sign-in or multi-user synchronization was performed.

## Re-run

```bash
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:e2e
pip install -r server/requirements-tracker.txt
npm run test:backend
python tools/validate_heritage_data.py
```

The new `.github/workflows/tracker-tests.yml` repeats these checks on supported pushes/PRs once the files are added to the repository.
