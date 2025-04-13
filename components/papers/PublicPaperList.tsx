'use client';

import { useEffect, useState } from 'react';
import { fetchPapers } from '@/lib/api/papers';
import PaperCard from './PaperCard';

export default function PapersList({
  initialCategory = '',
  initialSearch = '',
}: {
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [papers, setPapers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPapers = async () => {
      setLoading(true);
      try {
        const data = await fetchPapers(pagination.page, search, category);
        setPapers(data.papers);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching papers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, [pagination.page, search, category]);

  return (
    <div>
      {/* Optional: Search and category filters UI can go here */}

      {loading ? (
        <div>Loading papers...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <PaperCard key={paper._id} paper={paper} />
          ))}
          {papers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No papers found</p>
            </div>
          )}
        </div>
      )}

      {/* Optional: Pagination controls */}
    </div>
  );
}
