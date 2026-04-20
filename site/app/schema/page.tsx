import { readSchema } from '@/lib/articles';

export const metadata = { title: 'Schema — Hendrixpedia' };

export default function SchemaPage() {
  const schema = readSchema();
  return (
    <>
      <h2>Wiki schema</h2>
      <p className="muted">Writing conventions, frontmatter format, and linking rules.</p>
      <pre className="raw">{schema}</pre>
    </>
  );
}
