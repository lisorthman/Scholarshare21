import { Paper } from '@/types';
import React from 'react';
import Link from 'next/link';
import { UserIcon } from 'lucide-react';

const PaperCard: React.FC<{ paper: Paper }> = ({ paper }) => {
  return (
    <Link href={`/paper/${paper.id}`}> {/* ✅ Standardized route */}
      <div className="bg-[#f5f1e7] hover:bg-[#ece6da] transition rounded-2xl shadow-md p-6 w-[300px] flex-shrink-0">
        <h3 className="text-lg font-semibold mb-2 text-[#4e3f2d]">{paper.title}</h3>
        <p className="text-sm text-[#5c5143] mb-4">{paper.abstract.slice(0, 120)}...</p>
        <div className="flex items-center gap-2 text-[#7b6a57] mb-2">
          <UserIcon className="w-4 h-4" />
          <span className="text-sm">{paper.author}</span>
        </div>
        <div className="text-xs text-[#4e3f2d]">
          {paper.keywords.join(', ')} {/* ✅ Comma-separated keywords */}
        </div>
      </div>
    </Link>
  );
};

export default PaperCard;
