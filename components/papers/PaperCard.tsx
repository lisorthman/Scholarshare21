import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  isSaved?: boolean;
  onSaveToggle?: () => Promise<void>;
}

export default function PaperCard({
  paper,
  showStatus = false,
  isSaved = false,
  onSaveToggle,
}: PaperCardProps) {
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSaveToggle) {
      await onSaveToggle();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
            {paper.category.replace("-", " ")}
          </span>

          {showStatus && paper.status && (
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
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
                {new Date(paper.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {onSaveToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveClick}
                aria-label={isSaved ? "Unsave paper" : "Save paper"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            )}

            <Link
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
