'use client';
import { useState, useEffect } from 'react';
import { generateCitation } from '@/lib/utils';

interface Props {
  title: string;
  authors: string[];
  year: number | string; // Allow both number and string
  publisher: string;
  doi?: string;
}

export default function PapersGenerateCitation({
  title,
  authors,
  year,
  publisher,
  doi,
}: Props) {
  const [style, setStyle] = useState<'APA' | 'MLA' | 'Chicago'>('APA');
  const [citation, setCitation] = useState('');

  useEffect(() => {
    // Debug the incoming props
    console.log('Citation Props:', { title, authors, year, publisher, doi });
    
    // Convert year to number if it's a valid year string
    const yearNum = typeof year === 'string' ? parseInt(year) : year;
    
    const generated = generateCitation({ 
      title: title || 'Untitled',
      authors: authors?.length ? authors : ['Unknown Author'],
      year: isNaN(yearNum) ? new Date().getFullYear() : yearNum,
      publisher: publisher || 'ScholarShare Platform',
      doi 
    }, style);
    
    setCitation(generated);
  }, [style, title, authors, year, publisher, doi]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="style" className="text-[#634141] font-medium">
          Select Citation Style:
        </label>
        <select 
          id="style" 
          value={style} 
          onChange={(e) => setStyle(e.target.value as 'APA' | 'MLA' | 'Chicago')}
          className="border rounded px-2 py-1 text-[#634141]"
        >
          <option value="APA">APA</option>
          <option value="MLA">MLA</option>
          <option value="Chicago">Chicago</option>
        </select>
      </div>

      <textarea 
        value={citation} 
        readOnly 
        rows={5} 
        className="w-full p-2 border rounded bg-white text-[#634141]"
      />
    </div>
  );
}
