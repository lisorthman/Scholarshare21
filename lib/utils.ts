// lib/utils.ts

// Utility function for handling class names
export function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

// Interface for citation data
interface CitationData {
  _id: string;
  title: string;
  authors?: string[];
  createdAt: string;
  category?: string;
}

// Function for generating citations in various styles (APA, MLA, Chicago)
export function generateCitation(data: CitationData, style: 'APA' | 'MLA' | 'Chicago') {
  // Validate required data
  if (!data) {
    return 'Invalid paper data';
  }

  // Data validation with actual database fields
  const title = data.title || 'Untitled';
  const researcher = Array.isArray(data.authors) && data.authors.length > 0 
    ? data.authors[0] 
    : 'Unknown Author';
  const year = data.createdAt && !isNaN(new Date(data.createdAt).getTime()) 
    ? new Date(data.createdAt).getFullYear() 
    : 'N/A';
  const publisher = 'ScholarShare Platform';
  const category = data.category || 'Research Paper';
  const paperId = data._id || '';

  // Format year display for citation styles
  const yearDisplay = year === 'N/A' ? 'n.d.' : year;

  // Only include URL if paperId exists
  const urlSuffix = paperId 
    ? `. https://scholarshare.com/papers/${paperId}` 
    : '';

  switch (style) {
    case 'APA':
      return `${researcher} (${yearDisplay}). ${title} [${category}]. ${publisher}${urlSuffix}`.trim();
    case 'MLA':
      return `${researcher}. "${title}." ${category}, ${publisher}, ${yearDisplay}${paperId ? `, scholarshare.com/papers/${paperId}` : ''}`.trim();
    case 'Chicago':
      return `${researcher}. "${title}." ${category}. ${publisher}, ${yearDisplay}${urlSuffix}`.trim();
    default:
      return 'Invalid citation format';
  }
}
