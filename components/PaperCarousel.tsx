'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Paper } from '@/types';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { User2 } from 'lucide-react';
import { Mousewheel } from 'swiper/modules';
import PaperCard from './PaperCard'; // ✅ Use fallback with your existing card

interface PaperCarouselProps {
  title: string;
  papers: Paper[];
}

export default function PaperCarousel({ title, papers }: PaperCarouselProps) {
  const router = useRouter();

  // Fallback layout if fewer than 2 papers
  if (papers.length < 2) {
    return (
      <div className="my-12 px-4">
        <h2 className="text-2xl font-bold mb-4 text-[#5B4B36]">{title}</h2>
        <div className="flex gap-4 flex-wrap">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-12 px-4">
      <h2 className="text-2xl font-bold mb-4 text-[#5B4B36]">{title}</h2>
      <Swiper
        spaceBetween={20}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
        modules={[Mousewheel]}
        className="pb-4"
      >
        {papers.map((paper) => (
          <SwiperSlide key={paper.id}>
            <div
              onClick={() => router.push(`/paper/${paper.id}`)} // ✅ Fixed routing
              className="p-4 rounded-2xl bg-[#F5F1EB] hover:shadow-xl transition cursor-pointer h-full"
            >
              <h3 className="text-lg font-semibold text-[#3C2F2F] mb-1">{paper.title}</h3>
              <p className="text-sm text-[#6B5E53] line-clamp-3 mb-2">{paper.abstract}</p>

              <div className="flex items-center gap-2 text-sm text-[#4F433D] mb-2">
                <User2 size={16} />
                <span>{paper.author}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {paper.keywords.map((kw, i) => (
                  <Badge key={i} className="bg-[#B4A28C] text-white">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
