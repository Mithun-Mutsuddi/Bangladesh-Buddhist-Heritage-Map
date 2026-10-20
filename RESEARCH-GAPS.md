# Heritage coverage audit and research backlog

Last reviewed: 2026-10-20

This directory is a community research index, not an official national census. Do not describe it as complete or treat an area-level map pin as an exact entrance coordinate.

## Current codebase snapshot

The directory contains **324 records** on the working branch after adding four source-linked entries. Existing 320 records were retained.

| Review measure | Count | What it means |
|---|---:|---|
| All directory records | 324 | Includes institutions, local/community records and research-pending entries |
| Buddhist viharas | 208 | Existing directory category |
| Archaeological sites | 22 | Includes sites requiring individual evidence review |
| Monasteries | 7 | Separate from viharas in the current schema |
| Meditation / forest hermitages | 11 | Directory entries tagged for those functions |
| General institutions | 7 | Education, religious and community institutions grouped in the current schema |
| Orphanages / service centres | 7 | Does not imply each service is currently operating |
| Explicit education category | 1 | Newly separated Nalanda Institute record; marked for further verification |
| Cultural institution category | 1 | Dharmarajika Lalitkala Academy; current activity needs confirmation |
| Research-pending status | 57 | Includes records marked verificationPending and needs-scope items |
| Records with coordinates | 262 | Coordinates are present, not necessarily verified entrance GPS |
| Records explicitly marked approximate | 254 | Must not be used as exact driving destinations |
| Records with no coordinates | 62 | Show a name-based Maps search instead of a pin |
| Records with no source URL | 55 | Need source collection and evidence review |
| Exact duplicate name + district pairs | 0 | On this snapshot only; not proof there are no aliases or near-duplicates |
| Reused coordinate groups | 15 | Mostly multiple entries with the same approximate locality pin; keep flagged as approximate |

The current records are heavily concentrated in Chattogram Division (284 records); only a small number currently cover several other divisions. This is a research coverage gap, not evidence that Buddhist heritage is absent from those regions.

## New source-linked records on this branch

