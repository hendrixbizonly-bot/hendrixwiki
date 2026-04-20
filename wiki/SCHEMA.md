# Hendrixpedia — Schema & Conventions

This document defines how Hendrixpedia is structured, how it is maintained, and how it should be updated when the Raw context changes.

## Architecture (three layers)

1. **Raw** (`/Raw/context.md`) — the source of truth. Immutable from the wiki's perspective; the wiki is rebuilt from this file. Never edit the wiki directly to contradict Raw — edit Raw and regenerate.
2. **Wiki** (`/wiki/articles/...`) — LLM-generated interlinked markdown pages. Each page is a synthesis of what a concept *means to Hendrix*, not a neutral encyclopedia entry.
3. **Site** (`/site/...`) — the rendered Wikipedia-style UI. A static interface that reads the wiki manifest and markdown.

## Writing style for articles

Every article follows the same shape:

- **Tone:** concise, sharp, grounded, no-BS. Natural English. No bloated corporate phrasing. No try-hard motivational tone. Avoid em-dashes in generated writing (Hendrix dislikes them in writing help).
- **Voice:** third-person about Hendrix ("Hendrix sees X as..."), not second-person or first-person.
- **Angle:** every article is written through *what this means to Hendrix*. A page on Dubai is not a page about Dubai; it is a page about what Dubai is in his life. A page on Nietzsche is not a neutral bio; it is why Nietzsche matters to him and how the ideas connect to how he lives and builds.
- **Depth:** each article should be substantial — usually 4 to 10 sections, with at least one section connecting the topic back to his larger system (Duodode, building philosophy, money view, etc.).
- **Linking:** liberal use of `[[Wiki Links]]`. Every proper noun, every concept that has its own page, should be linked. Linking is how the wiki becomes a graph.

## Frontmatter

Every article starts with YAML frontmatter:

```yaml
---
title: Article Title
category: core|places|ventures|business|philosophy|building|design|language|culture|youtube|curiosity|reading|tools|tech|habits|money|communication|frictions|meta
type: person|place|venture|concept|tool|skill|show|channel|habit|principle|friction|meta
related: [List of other article titles]
tags: [relevant, tags]
---
```

## Section conventions

Articles typically include:

1. **Lede** — one paragraph stating what the topic is and why it matters to Hendrix.
2. **Contents** — implied by headings.
3. **Topic-specific sections** — the core of the article.
4. **Connection to Hendrix's system** — how this ties to building, money, design, philosophy, or Duodode.
5. **Related pages** — a short list of cross-links at the end.

## Wiki-link syntax

Use double brackets: `[[Target Article]]`. The renderer converts these to in-wiki links. If the target has a slug different from its title, use `[[target-slug|Display Text]]`.

## Category index

| Category | Description | Example articles |
|---|---|---|
| core | Identity, core traits, what makes him him | Hendrix, Introspection, ROI-Driven Thinking |
| places | Locations that shape his life | Dubai, Vietnam, UAE |
| ventures | His actual businesses and agency | Duodode, Digital Agency |
| business | Entrepreneurship, strategy, leverage | Entrepreneurship, Scale, Leverage |
| philosophy | Thinkers, intellectual frames | Nietzsche, Self-Overcoming, Philosophy |
| building | Building philosophy and principles | Build and Ship, Execution Over Talk |
| design | Design philosophy and thinking | Intentional Design, Timeless Design |
| language | Languages he knows or is learning | English, Spanish, Vietnamese |
| culture | TV series and pop culture influences | Silicon Valley, Succession |
| youtube | YouTube channels he learns from | Fireship, Kurzgesagt, Exurb1a |
| curiosity | Space, sci-fi, astronomy | Space, Science Fiction |
| reading | Essays, Substack, NYT, Medium | Substack, The New York Times |
| tools | Software and tools he uses | Figma, Next.js, Supabase |
| tech | Technical skills and stacks | JavaScript, GSAP, API Testing |
| habits | Daily practices | Running, Duolingo Streak |
| money | His relationship to wealth | Money, Freedom, Wealth |
| communication | How he writes and speaks | Directness, Concise Writing |
| frictions | What he dislikes / avoids | Fluff, Performative Talk |
| meta | The wiki itself | Hendrixpedia, Raw Context |

## How to update

1. Edit `/Raw/context.md` only.
2. Regenerate affected articles (ask an LLM: *"Read Raw/context.md and SCHEMA.md. Update any articles in /wiki/articles that contain stale or conflicting information."*).
3. Add new articles in the right category folder. Add them to `/wiki/index.md` and `/site/articles.json`.
4. Append an entry to `/wiki/log.md`.

## Anti-patterns (do not do)

- Do not write neutral encyclopedia entries. Every article is through Hendrix's lens.
- Do not frame Hendrix mainly as a content creator or short-form person.
- Do not reduce him to only design or UI/UX.
- Do not use bloated motivational language or fake-deep phrasing.
- Do not use em-dashes.
- Do not duplicate content across articles — link instead.
- Do not speculate beyond what is in Raw. If something is not in Raw, say so or leave it out.
