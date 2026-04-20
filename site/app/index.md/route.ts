import { readMasterIndex } from '@/lib/articles';

export async function GET() {
  const md = readMasterIndex();
  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
