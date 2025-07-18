'use client';
import { useState } from 'react';
import { Copy, Check, X, ArrowLeft } from 'lucide-react';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: {
    _id: string;
    title: string;
    authorDetails?: { name: string };
    createdAt: string;
  };
}

export default function CitationModal({ isOpen, onClose, paper }: CitationModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const generateCitation = (format: string) => {
    const authorName = paper.authorDetails?.name || 'Unknown Author';
    const title = paper.title || 'Untitled';
    const year = new Date(paper.createdAt).getFullYear();
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
                  by {paper.authorDetails?.name || 'Unknown Author'}
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
                <p className="text-[#634141]/60 text-sm">
                  Citations generated for ScholarShare Platform
                </p>
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