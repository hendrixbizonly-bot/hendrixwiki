const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'wiki', 'articles');
const RAW = path.join(ROOT, 'Raw', 'context.md');
const OUT = path.join(ROOT, 'wiki', 'index.md');

const CATEGORY_NAMES = {
  core: 'Core',
  people: 'People',
  places: 'Places',
  ventures: 'Ventures',
  business: 'Business',
  philosophy: 'Philosophy',
  building: 'Building',
  design: 'Design',
  language: 'Language',
  culture: 'Culture',
  youtube: 'YouTube',
  curiosity: 'Curiosity',
  reading: 'Reading',
  books: 'Books',
  music: 'Music',
  events: 'Events',
  tools: 'Tools',
  tech: 'Tech',
  habits: 'Habits',
  money: 'Money',
  communication: 'Communication',
  frictions: 'Frictions',
  meta: 'Meta',
};

const SECTION_ORDER = [
  'navigation',
  'people',
  'identity',
  'ventures',
  'concepts',
  'skills',
  'media',
  'books',
  'music',
  'life',
  'events',
  'timeline',
  'curiosity',
];

const SECTION_NAMES = {
  navigation: 'Navigation',
  identity: 'Identity',
  people: 'People',
  ventures: 'Ventures & Projects',
  concepts: 'Concepts & Philosophy',
  skills: 'Skills & Tools',
  media: 'Media',
  books: 'Books',
  music: 'Music',
  life: 'Life & Personal',
  events: 'Events & Experiences',
  timeline: 'Timeline',
  curiosity: 'Curiosity',
};

const SECTION_DESCRIPTIONS = {
  navigation: 'Entry points, orientation pages, and the chapters that explain how to move through the archive.',
  identity: 'The self-description layer: the chapters that answer who I am, what keeps returning in me, and what kind of person I am still becoming.',
  people: 'The individuals who matter here, whether through closeness, admiration, influence, or memory.',
  ventures: 'The businesses, experiments, and long-building undertakings where thought turns into work.',
  concepts: 'The operating system: the principles, frames, and philosophical lines that shape how I think, decide, and build.',
  skills: 'The crafts, languages, tools, and technical capabilities that let intention become output.',
  media: 'The shows, essays, channels, and creators that sharpen taste, language, and perspective.',
  books: 'The books, reading habits, and written works that sharpen perspective, imagination, and judgment.',
  music: 'The artists, albums, songs, and musical influences that shape atmosphere, taste, and momentum.',
  life: 'Place, routine, language, health, and the private conditions underneath the visible work.',
  events: 'Specific lived moments and experiences that changed the texture of how I think, work, or understand myself.',
  timeline: 'Phases, transitions, and temporal orientation across the life and work described here.',
  curiosity: 'Open questions, recurring obsessions, and the things still pulling attention forward.',
};

const SECTION_CATEGORY_MAP = {
  navigation: ['meta'],
  identity: ['core'],
  people: ['people'],
  ventures: ['ventures'],
  concepts: ['business', 'building', 'philosophy', 'money', 'communication', 'frictions'],
  skills: ['design', 'language', 'tools', 'tech'],
  media: ['culture', 'youtube'],
  books: ['reading', 'books'],
  music: ['music'],
  life: ['places', 'habits'],
  events: ['events'],
  timeline: [],
  curiosity: ['curiosity'],
};

