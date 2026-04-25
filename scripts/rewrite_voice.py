#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / 'wiki' / 'articles'

HEADING_MAP = {
    '## Connection to his system': '## Connection to my system',
    '## Connection to his values': '## Connection to my values',
    '## Why it matters to him': '## Why it matters to me',
    '## Why it fits his workflow': '## Why it fits my workflow',
    '## Why it fits his system': '## Why it fits my system',
    '## How Hendrix uses it': '## How I use it',
    '## What it gives him': '## What it gives me',
    '## What it unlocks for him': '## What it unlocks for me',
    '## Why Hendrix watches': '## Why I watch',
    '## What it gave him': '## What it gave me',
    '## What he avoids': '## What I avoid',
    '## How he uses it': '## How I use it',
    '## What it means to him': '## What it means to me',
    '## Why it fits him': '## Why it fits me',
    '## Why it frustrates him': '## Why it frustrates me',
    '## How he thinks about it': '## How I think about it',
    '## How he builds it': '## How I build it',
    '## Where he finds them': '## Where I find them',
    '## Where he applies it': '## Where I apply it',
    '## Where he wants it': '## Where I want it',
    '## How he applies it': '## How I apply it',
    '## How he frames it': '## How I frame it',
    '## How he builds them': '## How I build them',
    '## How he works on it': '## How I work on it',
    '## How he approaches it': '## How I approach it',
    '## How he works with it': '## How I work with it',
    '## What freedom means to him': '## What freedom means to me',
    '## What it is to him': '## What it is to me',
    '## What he rejects': '## What I reject',
    '## What he gets from the form': '## What I get from the form',
    '## What he looks for': '## What I look for',
    '## What he wants next': '## What I want next',
    '## What he means by it': '## What I mean by it',
    '## What he means by direct': '## What I mean by direct',
    '## What he takes from it': '## What I take from it',
    '## What he cares about': '## What I care about',
    '## What he reads': '## What I read',
    '## What he expects from shipped work': '## What I expect from shipped work',
    '## What shipping means to him': '## What shipping means to me',
    '## How he engages with it': '## How I engage with it',
    '## How he learns it': '## How I learn it',
    '## How he gets there': '## How I get there',
    '## Why he prefers it': '## Why I prefer it',
    '## Why he leans toward it': '## Why I lean toward it',
    '## Themes he resonates with': '## Themes I resonate with',
    '## His stance': '## My stance',
    '## His approach': '## My approach',
    '## His specific take': '## My specific take',
    '## His current base': '## My current base',
    '## Place in his media diet': '## Place in my media diet',
    '## Fit in his essay cluster': '## Fit in my essay cluster',
    '## Fit in his dev stack': '## Fit in my dev stack',
    '## Paths that fit his model': '## Paths that fit my model',
    '## How it feeds his work': '## How it feeds my work',
    '## Space and his building philosophy': '## Space and my building philosophy',
    '## Space and his worldview': '## Space and my worldview',
    '## Who he is': '## Who I am',
    '## What he is building': '## What I am building',
    '## How he works': '## How I work',
    '## How he thinks': '## How I think',
    '## What he values': '## What I value',
    '## How he reads him': '## How I read him',
    '## Why I cares about this': '## Why I care about this',
}

