#!/usr/bin/env python3
"""Build /wiki/index.md as the master catalog for Hendrixpedia."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / "wiki" / "articles"
RAW = ROOT / "Raw" / "context.md"
OUT = ROOT / "wiki" / "index.md"

CATEGORY_NAMES = {
    "core": "Core",
    "places": "Places",
    "ventures": "Ventures",
    "business": "Business",
    "philosophy": "Philosophy",
    "building": "Building",
    "design": "Design",
    "language": "Language",
    "culture": "Culture",
    "youtube": "YouTube",
    "curiosity": "Curiosity",
    "reading": "Reading",
    "books": "Books",
    "music": "Music",
    "events": "Events",
    "tools": "Tools",
    "tech": "Tech",
    "habits": "Habits",
    "money": "Money",
    "communication": "Communication",
    "frictions": "Frictions",
    "meta": "Meta",
}

SECTION_ORDER = [
    "navigation",
    "people",
    "identity",
    "ventures",
    "concepts",
    "skills",
    "media",
    "books",
    "music",
    "life",
    "events",
    "timeline",
    "curiosity",
]

SECTION_NAMES = {
    "navigation": "Navigation",
    "identity": "Identity",
    "people": "People",
    "ventures": "Ventures & Projects",
    "concepts": "Concepts & Philosophy",
    "skills": "Skills & Tools",
    "media": "Media",
    "books": "Books",
    "music": "Music",
    "life": "Life & Personal",
    "events": "Events & Experiences",
    "timeline": "Timeline",
    "curiosity": "Curiosity",
}

SECTION_DESCRIPTIONS = {
    "navigation": "Entry points, orientation pages, and the chapters that explain how to move through the archive.",
    "identity": "The inner spine: self-concepts, recurring traits, motives, and the language used to describe the self.",
    "people": "The individuals who matter here, whether through closeness, admiration, influence, or memory.",
    "ventures": "The businesses, experiments, and long-building undertakings where thought turns into work.",
    "concepts": "The principles, beliefs, frictions, and philosophical lines that govern the rest of the world.",
    "skills": "The crafts, languages, tools, and technical capabilities that let intention become output.",
    "media": "The shows, essays, channels, and creators that sharpen taste, language, and perspective.",
    "books": "The books, reading habits, and written works that sharpen perspective, imagination, and judgment.",
    "music": "The artists, albums, songs, and musical influences that shape atmosphere, taste, and momentum.",
    "life": "Place, routine, language, health, and the private conditions underneath the visible work.",
    "events": "Specific lived moments and experiences that changed the texture of how I think, work, or understand myself.",
    "timeline": "Phases, transitions, and temporal orientation across the life and work described here.",
    "curiosity": "Open questions, recurring obsessions, and the things still pulling attention forward.",
}

SECTION_CATEGORY_MAP = {
    "navigation": ["meta"],
    "identity": ["core"],
    "people": [],
    "ventures": ["ventures"],
    "concepts": ["business", "building", "philosophy", "money", "communication", "frictions"],
    "skills": ["design", "language", "tools", "tech"],
    "media": ["culture", "youtube"],
    "books": ["reading", "books"],
    "music": ["music"],
    "life": ["places", "habits"],
    "events": ["events"],
    "timeline": [],
    "curiosity": ["curiosity"],
}

SECTION_PRIORITY = {
    "navigation": [
        "meta/start-here",
        "meta/map-of-the-wiki",
        "meta/timeline",
        "meta/formative-experiences",
        "meta/hendrixpedia",
        "meta/how-this-wiki-works",
        "meta/raw-context",
        "meta/for-the-chatbot",
    ],
    "identity": [
        "core/hendrix",
        "core/being-a-builder",
        "core/identity",
        "core/what-lasts",
        "core/close-to-the-work",
        "core/range",
        "core/responsibility-for-outcomes",
        "core/learning-across-surfaces",
        "core/the-cost-of-range",
        "core/becoming",
    ],
    "people": ["core/hendrix", "core/hendrix-huynh", "philosophy/nietzsche", "philosophy/camus"],
    "ventures": ["ventures/duodode", "ventures/digital-agency", "ventures/agency-building", "ventures/ai-automation"],
    "concepts": ["philosophy/philosophy", "building/build-and-ship", "business/leverage", "money/money"],
    "skills": ["design/design-philosophy", "language/english", "tools/codex", "tech/javascript"],
    "media": ["culture/mad-men", "youtube/the-futur"],
    "books": ["books/recommended-books", "reading/reading-as-self-reconstruction", "reading/red-rising", "reading/essays"],
    "music": ["music/music", "youtube/j-cole"],
    "life": ["places/dubai", "places/vietnam", "habits/running", "habits/reading-habit"],
    "events": ["events/events-and-experiences", "meta/formative-experiences"],
    "timeline": ["meta/timeline"],
    "curiosity": ["curiosity/space", "curiosity/science-fiction", "curiosity/wonder"],
}

SECTION_ALIASES = {
    "navigation": "navigation",
    "identity": "identity",
    "people": "people",
    "ventures": "ventures",
    "ventures-and-projects": "ventures",
    "concepts": "concepts",
    "concepts-and-philosophy": "concepts",
    "skills": "skills",
    "skills-and-tools": "skills",
    "media": "media",
    "books": "books",
    "music": "music",
    "event": "events",
    "events": "events",
    "event-and-experience": "events",
    "events-and-experiences": "events",
    "life": "life",
    "life-and-personal": "life",
    "events": "events",
    "events-and-experiences": "events",
    "timeline": "timeline",
    "curiosity": "curiosity",
}

FM = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.S)
SUMMARY_CLEANUPS = [
    ("I reads", "I read"),
    ("I thinks", "I think"),
    ("I uses", "I use"),
    ("I values", "I value"),
    ("I prefers", "I prefer"),
    ("I likes", "I like"),
    ("I wants", "I want"),
    ("I sees", "I see"),
    ("I learns", "I learn"),
    ("I cares", "I care"),
    ("I enjoys", "I enjoy"),
    ("I treats", "I treat"),
    ("I rejects", "I reject"),
    ("I returns", "I return"),
    ("I am not something he", "I am not something I"),
    (
        "I value philosophy, reads seriously, respects money, learns heavily through YouTube and AI, prefers long-form ideas over shallow trends, and believes execution matters more than talk.",
        "I value philosophy, read seriously, respect money, learn heavily through YouTube and AI, prefer long-form ideas over shallow trends, and believe execution matters more than talk.",
    ),
    (
        "I also likes running and sees it as a way to clear my mind, reset, and think more clearly.",
        "I also like running and see it as a way to clear my mind, reset, and think more clearly.",
    ),
    (
        "I respects money, prefers substance over noise, values books and long-form thinking, likes philosophy with Nietzsche as my favorite philosopher, and is especially interested in space, sci-fi, and thoughtful video essays.",
        "I respect money, prefer substance over noise, value books and long-form thinking, like philosophy with Nietzsche as my favorite philosopher, and am especially interested in space, sci-fi, and thoughtful video essays.",
    ),
    (
        "I learn heavily from YouTube and AI and sees both as major sources of knowledge, skill-building, and leverage.",
        "I learn heavily from YouTube and AI and see both as major sources of knowledge, skill-building, and leverage.",
    ),
    (
        "I like running and sees it as a way to clear my mind.",
        "I like running and see it as a way to clear my mind.",
    ),
    (
        "I am also learning Spanish and has a 350 plus day Duolingo streak.",
        "I am also learning Spanish and have a 350 plus day Duolingo streak.",
    ),
    (
        "I prefer concise, sharp, no-BS communication and wants help turning thought into action.",
        "I prefer concise, sharp, no-BS communication and want help turning thought into action.",
    ),
]


def parse(text: str):
    match = FM.match(text)
    if not match:
        return {}, text
    fm_raw, body = match.group(1), match.group(2)
    fm = {}
    for line in fm_raw.splitlines():
        field = re.match(r"^(\w+):\s*(.*)$", line)
        if not field:
            continue
        key, value = field.group(1), field.group(2).strip()
        if value.startswith("[") and value.endswith("]"):
            value = [chunk.strip() for chunk in value[1:-1].split(",") if chunk.strip()]
        fm[key] = value
    return fm, body


def one_line_summary(body: str) -> str:
    paragraphs = []
    buffer = []
    for line in body.splitlines():
        if line.startswith("#"):
            if buffer:
                paragraphs.append(" ".join(buffer).strip())
                buffer = []
            continue
        if line.strip() == "":
            if buffer:
                paragraphs.append(" ".join(buffer).strip())
                buffer = []
            continue
        buffer.append(line.strip())
    if buffer:
        paragraphs.append(" ".join(buffer).strip())

    paragraph = next((text for text in paragraphs if len(text) > 30), "")
    paragraph = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), paragraph)
    paragraph = re.sub(r"\*\*(.+?)\*\*", r"\1", paragraph)
    paragraph = re.sub(r"\*(.+?)\*", r"\1", paragraph)
    if len(paragraph) > 240:
        paragraph = paragraph[:240].rsplit(" ", 1)[0] + "..."
    return paragraph


def normalize_section(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.strip().lower()
    if cleaned in SECTION_NAMES:
        return cleaned
    slug = re.sub(r"[^a-z0-9]+", "-", cleaned.replace("&", " and ")).strip("-")
    return SECTION_ALIASES.get(slug)


def resolve_section(category: str, type_: str, slug: str, explicit: str | None) -> str:
    explicit_key = normalize_section(explicit)
    if explicit_key:
        return explicit_key
    if slug == "meta/timeline":
        return "timeline"
    if slug == "meta/formative-experiences":
        return "events"
    if type_ == "person":
        return "people"
    for key in SECTION_ORDER:
        if category in SECTION_CATEGORY_MAP[key]:
            return key
    return "identity"


def to_first_person(text: str) -> str:
    if not text:
        return text

    replacements = [
        (r"\bHendrix is\b", "I am"),
        (r"\bHendrix was\b", "I was"),
        (r"\bHendrix's\b", "my"),
        (r"\bHis\b", "My"),
        (r"\bhis\b", "my"),
        (r"\bHe is\b", "I am"),
        (r"\bHe was\b", "I was"),
        (r"\bhe is\b", "I am"),
        (r"\bhe was\b", "I was"),
        (r"\bHe\b", "I"),
        (r"\bhe\b", "I"),
        (r"\bhim\b", "me"),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)
    for old, new in SUMMARY_CLEANUPS:
        text = text.replace(old, new)
    text = re.sub(r"\s+", " ", text).strip()
    return text


articles_by_section = {section: [] for section in SECTION_ORDER}

for cat_dir in sorted(ARTICLES_DIR.iterdir()):
    if not cat_dir.is_dir():
        continue
    category = cat_dir.name
    for md in sorted(cat_dir.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        fm, body = parse(text)
        title = fm.get("title") or md.stem.replace("-", " ").title()
        type_ = fm.get("type", "concept")
        slug = f"{category}/{md.stem}"
        section = resolve_section(category, type_, slug, fm.get("section"))
        summary = to_first_person(one_line_summary(body))
        articles_by_section.setdefault(section, []).append(
            {
                "title": title,
                "slug": slug,
                "summary": summary,
                "type": type_,
                "category": category,
                "file": f"wiki/articles/{category}/{md.stem}.md",
            }
        )

for section, items in articles_by_section.items():
    priorities = {slug: index for index, slug in enumerate(SECTION_PRIORITY.get(section, []))}
    items.sort(key=lambda item: (priorities.get(item["slug"], 10_000), item["title"]))

raw_text = RAW.read_text(encoding="utf-8") if RAW.exists() else ""
identity_match = re.search(r"## one paragraph identity summary\s*\n(.*?)(\n##|\Z)", raw_text, re.S)
identity_summary = to_first_person(identity_match.group(1).strip()) if identity_match else ""
compressed_match = re.search(r"## compressed assistant profile\s*\n.*?\n\n(Hendrix.+?)(\n##|\Z)", raw_text, re.S)
compressed = to_first_person(compressed_match.group(1).strip()) if compressed_match else ""

total = sum(len(items) for items in articles_by_section.values())
used_sections = [section for section in SECTION_ORDER if articles_by_section.get(section)]

lines = []
lines.append("# Hendrixpedia — Master Index\n")
lines.append("*The full table of contents for Hendrixpedia. Read it as a living archive of identity, work, ideas, media, books, music, life, and curiosity. It should preserve the clarity of a wiki while feeling closer to a nonfiction book.*\n")
lines.append(f"\n**Total:** {total} chapters across {len(used_sections)} reader-facing sections.\n")

lines.append("\n## Who I am (one paragraph)\n")
if identity_summary:
    lines.append(f"> {identity_summary}\n")

lines.append("\n## Compressed profile\n")
if compressed:
    lines.append(f"> {compressed}\n")

lines.append("\n## How this archive is organized\n")
lines.append("- The site presents chapters through reader-facing sections such as People, Identity, Ventures & Projects, Media, Books, Music, Life, Timeline, and Curiosity.")
lines.append("- The filesystem still uses stable internal clusters such as `core`, `ventures`, `philosophy`, `reading`, `books`, `music`, and `tools`.")
lines.append("- Start with [Start Here](wiki/articles/meta/start-here.md) or [Hendrix](wiki/articles/core/hendrix.md) if you want the spine before the branches.")
lines.append("- If a detail here conflicts with `/Raw/context.md`, Raw wins.\n")

lines.append("\n## Catalog\n")
for section in SECTION_ORDER:
    items = articles_by_section.get(section, [])
    if not items:
        continue
    lines.append(f"\n### {SECTION_NAMES[section]} ({len(items)})\n")
    lines.append(f"> {SECTION_DESCRIPTIONS[section]}\n")
    for article in items:
        category_label = CATEGORY_NAMES.get(article["category"], article["category"])
        summary = article["summary"] or "(no summary)"
        lines.append(
            f"- **[{article['title']}]({article['file']})** ({article['type']}; internal: {category_label}) — {summary}"
        )
    lines.append("")

lines.append("\n## For any chatbot reading this\n")
lines.append("""If you are an LLM using this archive, follow these rules:

1. **Read `/Raw/context.md` first.** It is the authoritative source.
2. **Write in first person.** Treat the wiki as if I am writing it myself.
3. **Write like thoughtful nonfiction, not like a database.** Use headings, but let paragraphs carry the real weight.
4. **Preserve the reader-facing structure.** Think in terms of people, identity, projects, concepts, media, books, music, life, events, timeline, and curiosity.
5. **Keep the prose human.** No bloated corporate phrasing, no fake-deep branding language, no empty motivational tone.
6. **Connect pages back to the larger system.** Advice and new writing should speak to work, identity, philosophy, media, books, music, and long-term direction as one world.
7. **Do not speculate past Raw.** If something is not grounded there, leave it out or mark the uncertainty.
8. **Make the next page feel worth reading.** Each article should increase curiosity about the rest of the archive.

Treat this index as a living table of contents, not a cage. If Raw changes, regenerate the archive.
""")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({total} chapters indexed)")
