# Hendrixpedia

A personal Wikipedia-style knowledge base for Hendrix Huynh, compiled from a single raw context file. Every article is written through Hendrix's lens — what the topic means to him, not a neutral encyclopedia entry.

Built as a Next.js app that reads markdown directly from `/wiki/articles`. Inspired by Andrej Karpathy's LLM Wiki pattern: *the wiki is a persistent, compounding artifact*. Less RAG, more LLM.

## Three-layer architecture

```
Raw/context.md          ← the only file you edit
     │
     ▼
wiki/articles/*/*.md    ← LLM-generated, interlinked articles
     │
     ▼
site/                   ← Next.js app (renders the wiki)
```

## Folder layout

```
Hendrix/
├── Raw/
│   └── context.md                 ← edit this
├── wiki/
│   ├── SCHEMA.md
│   ├── index.md                   ← master catalog for LLMs
│   ├── log.md
│   └── articles/
│       ├── core/ places/ ventures/ business/
│       ├── philosophy/ building/ design/
│       ├── language/ culture/ youtube/
│       ├── curiosity/ reading/ tools/ tech/
│       └── habits/ money/ communication/ frictions/ meta/
└── site/                          ← Next.js 14 app
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx               (home)
    │   ├── a/[...slug]/page.tsx   (article)
    │   ├── graph/page.tsx
    │   ├── raw/page.tsx
    │   ├── schema/page.tsx
    │   ├── search/page.tsx
    │   ├── random/page.tsx
    │   └── index.md/route.ts      (LLM export)
    ├── components/
    │   ├── TopBar.tsx Sidebar.tsx
    │   ├── KebabMenu.tsx SearchBox.tsx
    │   ├── SearchView.tsx Graph.tsx
    ├── lib/articles.ts
    ├── build_index.py             (regenerates wiki/index.md)
    ├── package.json
    └── next.config.mjs
```

## Run locally

```bash
cd site
npm install
npm run dev
# open http://localhost:3000
```

## Build for production

```bash
cd site
npm run build
npm start
```

## Update workflow

When your context changes:

1. Edit `/Raw/context.md`.
2. Ask any LLM: *"Read `/Raw/context.md` and `/wiki/SCHEMA.md`. Update or add articles in `/wiki/articles/` to reflect any changes. Follow SCHEMA exactly."*
3. Regenerate the LLM-facing index: `cd site && npm run index`.
4. Append a line to `/wiki/log.md`.
5. Restart `npm run dev`. The Next.js app reads the wiki directly from disk, so all pages reflect changes on next load.

## For any chatbot

Point it at `/Raw/context.md` + `/wiki/index.md` (or fetch from `/index.md` when the app is running). The index is designed so a single read gives any LLM the full picture.

## Stack

- Next.js 14 (App Router, TypeScript)
- `gray-matter` for frontmatter
- `marked` for markdown rendering
- Zero client-side state beyond a small kebab menu, search box, and force-directed graph

## Philosophy

- Every article is third-person about Hendrix, through his lens.
- No fake-deep language. No motivational tone. No em-dashes.
- Liberal cross-linking. The wiki is a graph.
- Articles tell you what a topic *means to him*, not what it means generally.
- Raw is the source of truth. The wiki is a projection of Raw.