EXACT_REPLACEMENTS = [
    ("[[Hendrix Huynh]]'s", 'my'),
    ("[[Hendrix]]'s", 'my'),
    ("Hendrix Huynh's", 'my'),
    ("Hendrix's", 'my'),
    ('[[Hendrix Huynh]]', 'Hendrix Huynh'),
    ('[[Hendrix]]', 'Hendrix'),
    ('For Hendrix,', 'For me,'),
    ('For Hendrix', 'For me'),
    ('for Hendrix,', 'for me,'),
    ('for Hendrix', 'for me'),
    ('to Hendrix', 'to me'),
    ('with Hendrix', 'with me'),
    ('part of Hendrix', 'part of me'),
    ('of Hendrix', 'of me'),
    ('means to Hendrix', 'means to me'),
    ('matters to Hendrix', 'matters to me'),
    ('Inside Hendrix\'s', 'Inside my'),
    ('inside Hendrix\'s', 'inside my'),
    ('Calling him ', 'Calling me '),
    ('Out of everyone he has read', 'Out of everyone I have read'),
    ('He is the person this wiki is about.', 'This is the page about me.'),
    ('the part of Hendrix that', 'the part of me that'),
    ('He is a reference point Hendrix returns to.', 'He is a reference point I return to.'),
    ('the type of reading he values', 'the type of reading I value'),
    ('the seriousness he brings', 'the seriousness I bring'),
    ('In personal writing he often prefers lowercase only.', 'In personal writing I often prefer lowercase only.'),
    ('He wants correction and real feedback on my English, not praise.', 'I want correction and real feedback on my English, not praise.'),
    ('He is drawn to [[Execution Over Talk]].', 'I am drawn to [[Execution Over Talk]].'),
    ('He is [[Ambition|ambitious]], [[ROI-Driven Thinking|ROI-driven]], and serious about [[Money]].', 'I am [[Ambition|ambitious]], [[ROI-Driven Thinking|ROI-driven]], and serious about [[Money]].'),
    ('He is drawn to characters who refuse to stay at the bottom.', 'I am drawn to characters who refuse to stay at the bottom.'),
    ('He runs a [[Branding]] and [[Digital Agency]] business.', 'I run a [[Branding]] and [[Digital Agency]] business.'),
    ('He is a builder working in [[Tech]] and [[Entrepreneurship]].', 'I am a builder working in [[Tech]] and [[Entrepreneurship]].'),
    ('He is interested in [[Space]], science, and ideas that combine curiosity with scale.', 'I am interested in [[Space]], science, and ideas that combine curiosity with scale.'),
    ('He is drawn to [[Philosophy]], [[Long-form Thinking]], and thoughtful [[Video Essays]].', 'I am drawn to [[Philosophy]], [[Long-form Thinking]], and thoughtful [[Video Essays]].'),
    ('It is the kind of content that expands how I frames questions, which in turn sharpens how I frames problems inside [[Duodode]] and my life.', 'It is the kind of content that expands how I frame questions, which in turn sharpens how I frame problems inside [[Duodode]] and my life.'),
    ('my favorite philosopher is [[Nietzsche]].', 'My favorite philosopher is [[Nietzsche]].'),
    ('That matches the kind of thinking he values.', 'That matches the kind of thinking I value.'),
    ('He is a builder, not a cynic.', 'I am a builder, not a cynic.'),
    ('He is using [[AI Tools]], [[AI Automation]], and other emerging tech inside [[Duodode]].', 'I am using [[AI Tools]], [[AI Automation]], and other emerging tech inside [[Duodode]].'),
    ('Between [[Fireship]] (developer-level), [[Joma Tech]] (career-level), [[Kurzgesagt]] (science-level), and Cleo Abram (journalism-level), he covers tech from multiple heights.', 'Between [[Fireship]] (developer-level), [[Joma Tech]] (career-level), [[Kurzgesagt]] (science-level), and Cleo Abram (journalism-level), I cover tech from multiple heights.'),
    ('He is a builder running [[Duodode]] and thinking long-term about [[Entrepreneurship]].', 'I am a builder running [[Duodode]] and thinking long-term about [[Entrepreneurship]].'),
    ('Not the heaviest channel he watches, not the lightest.', 'Not the heaviest channel I watch, not the lightest.'),
    ('It is a piece of data about who he is. I respect data about himself more than stories about himself.', 'It is a piece of data about who I am. I respect data about myself more than stories about myself.'),
    ('I do what I says, daily, without needing external pressure.', 'I do what I say, daily, without needing external pressure.'),
    ('I am writing himself down on purpose.', 'I am writing myself down on purpose.'),
    ('A serious, structured record of who he is, what I value, what I am building, and how I think.', 'A serious, structured record of who I am, what I value, what I am building, and how I think.'),
    ('that gets updated as he changes.', 'that gets updated as I change.'),
    ('making himself legible', 'making myself legible'),
    ('where I currently operates from', 'where I currently operate from'),
    ('It is tied to who he is, where I came from, and how I carry himself.', 'It is tied to who I am, where I came from, and how I carry myself.'),
    ('Scale is one of the directions Hendrix consistently wants to move toward.', 'Scale is one of the directions I consistently want to move toward.'),
    ('He is not interested in small wins that plateau. He is interested in building something that grows beyond the limits of one person\'s time.', 'I am not interested in small wins that plateau. I am interested in building something that grows beyond the limits of one person\'s time.'),
    ('He filters for real compounding, not the appearance of it.', 'I filter for real compounding, not the appearance of it.'),
    ('If something is only surface aesthetic, he loses interest fast. If something carries real weight, he stays with it.', 'If something is only surface aesthetic, I lose interest fast. If something carries real weight, I stay with it.'),
    ('Pages about the tools, tech, and stack he uses.', 'Pages about the tools, tech, and stack I use.'),
    ('- Written in third-person.', '- Written in first person.'),
    ('- Third-person voice, through my lens.', '- First-person voice, through my lens.'),
    ('- How he asks for feedback on my own work', '- How I ask for feedback on my own work'),
]

