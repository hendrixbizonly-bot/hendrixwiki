import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleToc, loadArticle, loadArticles, renderArticle, sectionName } from '@/lib/articles';

export async function generateStaticParams() {
  return loadArticles().map(article => ({ slug: article.slug.split('/') }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  return { title: article ? `${article.title} | Hendrixpedia` : 'Chapter | Hendrixpedia' };
}

export default function ArticlePage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  if (!article) notFound();

  const articles = loadArticles();
  const html = renderArticle(article, articles);
  const section = sectionName(article.section);
  const toc = getArticleToc(article.body);

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
              Part of <Link href={`/#${article.section}`}>{section}</Link> — {article.related.length} linked articles.
            </p>
            <p>{article.tags.length} tags · updated {article.updatedAt}</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
