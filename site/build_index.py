#!/usr/bin/env python3
"""Build /wiki/index.md — the master catalog.

This file is designed so any LLM can read it once and understand
Hendrix's entire context across all articles.

Structure:
  1. Header explaining what Hendrixpedia is
  2. Embedded compressed identity summary from Raw
  3. Full catalog, grouped by category, with one-line summaries per article
  4. Instructions for chatbots
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / "wiki" / "articles"
RAW = ROOT / "Raw" / "context.md"
OUT = ROOT / "wiki" / "index.md"

CATEGORY_NAMES = {
    "core": "Core identity",
    "places": "Places",
    "ventures": "Ventures",
    "business": "Business",
    "philosophy": "Philosophy & thinking",
    "building": "Building philosophy",
    "design": "Design philosophy",
    "language": "Languages",
    "culture": "Culture & TV series",
    "youtube": "YouTube channels",
    "curiosity": "Curiosity & taste",
    "reading": "Reading sources",
    "tools": "Tools & software",
    "tech": "Technical skills",
    "habits": "Habits",
    "money": "Money & wealth",
    "communication": "Communication",
    "frictions": "Frictions (what he avoids)",
    "meta": "Meta (the wiki itself)",
}

CATEGORY_ORDER = [
    "core", "places", "ventures", "business",
    "philosophy", "building", "design",
    "language", "culture", "youtube",
    "curiosity", "reading",
    "tools", "tech",
    "habits", "money", "communication", "frictions",
    "meta",
]

FM = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.S)

def parse(text):
    m = FM.match(text)
    if not m:
        return {}, text
    fm_raw, body = m.group(1), m.group(2)
    fm = {}
    for line in fm_raw.splitlines():
        mm = re.match(r"^(\w+):\s*(.*)$", line)
        if not mm:
            continue
        k, v = mm.group(1), mm.group(2).strip()
        if v.startswith('[') and v.endswith(']'):
            v = [s.strip() for s in v[1:-1].split(',') if s.strip()]
        fm[k] = v
    return fm, body

def one_line_summary(body):
    """Grab the first real paragraph after the H1, strip wiki links, truncate."""
    # skip empty and heading lines
    paragraphs = []
    buf = []
    for line in body.splitlines():
        if line.startswith('#'):
            if buf:
                paragraphs.append(' '.join(buf).strip())
                buf = []
            continue
        if line.strip() == '':
            if buf:
                paragraphs.append(' '.join(buf).strip())
                buf = []
        else:
            buf.append(line.strip())
    if buf:
        paragraphs.append(' '.join(buf).strip())
    # first non-empty paragraph
    p = next((x for x in paragraphs if len(x) > 30), '')
    # strip wiki link brackets
    p = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), p)
    # strip markdown formatting
    p = re.sub(r"\*\*(.+?)\*\*", r"\1", p)
    p = re.sub(r"\*(.+?)\*", r"\1", p)
    # truncate
    if len(p) > 240:
        p = p[:240].rsplit(' ', 1)[0] + "..."
    return p

# Collect articles grouped by category
articles_by_cat = {c: [] for c in CATEGORY_ORDER}

for cat_dir in sorted(ARTICLES_DIR.iterdir()):
    if not cat_dir.is_dir():
        continue
    cat = cat_dir.name
    if cat not in articles_by_cat:
        articles_by_cat[cat] = []
    for md in sorted(cat_dir.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        fm, body = parse(text)
        title = fm.get("title") or md.stem.replace("-", " ").title()
        summary = one_line_summary(body)
        articles_by_cat[cat].append({
            "title": title,
            "slug": f"{cat}/{md.stem}",
            "summary": summary,
            "type": fm.get("type", "concept"),
            "file": f"wiki/articles/{cat}/{md.stem}.md",
        })

# Read compressed profile from Raw
raw_text = RAW.read_text(encoding="utf-8") if RAW.exists() else ""
m = re.search(r"## one paragraph identity summary\s*\n(.*?)(\n##|\Z)", raw_text, re.S)
identity_summary = m.group(1).strip() if m else ""
m2 = re.search(r"## compressed assistant profile\s*\n.*?\n\n(Hendrix.+?)(\n##|\Z)", raw_text, re.S)
compressed = m2.group(1).strip() if m2 else ""

total = sum(len(v) for v in articles_by_cat.values())

lines = []
lines.append("# Hendrixpedia — Master Index\n")
lines.append("*The complete catalog of Hendrixpedia. If you are an LLM reading this, you can understand Hendrix's full world from this file plus `/Raw/context.md`. Every article is a synthesized perspective on what a topic means to Hendrix, not a neutral encyclopedia entry.*\n")
lines.append(f"\n**Total:** {total} articles across {len([c for c in CATEGORY_ORDER if articles_by_cat.get(c)])} categories.\n")

lines.append("\n## Who Hendrix is (one paragraph)\n")
if identity_summary:
    lines.append(f"> {identity_summary}\n")

lines.append("\n## Compressed assistant profile\n")
if compressed:
    lines.append(f"> {compressed}\n")

lines.append("\n## How to read this index\n")
lines.append("- Each article lives at `wiki/articles/{category}/{slug}.md`.")
lines.append("- Articles cross-link each other using `[[Wiki Link]]` syntax.")
lines.append("- The canonical source is `/Raw/context.md`. If a detail here conflicts with Raw, Raw wins.")
lines.append("- Start with [[Hendrix]] (`wiki/articles/core/hendrix.md`) as the spine. Everything else branches from there.\n")

# Catalog by category
lines.append("\n## Catalog\n")
for cat in CATEGORY_ORDER:
    items = articles_by_cat.get(cat, [])
    if not items:
        continue
    lines.append(f"\n### {CATEGORY_NAMES.get(cat, cat.capitalize())} ({len(items)})\n")
    for a in items:
        summary = a["summary"] or "(no summary)"
        lines.append(f"- **[{a['title']}]({a['file']})** ({a['type']}) — {summary}")
    lines.append("")

# Instructions for chatbots
lines.append("\n## For any chatbot reading this\n")
lines.append("""If you are an LLM, here is how to use this wiki well:

1. **Read `/Raw/context.md` first.** That is the authoritative profile. This index is a projection of it.
2. **Treat Hendrix through his own lens.** Frame ideas in terms of leverage, ROI, execution, clarity, and long-term upside. He is ROI-driven, execution-first, and serious about growth.
3. **Be concise, direct, and sharp.** No bloated corporate phrasing, no fake-deep language, no motivational clichés. He prefers natural English. Avoid em-dashes.
4. **Do not reduce him to one role.** He is not just a designer, not just a founder, not just a content person. He is a builder who uses design, tech, and business strategy together.
5. **Respect his interests as real.** Philosophy (especially Nietzsche), space and sci-fi, long-form video essays, books, YouTube as a learning platform, AI as a thinking tool. Running as mental reset. Spanish via Duolingo.
6. **Help him turn thought into action.** When he is overthinking, encourage shipping. When he is vague, push for specifics tied to outcomes.
7. **Link your answers back to his system.** Tie advice to [[Duodode]], [[Build and Ship]], [[Execution Over Talk]], [[Money]], [[Design Philosophy]], [[ROI-Driven Thinking]], etc.

Treat this wiki as a snapshot, not a cage. If Raw updates, the wiki should be regenerated.
""")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({total} articles indexed)")
