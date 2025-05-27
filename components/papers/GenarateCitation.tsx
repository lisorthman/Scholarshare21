'use client';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Paper {
  _id: string;
  title: string;
  authors?: string[] | Array<{ name: string }>;
  createdAt: string;
  year?: number;
  publisher?: string;
  version?: string;
  doi?: string;
}

export default function GenerateCitation({ paper }: { paper: Paper }) {
  const [style, setStyle] = useState<'APA' | 'MLA' | 'Chicago'>('APA');
  const [citation, setCitation] = useState('');

  const formatAuthor = (author: string | { name: string } | undefined): string => {
    if (!author) return 'Unknown Author';
    if (typeof author === 'string') return author;
    return author.name || 'Unknown Author';
  };

  const generateCitation = () => {
    // Use paper.authors instead of undefined 'authors' variable
    const authors = paper.authors || ['Unknown Author'];
    const author = formatAuthor(authors[0]);
    const year = paper.year || new Date(paper.createdAt).getFullYear();
    const title = paper.title;
    const version = paper.version ? ` (Version ${paper.version})` : '';
    const publisher = paper.publisher || '';
    const doi = paper.doi || '';

    switch (style) {
      case 'APA':
        return `${author}. (${year}). ${title}${version}. ${publisher}${doi ? ` https://doi.org/${doi}` : ''}`;
      case 'MLA':
        return `${author}. "${title}"${version}. ${publisher}, ${year}${doi ? `, https://doi.org/${doi}` : ''}.`;
      case 'Chicago':
        return `${author}. ${year}. "${title}"${version}. ${publisher}${doi ? `. https://doi.org/${doi}` : ''}`;
      default:
        return `${author}. (${year}). ${title}${version}. ${publisher}${doi ? ` https://doi.org/${doi}` : ''}`;
    }
  };

  useEffect(() => {
    setCitation(generateCitation());
  }, [style, paper]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-medium mb-2">Citation</h3>
      <select
        value={style}
        onChange={(e) => setStyle(e.target.value as any)}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="APA">APA</option>
        <option value="MLA">MLA</option>
        <option value="Chicago">Chicago</option>
      </select>
      <div className="p-2 bg-gray-50 rounded text-sm">
        {citation}
      </div>
    </div>
  );
}