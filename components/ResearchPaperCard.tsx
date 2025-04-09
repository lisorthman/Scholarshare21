import { ApiResearchPaper } from '@/types/research';

interface ResearchPaperCardProps {
  paper: ApiResearchPaper;
}

export default function ResearchPaperCard({ paper }: ResearchPaperCardProps) {
  // Safely handle missing paper or status
  if (!paper || !paper.status) {
    console.error('Invalid paper data:', paper);
    return <div className="p-4 border rounded-lg bg-red-50 text-red-600">Invalid paper data</div>;
  }

  const getStatusColor = () => {
    switch (paper.status.toLowerCase()) { // Case-insensitive check
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default: // Includes 'pending' and any unexpected values
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Safely format status text
  const formattedStatus = paper.status.length > 0 
    ? paper.status.charAt(0).toUpperCase() + paper.status.slice(1).toLowerCase()
    : 'Unknown';

  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold mb-1">{paper.title || 'Untitled Paper'}</h3>
        <p className="text-gray-600 mb-1">{paper.researchField || 'No field specified'}</p>
        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor()}`}>
          {formattedStatus}
        </span>
      </div>
      <div>
        <a 
          href={paper.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          View Paper
        </a>
      </div>
    </div>
  );
}