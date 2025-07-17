'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LottieLoader from '@/components/ui/LottieLoader';

export default function ClientLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);
  return (
    <>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <LottieLoader size={500} />
        </div>
      )}
      {children}
    </>
  );
}