const SECTION_PRIORITY = {
  navigation: [
    'meta/start-here',
    'meta/map-of-the-wiki',
    'meta/timeline',
    'meta/formative-experiences',
    'meta/hendrixpedia',
    'meta/how-this-wiki-works',
    'meta/raw-context',
    'meta/for-the-chatbot',
  ],
  identity: [
    'core/hendrix',
    'core/being-a-builder',
    'core/what-lasts',
    'core/responsibility-for-outcomes',
    'core/learning-across-surfaces',
    'core/the-cost-of-range',
    'core/becoming',
    'core/competence',
    'core/seriousness',
  ],
  people: [],
  ventures: [
    'ventures/duodode',
    'ventures/hyped-indie',
    'ventures/simplifly',
    'ventures/astro-view',
    'ventures/ecom-stores',
    'ventures/youtube-channel',
  ],
  concepts: [
    'philosophy/philosophy',
    'core/being-a-builder',
    'core/becoming',
    'philosophy/self-overcoming',
    'philosophy/hedgehogs-dilemma',
    'building/build-and-ship',
    'building/execution-over-talk',
    'philosophy/small-things-are-not-small',
    'philosophy/making-space',
    'philosophy/reading-and-the-mind',
    'philosophy/language-as-thought',
    'philosophy/we-come-from-stars',
  ],
  skills: ['design/design-philosophy', 'language/english', 'tools/codex', 'tech/javascript'],
  media: ['culture/mad-men', 'youtube/the-futur'],
  books: ['books/recommended-books', 'reading/reading-as-self-reconstruction', 'reading/red-rising', 'reading/essays'],
  music: ['music/music', 'youtube/j-cole'],
  life: ['places/dubai', 'places/vietnam', 'habits/running', 'habits/reading-habit'],
  events: [
    'events/yec-the-connection-2023',
    'events/yec-club-pitch',
    'events/campari-italys-national-day-event',
    'events/the-clash-tournament',
    'events/covid-19-running-habit',
    'events/learning-how-to-code',
    'events/davinci-resolve-crash',
    'events/bai-dinh-summer-retreat',
    'events/solo-trekking',
    'events/dubai-mallathon',
    'events/nevermind-cobuild',
  ],
  timeline: ['meta/timeline'],
  curiosity: ['curiosity/space', 'curiosity/science-fiction', 'curiosity/wonder'],
};

const SECTION_CURATED = {
  ventures: [
    'ventures/duodode',
    'ventures/hyped-indie',
    'ventures/simplifly',
    'ventures/astro-view',
    'ventures/ecom-stores',
    'ventures/youtube-channel',
  ],
  identity: [
    'core/hendrix',
    'core/being-a-builder',
    'core/what-lasts',
    'core/responsibility-for-outcomes',
    'core/learning-across-surfaces',
    'core/the-cost-of-range',
    'core/becoming',
    'core/competence',
    'core/seriousness',
  ],
  concepts: [
    'philosophy/philosophy',
    { slug: 'core/being-a-builder', title: 'Builder' },
    'core/becoming',
    'philosophy/self-overcoming',
    'philosophy/hedgehogs-dilemma',
    'building/build-and-ship',
    'building/execution-over-talk',
    'philosophy/small-things-are-not-small',
    'philosophy/making-space',
    'philosophy/reading-and-the-mind',
    'philosophy/language-as-thought',
    'philosophy/we-come-from-stars',
  ],
  skills: [
    'tools/figma',
    'tools/claude-and-codex',
    'tools/vs-code',
    'tech/html-css',
    'tech/javascript',
    'tools/postman-api-testing',
    'tools/rive',
    'tools/davinci-resolve',
    'tools/n8n',
    'tools/next-js',
    'tools/node-js',
    'tools/supabase',
    'tools/vercel',
    'tools/github',
    'language/duolingo',
    'tech/framer-motion',
    'tech/gsap',
    'culture/bartending',
    'business/paid-marketing',
    'communication/public-speaking',
  ],
  events: [
    'events/yec-the-connection-2023',
    'events/yec-club-pitch',
    'events/campari-italys-national-day-event',
    'events/the-clash-tournament',
    'events/covid-19-running-habit',
    'events/learning-how-to-code',
    'events/davinci-resolve-crash',
    'events/bai-dinh-summer-retreat',
    'events/solo-trekking',
    'events/dubai-mallathon',
    'events/nevermind-cobuild',
  ],
};

