'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PaperCard from '@/components/papers/PaperCard';
import CategoryFilter from '@/components/category/CategoryFilter';
import { User } from '@/types/user';

export default function UserPapersDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [savedPapers, setSavedPapers] = useState<any[]>([]);
  const [recommendedPapers, setRecommendedPapers] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'recommended' | 'recent'>('all');
  const [loading, setLoading] = useState({
    papers: true,
    saved: true,
    recommended: true,
    recent: true
  });
  const [error, setError] = useState('');

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/me');
        const data = await res.json();

        if (!data?.user) {
          router.push('/login');
          return;
        }

        const userObj: User = {
          _id: data.user._id,
          name: data.user.name || 'Anonymous',
          email: data.user.email,
          role: data.user.role,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt
        };

        setUser(userObj);
        fetchAllData(userObj._id);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchAllData = async (userId: string) => {
    try {
      const papersParams = new URLSearchParams();
      if (category) papersParams.append('category', category);
      if (searchQuery) papersParams.append('search', searchQuery);

      const [papersRes, savedRes, recommendedRes, recentRes] = await Promise.all([
        fetch(`/api/papers?${papersParams.toString()}`),
        fetch(`/api/user/saved-papers?userId=${userId}`),
        fetch(`/api/recommendations?userId=${userId}`),
        fetch(`/api/user/recently-viewed?userId=${userId}`)
      ]);

      const [papersData, savedData, recommendedData, recentData] = await Promise.all([
        papersRes.json(),
        savedRes.json(),
        recommendedRes.json(),
        recentRes.json()
      ]);

      setPapers(papersData.papers || []);
      setSavedPapers(savedData.papers || []);
      setRecommendedPapers(recommendedData.papers || []);
      setRecentlyViewed(recentData.papers || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading({ papers: false, saved: false, recommended: false, recent: false });
    }
  };

  const handleSavePaper = async (paperId: string) => {
    try {
      if (!user?._id) return;

      const res = await fetch('/api/user/save-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, paperId }),
      });

      if (res.ok) {
        const savedRes = await fetch(`/api/user/saved-papers?userId=${user._id}`);
        const savedData = await savedRes.json();
        setSavedPapers(savedData.papers);
      }
    } catch (err) {
      console.error('Error saving paper:', err);
    }
  };

  const getPapersToDisplay = () => {
    switch (activeTab) {
      case 'saved': return savedPapers;
      case 'recommended': return recommendedPapers;
      case 'recent': return recentlyViewed;
      default: return papers;
    }
  };

  const isLoading = Object.values(loading).some(Boolean);

  if (!user) return <p>Loading user data...</p>;

  return (
    <DashboardLayout user={user}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
          Research Papers Collection
        </h1>

        <CategoryFilter 
          activeCategory={category || ''}
          searchQuery={searchQuery || ''}
        />

        <div style={{
          display: 'flex',
          gap: '10px',
          margin: '20px 0',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          {['all', 'saved', 'recommended', 'recent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                ...tabButtonStyle,
                ...(activeTab === tab ? activeTabStyle : {})
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Papers
            </button>
          ))}
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '200px', background: '#eee', borderRadius: '8px' }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '30px'
            }}>
              {getPapersToDisplay().map((paper) => (
                <PaperCard 
                  key={paper._id} 
                  paper={paper}
                  isSaved={savedPapers.some(p => p._id === paper._id)}
                  onSaveToggle={() => handleSavePaper(paper._id)}
                />
              ))}
            </div>

            {getPapersToDisplay().length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 0',
                color: '#555'
              }}>
                {{
                  all: 'No papers found matching your criteria',
                  saved: 'You have no saved papers yet',
                  recommended: 'No recommendations available yet',
                  recent: 'No recently viewed papers'
                }[activeTab]}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

const tabButtonStyle = {
  padding: '10px 20px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
};

const activeTabStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  fontWeight: '600',
};
