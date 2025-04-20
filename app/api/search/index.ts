import type { NextApiRequest, NextApiResponse } from 'next';
import client from '@/lib/elasticsearch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid search query' });
  }

  try {
    const { hits } = await client.search({
      index: 'research-papers',
      query: {
        multi_match: {
          query: q,
          fields: ['title^3', 'abstract', 'keywords', 'author'],
        },
      },
    });

    const results = hits.hits.map(hit => hit._source);
    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
}
