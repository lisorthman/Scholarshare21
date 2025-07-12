// lib/utils.ts

// Utility function for handling class names
export function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ');
}

// Function for generating citations in various styles (APA, MLA, Chicago)
export function generateCitation(data: {
  title: string;
  authors: string[];
  year: number;
  publisher: string;
  doi?: string;
}, style: 'APA' | 'MLA' | 'Chicago') {
  const authorsFormatted = data.authors.join(', ');

  switch (style) {
    case 'APA':
      return `${authorsFormatted} (${data.year}). *${data.title}*. ${data.publisher}. ${data.doi ?? ''}`.trim();
    case 'MLA':
      return `${authorsFormatted}. *${data.title}*. ${data.publisher}, ${data.year}. ${data.doi ?? ''}`.trim();
    case 'Chicago':
      return `${authorsFormatted}. *${data.title}*. ${data.publisher}, ${data.year}. ${data.doi ?? ''}`.trim();
    default:
      return '';
  }
}
