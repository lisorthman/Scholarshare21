'use client';
import { useState } from 'react';
import { Heart, MessageCircle, Eye, Share2, MoreVertical, Trash2, Check, X, Quote } from 'lucide-react';
import CitationModal from '../CitationModal';

interface Paper {
  _id: string;
  title: string;
  abstract: string;
  fileUrl?: string;
  fileName?: string;
  authorDetails?: {
    name: string;
  };
  createdAt: string;
  status?: string;
  category?: string;
  reviews?: Array<any>;
  ratings?: Array<any>;
  views?: number;
  likes?: Array<any>;
}

interface PaperCardProps {
  paper: Paper;
  showAdminActions?: boolean;
  showResearcherActions?: boolean;
  onApprove?: (paperId: string) => void;
  onReject?: (paperId: string) => void;
  onDelete?: (paperId: string) => void;
}

export default function PaperCard({ 
  paper, 
  showAdminActions = false, 
  showResearcherActions = false,
  onApprove,
  onReject,
  onDelete
}: PaperCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(paper._id);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(paper._id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(paper._id);
    }
  };

  const handleCitationClick = () => {
    setShowCitationModal(true);
  };

  const averageRating = paper.ratings && paper.ratings.length > 0 
    ? paper.ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / paper.ratings.length 
    : 0;

  const truncatedAbstract = paper.abstract?.length > 120 
    ? `${paper.abstract.substring(0, 120)}...` 
    : paper.abstract;

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#634141] mb-2 line-clamp-2 leading-tight">
              {paper.title}
            </h3>
            <p className="text-sm text-[#634141]/70 mb-2">
              by {paper.authorDetails?.name || 'Unknown Author'}
            </p>
            {paper.category && (
              <span className="inline-block px-2 py-1 bg-[#634141]/10 text-[#634141] text-xs rounded-full">
                {paper.category}
              </span>
            )}
          </div>
          {showResearcherActions && (
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Abstract */}
        <div className="mb-4">
          <p className="text-[#634141]/80 text-sm leading-relaxed">
            {showMore ? paper.abstract : truncatedAbstract}
          </p>
          {paper.abstract && paper.abstract.length > 120 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-[#634141] text-sm font-medium mt-2 hover:underline"
            >
              {showMore ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-[#634141]/60">
          {paper.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{paper.views}</span>
            </div>
          )}
          {paper.reviews && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{paper.reviews.length}</span>
            </div>
          )}
          {paper.likes && (
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{paper.likes.length}</span>
            </div>
          )}
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span>{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                isLiked 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">Like</span>
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>

            {/* Citation Button */}
            <button
              onClick={handleCitationClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90 transition-colors duration-200"
            >
              <Quote className="w-4 h-4" />
              <span className="text-sm">Cite</span>
            </button>
          </div>

          {/* Admin Actions */}
          {showAdminActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">Approve</span>
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Reject</span>
              </button>
            </div>
          )}

          {/* Researcher Actions */}
          {showResearcherActions && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </button>
          )}
        </div>

        {/* Status Badge */}
        {paper.status && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              paper.status === 'approved' ? 'bg-green-100 text-green-800' :
              paper.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Citation Modal */}
      <CitationModal
        isOpen={showCitationModal}
        onClose={() => setShowCitationModal(false)}
        paper={paper}
      />
    </>
  );
}