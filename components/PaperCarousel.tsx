'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Paper } from '@/types';
import { PaperCard } from './PaperCard';
import styles from './PaperCarousel.module.scss';

interface PaperCarouselProps {
  title: string;
  papers: Paper[];
  variant?: 'category' | 'recent' | 'popular';
}

export default function PaperCarousel({ 
  title, 
  papers, 
  variant = 'category' 
}: PaperCarouselProps) {
  if (papers.length < 2) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.header}>
          <h2>{title}</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          {papers.map((paper) => (
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
        modules={[Mousewheel, FreeMode]}
        freeMode={true}
        mousewheel={{ forceToAxis: true }}
        slidesPerView={'auto'}
        spaceBetween={-40}
        grabCursor={true}
        className={styles.swiper}
      >
        {papers.map((paper) => (
          <SwiperSlide key={paper.id}>
            <PaperCard paper={paper} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}