'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import { Paper } from '@/types';
import { PaperCard } from './PaperCard';
import styles from './PaperCarousel.module.scss';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaperCarouselProps {
  title: string;
  papers: Paper[];
  variant?: 'category' | 'recent' | 'popular';
  isLoading?: boolean;
}

export default function PaperCarousel({ 
  title, 
  papers = [], 
  variant = 'category',
  isLoading = false
}: PaperCarouselProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort papers based on variant
  const sortedPapers = [...papers].sort((a, b) => {
    if (variant === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (variant === 'popular') {
      return (b.downloads ?? 0) - (a.downloads ?? 0);
    }
    return 0;
  });

  // Navigation handlers
  const goNext = () => {
    if (swiperInstance) swiperInstance.slideNext();
  };

  const goPrev = () => {
    if (swiperInstance) swiperInstance.slidePrev();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.header}>
          <h2>{title}</h2>
        </div>
        <div className={styles.loadingState}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  // Fallback layout if insufficient papers
  if (sortedPapers.length < 2) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.header}>
          <h2>{title}</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          {sortedPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
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
      
      <Swiper
        modules={[Mousewheel, FreeMode, Navigation]}
        freeMode={true}
        mousewheel={{ 
          forceToAxis: true,
          releaseOnEdges: true // Better touch support
        }}
        slidesPerView={'auto'}
        spaceBetween={-40}
        grabCursor={true}
        className={styles.swiper}
        onSwiper={setSwiperInstance}
        touchEventsTarget="container" // Better touch handling
        touchRatio={0.5} // More sensitive touch
        resistanceRatio={0} // Disable elastic pull
      >
        {sortedPapers.map((paper) => (
          <SwiperSlide key={paper.id}>
            <PaperCard paper={paper} />
          </SwiperSlide>
        ))}

        {/* Custom navigation buttons */}
        {!isMobile && (
          <>
            <button 
              onClick={goPrev}
              className={`${styles.navButton} prev`}
              aria-label="Previous papers"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={goNext}
              className={`${styles.navButton} next`}
              aria-label="Next papers"
            >
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </Swiper>
    </div>
  );
}