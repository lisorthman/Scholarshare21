import React from 'react';
import { ResearchPaperDocument } from '@/models/ResearchPaper';

interface GenerateCitationProps {
  paper: ResearchPaperDocument;
  citationStyle?: 'apa' | 'mla' | 'chicago' | 'ieee';
}

const GenerateCitation: React.FC<GenerateCitationProps> = ({ 
  paper, 
  citationStyle = 'apa' 
}) => {
  const formatAuthor = (author: any) => {
    if (!author) return 'Unknown Author';
    if (typeof author === 'string') return author;
    return author.name || 'Unknown Author';
  };

  const generateCitation = () => {
    const author = formatAuthor(paper.author);
    const year = new Date(paper.createdAt).getFullYear();
    const title = paper.title;
    const version = paper.version ? ` (Version ${paper.version})` : '';

    switch (citationStyle) {
      case 'apa':
        return `${author}. (${year}). ${title}${version}.`;
      case 'mla':
        return `${author}. "${title}"${version}, ${year}.`;
      case 'chicago':
        return `${author}. ${year}. "${title}"${version}.`;
      case 'ieee':
        return `${author}, "${title}"${version}, ${year}.`;
      default:
        return `${author}. (${year}). ${title}${version}.`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCitation())
      .then(() => alert('Citation copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">
        {citationStyle.toUpperCase()} Citation
      </h3>
      <div className="bg-gray-50 p-3 rounded mb-3">
        <pre className="whitespace-pre-wrap text-sm">
          {generateCitation()}
        </pre>
      </div>
      <div className="flex justify-between items-center">
        <select
          value={citationStyle}
          onChange={(e) => citationStyle = e.target.value as any}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="apa">APA</option>
          <option value="mla">MLA</option>
          <option value="chicago">Chicago</option>
          <option value="ieee">IEEE</option>
        </select>
        <button
          onClick={copyToClipboard}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Copy Citation
        </button>
      </div>
    </div>
  );
};

export default GenerateCitation;