NAME_VERB_REPLACEMENTS = [
    ('is building', 'am building'),
    ('is', 'am'),
    ('wants to', 'want to'),
    ('wants', 'want'),
    ('uses', 'use'),
    ('values', 'value'),
    ('prefers', 'prefer'),
    ('treats', 'treat'),
    ('likes', 'like'),
    ('works', 'work'),
    ('thinks', 'think'),
    ('sees', 'see'),
    ('reads', 'read'),
    ('respects', 'respect'),
    ('came from', 'came from'),
    ('came', 'came'),
    ('grew up', 'grew up'),
    ('aims', 'aim'),
    ('filters', 'filter'),
    ('keeps', 'keep'),
    ('does not', 'do not'),
    ('does', 'do'),
    ('has', 'have'),
    ('builds', 'build'),
    ('watches', 'watch'),
    ('finds', 'find'),
    ('operates', 'operate'),
    ('takes', 'take'),
    ('returns to', 'return to'),
    ('returns', 'return'),
    ('cares', 'care'),
    ('knows', 'know'),
    ('trusts', 'trust'),
    ('evaluates', 'evaluate'),
    ('handles', 'handle'),
    ('frames', 'frame'),
    ('stores', 'store'),
    ('resists', 'resist'),
    ('chooses', 'choose'),
    ('defaults', 'default'),
    ('corrects', 'correct'),
    ('lives', 'live'),
    ('lets', 'let'),
    ('goes', 'go'),
    ('relies', 'rely'),
    ('moves', 'move'),
    ('recognizes', 'recognize'),
    ('measures', 'measure'),
    ('distrusts', 'distrust'),
    ('learns', 'learn'),
    ('enjoys', 'enjoy'),
    ('starts', 'start'),
    ('dislikes', 'dislike'),
    ('stays', 'stay'),
    ('understands', 'understand'),
    ('absorbed', 'absorbed'),
    ('runs', 'run'),
    ('believes', 'believe'),
    ('brings', 'bring'),
    ('carries', 'carry'),
    ('refuses', 'refuse'),
]

LOWER_CLAUSE_REPLACEMENTS = [
    (' how he ', ' how I '),
    (' what he ', ' what I '),
    (' why he ', ' why I '),
    (' where he ', ' where I '),
    (' when he ', ' when I '),
    (' because he ', ' because I '),
    (' whether he ', ' whether I '),
    (' while he ', ' while I '),
    (' if he ', ' if I '),
    (' that he ', ' that I '),
    (' he already ', ' I already '),
    (' he also ', ' I also '),
    (' he would ', ' I would '),
    (' he does not ', ' I do not '),
    (' he does ', ' I do '),
    (' he uses ', ' I use '),
    (' he values ', ' I value '),
    (' he prefers ', ' I prefer '),
    (' he thinks ', ' I think '),
    (' he reads ', ' I read '),
    (' he respects ', ' I respect '),
    (' he likes ', ' I like '),
    (' he works ', ' I work '),
    (' he writes ', ' I write '),
    (' he talks ', ' I talk '),
    (' he sharpens ', ' I sharpen '),
    (' he frames ', ' I frame '),
    (' he reflects ', ' I reflect '),
    (' he decides ', ' I decide '),
    (' he avoids ', ' I avoid '),
    (' he wants ', ' I want '),
    (' he treats ', ' I treat '),
    (' he is ', ' I am '),
    (' he has ', ' I have '),
    (' he can ', ' I can '),
    (' he trusts ', ' I trust '),
    (' he evaluates ', ' I evaluate '),
    (' he starts ', ' I start '),
    (' he believes ', ' I believe '),
    (' he brings ', ' I bring '),
    (' he grew up ', ' I grew up '),
    (' he keeps ', ' I keep '),
    (' he learned ', ' I learned '),
    (' he learns ', ' I learn '),
    (' he carries ', ' I carry '),
    (' he refuses ', ' I refuse '),
    (' he chooses ', ' I choose '),
    (' he picks ', ' I pick '),
    (' he dislikes ', ' I dislike '),
    (' he follows ', ' I follow '),
    (' he notices ', ' I notice '),
    (' he allows ', ' I allow '),
    (' he builds ', ' I build '),
    (' he runs ', ' I run '),
    (' he values ', ' I value '),
    (' he encounters ', ' I encounter '),
    (' he could ', ' I could '),
    (' he operates ', ' I operate '),
]

