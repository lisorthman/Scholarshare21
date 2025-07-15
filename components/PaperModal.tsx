// components/PaperModal.tsx
'use client';

import { useEffect } from 'react';
import { Paper } from '@/types';
import styles from './PaperModal.module.scss';
import { X } from 'lucide-react';

interface PaperModalProps {
  paper: Paper | null;
  open: boolean;
  onClose: () => void;
}

export default function PaperModal({ paper, open, onClose }: PaperModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!paper) return null;

  const isPDF = 
    paper.fileType?.toLowerCase() === 'application/pdf' ||
    paper.fileUrl?.toLowerCase().endsWith('.pdf');

  const formattedDate = paper.createdAt
    ? new Date(paper.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unknown';

  const formattedSize = paper.fileSize
    ? `${(paper.fileSize / 1024).toFixed(1)} KB`
    : '302';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

        <div className={styles.content}>
          <div className={styles.previewSection}>
            {isPDF ? (
              <iframe 
                src={paper.fileUrl} 
                title="Paper Preview" 
                width="100%" 
                height="100%"
                style={{ border: 'none' }}
                onError={(e) => console.error('PDF preview failed:', e)} 
                />
            ) : (
              <div className={styles.fallback}>
                <p>Preview not available for this file type.</p>
                <p>Please download to view the full content.</p>
              </div>
            )}
          </div>

          <div className={styles.detailsSection}>
            <h2>{paper.title}</h2>
            <p className={styles.abstract}>{paper.abstract}</p>
            <p><strong>Author:</strong> {paper.author || 'Anonymous'}</p>
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Category:</strong> {paper.category || 'Uncategorized'}</p>
            <p><strong>File Size:</strong> {formattedSize}</p>

            {paper.keywords?.length > 0 && (
              <div className={styles.keywords}>
                <strong>Keywords:</strong>
                {paper.keywords.map((kw, idx) => (
                  <span key={idx} className={styles.keyword}>{kw}</span>
                ))}
              </div>
            )}

            <div className={styles.buttons}>
              <a href={paper.fileUrl} target="_blank" rel="noopener" download>
                <button>Download</button>
              </a>
              <button>Wishlist</button>
              <button>Cite</button>
              <form action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="paperId" value={paper.id} />
                <button type="submit">Support</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
