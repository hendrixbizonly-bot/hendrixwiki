import { SearchView } from '@/components/SearchView';
import { getManifest } from '@/lib/articles';

export const metadata = { title: 'Search - Hendrix Wiki' };

export default function SearchPage() {
  const { articles } = getManifest();

  return (
    <section>
      <header className="page-header secondary">
        <h1 className="page-title small">Search</h1>
        <p className="page-subtitle">Look up articles by title, category, or tags.</p>
      </header>
      <SearchView articles={articles} />
    </section>
  );
}