SENTENCE_START_REPLACEMENTS = [
    ('He is building', 'I am building'),
    ('He is', 'I am'),
    ('He wants to', 'I want to'),
    ('He wants', 'I want'),
    ('He uses', 'I use'),
    ('He values', 'I value'),
    ('He prefers', 'I prefer'),
    ('He treats', 'I treat'),
    ('He likes', 'I like'),
    ('He works', 'I work'),
    ('He thinks', 'I think'),
    ('He sees', 'I see'),
    ('He reads', 'I read'),
    ('He respects', 'I respect'),
    ('He does not', 'I do not'),
    ('He does', 'I do'),
    ('He has', 'I have'),
    ('He can', 'I can'),
    ('He trusts', 'I trust'),
    ('He evaluates', 'I evaluate'),
    ('He starts', 'I start'),
    ('He believes', 'I believe'),
    ('He grew up', 'I grew up'),
    ('He keeps', 'I keep'),
    ('He learns', 'I learn'),
    ('He enjoys', 'I enjoy'),
    ('He dislikes', 'I dislike'),
    ('He stays', 'I stay'),
    ('He understands', 'I understand'),
    ('He absorbed', 'I absorbed'),
    ('He runs', 'I run'),
    ('He brings', 'I bring'),
    ('He would', 'I would'),
    ('He also', 'I also'),
    ('He refuses', 'I refuse'),
    ('His ', 'My '),
]

