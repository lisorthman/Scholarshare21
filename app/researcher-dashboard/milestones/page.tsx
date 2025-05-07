'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

interface ResearchMilestone {
  _id: string;
  title: string;
  abstract?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  createdAt: string;
  updatedAt: string;
  readerStats?: {
    [key: string]: any;
  };
}

export default function MilestonePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [milestones, setMilestones] = useState<ResearchMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyTokenAndFetchMilestones = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify token');
        }

        const data = await response.json();
        if (data.valid && data.user.role === 'researcher') {
          setUser(data.user);
          await fetchResearchPapers(data.user._id);
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    verifyTokenAndFetchMilestones();
  }, []);

  const fetchResearchPapers = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/papers?authorId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch research papers');
      }
      const data = await res.json();
      setMilestones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research papers');
      setMilestones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      fetchResearchPapers(user._id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'pending':
        return { bg: '#fff3e0', text: '#f57c00' };
      case 'rejected':
        return { bg: '#ffebee', text: '#c62828' };
      default:
        return { bg: '#f5f5f5', text: '#666666' };
    }
  };

  if (!user) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Loading...</p>
    </div>
  );

  return (
    <DashboardLayout user={user} defaultPage="Milestones">
      <div style={{
        marginTop: '50px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px' 
        }}>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Research Paper Milestones</h1>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px' 
          }}>
            <p>Loading research papers...</p>
          </div>
        ) : error ? (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff3f3', 
            borderRadius: '10px',
            color: '#d32f2f' 
          }}>
            <p>{error}</p>
            <button 
              onClick={handleRefresh}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: '#fff',
                border: '1px solid #d32f2f',
                color: '#d32f2f',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : !Array.isArray(milestones) || milestones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px'
          }}>
            <p style={{ color: '#666', marginBottom: '16px' }}>No research papers uploaded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {milestones.map((paper) => {
              if (!paper) return null;
              const statusColor = getStatusColor(paper.status);
              return (
                <div
                  key={paper._id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '10px',
                    border: '1px solid #eee',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{paper.title}</h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '14px',
                      backgroundColor: statusColor.bg,
                      color: statusColor.text
                    }}>
                      {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                    </span>
                  </div>

                  {paper.abstract && (
                    <p style={{ 
                      margin: '10px 0', 
                      color: '#666',
                      fontSize: '14px' 
                    }}>
                      {paper.abstract.length > 200 
                        ? `${paper.abstract.substring(0, 200)}...` 
                        : paper.abstract}
                    </p>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <div>
                      <div>Category: {paper.category}</div>
                      <div>File: {paper.fileName}</div>
                      <div>Size: {(paper.fileSize / 1024).toFixed(2)} KB</div>
                    </div>
                    <div>
                      <div>Uploaded: {new Date(paper.createdAt).toLocaleDateString()}</div>
                      <div>Last Updated: {new Date(paper.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}