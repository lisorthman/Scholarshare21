// app/search/page.tsx
'use client';

import '@/app/globals.css';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Paper } from '@/types';
import PaperCarousel from '@/components/PaperCarousel';
import PaperCard from '@/components/PaperCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search fetch error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const trendingPapers = results.slice(0, 4);
  const editorsChoice = results.slice(4, 8);
  const remaining = results.slice(8);

  return (
    <div className="min-h-screen bg-[#fdfaf4] px-6 py-10">
      <h1 className="text-3xl font-bold text-[#5B4B36] mb-6">Search Results for "{query}"</h1>

      {loading ? (
        <p className="text-[#5B4B36]">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-[#5B4B36]">No results found.</p>
      ) : (
        <>
          {trendingPapers.length > 0 && (
            <PaperCarousel title="Trending Papers" papers={trendingPapers} />
          )}

          {editorsChoice.length > 0 && (
            <PaperCarousel title="Editor's Choice" papers={editorsChoice} />
          )}

          {remaining.length > 0 && (
            <div className="mt-12 px-2">
              <h2 className="text-2xl font-semibold text-[#5B4B36] mb-4">More Results</h2>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {remaining.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
