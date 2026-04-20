import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadArticles, loadArticle, renderArticle, CATEGORY_NAMES } from '@/lib/articles';

export async function generateStaticParams() {
  return loadArticles().map(a => ({ slug: a.slug.split('/') }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const a = loadArticle(slug);
  return { title: a ? `${a.title} — Hendrixpedia` : 'Article — Hendrixpedia' };
}

export default function ArticlePage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const article = loadArticle(slug);
  if (!article) notFound();

  const articles = loadArticles();
  const html = renderArticle(article, articles);
  const catName = CATEGORY_NAMES[article.category] || article.category;

  return (
    <article>
      <div className="breadcrumbs">
        <Link href="/">Main</Link> ›{' '}
        <Link href={`/#${article.category}`}>{catName}</Link> ›{' '}
        <span>{article.title}</span>
      </div>
      <div className="article-meta">{article.type} · category: {article.category}</div>
      <h1 className="article-title">
        {article.title} <span className="edit">[edit in /Raw/context.md]</span>
      </h1>
      <div className="article" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