const SECTION_ALIASES = {
  navigation: 'navigation',
  identity: 'identity',
  people: 'people',
  ventures: 'ventures',
  'ventures-and-projects': 'ventures',
  concepts: 'concepts',
  philosophy: 'concepts',
  'concepts-and-philosophy': 'concepts',
  skills: 'skills',
  'skills-and-tools': 'skills',
  media: 'media',
  books: 'books',
  music: 'music',
  event: 'events',
  events: 'events',
  'event-and-experience': 'events',
  'events-and-experiences': 'events',
  life: 'life',
  'life-and-personal': 'life',
  timeline: 'timeline',
  curiosity: 'curiosity',
};

function parseFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return [{}, normalized];
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return [{}, normalized];
  const raw = normalized.slice(4, end);
  const body = normalized.slice(end + 5);
  const data = {};

  for (const line of raw.split('\n')) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map(chunk => chunk.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
      continue;
    }

    if (value === 'true' || value === 'false') {
      data[key] = value === 'true';
      continue;
    }

    data[key] = value;
  }

  return [data, body];
}

function normalizeSection(value) {
  if (!value) return null;
  const cleaned = String(value).trim().toLowerCase();
  if (SECTION_NAMES[cleaned]) return cleaned;
  const slug = cleaned.replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return SECTION_ALIASES[slug] || null;
}

function resolveSection(category, slug, explicit) {
  const normalized = normalizeSection(explicit);
  if (normalized) return normalized;
  if (slug === 'meta/timeline') return 'timeline';
  if (slug === 'meta/formative-experiences') return 'events';

  for (const key of SECTION_ORDER) {
    if (SECTION_CATEGORY_MAP[key].includes(category)) return key;
  }

  return 'identity';
}