- **ধর্মরাজিকা অনাথালয়** — the Dharmarajika Trust Foundation describes an orphanage and support for children at the Basabo/Sabujbag complex. The directory entry intentionally has no entrance pin. Confirm current operation and visitor/contact rules before publishing further details. Source: [Dharmarajika Trust Foundation](https://www.dharmarajikatrustfoundation.org/bbkps/abcp.html).
- **পটিয়া কেন্দ্রীয় বৌদ্ধ বিহার ও কল্যাণ কমপ্লেক্স** — the organisation's own website describes religious practice, meditation, education, a library and welfare purposes. No exact entrance coordinate is asserted. Source: [Patiya Central Buddhist Monastery & Welfare Complex](https://pcbmwc.org/).
- **নালন্দা ইনস্টিটিউট** — listed separately for education search, but explicitly marked pending because a separate campus, curriculum, current enrolment and legal status have not been independently verified. Source: [Patiya Central Buddhist Monastery & Welfare Complex](https://pcbmwc.org/).
- **ধর্মরাজিকা ললিতকলা একাডেমি** — listed as a cultural institution cited by the foundation; marked pending because current operation is not established by the older page. Source: [Dharmarajika Trust Foundation](https://www.dharmarajikatrustfoundation.org/bbkps/abcp.html).

No specific Buddhist old-age home has been added: a trustworthy current name and address were not established in this review. Keep the প্রবীণসেবা category available, but only add a named home after a credible institution/government source or direct confirmation. Do not invent an address, active status, contact number or map pin.

## Authoritative / useful next sources

1. [Buddhist Religious Welfare Trust — district-wise Buddhist vihara/pagoda lists](https://brwt.gov.bd/pages/static-pages/6922dbb0933eb65569e0bdb6). Import each listed district document separately, preserve the source URL and retrieval date, normalise spelling, and de-duplicate carefully before adding records.
2. [Bangladesh government — district list](https://bangladesh.gov.bd/site/view/district-list/). Use as a division/district coverage checklist, not as proof of a Buddhist site.
3. [World Buddhist Directory — Bangladesh](https://buddhanet.info/wbd/country.php?country_id=40). It returned 116 entries in the reviewed page, including monasteries, organisations, education and social-welfare groups. Treat its contacts and current activity as leads that require re-checking.
4. [UNESCO — Somapura Mahavihara](https://whc.unesco.org/en/list/322/) and [Department of Archaeology, Bangladesh](https://archaeology.gov.bd/). For archaeological records, retain official monument identifiers, excavation/publication references, legal protection status, and verified site entrance coordinates where available.
5. [Bangladesh Police — metropolitan police stations](https://www.police.gov.bd/index.php/en/metropolitan_police) plus a maintained district-level police-station source. The linked [Bangladesh Locations Dataset](https://github.com/HedaetShahriar/bangladesh-locations-dataset) describes 8 divisions, 64 districts, 502 upazila-level entries, 67 city thanas and 4,540 union/area-level records. The current UI loads compact division/district CSVs first and fetches the selected district’s detailed JSON on demand. This is a useful reference, **not** a complete official police-thana register, and its area records do not consistently distinguish unions from other local areas. Verify each locality before using it for an actual site address.
6. [Dharmarajika Trust Foundation](https://www.dharmarajikatrustfoundation.org/bbkps/abcp.html) and [Patiya Central Buddhist Monastery & Welfare Complex](https://pcbmwc.org/) for education, orphanage, cultural and welfare sub-registers.
7. For historical photographs and oral histories, seek original custodians, local sangha and monastery committees, families, photographers, museums, libraries, publications, and community archives. Record who supplied an item, creation/capture date (or uncertainty), rights/permission, provenance, and a public-safe contact route.

## Work still needed before a claim of national completeness

- **District-by-district reconciliation:** compare the Trust's complete district list with the existing directory; preserve the original spelling, aliases, official source and date consulted. The current list is not yet reconciled record-by-record against every source attachment.
- **Upazila / thana / union mapping:** populate each place from explicit documentary or owner-confirmed address data. The administrative reference includes a separate 67-city-thana layer, but is not a complete police station register. Its 4,540 area-level labels include a mixture of unions and local areas; verify the actual unit for each locality. Do not copy an upazila centroid and call it a police station or temple entrance.
- **Archaeology:** check all known Buddhist mounds, stupas, ruins, monasteries, inscriptions, sculptures, museum collections and protected monuments against Department of Archaeology records, excavation reports and academic publications. Sites with uncertain Buddhist attribution must remain explicitly qualified.
- **Education / research:** create a separate register for Pali and Buddhist Studies departments, Sanskrit/Pali boards, monastery schools, libraries, Buddhist publishers, research centres and organisations offering education. Check current operation and distinguish a programme inside a monastery from an independent institution.
- **Child / elderly / community services:** reconcile orphanages, child homes, health and relief services, shelters for women and older people, disability support and welfare trusts with current official or direct institutional evidence. Protect vulnerable people's identities.
- **Living heritage:** record annual festivals, oral histories, music, manuscripts, rituals, craft traditions, temples and communities only with community consent and a source trail.
- **Coordinate quality:** verify entrance coordinates on-site or against an official map/owner confirmation. Do not remove the approximate-pin warning until evidence supports the change. Multiple records can legitimately share an approximate locality centroid; they should not all appear to be exact separate map points.
- **Photographic, audio and documentary rights:** keep permission/licence, contributor/collector, photographer, dates, provenance and redaction needs with every item.
- **Ongoing maintenance:** add last-verified date, reviewed-by role, source status and update history for sensitive/current records.

## Historical archive publication format

The archive UI stores uploads as private local drafts in the current browser. Publishing is an explicit export-and-commit operation; local drafts are not automatically visible to other visitors.

Published entries are stored inside the existing content.json array with type: "archive". Preserve existing site records when merging. Each record can include archiveType, eventDate, captureDate, photographer, collector, uploader, uploaderAddress (institution/area only; avoid private home addresses), division, district, upazila, thana, union, description, history, sourceUrl, shareUrl, rights, tags and attachments[]. Local file blobs are bundled under assets/archives/ by the generated ZIP.

Before publishing, inspect every attachment and remove private, unlawful or unlicensed information. Never treat user-submitted metadata as verified until reviewed. For video/audio, controls are rendered where the browser supports the format; PDFs open in the browser's PDF viewer when supported; plain text is shown in a readable text pane; external links open the original resource.

## Map and filter notes

- The map's static loading overlay was previously left on top of the map after initialization; the working branch removes it immediately and shows a non-blocking tile status instead.
- Initial map setup no longer waits for optional content.json retrieval. Marker-cluster insertion is chunked and the base map status times out to avoid a permanent loading message.
- Division → district → upazila → thana → union/area choices load progressively. Division/district lists are compact; the selected district's detailed JSON (including upazila, city-thana and area entries) is fetched only when needed, so map startup doesn't wait for geography. The cited upstream dataset documents 67 city thanas, not a complete national police-station directory; union/area names are not uniformly typed.
