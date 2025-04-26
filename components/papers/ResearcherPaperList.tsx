'use client';

import { useEffect, useState } from 'react';
import PaperCard from './PaperCard';
import { useSession } from 'next-auth/react';

export default function ResearcherPaperList() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchPapers = async () => {
      if (!session?.user?._id) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/researcher/papers?userId=${session.user._id}`);
        const data = await res.json();
        setPapers(data.papers);
      } catch (error) {
        console.error('Error fetching researcher papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [session]);

  if (loading) return <div>Loading your papers...</div>;
  
  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <PaperCard 
          key={paper._id} 
          paper={paper} 
          showStatus={true} 
        />
      ))}
      {papers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't submitted any papers yet</p>
        </div>
      )}
    </div>
  );
}