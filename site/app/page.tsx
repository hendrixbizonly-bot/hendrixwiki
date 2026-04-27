import Link from 'next/link';
import { articlesBySection, displayTitle, leadSentence, loadArticle, loadArticles, shortSummary, visibleArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = visibleArticles(loadArticles());
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
          <h1 className="page-title home-hero-title">Hendrixpedia</h1>
          <p className="page-subtitle">
            Personal encyclopedia compiled from notes, projects, conversations, and life.
          </p>
          <p className="page-context">
            {articles.length} chapters across {categoryCount} categories · <Link href="/talk">Chat with AI Hendrix</Link>
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
                ? leadSentence(featured.body, 210)
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
                  {section.articles.map(article => (
                    <li className="browse-item" key={article.slug}>
                      <Link href={`/a/${article.slug}`}>{displayTitle(article)}</Link>
                      <span> — {shortSummary(article.body, 10) || 'One of the section spine chapters.'}</span>
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
              Hendrixpedia maps identity, work, ideas, media, places, and habits into one personal archive.
            </p>
            <p>Open <Link href="/talk">Talk</Link> to download the live <code>index.md</code> pack for any LLM.</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
