import { readSchema } from '@/lib/articles';

export const metadata = { title: 'Schema - Hendrix Wiki' };

export default function SchemaPage() {
  const schema = readSchema();

  return (
    <section>
      <header className="page-header secondary">
        <h1 className="page-title small">Wiki schema</h1>
        <p className="page-subtitle">Writing conventions, frontmatter format, and linking rules.</p>
      </header>
      <pre className="raw">{schema}</pre>
    </section>
  );
}