CLEANUP_REPLACEMENTS = [
    ('I value [[Philosophy]], respects [[Money]], prefers substance over noise, and believes', 'I value [[Philosophy]], respect [[Money]], prefer substance over noise, and believe'),
    ('I do not see himself', 'I do not see myself'),
    ('I see himself', 'I see myself'),
    ('I uses', 'I use'),
    ('I values', 'I value'),
    ('I thinks', 'I think'),
    ('I reads', 'I read'),
    ('I wants', 'I want'),
    ('I likes', 'I like'),
    ('I works', 'I work'),
    ('I treats', 'I treat'),
    ('I respects', 'I respect'),
    ('I avoids', 'I avoid'),
    ('I writes', 'I write'),
    ('I talks', 'I talk'),
    ('I sharpens', 'I sharpen'),
    ('I frames', 'I frame'),
    ('I reflects', 'I reflect'),
    ('I decides', 'I decide'),
    ('I starts', 'I start'),
    ('I keeps', 'I keep'),
    ('I lives', 'I live'),
    ('I builds', 'I build'),
    ('I brings', 'I bring'),
    ('I believes', 'I believe'),
    ('I prefers', 'I prefer'),
    ('I carries', 'I carry'),
    ('I lets', 'I let'),
    ('I evaluates', 'I evaluate'),
    ('I trusts', 'I trust'),
    ('I haves', 'I have'),
    ('I does', 'I do'),
    ('I is', 'I am'),
    ('I sees', 'I see'),
    ('I knows', 'I know'),
    ('I looks', 'I look'),
    ('I dislikes', 'I dislike'),
    ('I applies', 'I apply'),
    ('I manages', 'I manage'),
    ('I covers', 'I cover'),
    ('I states', 'I state'),
    ('I follows', 'I follow'),
    ('I allows', 'I allow'),
    ('I notices', 'I notice'),
    ('I chooses', 'I choose'),
    ('I picks', 'I pick'),
    ('I encounters', 'I encounter'),
    ('I already tries', 'I already try'),
    ('I already lives', 'I already live'),
    ('I cares', 'I care'),
    ('I refuses', 'I refuse'),
    ('I rejects', 'I reject'),
    ('I would rather be', 'I would rather be'),
    ('I am drawn to [[Space]], [[Astronomy]], [[Science Fiction]], and [[Video Essays]], and uses', 'I am drawn to [[Space]], [[Astronomy]], [[Science Fiction]], and [[Video Essays]], and I use'),
    ('I read seriously, prefers', 'I read seriously, prefer'),
    ('## How I read me', '## How I read him'),
    ('## Why I cares about this', '## Why I care about this'),
    ('## How I reads him', '## How I read him'),
    ('## When I runs', '## When I run'),
    ('## Why I dislikes them', '## Why I dislike them'),
    ('## What I filters out', '## What I filter out'),
    ('## Why I picks clear', '## Why I pick clear'),
    ('## Why I frames it this way', '## Why I frame it this way'),
    ('## What I looks for in ideas', '## What I look for in ideas'),
    ('## What I looks for in it', '## What I look for in it'),
    ('For me, who is drawn to [[Space]], [[Astronomy]], and humanity\'s place in the universe, it is one of the natural homes for that curiosity.', 'For me, it is one of the natural homes for that curiosity because I am drawn to [[Space]], [[Astronomy]], and humanity\'s place in the universe.'),
    ('When he notices himself waiting to feel ready, I treat it as a cue to begin.', 'When I notice myself waiting to feel ready, I treat it as a cue to begin.'),
    ('That same method still applies: I keep watching sharper and sharper content to keep sharpening himself.', 'That same method still applies: I keep watching sharper and sharper content to keep sharpening myself.'),
    ('the [[Vietnam|Vietnamese]] context he came from before [[Dubai]] became my base', 'the [[Vietnam|Vietnamese]] context I came from before [[Dubai]] became my base'),
    ('UI am where the [[Design Philosophy]] meets the pixel.', 'UI is where the [[Design Philosophy]] meets the pixel.'),
    ('Running is one of the few places where Hendrix allows himself to be purely inside a process with no deliverable.', 'Running is one of the few places where I allow myself to be purely inside a process with no deliverable.'),
    ('Because he builds across multiple disciplines at once:', 'Because I build across multiple disciplines at once:'),
    ('- A feed I can curate around ideas and writers he respects', '- A feed I can curate around ideas and writers I respect'),
    ('It is not a trend he follows. It is a layer he builds with.', 'It is not a trend I follow. It is a layer I build with.'),
    ('It is breaking a promise to himself.', 'It is breaking a promise to myself.'),
    ('the systems, goals, and ambitions he builds day to day sit inside something vastly larger', 'the systems, goals, and ambitions I build day to day sit inside something vastly larger'),
    ('- When he runs and lets my mind clear', '- When I run and let my mind clear'),
    ('When a sentence could be sharp or it could be clever, he picks sharp.', 'When a sentence could be sharp or it could be clever, I pick sharp.'),
    ('Hendrix actively watches for this pattern in himself and in others.', 'I actively watch for this pattern in myself and in others.'),
    ('for himself, to live a diluted life', 'for myself, to live a diluted life'),
    ('who he is, what I am building, how I think, and what I value', 'who I am, what I am building, how I think, and what I value'),
    ('It is written in my lens', 'It is written through my lens'),
]

FRONTMATTER_RE = re.compile(r'^(---\n.*?\n---\n)(.*)$', re.S)
SELF_RE = re.compile(r'\b(I|me|my|myself)\b')


def apply_heading(line: str) -> str:
    if line in HEADING_MAP:
        return HEADING_MAP[line]
    line = re.sub(r'^## What he\b', '## What I', line)
    line = re.sub(r'^## How he\b', '## How I', line)
    line = re.sub(r'^## Why he\b', '## Why I', line)
    line = re.sub(r'^## Where he\b', '## Where I', line)
    line = re.sub(r'^## When he\b', '## When I', line)
    line = re.sub(r'^## His\b', '## My', line)
    line = line.replace(' to him', ' to me').replace(' for him', ' for me').replace(' his ', ' my ')
    return line


