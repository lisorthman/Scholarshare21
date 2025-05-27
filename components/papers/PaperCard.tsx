'use client';

import Link from "next/link";
import { Bookmark, BookmarkCheck, Download, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full capitalize">
            {paper.category.replace(/-/g, " ")}
          </span>

          {showStatus && paper.status && (
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                paper.status === "approved"
                  ? "text-green-700 bg-green-100"
                  : paper.status === "rejected"
                  ? "text-red-700 bg-red-100"
                  : "text-yellow-700 bg-yellow-100"
              }`}
            >
              {paper.status}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2 line-clamp-2">{paper.title}</h3>

        {paper.abstract && (
          <p className="text-gray-600 mb-4 line-clamp-3">{paper.abstract}</p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {paper.author?.name && <span>By {paper.author.name}</span>}
            {paper.createdAt && (
              <span className="block text-xs">
                {new Date(paper.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {/* Wishlist Button - Now properly showing */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistClick}
              disabled={isDownloading}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlisted ? (
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              ) : (
                <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
              )}
            </Button>

            {/* Save Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveClick}
              disabled={isDownloading}
              aria-label={isSaved ? "Unsave paper" : "Save paper"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              ) : (
                <Bookmark className="h-5 w-5 text-gray-600 hover:text-yellow-500" />
              )}
            </Button>

            {/* Download Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Download paper"
            >
              <Download className={`h-5 w-5 ${isDownloading ? 'text-gray-400 animate-pulse' : 'text-gray-600 hover:text-blue-500'}`} />
            </Button>

            {/* View Button */}
            <Button asChild variant="ghost" size="sm" className="text-red-900 hover:text-red-700">
              <Link
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </Link>
            </Button>

            {/* Citation Button */}
            <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              <Link href={`/papers/${paper._id}`}>
                Citation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}