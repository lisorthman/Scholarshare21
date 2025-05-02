import { Download, ChevronRight } from 'react-feather';

interface ResearchPaper {
  _id: string;
  title?: string;
  abstract?: string;
  category?: {
    _id?: string;
    name?: string;
  };
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  authorId?: string;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ResearchPaperCardProps {
  paper: ResearchPaper;
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

const DEFAULT_CATEGORY = 'Uncategorized';

export default function ResearchPaperCard({ 
  paper, 
  onView 
}: ResearchPaperCardProps) {
  if (!paper?._id) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        ⚠️ Invalid paper data
      </div>
    );
  }

  // Safe property access with fallbacks
  const categoryName = paper.category?.name || DEFAULT_CATEGORY;
  const emoji = CATEGORY_EMOJIS[categoryName] || CATEGORY_EMOJIS[DEFAULT_CATEGORY];
  const title = paper.title || 'Untitled Paper';
  const status = paper.status?.toLowerCase() || 'pending';
  const fileSizeMB = paper.fileSize ? (paper.fileSize / (1024 * 1024)).toFixed(2) : '0.00';
  
  const formattedDate = paper.createdAt 
    ? new Date(paper.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Date not available';

  return (
    <div 
      className="p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-all bg-white"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      <div className="flex flex-col space-y-4">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2 leading-tight">
            {title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            status === 'pending' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status === 'pending' ? '⏳ Pending' : status.toUpperCase()}
          </span>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {emoji} {categoryName}
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
            aria-label="View paper details"
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
            aria-label="Download research paper"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}