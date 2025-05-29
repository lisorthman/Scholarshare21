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
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.categoryBadge}>
          {paper.category.replace(/-/g, " ")}
        </span>

        {showStatus && paper.status && (
          <span style={{
            ...styles.statusBadge,
            ...(paper.status === "approved" ? styles.statusApproved : 
                paper.status === "rejected" ? styles.statusRejected : 
                styles.statusPending)
          }}>
            {paper.status}
          </span>
        )}
      </div>

      <div style={styles.cardBody}>
        <h3 style={styles.title}>{paper.title}</h3>

        {paper.abstract && (
          <p style={styles.abstract}>{paper.abstract}</p>
        )}

        <div style={styles.footer}>
          <div style={styles.metaInfo}>
            {paper.author?.name && (
              <span style={styles.author}>By {paper.author.name}</span>
            )}
            {paper.createdAt && (
              <span style={styles.date}>
                {new Date(paper.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>

          <div style={styles.actions}>
            <button
              style={styles.iconButton}
              onClick={handleWishlistClick}
              disabled={isDownloading}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlisted ? (
                <Heart style={{...styles.icon, ...styles.wishlistActive}} />
              ) : (
                <Heart style={{...styles.icon, ...styles.wishlistInactive}} />
              )}
            </button>

            <button
              style={styles.iconButton}
              onClick={handleSaveClick}
              disabled={isDownloading}
              aria-label={isSaved ? "Unsave paper" : "Save paper"}
            >
              {isSaved ? (
                <BookmarkCheck style={{...styles.icon, ...styles.saveActive}} />
              ) : (
                <Bookmark style={{...styles.icon, ...styles.saveInactive}} />
              )}
            </button>

            <button
              style={styles.iconButton}
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Download paper"
            >
              <Download style={{
                ...styles.icon,
                ...(isDownloading ? styles.downloading : styles.download)
              }} />
            </button>

            <Link
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.textButton}
            >
              View
            </Link>

            <Link 
              href={`/papers/${paper._id}`}
              style={{...styles.textButton, ...styles.citationButton}}
            >
              Citation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: '1px solid #D7CCC8',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#FFF',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
      borderColor: '#A1887F',
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  categoryBadge: {
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#5D4037',
    backgroundColor: '#EFEBE9',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  statusBadge: {
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  statusApproved: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    color: '#F57F17',
    backgroundColor: '#FFF8E1',
  },
  statusRejected: {
    color: '#C62828',
    backgroundColor: '#FFEBEE',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#3E2723',
    margin: '0',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  abstract: {
    fontSize: '15px',
    color: '#5D4037',
    margin: '0',
    lineHeight: '1.6',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #EFEBE9',
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  author: {
    fontSize: '14px',
    color: '#5D4037',
  },
  date: {
    fontSize: '12px',
    color: '#8D6E63',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#EFEBE9',
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  icon: {
    width: '20px',
    height: '20px',
  },
  wishlistInactive: {
    color: '#8D6E63',
    ':hover': {
      color: '#D32F2F',
    },
  },
  wishlistActive: {
    color: '#D32F2F',
    fill: '#D32F2F',
  },
  saveInactive: {
    color: '#8D6E63',
    ':hover': {
      color: '#F57C00',
    },
  },
  saveActive: {
    color: '#F57C00',
    fill: '#F57C00',
  },
  download: {
    color: '#8D6E63',
    ':hover': {
      color: '#0288D1',
    },
  },
  downloading: {
    color: '#BCAAA4',
    animation: 'pulse 1.5s infinite',
  },
  textButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5D4037',
    backgroundColor: 'transparent',
    border: '1px solid #D7CCC8',
    borderRadius: '6px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#EFEBE9',
      borderColor: '#A1887F',
    },
  },
  citationButton: {
    color: '#5D4037',
    backgroundColor: '#EFEBE9',
    border: 'none',
    ':hover': {
      backgroundColor: '#D7CCC8',
    },
  },
};