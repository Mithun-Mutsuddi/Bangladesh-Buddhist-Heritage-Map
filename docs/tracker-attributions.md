# Tracker data & asset attribution

## Editorial data

The existing repository's `data/heritage-sites.json`, `data/dashboard-core.json`, `data/dashboard-directory.json` and `data/events.json` are retained as the editorial sources. `tools/build_tracker_data.py` builds `data/tracker-places.json` from their existing stable IDs. The source/reference and approximate-coordinate flags are retained. The 3,218-record compiled directory is not a certified census of active Buddhist temples. Some inherited records have no source URL or require field verification; details retain their uncertainty.

The tracker borrows the general district-checklist/progress-card interaction idea from the user-supplied reference, https://www.travelxbd.xyz/. Its application code, styles and map files were **not copied**. The implementation is new and additive to the user's MIT-licensed repository.

## District boundary data

- Dataset: geoBoundaries `BGD ADM2`, 64 district units, boundary year represented: 2020.
- boundaryID: `BGD-ADM2-16705992`.
- Source organizations: Bangladesh Bureau of Statistics (BBS), OCHA ROAP.
- License: Creative Commons Attribution 3.0 Intergovernmental Organisations (CC BY 3.0 IGO).
- License text: https://creativecommons.org/licenses/by/3.0/igo/
- Original source reference: https://data.humdata.org/dataset/administrative-boundaries-of-bangladesh-as-of-2015
- geoBoundaries metadata: https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM2/
- Pinned geometry source: https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/BGD/ADM2/geoBoundaries-BGD-ADM2_simplified.geojson
- Modifications: JSON compacted; Bengali labels and division grouping added. Geometry projected into a custom SVG overview at runtime. Travel maps and downloaded cards retain a short attribution.

This is a simplified overview, not legal boundary advice or a road-navigation basemap. No affiliation or endorsement by BBS/OCHA/geoBoundaries is implied.

## Visuals

`assets/tracker/journey-hero.jpg` is an **AI-generated illustration inspired by Paharpur**, not a documentary photograph. The hero and the reused featured image are labelled accordingly. The two remaining featured-card images are generic inline SVG illustrations, not documentary depictions of their locations. Decorative icons are inline SVG paths in `tracker.js`. The original site's existing logo remains the favicon.

No external searched photograph was included in the delivered tracker.

## Fonts

Self-hosted, downloaded through Google Fonts:
- Inter — The Inter Project Authors; SIL Open Font License 1.1.
- Lora — The Lora Project Authors; SIL Open Font License 1.1.
- Noto Sans Bengali — The Noto Project Authors; SIL Open Font License 1.1.

Original font licenses are bundled in `assets/tracker/fonts/`. `fonts.css` uses local font paths only. The tracker does not contact Google Fonts at runtime.

## Code

The original repository's MIT license and attribution remain unchanged. New tracker code is supplied under the same MIT license, excluding separately licensed boundary data and fonts. See the root `LICENSE` and this attribution file.
