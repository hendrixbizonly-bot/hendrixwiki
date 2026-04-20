import Link from 'next/link';
import { articlesByCategory, loadArticles, leadSentence, loadArticle } from '@/lib/articles';

export default function HomePage() {
  const articles = loadArticles();
  const groups = articlesByCategory();
  const featured = loadArticle('core/hendrix');
  const recent = articles.slice(0, 6);

  return (
    <>
      <h1 className="welcome">
        Welcome to <span>Hendrixpedia</span> <sup>v1</sup>,
      </h1>
      <p className="lede-center">the personal encyclopedia compiled from Hendrix&apos;s raw context.</p>
      <p className="stats">
        {articles.length} articles across {groups.length} categories ·{' '}
        <Link href="/graph">Open graph</Link>
      </p>

      <div className="grid">
        <section className="card featured">
          <header className="card-head blue">Featured article</header>
          <div className="card-body">
            <div className="featured-row">
              <div className="featured-img"><div className="featured-logo">H</div></div>
              <p>
                <Link href="/a/core/hendrix"><strong>Hendrix</strong></Link>{' '}
                <span className="muted">(person)</span> —{' '}
                {featured ? leadSentence(featured.body, 240) : 'Hendrix is a Dubai-based builder.'}
              </p>
            </div>
            <p><Link href="/a/core/hendrix" className="read-more">Read more →</Link></p>
          </div>
        </section>

        <section className="card recent">
          <header className="card-head gray">Recently updated</header>
          <ul className="card-body">
            {recent.map(a => (
              <li key={a.slug}>
                <Link href={`/a/${a.slug}`}>{a.title}</Link>
                <span className="date">(2026-04-20)</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card about">
          <header className="card-head gray">About</header>
          <div className="card-body">
            <p>Hendrixpedia is a personal knowledge wiki compiled from a single raw context file. Every article is written through Hendrix&apos;s lens — what the topic means to him, not a neutral encyclopedia entry.</p>
            <p className="muted">Architecture: Raw → Wiki → Site. Edit <code>/Raw/context.md</code>, regenerate articles, restart.</p>
          </div>
        </section>

        <section className="card browse">
          <header className="card-head green">Browse by category</header>
          <div className="card-body">
            {groups.map(g => (
              <div className="browse-group" key={g.key}>
                <h4>{g.name}</h4>
                <ul>
                  {g.articles.slice(0, 14).map(a => (
                    <li key={a.slug}>
                      <Link href={`/a/${a.slug}`}>{a.title}</Link>{' '}
                      <span className="muted">— {a.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
