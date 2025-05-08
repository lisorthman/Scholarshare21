'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Paper } from '@/types';
import PaperCarousel from '@/components/PaperCarousel';
import { PaperCard } from '@/components/PaperCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowUp } from 'lucide-react';
import styles from './search.module.scss';
import Link from 'next/link';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [didYouMean, setDidYouMean] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Group results by first letter of title
  const { alphabeticalResults, letters } = useMemo(() => {
    const grouped: Record<string, Paper[]> = {};
    
    const sorted = [...results].sort((a, b) => 
      a.title.localeCompare(b.title)
    );

    sorted.forEach(paper => {
      const firstLetter = paper.title[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(paper);
    });

    return {
      alphabeticalResults: grouped,
      letters: Object.keys(grouped).sort()
    };
  }, [results]);

  // Scroll to letter section
  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveLetter(letter);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
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

  

  // suggested searches
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

  // Filter papers by download count (for popular)
  const popularPapers = useMemo(() => 
    [...results]
      .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
      .slice(0, 10),
    [results]
  );

  // Filter papers by date (for recent)
  const recentPapers = useMemo(() => 
    [...results]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
    [results]
  );

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

      {loading ? (
        <div className={styles.loadingGrid}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className={styles.noResults}>
          <h2>No results found for "{query}"</h2>
          <p>Try different keywords or check your spelling</p>
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
          <section className={styles.carouselSection}>
            {popularPapers.length > 0 && (
              <PaperCarousel 
                title="Most Popular" 
                papers={popularPapers} 
                variant="popular"
              />
            )}

            {recentPapers.length > 0 && (
              <PaperCarousel 
                title="Recently Added" 
                papers={recentPapers} 
                variant="recent"
              />
            )}
          </section>

          <section className={styles.alphabeticalResults}>
            <h2>Browse All Results</h2>
            <div className={styles.lettersNav}>
              {letters.map(letter => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={`${styles.letterButton} ${
                    activeLetter === letter ? styles.active : ''
                  }`}
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
                      <PaperCard key={paper.id} paper={paper} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={styles.backToTop}
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </button>
        </>
      )}
    </div>
  );
}