'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Paper = {
  title: string;
  abstract: string;
  keywords: string[];
  author: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-red-500">No results found for "{query}"</p>
      ) : (
        results.map((paper, index) => (
          <div key={index} className="mb-6 border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{paper.title}</h2>
            <p className="text-gray-700 mt-1">{paper.abstract}</p>
            <div className="text-sm text-gray-500 mt-2">
              <p><strong>Author:</strong> {paper.author}</p>
              <p><strong>Keywords:</strong> {paper.keywords.join(', ')}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
