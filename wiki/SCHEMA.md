# Hendrixpedia — Structure & Writing Contract

Hendrixpedia should preserve the clarity of an encyclopedia while reading more like a thoughtful nonfiction book. The goal is not to sound like a database with better styling. The goal is to let a reader move through a living world: a person, his work, his ideas, his influences, his habits, his ambitions, and the questions still shaping him.

## What This Archive Is

This wiki is not only a knowledge base. It is an unfolding body of thought, identity, memory, work, taste, and direction.

Each article should feel like a chapter inside a larger book. A page can still be practical, searchable, and structured, but it should never feel mechanically summarized or emotionally empty.

## Three Layers

1. **Raw** (`/Raw/context.md`) is the source of truth.
   If a fact changes, Raw changes first.
2. **Wiki** (`/wiki/articles/...`) is the chapter layer.
   These are written pages, not raw notes.
3. **Site** (`/site/...`) is the reading surface.
   It presents the archive as a table of contents rather than a software dashboard.

## Two Kinds of Organization

The project uses two parallel structures.

### 1. Internal clusters

Internal `category` values keep the filesystem organized and should remain broad, stable, and easy to maintain.

Allowed internal categories:

- `core`
- `places`
- `ventures`
- `business`
- `philosophy`
- `building`
- `design`
- `language`
- `culture`
- `youtube`
- `curiosity`
- `reading`
- `tools`
- `tech`
- `habits`
- `money`
- `communication`
- `frictions`
- `meta`

### 2. Reader-facing sections

The site groups those internal clusters into a cleaner table of contents that should feel like a nonfiction book.

Preferred reader-facing sections:

- `navigation`
- `identity`
- `people`
- `ventures`
- `concepts`
- `skills`
- `media`
- `life`
- `events`
- `timeline`
- `curiosity`

Section intent:

- **Navigation**: entry points such as Start Here, Map of the Wiki, Timeline, featured pages, or orientation chapters.
- **Identity**: self-concepts, recurring traits, internal labels, motives, and the language used to describe the self.
- **People**: specific people who matter personally, professionally, or intellectually.
- **Ventures & Projects**: businesses, brands, products, side projects, experiments, and long-building undertakings.
- **Concepts & Philosophy**: ideas, principles, frameworks, frictions, beliefs, and recurring themes.
- **Skills & Tools**: crafts, technologies, software, languages, and working capabilities.
- **Media**: books, channels, essays, films, shows, creators, and other cultural inputs that belong in this world.
- **Life & Personal**: places, routines, language, health, emotional texture, and private conditions beneath the visible work.
- **Events & Experiences**: important lived moments and specific experiences.
- **Timeline**: eras, phases, chronology, and milestones.
- **Curiosity**: obsessions, open questions, rabbit holes, and unfinished thought.

In frontmatter, `category` remains the internal cluster. Use optional `section` only when a page needs explicit reader-facing placement, especially for Navigation, Events & Experiences, Timeline, or when a page belongs somewhere unusual.

## Frontmatter

Every article starts with YAML frontmatter.

```yaml
---
title: Article Title
category: core|places|ventures|business|philosophy|building|design|language|culture|youtube|curiosity|reading|tools|tech|habits|money|communication|frictions|meta
section: navigation|identity|people|ventures|concepts|skills|media|life|events|timeline|curiosity   # optional
type: person|place|venture|concept|tool|skill|show|channel|book|habit|principle|friction|meta|timeline|experience
related: [List of related article titles]
tags: [relevant, tags]
---
```

## Article Shape

Articles should be built from sectioned prose.

Do not write one long wall of text. Do not flatten the page into bullets either.

Use headings such as these when they fit naturally:

- Overview
- Why It Matters
- Origins
- How It Shows Up
- In Practice
- Role in the Larger System
- Related Pages

These are examples, not a template. Do not force every page into the same structure.

## Writing Style

Write each article like a page from a thoughtful nonfiction book.

Core style:

- Write in first person, as if I am writing the page myself.
- Use full, connected prose.
- Let ideas emerge through observation, tension, memory, and lived relevance.
- Keep paragraphs developed and readable.
- Vary sentence length naturally.
- Let the page feel authored, calm, and deliberate.
- Preserve clarity without draining the writing of texture.

What to avoid:

- database-entry writing
- corporate bio language
- startup manifesto tone
- fake-deep branding copy
- repetitive “not this, not that” contrast structures
- rigid thesis-explanation-list rhythm
- bullet-heavy pages
- flat definitions that explain the subject too early
- empty filler phrases such as “this reflects” or “this suggests” when they add nothing

What to do instead:

- Open naturally and with some pull.
- Let the meaning of the subject reveal itself over a few sentences.
- Explain why it matters in lived terms, not only conceptual terms.
- Show how it appears in work, decisions, habits, ambition, reading, relationships, or memory.
- Make the page feel like part of a larger world.

## Article-Specific Rules

### Identity pages

Do not define the label too quickly. First show the pressure, limitation, or lived reality that made the label necessary.

### People pages

Do not reduce a person to a resume summary. Write them as a presence inside this world. Explain who they are, why they matter, and what kind of relationship or weight surrounds them.

### Media pages

Do not write generic reviews. Explain why the book, channel, show, essay, or creator belongs in this archive: what it sharpened, what kind of taste it represents, or what part of the world it feeds.

## Formatting Rules

- Headings should organize thought, not flatten it.
- Paragraphs should dominate.
- Bullets are allowed when they genuinely improve clarity, but they should be secondary.
- Transitions should feel smooth.
- The page should read like one continuous voice.

## Linking

Use liberal `[[Wiki Links]]` whenever another page exists or clearly should exist.

Linking is not decorative. It is how the archive becomes a navigable world.

## Update Workflow

1. Update `/Raw/context.md` when facts, themes, or priorities change.
2. Add or rewrite affected articles in `/wiki/articles/...`.
3. If the page needs special reader-facing placement, add `section:` in frontmatter.
4. Regenerate the master index with `cd site && npm run index`.
5. Append a note to `/wiki/log.md`.

## Anti-Patterns

Do not do the following:

- Write neutral encyclopedia entries detached from my point of view.
- Reduce me to only one role such as designer, founder, or content person.
- Turn the archive into motivational language or branding theater.
- Duplicate whole ideas across pages when links would do the job.
- Speculate beyond what is grounded in Raw.
- Over-mechanize the writing until it stops feeling human.

## Final Test

Before keeping a page, ask:

- Does it feel written by a human with taste?
- Does it feel like part of a larger world?
- Does it read like something to stay with, not just scan?
- Does it use headings without becoming mechanical?
- Does it avoid AI-summary voice?
- Does it make the next page feel worth opening?

If the answer is no, rewrite it.
