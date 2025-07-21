'use client';

import { useRouter } from 'next/navigation';
import { Paper } from '@/types'; // Adjust import if needed
import { Button } from '@/components/ui/Button'; // or replace with your own <button> if not using shadcn

type Props = {
  paper?: Paper;
};

export default function SupportPublisher({ paper }: Props) {
  const router = useRouter();

  const handleSupportClick = () => {
    if (paper) {
      router.push(`/donate?paperId=${paper.id}`);
    } else {
      router.push('/donate');
    }
  };

  return (
    <Button
      className="w-full bg-[#b08f6a] hover:bg-[#8a6c4f] text-white mt-2"
      onClick={handleSupportClick}
    >
      Support Publisher
    </Button>
  );
}
