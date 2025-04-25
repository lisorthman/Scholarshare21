// app/api/search/route.ts
import { NextResponse } from 'next/server';
import client from '@/lib/elasticsearch';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const { hits } = await client.search({
      index: 'research-papers',
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'abstract', 'keywords', 'author'],
          fuzziness: 'AUTO',
        },
      },
    });

    const results = hits.hits.map((hit: any) => ({
      id: hit._id, // <-- Include the Elasticsearch ID
      ...hit._source, // <-- Merge the rest of the data
    }));
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
