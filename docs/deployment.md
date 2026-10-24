# Deployment and local development

## What runs on GitHub Pages

The current site remains a static HTML/CSS/JavaScript app. Publish the repository's root directory from the `main` branch using **Settings → Pages → Deploy from a branch → main / (root)**. The responsive enhancements include the festival tracker, route planner, nearby-service searches, a community correction helper and long-form site articles. One shared `sanghamitra.js` panel provides the source-based local guide across the homepage, content pages and tracker. These sections do not require a database to render.

The map itself uses Leaflet and OpenStreetMap tiles. Google Maps links are used for route, place-name and nearby-service searches; this branch does not require a Google Maps JavaScript API key. If a browser blocks the Leaflet CDN, an explanatory search-link fallback is shown. Browser geolocation requires user permission and a secure context (normally HTTPS or localhost).

## Optional SanghaMitra API

GitHub Pages cannot run Python. Deploy the optional FastAPI service to a separate server/container and set the following environment variables there:

- `OPENAI_API_KEY`: secret key kept only on the server
- `OPENAI_MODEL`: provider-supported chat-completion model name; default is `gpt-4o-mini`
- `OPENAI_CHAT_COMPLETIONS_URL`: optional provider-compatible endpoint
- `ALLOWED_ORIGINS`: comma-separated frontend origins, for example `https://mithun-mutsuddi.github.io`

Never commit the API key or place it in HTML/JavaScript. Run locally from the repository root:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn server.sanghamitra_api:app --reload --port 8000
```

Then set `window.SANGHAMITRA_API_URL = "https://your-api-host.example/api/chat"` before the shared `sanghamitra.js` loads, or inject it in the hosting platform's runtime configuration. `CHARJAVUMI_CHAT_ENDPOINT` is also supported; otherwise the optional online mode tries same-origin `/api/chat`. Do not set this to localhost on the public website. The local guide is the default and works without a server. Online AI is opt-in; if its request fails, the panel reports the failure instead of presenting a fabricated generated answer.

The API uses a curated site record, not the whole directory, for each query. It returns only that record's source URLs and does not expose request headers or provider error bodies. Production deployments should add rate limiting, abuse monitoring, a hosting-specific secrets manager, TLS, cost controls, and provider-specific safety review.

## Firestore

`docs/firestore-schema.json` describes the intended collections and document fields; `firestore.rules` is a starter ruleset for review, pending user reviews, public published content and moderated archive submissions. It is not automatically connected to the static page. Configure Firebase Authentication, Storage rules, App Check, moderator/admin custom claims and indexes in a real Firebase project before handling user submissions.

Never accept client-supplied `user_id` as authority. Reviews must be tied to `request.auth.uid`; new archival assets should remain private until permission, provenance, consent and copyright are reviewed. Keep uploader contact details in private fields/documents that public queries cannot access.

## Verify before publishing

From the repository root, run:

```bash
python tools/validate_heritage_data.py
```

This checks JSON shape, unique IDs, coordinate ranges, events, Firestore schema, and that every directory record has a 200+ word SEO draft. It cannot verify history, coordinates, ticket fees or opening hours. Those still need source-by-source human review. Many map points are approximate and should not be treated as surveyed entrance GPS.

## Historical and SEO content policy

The directory currently has 323 records; it is a growing community directory, not a complete government census. Only a minority of points have not been flagged approximate/verification-pending. The 323 long-form Bengali SEO summaries are editorial drafts; for some locations the site-specific history is sparse, so the text explicitly says which evidence remains missing. Do not remove that warning merely to make pages appear authoritative.
