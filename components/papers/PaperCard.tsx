'use client';

import Link from "next/link";
import { Download, ChevronRight, Clock, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

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
  estimatedReadingTime?: number;
  downloadCount?: number;
}

interface PaperCardProps {
  paper: Paper;
  showStatus?: boolean;
}

export default function PaperCard({
  paper,
  showStatus = false,
}: PaperCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

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
    <motion.div 
      className="border border-[#D7CCC8] rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-[#A1887F] group"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="px-3 py-1.5 text-xs font-medium text-[#5D4037] bg-[#EFEBE9] rounded-full capitalize tracking-wide">
          {paper.category.replace(/-/g, " ")}
        </span>

        {showStatus && paper.status && (
          <span className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize ${
            paper.status === "approved" ? "text-[#2E7D32] bg-[#E8F5E9]" :
            paper.status === "rejected" ? "text-[#C62828] bg-[#FFEBEE]" :
            "text-[#F57F17] bg-[#FFF8E1]"
          }`}>
            {paper.status}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-[#3E2723] line-clamp-2 group-hover:text-[#0288D1] transition-colors">
          {paper.title}
        </h3>

        {paper.abstract && (
          <p className="text-[#5D4037] line-clamp-3">{paper.abstract}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-2">
          {paper.author?.name && (
            <div className="flex items-center text-sm text-[#5D4037]">
              <User className="w-4 h-4 mr-1" />
              {paper.author.name}
            </div>
          )}
          {paper.estimatedReadingTime && (
            <div className="flex items-center text-sm text-[#5D4037]">
              <Clock className="w-4 h-4 mr-1" />
              {paper.estimatedReadingTime} min read
            </div>
          )}
          {paper.downloadCount !== undefined && (
            <div className="flex items-center text-sm text-[#5D4037]">
              <Download className="w-4 h-4 mr-1" />
              {paper.downloadCount} downloads
            </div>
          )}
        </div>

        <div className="flex justify-end items-center mt-4 pt-4 border-t border-[#EFEBE9]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDownloading 
                  ? "text-[#BCAAA4] bg-[#EFEBE9]" 
                  : "text-[#5D4037] hover:text-[#0288D1] hover:bg-[#E3F2FD]"
              }`}
              aria-label="Download paper"
            >
              <Download className={`w-4 h-4 ${isDownloading ? "animate-pulse" : ""}`} />
              {isDownloading ? "Downloading..." : "Download"}
            </button>

            <Link
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#5D4037] bg-[#EFEBE9] rounded-lg hover:bg-[#D7CCC8] transition-colors"
            >
              <span>View</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link 
              href={`/papers/${paper._id}`}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-[#5D4037] rounded-lg hover:bg-[#3E2723] transition-colors"
            >
              <span>Citation</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}