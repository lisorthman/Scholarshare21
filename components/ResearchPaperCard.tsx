import { ApiResearchPaper } from '@/types/research';
import { Download, ChevronRight } from 'react-feather';

interface ResearchPaperCardProps {
  paper: ApiResearchPaper;
  onView?: (paperId: string) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Computer Science': '💻',
  'Biology': '🧬',
  'Physics': '⚛️',
  'Chemistry': '🧪',
  'Engineering': '⚙️',
  'Mathematics': '🧮',
  'Medicine': '🏥',
  'Social Sciences': '🌐',
  'Other': '📄',
  'Uncategorized': '📌'
};

export default function ResearchPaperCard({ 
  paper, 
  onView
}: ResearchPaperCardProps) {
  if (!paper || !paper._id) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        ⚠️ Invalid paper data
      </div>
    );
  }

  const fileSizeMB = (paper.fileSize / (1024 * 1024)).toFixed(2);
  const formattedDate = new Date(paper.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      className="p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-all bg-white"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      <div className="flex flex-col space-y-4">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2 leading-tight">
            {paper.title || 'Untitled Paper'}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            paper.status === 'pending' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {paper.status === 'pending' ? '⏳ Pending' : paper.status.toUpperCase()}
          </span>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {CATEGORY_EMOJIS[paper.category] || '📌'} {paper.category || 'Uncategorized'}
          </span>
          
          <span className="flex items-center gap-1">
            📦 {fileSizeMB} MB
          </span>
          
          <span className="flex items-center gap-1">
            📅 {formattedDate}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button
            onClick={() => onView?.(paper._id)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
          >
            View details
            <ChevronRight 
              size={16} 
              className="transition-transform group-hover:translate-x-0.5" 
            />
          </button>
          
          <a
            href={paper.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}