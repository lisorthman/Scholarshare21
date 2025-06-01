'use client';

import Link from "next/link";
import { Bookmark, BookmarkCheck, Download, Heart } from "lucide-react";
import { useState } from "react";

interface Paper {
  _id: string;
  title: string;
  abstract?: string;
  category: string;
  fileUrl: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: Date;
  author?: {
    name?: string;
    email?: string;
  };
}

interface PaperCardProps {
  paper: Paper;
  showStatus?: boolean;
  initialSaved?: boolean;
  initialWishlisted?: boolean;
  onSaveToggle?: (paperId: string, newState: boolean) => Promise<void>;
  onWishlistToggle?: (paperId: string, newState: boolean) => Promise<void>;
}

export default function PaperCard({
  paper,
  showStatus = false,
  initialSaved = false,
  initialWishlisted = false,
  onSaveToggle,
  onWishlistToggle,
}: PaperCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      if (onSaveToggle) {
        await onSaveToggle(paper._id, newSavedState);
      }
    } catch (error) {
      setIsSaved(!isSaved);
      console.error("Failed to toggle save:", error);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const newWishlistState = !isWishlisted;
      setIsWishlisted(newWishlistState);
      if (onWishlistToggle) {
        await onWishlistToggle(paper._id, newWishlistState);
      }
    } catch (error) {
      setIsWishlisted(!isWishlisted);
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      const response = await fetch(paper.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="border border-[#D7CCC8] rounded-xl p-6 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#A1887F]">
      <div className="flex justify-between items-center mb-4">
        <span className="px-3 py-1.5 text-sm font-semibold text-[#5D4037] bg-[#EFEBE9] rounded-full capitalize">
          {paper.category.replace(/-/g, " ")}
        </span>

        {showStatus && paper.status && (
          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize ${
            paper.status === "approved" ? "text-[#2E7D32] bg-[#E8F5E9]" :
            paper.status === "rejected" ? "text-[#C62828] bg-[#FFEBEE]" :
            "text-[#F57F17] bg-[#FFF8E1]"
          }`}>
            {paper.status}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-[#3E2723] line-clamp-2">
          {paper.title}
        </h3>

        {paper.abstract && (
          <p className="text-[#5D4037] line-clamp-3">{paper.abstract}</p>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#EFEBE9]">
          <div className="flex flex-col gap-1">
            {paper.author?.name && (
              <span className="text-sm text-[#5D4037]">By {paper.author.name}</span>
            )}
           
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-[#EFEBE9] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleWishlistClick}
              disabled={isDownloading}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "text-[#D32F2F] fill-[#D32F2F]" : "text-[#8D6E63] hover:text-[#D32F2F]"}`} />
            </button>

            <button
              className="p-2 rounded-md hover:bg-[#EFEBE9] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSaveClick}
              disabled={isDownloading}
              aria-label={isSaved ? "Unsave paper" : "Save paper"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-[#F57C00] fill-[#F57C00]" />
              ) : (
                <Bookmark className="w-5 h-5 text-[#8D6E63] hover:text-[#F57C00]" />
              )}
            </button>

            <button
              className="p-2 rounded-md hover:bg-[#EFEBE9] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Download paper"
            >
              <Download className={`w-5 h-5 ${isDownloading ? "text-[#BCAAA4] animate-pulse" : "text-[#8D6E63] hover:text-[#0288D1]"}`} />
            </button>

            <Link
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-[#5D4037] bg-transparent border border-[#D7CCC8] rounded-md hover:bg-[#EFEBE9] hover:border-[#A1887F]"
            >
              View
            </Link>

            <Link 
              href={`/papers/${paper._id}`}
              className="px-4 py-2 text-sm font-medium text-[#5D4037] bg-[#EFEBE9] rounded-md hover:bg-[#D7CCC8]"
            >
              Citation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}