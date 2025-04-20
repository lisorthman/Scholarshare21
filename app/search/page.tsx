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

  useEffect(() => {
    if (query) {
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => setResults(data.results || []));
    }
  }, [query]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      {results.map((paper, index) => (
        <div key={index} className="mb-6 border p-4 rounded">
          <h2 className="text-xl font-semibold">{paper.title}</h2>
          <p className="text-gray-700">{paper.abstract}</p>
          <p className="text-sm text-gray-500">Author: {paper.author}</p>
          <p className="text-sm text-gray-400">Keywords: {paper.keywords.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}
