'use client';

import { useState } from 'react';
import { Paper } from '@/types';

export function usePaperModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const openModal = (paper: Paper) => {
    setSelectedPaper(paper);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPaper(null);
  };

  return { isOpen, selectedPaper, openModal, closeModal };
}
