import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categoryName, loadArticle, loadArticles, renderArticle, sectionName } from '@/lib/articles';

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
  const cluster = categoryName(article.category);

  return (
    <article className="article-page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link> {'>'} <Link href={`/#${article.section}`}>{section}</Link> {'>'} <span>{article.title}</span>
      </div>
      <div className="article-meta">
        {section} | {article.type} | updated {article.updatedAt}
      </div>
      <h1 className="article-title">{article.title}</h1>
      <p className="article-note">
        This chapter is rendered from <code>/wiki/articles/{article.slug}.md</code>. On the site it belongs to{' '}
        {section}; on disk it lives in the internal {cluster} cluster so the archive stays readable for both people and models.
      </p>
      <div className="article" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
