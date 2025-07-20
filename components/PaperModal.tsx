// components/PaperModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Paper } from '@/types';
import styles from './PaperModal.module.scss';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CitationModal from './CitationModal';

interface PaperModalProps {
  paper: Paper | null;
  open: boolean;
  onClose: () => void;
}

export default function PaperModal({ paper, open, onClose }: PaperModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showCitationModal, setShowCitationModal] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSupportClick = () => {
    if (!paper) return;
    if (!session) {
      router.push(`/signin?callbackUrl=/donate?paperId=${paper.id}`);
    } else {
      router.push(`/donate?paperId=${paper.id}`);
    }
  };

  const handleCiteClick = () => {
    setShowCitationModal(true);
  };

  const handleCloseCitationModal = () => {
    setShowCitationModal(false);
  };

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
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(paper.fileUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = paper.title || 'paper';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert('Download failed.');
                  }
                }}
              >
                Download
              </button>
              <button>Wishlist</button>
              <button onClick={handleCiteClick}>Cite</button>
              <button onClick={handleSupportClick}>Support Publisher</button>
            </div>
          </div>
        </div>
      </div>

      {/* Citation Modal */}
      {paper && (
        <CitationModal
          isOpen={showCitationModal}
          onClose={handleCloseCitationModal}
          paper={{
            _id: paper.id,
            title: paper.title,
            authorDetails: { name: paper.author || 'Unknown Author' },
            createdAt: typeof paper.createdAt === 'string' ? paper.createdAt : paper.createdAt?.toISOString?.() || ''
          }}
        />
      )}
    </div>
  );

}

