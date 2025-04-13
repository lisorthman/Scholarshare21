'use client';

import { useState } from 'react';
import PaperCard from './PaperCard';

interface Paper {
  _id: string;
  title: string;
  abstract?: string;
  keywords: string[];
  category: string;
  fileUrl: string;
  // Add other paper properties as needed
}

export default function PapersSearch({ initialPapers }: { initialPapers: Paper[] }) {
  const [papers, setPapers] = useState(initialPapers);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = papers.filter(paper => 
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (paper.abstract && paper.abstract.toLowerCase().includes(searchQuery.toLowerCase())) ||
    paper.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search papers by title, abstract or keywords..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredPapers.length} of {papers.length} papers
      </div>

      {/* Papers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPapers.map((paper) => (
          <PaperCard key={paper._id} paper={paper} />
        ))}
      </div>

      {/* Empty State */}
      {filteredPapers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No papers found matching your search</p>
        </div>
      )}
    </div>
  );
}