import { redirect } from 'next/navigation';
import { loadArticles } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export default function RandomPage() {
  const articles = loadArticles();
  const pick = articles[Math.floor(Math.random() * articles.length)];
  redirect(`/a/${pick.slug}`);
}