def apply_sentence_start(sentence: str, current_ref: str | None) -> str:
    stripped = sentence.lstrip()
    prefix = sentence[: len(sentence) - len(stripped)]
    if current_ref != 'self':
        return sentence
    for src, dst in SENTENCE_START_REPLACEMENTS:
        if stripped.startswith(src):
            return prefix + dst + stripped[len(src):]
    return sentence


def transform_body(body: str, title: str, article_type: str) -> str:
    lines = [apply_heading(line) if line.startswith('## ') else line for line in body.splitlines()]
    text = '\n'.join(lines)

    for old, new in EXACT_REPLACEMENTS:
        text = text.replace(old, new)

    for src, dst in NAME_VERB_REPLACEMENTS:
        text = re.sub(rf'\bHendrix Huynh\s+{re.escape(src)}\b', f'I {dst}', text)
        text = re.sub(rf'\bHendrix\s+{re.escape(src)}\b', f'I {dst}', text)

    for old, new in LOWER_CLAUSE_REPLACEMENTS:
        text = text.replace(old, new)

    text = re.sub(r'\bhimself\b', 'myself', text)
    text = re.sub(r'\bhim\b', 'me', text)
    text = re.sub(r'\bhis\b', 'my', text)

    default_self = article_type not in {'person', 'show', 'channel'} or title in {'Hendrix', 'Hendrix Huynh'}
    title_pat = re.escape(title)
    paragraphs = text.split('\n\n')
    rewritten: list[str] = []

    for paragraph in paragraphs:
        parts = re.split(r'(?<=[.!?])\s+', paragraph)
        current_ref: str | None = 'self' if default_self else None
        out: list[str] = []

        for part in parts:
            if not part:
                out.append(part)
                continue

            if current_ref is None:
                if SELF_RE.search(part):
                    current_ref = 'self'
                elif title not in {'Hendrix', 'Hendrix Huynh'} and re.search(rf'\b{title_pat}\b', part):
                    current_ref = 'topic'

            part = apply_sentence_start(part, current_ref)
            out.append(part)

            if SELF_RE.search(part):
                current_ref = 'self'
            elif title not in {'Hendrix', 'Hendrix Huynh'} and re.search(rf'\b{title_pat}\b', part):
                current_ref = 'topic'

        rewritten.append(' '.join(out))

    text = '\n\n'.join(rewritten)

    for old, new in CLEANUP_REPLACEMENTS:
        text = text.replace(old, new)

    return text


def restore_list_formatting(text: str) -> str:
    lines: list[str] = []

    for line in text.splitlines():
        if line.startswith('- ') and ' - ' in line:
            parts = re.split(r'\s(?=- (?:\*\*|\[\[|[A-Z0-9]))', line)
            if len(parts) > 1:
                lines.extend(parts)
                continue

        if re.match(r'^\d+\.\s', line) and re.search(r'\s(?=\d+\.\s)', line):
            parts = re.split(r'\s(?=\d+\.\s)', line)
            if len(parts) > 1:
                lines.extend(parts)
                continue

        lines.append(line)

    return '\n'.join(lines)


def rewrite_file(path: Path) -> bool:
    original = path.read_text(encoding='utf-8')
    match = FRONTMATTER_RE.match(original)
    if not match:
        return False

    frontmatter, body = match.groups()
    title_match = re.search(r'^title:\s*(.+)$', frontmatter, re.M)
    type_match = re.search(r'^type:\s*(.+)$', frontmatter, re.M)
    title = title_match.group(1).strip() if title_match else path.stem.replace('-', ' ').title()
    article_type = type_match.group(1).strip() if type_match else 'concept'

    rewritten = frontmatter + restore_list_formatting(transform_body(body, title, article_type))
    if rewritten == original:
        return False

    path.write_text(rewritten, encoding='utf-8')
    return True


def main() -> None:
    changed = 0
    for path in sorted(ARTICLES_DIR.rglob('*.md')):
        if rewrite_file(path):
            changed += 1
    print(f'rewrote {changed} article files')


if __name__ == '__main__':
    main()
