'use client';

// Swiper imports removed
import { Paper } from '@/types';
import { PaperCard } from './PaperCard';
import styles from './PaperCarousel.module.scss';

interface PaperCarouselProps {
  title: string;
  papers: Paper[];
  variant?: 'category' | 'recent' | 'popular';
  onCardClick?: (paper: Paper) => void;
}

export default function PaperCarousel({ 
  title, 
  papers, 
  variant = 'category' ,
  onCardClick
}: PaperCarouselProps) {
  if (papers.length < 2) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.header}>
          <h2>{title}</h2>
        </div>
        <div className={styles.flexCarousel}>
          {papers.map((paper, idx) => (
            <div
              key={paper.id}
              className={styles.flexCard}
              onClick={() => onCardClick?.(paper)}
              style={{ zIndex: idx }}
            >
              <PaperCard paper={paper} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>
      <div className={styles.flexCarousel}>
        {papers.map((paper, idx) => (
          <div
            key={paper.id}
            className={styles.flexCard}
            onClick={() => onCardClick?.(paper)}
            style={{ zIndex: papers.length - idx }}
          >
            <PaperCard paper={paper} />
          </div>
        ))}
      </div>
    </div>
  );
}

