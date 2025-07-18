'use client';

import Link from "next/link";
import { Download, ChevronRight, Clock, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, X, ArrowLeft } from 'lucide-react';

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
  downloads?: number;
  views?: number;
}

interface PaperCardProps {
  paper: Paper;
  showStatus?: boolean;
}

function CitationModal({ isOpen, onClose, paper }: { isOpen: boolean, onClose: () => void, paper: Paper }) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const generateCitation = (format: string) => {
    const authorName = paper.author?.name || 'Unknown Author';
    const title = paper.title || 'Untitled';
    const year = paper.createdAt ? new Date(paper.createdAt).getFullYear() : 'n.d.';
    const publisher = 'ScholarShare Platform';
    
    switch (format) {
      case 'APA':
        return `${authorName} (${year}). ${title}. ${publisher}.`;
      case 'MLA':
        return `${authorName}. "${title}." ${publisher}, ${year}.`;
      case 'Chicago':
        return `${authorName}. "${title}." ${publisher}. ${year}.`;
      default:
        return '';
    }
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header with Back Button */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 mt-1"
                title="Back to Papers"
              >
                <ArrowLeft className="w-5 h-5 text-[#634141]" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-[#634141] mb-2">
                  Citation Formats
                </h2>
                <h3 className="text-lg text-[#634141]/80 font-medium">
                  {paper.title}
                </h3>
                <p className="text-[#634141]/60 text-sm">
                  by {paper.author?.name || 'Unknown Author'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Close"
            >
              <X className="w-5 h-5 text-[#634141]" />
            </button>
          </div>

          {/* Citation Formats */}
          <div className="space-y-6">
            {['APA', 'MLA', 'Chicago'].map((format) => (
              <div key={format} className="border border-[#634141]/20 rounded-lg p-4 hover:border-[#634141]/40 transition-colors duration-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#634141] mb-3 text-lg">
                      {format} Format
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-[#634141]/80 text-sm leading-relaxed break-words">
                        {generateCitation(format)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateCitation(format), format)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      copiedFormat === format 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-[#634141] text-white hover:bg-[#634141]/90'
                    }`}
                  >
                    {copiedFormat === format ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="mt-8 pt-6 border-t border-[#634141]/20">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 text-[#634141] border border-[#634141] rounded-lg hover:bg-[#634141]/10 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Papers
              </button>
              <div className="flex items-center gap-4">
                
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#634141] text-white rounded-lg hover:bg-[#634141]/90 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaperCard({ paper, showStatus = false }: PaperCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      // Call API to increment download count
      await fetch(`/api/papers/${paper._id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Download the file
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

  const handleView = async () => {
    try {
      // Call API to increment view count
      await fetch(`/api/papers/${paper._id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  return (
    <>
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
            {paper.downloads !== undefined && (
              <div className="flex items-center text-sm text-[#5D4037]">
                <Download className="w-4 h-4 mr-1" />
                {paper.downloads} downloads
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
                onClick={handleView}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#5D4037] bg-[#EFEBE9] rounded-lg hover:bg-[#D7CCC8] transition-colors"
              >
                <span>View</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setShowCitationModal(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-[#5D4037] rounded-lg hover:bg-[#3E2723] transition-colors"
              >
                <span>Citation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <CitationModal 
        isOpen={showCitationModal} 
        onClose={() => setShowCitationModal(false)} 
        paper={paper} 
      />
    </>
  );
}