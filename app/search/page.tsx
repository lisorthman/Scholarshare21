'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Paper } from '@/types';
import PaperCarousel from '@/components/PaperCarousel';
import {PaperCard} from '@/components/PaperCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/badge';
import styles from './search.module.scss';

const trackEvent = (category: string, action: string, label: string) => {
  console.log(`Tracking: ${category} - ${action} - ${label}`);
  // Replace with your analytics implementation
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [didYouMean, setDidYouMean] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  useEffect(() => {
    if (results.length === 0 && !loading && query) {
      trackEvent('Search', 'NoResults', query);
    }
  }, [results, loading, query]);

  const suggestedSearches = useMemo(() => {
    if (!query) return [];
    const baseQuery = query.length > 15 ? query.substring(0, 15) + '...' : query;
    return [
      `"${baseQuery}" in title`,
      `author:"${baseQuery}"`,
      `category:"${baseQuery}"`,
      `related to ${baseQuery}`
    ];
  }, [query]);

  const { alphabeticalResults, letters } = useMemo(() => {
    const grouped: Record<string, Paper[]> = {};
    const sorted = [...results].sort((a, b) => a.title.localeCompare(b.title));
    
    sorted.forEach(paper => {
      const firstLetter = paper.title[0].toUpperCase();
      grouped[firstLetter] = [...(grouped[firstLetter] || []), paper];
    });

    return {
      alphabeticalResults: grouped,
      letters: Object.keys(grouped).sort()
    };
  }, [results]);

  const fetchResults = async () => {
    if (!query) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      setResults(data.results || []);
      setDidYouMean(data.suggestedQuery || '');
      
    } catch (error) {
      console.error('Search fetch error:', error);
      setResults([]);
      setDidYouMean('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, [query]);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveLetter(letter);
  };

  if (loading) {
    return (
      <div className={styles.searchPage}>
        <header className={styles.searchHeader}>
          <h1>Search Results for "{query}"</h1>
        </header>
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} className={styles.skeletonCard} height="320px" />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchPage}>
      <header className={styles.searchHeader}>
        <h1>Search Results for "{query}"</h1>
        {results.length > 0 && (
          <Badge className={styles.resultCount}>
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </Badge>
        )}
      </header>

      {results.length === 0 ? (
        <div className={styles.noResults}>
          <h2>No results found for "{query}"</h2>
          
          {didYouMean && (
            <div className={styles.didYouMean}>
              Did you mean: {' '}
              <Link href={`/search?q=${encodeURIComponent(didYouMean)}`}>
                {didYouMean}
              </Link>?
            </div>
          )}

          <div className={styles.suggestions}>
            <h3>Try these instead:</h3>
            <ul>
              {suggestedSearches.map((search, i) => (
                <li key={i}>
                  <Link href={`/search?q=${encodeURIComponent(search)}`}>
                    {search}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.searchTips}>
            <h3>Search tips:</h3>
            <ul>
              <li>Try different keywords</li>
              <li>Check your spelling</li>
              <li>Use more general terms</li>
              <li>Search by author name or category</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <PaperCarousel 
            title="Most Popular" 
            papers={results.slice().sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0)).slice(0, 10)} 
            variant="popular" 
          />

          <PaperCarousel 
            title="Recently Added" 
            papers={results.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)} 
            variant="recent" 
          />

          <section className={styles.alphabeticalResults}>
            <h2>Browse All Results</h2>
            <div className={styles.lettersNav}>
              {letters.map(letter => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={`${styles.letterButton} ${activeLetter === letter ? styles.active : ''}`}
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className={styles.resultsGrid}>
              {letters.map(letter => (
                <div key={letter} id={`letter-${letter}`} className={styles.letterSection}>
                  <h3 className={styles.letterHeading}>{letter}</h3>
                  <div className={styles.papersGrid}>
                    {alphabeticalResults[letter].map(paper => (
                      <PaperCard key={paper.id} paper={{ ...paper, author: paper.author }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}