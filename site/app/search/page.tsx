import { SearchView } from '@/components/SearchView';
import { getManifest } from '@/lib/articles';

export const metadata = { title: 'Search — Hendrixpedia' };

export default function SearchPage() {
  const { articles } = getManifest();
  return (
    <>
      <h2>Search</h2>
      <SearchView articles={articles} />
    </>
  );
}
