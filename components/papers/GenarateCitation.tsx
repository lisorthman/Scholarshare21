'use client';
import { useState, useEffect } from 'react';
import { generateCitation } from '@/lib/utils';

interface Props {
  title: string;
  authors: string[];
  year: number;
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
    const generated = generateCitation({ title, authors, year, publisher, doi }, style);
    setCitation(generated);
  }, [style, title, authors, year, publisher, doi]);

  return (
    <div>
      <label htmlFor="style">Select Citation Style:</label>
      <select id="style" value={style} onChange={(e) => setStyle(e.target.value as any)}>
        <option value="APA">APA</option>
        <option value="MLA">MLA</option>
        <option value="Chicago">Chicago</option>
      </select>

      <textarea value={citation} readOnly rows={5} style={{ width: '100%', marginTop: '1rem' }} />
    </div>
  );
}
