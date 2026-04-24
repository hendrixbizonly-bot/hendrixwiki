import Link from 'next/link';
import { articlesBySection, leadSentence, loadArticle, loadArticles, type Article } from '@/lib/articles';

const guideSlugs = ['meta/start-here', 'meta/map-of-the-wiki', 'meta/timeline', 'meta/formative-experiences'];

export default function HomePage() {
  const articles = loadArticles();
  const sections = articlesBySection();
  const featured = loadArticle('meta/start-here') ?? loadArticle('core/hendrix');
  const guides = guideSlugs
    .map(slug => loadArticle(slug))
    .filter((article): article is Article => article !== null);
  const recent = [...articles]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title))
    .slice(0, 4);
  const tableOfContents = sections.filter(section => section.key !== 'navigation');

  return (
    <div className="wiki-home">
      <div className="wiki-home-main">
        <header className="page-header">
          <h1 className="page-title">Hendrixpedia</h1>
          <p className="page-subtitle">
            A living book of identity, work, ideas, taste, memory, and direction.
          </p>
          <p className="page-context">
            {articles.length} chapters across {sections.length} reader-facing sections |{' '}
            <Link href="/graph">map view</Link> | <Link href="/raw">raw notes</Link> |{' '}
            <Link href="/schema">writing contract</Link>
          </p>
        </header>

        <section className="info-box">
          <header className="info-box-head">Opening Chapter</header>
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
              <Link href={`/a/${featured?.slug ?? 'core/hendrix'}`}>Begin reading -&gt;</Link>
            </p>
          </div>
        </section>

        <section className="info-box">
          <header className="info-box-head">Orientation</header>
          <div className="info-box-body browse-sections">
            {guides.map(article => (
              <section className="browse-section" key={article.slug}>
                <h3>
                  <Link href={`/a/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="browse-intro">{leadSentence(article.body, 220)}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="info-box">
          <header className="info-box-head">The Table of Contents</header>
          <div className="info-box-body browse-sections">
            {tableOfContents.map(section => (
              <section className="browse-section" id={section.key} key={section.key}>
                <h3>{section.name}</h3>
                <p className="browse-intro">{section.description}</p>
                <div className="browse-items">
                  {section.articles.slice(0, 4).map(article => (
                    <p className="browse-item" key={article.slug}>
                      <Link href={`/a/${article.slug}`}>{article.title}</Link>
                      {' '}- {leadSentence(article.body, 170) || `${article.title} is one of the spine chapters in this section.`}
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
          <header className="info-box-head">About This Archive</header>
          <div className="info-box-body">
            <p>
              Hendrixpedia is not meant to read like a flat database. It is a structured personal archive arranged so the reader can move from identity into work, from work into ideas, and from ideas into the books, media, places, and habits that keep the whole world coherent.
            </p>
            <p>
              The filesystem still keeps internal clusters inside <code>/wiki/articles</code>, but the site now presents them as a reader-facing table of contents. The goal is clarity without losing atmosphere.
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
