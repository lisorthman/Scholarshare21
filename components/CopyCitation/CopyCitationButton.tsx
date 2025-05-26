'use client';

import { useState } from 'react';

interface CopyCitationButtonProps {
  citation: string;
}

export default function CopyCitationButton({ citation }: CopyCitationButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        backgroundColor: '#634141',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(99, 65, 65, 0.2)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#795858';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#634141';
      }}
    >
      {copied ? 'Copied!' : 'Copy Citation'}
    </button>
  );
}