'use client';

import { ApiResearchPaper } from '@/types/research';
import { Download, ChevronRight, Edit2, Trash2 } from 'react-feather';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ResearchPaperCardProps {
  paper: ApiResearchPaper;
  onView?: (paperId: string) => void;
  onDelete?: (paperId: string) => void; // optional callback to update UI after delete
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
  onView,
  onDelete
}: ResearchPaperCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEdit = () => {
    router.push(`/researcher/edit/${paper._id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this research paper?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/researcher/uploads/${paper._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Delete failed: ${errorData.error || 'Unknown error'}`);
        setIsDeleting(false);
        return;
      }

      if (onDelete) onDelete(paper._id);
    } catch (err) {
      console.error('Delete error:', err);
      alert('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="flex gap-3">
            <button
              onClick={() => onView?.(paper._id)}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
            >
              View
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-800 transition-colors"
              disabled={isDeleting}
            >
              <Edit2 size={14} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors"
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>

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
