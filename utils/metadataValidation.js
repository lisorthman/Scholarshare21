// utils/metadataValidation.js
export function validateMetadata(paper) {
  const issues = [];

  if (!paper.title || paper.title.length < 10) {
    issues.push('Title missing or too short');
  }
  if (!paper.abstract || paper.abstract.split(' ').length < 50) {
    issues.push('Abstract missing or too short (<50 words)');
  }
  if (!paper.keywords || paper.keywords.length < 3) {
    issues.push('Fewer than 3 keywords provided');
  }
  if (!paper.fileUrl || !paper.fileUrl.endsWith('.pdf')) {
    issues.push('Invalid file format (must be PDF)');
  }

  return issues;
}