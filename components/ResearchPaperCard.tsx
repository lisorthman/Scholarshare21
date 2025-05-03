'use client';

import { ApiResearchPaper } from '@/types/research';
import { Download, ChevronRight, Edit2, Trash2 } from 'react-feather';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ResearchPaperCardProps {
  paper: ApiResearchPaper;
  onView?: (paperId: string) => void;
  onDeleteSuccess?: () => void;
}

// Default emoji for when category doesn't match
const DEFAULT_CATEGORY_EMOJI = '📄';

// Basic category emoji mapping (can be enhanced or made dynamic)
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
  onDeleteSuccess
}: ResearchPaperCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // Get category name - handles both direct string and populated object
  const categoryName = typeof paper.category === 'string' 
    ? paper.category 
    : paper.categoryDetails?.name || 'Uncategorized';

  // Get appropriate emoji for the category
  const categoryEmoji = CATEGORY_EMOJIS[categoryName] || DEFAULT_CATEGORY_EMOJI;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this research paper?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/researcher/uploads/${paper._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete paper');
      }

      toast.success('Paper deleted successfully');
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`p-6 rounded-xl border transition-all bg-white group ${
        isHovered ? 'border-blue-400 shadow-lg' : 'border-gray-200 shadow-md'
      }`}
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col space-y-4">
        {/* Header with title and status */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 leading-tight">
            {paper.title || 'Untitled Paper'}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
            paper.status === 'pending' 
              ? 'bg-amber-100 text-amber-900' 
              : paper.status === 'approved'
                ? 'bg-green-100 text-green-900'
                : 'bg-red-100 text-red-900'
          }`}>
            {paper.status === 'pending' 
              ? '⏳ Pending Review' 
              : paper.status === 'approved'
                ? '✅ Approved'
                : '❌ Rejected'}
          </span>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {categoryEmoji} {categoryName}
          </span>
          
          <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
            📦 {fileSizeMB} MB
          </span>
          
          <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
            📅 {formattedDate}
          </span>
        </div>

        {/* Abstract preview */}
        {paper.abstract && (
          <p className="text-gray-600 line-clamp-2 text-sm">
            {paper.abstract}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {onView && (
              <button
                onClick={() => onView(paper._id)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors group-hover:animate-pulse"
                disabled={isDeleting}
              >
                View Details
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            )}

            <Link
              href={`/researcher-dashboard/uploads/edit/${paper._id}`}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={14} className="text-gray-600" />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors shadow-sm"
            download
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}