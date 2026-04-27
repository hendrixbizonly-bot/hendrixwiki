# Hendrixpedia Log

Append-only record of ingests, regenerations, and structural changes.

## 2026-04-20 — Initial wiki creation
- Ingested `/Raw/context.md` (v1)
- Generated ~200 articles across 19 categories
- Built static Wikipedia-style UI in `/site`
- Built graph view
- Created `index.md` master catalog

## 2026-04-22 — Voice migration to first person
- Rewrote article copy from third-person Hendrix narration into first-person writing
- Updated `/wiki/SCHEMA.md` and `/README.md` so future article generations stay in first person
- Updated the site copy and master index generator to match the new voice

## 2026-04-22 — Added screenshot-derived themes
- Expanded `/Raw/context.md` with new recurring themes from saved screenshots and quotes
- Added new articles for Camus, solitude, reading as self-reconstruction, and manufactured dissatisfaction

## 2026-04-22 — Reframed the archive as a nonfiction-style book
- Reorganized the site around reader-facing sections such as Identity, People, Ventures & Projects, Media, Life, Timeline, and Curiosity
- Added orientation chapters for Start Here, Map of the Wiki, Timeline, and Formative Experiences
- Rewrote spine articles to move the archive closer to a literary, sectioned nonfiction voice

## 2026-04-22 — Added screenshot-derived chapters from the latest image set
- Expanded `/Raw/context.md` with new themes around moral resistance, human continuity, water-like adaptability, Mars/resistance imagery, and a recent 10K PR during an 11.11 km morning run in Dubai
- Added new chapters for Morning Runs, Hedgehog's Dilemma, Moral Resistance, Human Repetition, Why to Live, and Red Rising
- Rewrote `/wiki/articles/habits/running.md` so the new running details fit the larger voice of the archive

## 2026-04-25 — Folded the new raw essays into the archive
- Expanded `/Raw/context.md` with stronger builder and direction/freedom detail so the source of truth matches the newer raw notes
- Rewrote key chapters across identity, reading, philosophy, curiosity, frictions, and running to absorb the new essay material and smooth out older generated phrasing
- Removed the article provenance note from the site so chapter pages open more naturally

## 2026-04-26 — Rebuilt the identity section around the builder voice
- Expanded `/Raw/context.md` with builder-origin, label-fit, learning-pattern, and trade-off notes so the source material better explains the identity spine
- Rewrote the existing `/wiki/articles/core` essays in a longer first-person builder voice instead of short concept-note summaries
- Added six new core essays: `what-lasts`, `close-to-the-work`, `range`, `learning-across-surfaces`, `responsibility-for-outcomes`, and `the-cost-of-range`
- Updated the identity priority order in `/site/lib/constants.ts` and `/site/build_index.py` so the new builder arc leads the section

## 2026-04-26 — Added books and music sections, and moved People above Identity
- Reordered the reader-facing section stack so `People` now appears above `Identity` in the site and index
- Promoted `Books` and `Music` into top-level reader-facing sections instead of keeping them buried under `Media`
- Added new internal `books` and `music` categories and seeded them with `/wiki/articles/books/recommended-books.md` and `/wiki/articles/music/music.md`

## 2026-04-26 — Added a real events category and expanded the sidebar lists
- Added a new internal `events` category with `/wiki/articles/events/events-and-experiences.md` as its seed page
- Mapped the reader-facing `Events & Experiences` section to both the new category and the existing formative-experience pages
- Increased the non-navigation sidebar list count so each section shows more chapters at a glance

## 2026-04-26 â€” Added the first People article set from `People.txt`
- Added a new internal `people` category to the site constants and writing contract so person pages can live in their own cluster
- Split `c:\Users\User\Downloads\People.txt` into 18 separate markdown chapters under `/wiki/articles/people/`
- Rebuilt `/wiki/index.md` so the new People pages appear in the master catalog

## 2026-04-26 - Curated the Skills & Tools section around the approved list
- Replaced the raw Skills & Tools section dump with a fixed 20-item curated order in `/site/lib/constants.ts`, `/site/lib/articles.ts`, and `/site/build_index.py`
- Rewrote or added approved pages for Figma, Claude and Codex, HTML/CSS, Postman API Testing, Rive Animation, n8n Workflow with VPS, Bartending, Paid Marketing, Public Speaking, and the rest of the approved stack
- Converted true duplicates such as `Codex`, `Claude Code`, `HTML`, `CSS`, `Postman`, and `API Testing` into hidden redirects so old links still resolve without cluttering navigation

## 2026-04-27 - Turned `Books.txt` into a real books shelf
- Split `c:\Users\User\Downloads\Books.txt` into reflective book essays across `/wiki/articles/books/` and refreshed `/wiki/articles/reading/red-rising.md`
- Added new concept pages for uncertainty, absurdity, inner life, mortality, star friendship, loneliness, communication across difference, and human evolution so the shelf links back into the larger worldview
- Updated `/wiki/SCHEMA.md` so the documented internal categories match the live `books`, `music`, and `events` structure
- Rebuilt `/wiki/index.md` so the new books shelf and concept pages appear in the master catalog

## 2026-04-27 - Reframed the books ingest into essay-plus-graph structure
- Rewrote the recent books and concept pages into a consistent `Essay`, `Key Ideas`, and bullet-style `Related` format
- Removed repeated summary-style openings so the prose reads more like internal thought and less like review copy
- Strengthened the link graph by surfacing idea nodes directly in `Key Ideas` while keeping real `[[Wiki Links]]` in `Related`

## 2026-04-27 - Turned the Spotify exports into a real music shelf
- Expanded `/Raw/context.md` with a Spotify-based listening profile covering volume, range, older-music pull, multilingual listening, and the split between pressure music and atmospheric music
- Added six new music essays under `/wiki/articles/music/`: `spotify-wrapped-2025`, `listening-age`, `grime-and-drill`, `multilingual-listening`, `berlioz`, and `hermanos-gutierrez`
- Rewrote `/wiki/articles/music/music.md` so the shelf points directly to the new Spotify-derived chapters

## Format for future entries
```text
## YYYY-MM-DD — Short description
- what changed in Raw
- what articles were added/updated/deprecated
- notes
```