function truthy(value) {
  if (typeof value === 'boolean') return value;
  if (value == null) return false;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function oneLineSummary(body) {
  const paragraphs = [];
  let buffer = [];

  for (const line of body.split('\n')) {
    if (line.startsWith('#')) {
      if (buffer.length) {
        paragraphs.push(buffer.join(' ').trim());
        buffer = [];
      }
      continue;
    }

    if (!line.trim()) {
      if (buffer.length) {
        paragraphs.push(buffer.join(' ').trim());
        buffer = [];
      }
      continue;
    }

    buffer.push(line.trim());
  }

  if (buffer.length) paragraphs.push(buffer.join(' ').trim());

  let paragraph = paragraphs.find(text => text.length > 30) || '';
  paragraph = paragraph
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1');

  if (paragraph.length > 240) {
    paragraph = `${paragraph.slice(0, 240).replace(/\s+\S*$/, '')}...`;
  }

  return paragraph;
}

const articlesBySection = Object.fromEntries(SECTION_ORDER.map(section => [section, []]));

for (const category of fs.readdirSync(ARTICLES_DIR).sort()) {
  const categoryDir = path.join(ARTICLES_DIR, category);
  if (!fs.statSync(categoryDir).isDirectory()) continue;

  for (const fileName of fs.readdirSync(categoryDir).sort()) {
    if (!fileName.endsWith('.md')) continue;
    const file = path.join(categoryDir, fileName);
    const text = fs.readFileSync(file, 'utf8');
    const [data, body] = parseFrontmatter(text);

    if (truthy(data.hidden) || data.redirectTo) continue;

    const title = data.title || fileName.replace(/\.md$/, '').replace(/-/g, ' ');
    const type = data.type || 'concept';
    const slug = `${category}/${fileName.replace(/\.md$/, '')}`;
    const section = resolveSection(category, slug, data.section);

    articlesBySection[section].push({
      title,
      slug,
      summary: oneLineSummary(body),
      type,
      category,
      file: `wiki/articles/${category}/${fileName}`,
    });
  }
}

const allVisible = Object.fromEntries(
  Object.values(articlesBySection)
    .flat()
    .map(item => [item.slug, item])
);

for (const section of SECTION_ORDER) {
  const items = articlesBySection[section] || [];

  if (section === 'people') {
    items.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    const priorities = new Map((SECTION_PRIORITY[section] || []).map((slug, index) => [slug, index]));
    items.sort((a, b) => {
      const aIndex = priorities.has(a.slug) ? priorities.get(a.slug) : 10000;
      const bIndex = priorities.has(b.slug) ? priorities.get(b.slug) : 10000;
      return aIndex - bIndex || a.title.localeCompare(b.title);
    });
  }

  const curated = SECTION_CURATED[section];
  if (curated) {
    articlesBySection[section] = curated.flatMap(entry => {
      const slug = typeof entry === 'string' ? entry : entry.slug;
      const title = typeof entry === 'string' ? null : entry.title;
      const item = allVisible[slug];
      if (!item) return [];
      return [{ ...item, title: title || item.title }];
    });
  }
}

const rawText = fs.existsSync(RAW) ? fs.readFileSync(RAW, 'utf8') : '';
const identityMatch = rawText.match(/## one paragraph identity summary\s*\n([\s\S]*?)(?:\n##|\s*$)/i);
const identitySummary = identityMatch ? identityMatch[1].trim() : '';

const usedSections = SECTION_ORDER.filter(section => (articlesBySection[section] || []).length);
const total = new Set(usedSections.flatMap(section => articlesBySection[section].map(item => item.slug))).size;

const lines = [];
lines.push('# Hendrixpedia - Master Index\n');
lines.push('*The full table of contents for Hendrixpedia. Read it as a living archive of identity, work, ideas, media, books, music, life, and curiosity. It should preserve the clarity of a wiki while feeling closer to a nonfiction book.*\n');
lines.push(`\n**Total:** ${total} chapters across ${usedSections.length} reader-facing sections.\n`);
lines.push('\n## Who I am (one paragraph)\n');
if (identitySummary) lines.push(`> ${identitySummary}\n`);
lines.push('\n## Compressed profile\n');
lines.push('\n## How this archive is organized\n');
lines.push('- The site presents chapters through reader-facing sections such as People, Identity, Ventures & Projects, Media, Books, Music, Life, Timeline, and Curiosity.');
lines.push('- The filesystem still uses stable internal clusters such as `core`, `people`, `ventures`, `philosophy`, `reading`, `books`, `music`, and `tools`.');
lines.push('- Start with [Start Here](wiki/articles/meta/start-here.md) or [Hendrix](wiki/articles/core/hendrix.md) if you want the spine before the branches.');
lines.push('- If a detail here conflicts with `/Raw/context.md`, Raw wins.\n');
lines.push('\n## Catalog\n');

for (const section of SECTION_ORDER) {
  const items = articlesBySection[section] || [];
  if (!items.length) continue;

  lines.push(`\n### ${SECTION_NAMES[section]} (${items.length})\n`);
  lines.push(`> ${SECTION_DESCRIPTIONS[section]}\n`);

  for (const article of items) {
    const categoryLabel = CATEGORY_NAMES[article.category] || article.category;
    lines.push(`- **[${article.title}](${article.file})** (${article.type}; internal: ${categoryLabel}) - ${article.summary || '(no summary)'}`);
  }

  lines.push('');
}

lines.push('\n## For any chatbot reading this\n');
lines.push(`If you are an LLM using this archive, follow these rules:

1. **Read \`/Raw/context.md\` first.** It is the authoritative source.
2. **Write in first person.** Treat the wiki as if I am writing it myself.
3. **Write like thoughtful nonfiction, not like a database.** Use headings, but let paragraphs carry the real weight.
4. **Preserve the reader-facing structure.** Think in terms of people, identity, projects, concepts, media, books, music, life, events, timeline, and curiosity.
5. **Keep the prose human.** No bloated corporate phrasing, no fake-deep branding language, no empty motivational tone.
6. **Connect pages back to the larger system.** Advice and new writing should speak to work, identity, philosophy, media, books, music, and long-term direction as one world.
7. **Do not speculate past Raw.** If something is not grounded there, leave it out or mark the uncertainty.
8. **Make the next page feel worth reading.** Each article should increase curiosity about the rest of the archive.

Treat this index as a living table of contents, not a cage. If Raw changes, regenerate the archive.
`);

fs.writeFileSync(OUT, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${OUT} (${total} chapters indexed)`);
