import Link from 'next/link';
import { articlesBySection, leadSentence, loadArticle, loadArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = loadArticles();
  const sections = articlesBySection();
  const categoryCount = new Set(articles.map(article => article.category)).size;
  const featured = loadArticle('meta/start-here') ?? loadArticle('core/hendrix');
  const recent = [...articles]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title))
    .slice(0, 3);
  const tableOfContents = sections.filter(section => section.key !== 'navigation');

  return (
    <div className="wiki-home">
      <div className="wiki-home-main">
        <header className="page-header wiki-home-header">
          <h1 className="page-title home-hero-title">Welcome to Hendrixpedia</h1>
          <p className="page-subtitle">
            the personal knowledge base compiled from notes, projects, conversations, and life.
          </p>
          <p className="page-context">
            {articles.length} chapters across {categoryCount} categories · <Link href="/talk">v1 — talk to AI Hendrix</Link>
          </p>
        </header>

        <section className="info-box">
          <header className="info-box-head">Featured article</header>
          <div className="info-box-body">
            <h2 className="feature-title">
              <Link href={`/a/${featured?.slug ?? 'core/hendrix'}`}>{featured?.title ?? 'Hendrix'}</Link>
            </h2>
            <p className="feature-copy">
              {featured
                ? leadSentence(featured.body, 420)
                : 'This archive follows the shape of a life in motion: the person, the work, the ideas, the media, and the private forces underneath all of it.'}
            </p>
            <p className="feature-link-row">
              <Link href={`/a/${featured?.slug ?? 'core/hendrix'}`}>Read more -&gt;</Link>
            </p>
          </div>
        </section>

        <section className="info-box">
          <header className="info-box-head">Browse by category</header>
          <div className="info-box-body category-browser">
            {tableOfContents.map(section => (
              <section className="category-browser-group" id={section.key} key={section.key}>
                <h3>{section.name}</h3>
                <ul className="category-browser-list">
                  {section.articles.slice(0, 6).map(article => (
                    <li className="browse-item" key={article.slug}>
                      <Link href={`/a/${article.slug}`}>{article.title}</Link>
                      <span> — {leadSentence(article.body, 150) || `${article.title} is one of the spine chapters in this section.`}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </div>

      <aside className="wiki-home-side">
        <section className="info-box compact">
          <header className="info-box-head">Recently Updated</header>
          <div className="info-box-body">
            {recent.map(article => (
              <p className="recent-item" key={article.slug}>
                <Link href={`/a/${article.slug}`}>{article.title}</Link>
                <span>({article.updatedAt})</span>
              </p>
            ))}
          </div>
        </section>

        <section className="info-box compact">
          <header className="info-box-head">About</header>
          <div className="info-box-body">
            <p>
              Hendrixpedia is a personal knowledge base built from raw notes, projects, essays, and lived experience. It is arranged so the reader can move from identity into work, from work into ideas, and from ideas into the media, places, and habits underneath all of it.
            </p>
            <p>
              Use the <Link href="/talk">Talk</Link> tab to open the live <code>index.md</code> context pack, download it, and import it into any LLM to chat with AI Hendrix.
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
