---
title: How This Wiki Works
category: meta
type: meta
related: [Hendrixpedia, Raw Context, For the Chatbot]
tags: [meta, architecture, system]
---

# How This Wiki Works

[[Hendrixpedia]] is built in three layers. Each layer has a job. The separation is intentional and reflects how I think: build a clean system, let it compound, avoid [[Fluff|fluff]] in the architecture.

## The three layers

### 1. Raw

`/Raw/context.md`. The source of truth. See [[Raw Context]]. This is where facts about Hendrix live. It is immutable from the wiki's perspective: the wiki is regenerated from Raw, not edited to contradict it.

### 2. Wiki

`/wiki/articles/...`. LLM-generated, interlinked markdown pages. Each page is:

- Framed through what the topic means to me.
- Written in first person.
- Heavy on `[[Wiki Links]]` to other pages.
- Grounded in what Raw says.

### 3. Site

`/site/...`. The rendered interface. A Wikipedia-style UI that reads the wiki manifest and the markdown. The site is a view, not a source.

## Writing style

All articles follow the same shape, defined in `/wiki/SCHEMA.md`:

- YAML frontmatter with title, category, type, related, tags.
- First-person voice, through my lens.
- Concise, sharp, grounded, no-BS.
- No em-dashes, no [[Fake Motivational Tone|fake motivational tone]].
- 4 to 10 sections, usually 400 to 900 words.
- A "Related" section at the end.

See `/wiki/SCHEMA.md` for the full conventions.

## The update flow

1. Edit `/Raw/context.md`.
2. Regenerate any affected articles.
3. Add new articles in the right category folder.
4. Update `/wiki/index.md` and `/site/articles.json`.
5. Append an entry to `/wiki/log.md`.

## Why this structure

- **Separation of data and view**: changes are cheap and safe.
- **Regeneratability**: any article can be rewritten from Raw without losing truth.
- **Graph, not pile**: linking makes this a real second brain.
- **LLM-friendly**: an LLM can ingest Raw, or walk the wiki graph, or read the rendered site.

This matches my [[Strategic Thinking|strategic]] and [[ROI-Driven Thinking|ROI-driven]] way of building. One-time structural work, long-term [[Leverage|leverage]].

## Anti-patterns

- Editing articles to contradict Raw without updating Raw first.
- Writing articles as neutral encyclopedia entries.
- Duplicating content instead of linking.
- Speculating beyond what Raw contains.
- Using em-dashes.

## Connection to my system

This page ties to [[Hendrixpedia]], [[Raw Context]], and [[For the Chatbot]]. It is the operating manual for the wiki itself.

## Related

[[Hendrixpedia]] · [[Raw Context]] · [[For the Chatbot]]