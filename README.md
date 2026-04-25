# Hendrixpedia

Hendrixpedia is a personal archive built from a single raw context file and rendered as a wiki. It should feel less like a database and more like a structured nonfiction book about a person, his work, his ideas, his taste, and the world orbiting around him.

Every article is written in first person. The aim is clarity without flattening the prose.

## Three-layer architecture

```text
Raw/context.md          <- the only source of truth
     |
     v
wiki/articles/*/*.md    <- interlinked chapter-like articles
     |
     v
site/                   <- Next.js reading surface
```

## Internal Clusters vs Reader-Facing Sections

The filesystem keeps stable internal clusters such as `core`, `ventures`, `philosophy`, `tools`, and `reading`.

The site presents those pages through broader reader-facing sections:

- Navigation
- Identity
- People
- Ventures & Projects
- Concepts & Philosophy
- Skills & Tools
- Media
- Life & Personal
- Events & Experiences
- Timeline
- Curiosity

That split lets the project stay maintainable on disk while reading more like a deliberate table of contents.

## Folder layout

```text
hendrixwiki/
├── Raw/
│   └── context.md
├── wiki/
│   ├── SCHEMA.md
│   ├── index.md
│   ├── log.md
│   └── articles/
│       ├── core/ places/ ventures/ business/
│       ├── philosophy/ building/ design/
│       ├── language/ culture/ youtube/
│       ├── curiosity/ reading/ tools/ tech/
│       └── habits/ money/ communication/ frictions/ meta/
└── site/
    ├── app/
    ├── components/
    ├── lib/
    ├── build_index.py
    └── package.json
```

## Run locally

```bash
cd site
npm install
npm run dev
```

Open `http://localhost:3000`.

## Update workflow

1. Edit `/Raw/context.md`.
2. Rewrite or add affected chapters in `/wiki/articles/`.
3. Keep `/wiki/SCHEMA.md` as the writing contract.
4. Regenerate the master index with `cd site && npm run index`.
5. Append a note to `/wiki/log.md`.

## Writing rules in one breath

- First person.
- Sectioned prose.
- Paragraphs before bullets.
- Rich, reflective, human writing.
- No flat database voice.
- No fake-deep startup language.
- Every page should feel like part of a larger world.
