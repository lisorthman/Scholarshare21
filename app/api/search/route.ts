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
      index: 'scholar-share-search',
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'abstract', 'keywords', 'author'],
          fuzziness: 'AUTO',
        },
      },
    });

    const results = hits.hits.map((hit: any) => {
      const source = hit._source;

      return {
        id: hit._id,
        title: source.title,
        abstract: source.abstract,
        author: source.author || 'Anonymous',
        category: source.category || 'Uncategorized',
        keywords: source.keywords || [],
        createdAt: source.createdAt,
        uploadedAt: source.uploadedAt,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
