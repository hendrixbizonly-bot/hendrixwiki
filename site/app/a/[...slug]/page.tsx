import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  getArticleToc,
  getRelatedArticles,
  loadArticle,
  loadArticles,
  renderArticle,
  sectionName,
} from '@/lib/articles';

export async function generateStaticParams() {
  return loadArticles().map(article => ({ slug: article.slug.split('/') }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  const target = article?.redirectTo ? loadArticle(article.redirectTo) : article;
  return { title: target ? `${target.title} | Hendrixpedia` : 'Chapter | Hendrixpedia' };
}

export default function ArticlePage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  if (!article) notFound();
  if (article.redirectTo) {
    redirect(`/a/${article.redirectTo.split('/').map(encodeURIComponent).join('/')}`);
  }

  const articles = loadArticles();
  const html = renderArticle(article, articles);
  const section = sectionName(article.section);
  const toc = getArticleToc(article.body);
  const relatedArticles = getRelatedArticles(article, articles);

  return (
    <div className="article-shell">
      <article className="article-page">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> {'>'} <Link href={`/#${article.section}`}>{section}</Link> {'>'} <span>{article.title}</span>
        </div>
        <div className="article-meta">
          {section} | {article.type} | updated {article.updatedAt}
        </div>
        <h1 className="article-title">{article.title}</h1>
        <div id="overview" className="article" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <aside className="article-side">
        <section className="info-box compact article-toc-box">
          <header className="info-box-head">Contents</header>
          <div className="info-box-body">
            <ol className="article-toc-list">
              {toc.map(item => (
                <li className={`depth-${item.level}`} key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="info-box compact">
          <header className="info-box-head">About this page</header>
          <div className="info-box-body">
            <p>
              Part of <Link href={`/#${article.section}`}>{section}</Link> — {relatedArticles.length} linked articles.
            </p>
            <p>{article.tags.length} tags · updated {article.updatedAt}</p>
          </div>
        </section>

        {relatedArticles.length > 0 ? (
          <section className="info-box compact">
            <header className="info-box-head">Related articles</header>
            <div className="info-box-body">
              <ul className="info-list">
                {relatedArticles.map(relatedArticle => (
                  <li key={relatedArticle.slug}>
                    <Link href={`/a/${relatedArticle.slug}`}>{relatedArticle.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
