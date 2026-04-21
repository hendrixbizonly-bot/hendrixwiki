import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORY_NAMES, loadArticle, loadArticles, renderArticle } from '@/lib/articles';

export async function generateStaticParams() {
  return loadArticles().map(article => ({ slug: article.slug.split('/') }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  return { title: article ? `${article.title} - Hendrix Wiki` : 'Article - Hendrix Wiki' };
}

export default function ArticlePage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  if (!article) notFound();

  const articles = loadArticles();
  const html = renderArticle(article, articles);
  const catName = CATEGORY_NAMES[article.category] || article.category;

  return (
    <article className="article-page">
      <div className="breadcrumbs">
        <Link href="/">Main page</Link> {'>'} <Link href={`/#${article.category}`}>{catName}</Link> {'>'} <span>{article.title}</span>
      </div>
      <div className="article-meta">
        {article.type} | category: {article.category} | updated {article.updatedAt}
      </div>
      <h1 className="article-title">{article.title}</h1>
      <p className="article-note">
        This page is rendered from <code>/wiki/articles/{article.slug}.md</code>. If the meaning changes, update <Link href="/raw">Raw</Link> and regenerate the wiki.
      </p>
      <div className="article" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
