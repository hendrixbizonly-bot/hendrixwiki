import Link from 'next/link';
import { articlesByCategory, leadSentence, loadArticle, loadArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = loadArticles();
  const groups = articlesByCategory();
  const featured = loadArticle('design/design-philosophy') ?? loadArticle('core/hendrix');
  const recent = [...articles]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title))
    .slice(0, 3);
  const browseGroups = groups.slice(0, 6);

  return (
    <div className="wiki-home">
      <div className="wiki-home-main">
        <header className="page-header">
          <h1 className="page-title">Welcome to Hendrix Wiki</h1>
          <p className="page-subtitle">
            the personal knowledge base compiled from notes, projects, conversation, and work.
          </p>
          <p className="page-context">
            {articles.length} articles across {groups.length} categories | <Link href="/">v1</Link> |{' '}
            <Link href="/graph">graph view</Link>
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
                : 'Hendrix is a Dubai-based builder with a strong bias toward design, tech, and business leverage.'}
            </p>
            <p className="feature-link-row">
              <Link href={`/a/${featured?.slug ?? 'core/hendrix'}`}>Read more -&gt;</Link>
            </p>
          </div>
        </section>

        <section className="info-box">
          <header className="info-box-head">Browse by category</header>
          <div className="info-box-body browse-sections">
            {browseGroups.map(group => (
              <section className="browse-section" id={group.key} key={group.key}>
                <h3>{group.name}</h3>
                <p className="browse-intro">
                  This section gathers {group.articles.length} article{group.articles.length === 1 ? '' : 's'} that map how Hendrix thinks about {group.name.toLowerCase()}.
                </p>
                <div className="browse-items">
                  {group.articles.slice(0, 5).map(article => (
                    <p className="browse-item" key={article.slug}>
                      <Link href={`/a/${article.slug}`}>{article.title}</Link>
                      {' '}- {leadSentence(article.body, 160) || `${article.title} is one of the core entries in this section.`}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>

      <aside className="wiki-home-side">
        <section className="info-box compact">
          <header className="info-box-head">Recently updated</header>
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
              Hendrix Wiki is a personal knowledge base built around Hendrix Huynh&apos;s raw context. The goal is not neutral encyclopedia writing. It is a structured view of what each topic means inside his system.
            </p>
            <p>
              The site reads directly from <code>/wiki/articles</code>, with <Link href="/raw">Raw</Link> as the source of truth and <Link href="/schema">Schema</Link> as the writing contract.
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
