'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

interface Milestone {
  _id: string;
  title: string;
  description?: string;
  date: string;
  progress?: number;
  status: 'pending' | 'completed';
}

export default function MilestonePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
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

        const data = await response.json();
        if (data.valid && data.user.role === 'researcher') {
          setUser(data.user);
          fetchMilestones(data.user._id);
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    verifyTokenAndFetchMilestones();
  }, [router]);

  const fetchMilestones = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/milestones?userId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch milestones');
      }
      const data = await res.json();
      setMilestones(data);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      fetchMilestones(user._id);
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
          <h1 style={{ fontSize: '28px', margin: 0 }}>Research Milestones</h1>
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
            <p>Loading milestones...</p>
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
        ) : milestones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px'
          }}>
            <p style={{ color: '#666', marginBottom: '16px' }}>No milestones found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {milestones.map((milestone) => (
              <div
                key={milestone._id}
                style={{
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '10px',
                  border: '1px solid #eee',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{milestone.title}</h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '14px',
                    backgroundColor: milestone.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                    color: milestone.status === 'completed' ? '#2e7d32' : '#f57c00'
                  }}>
                    {milestone.status}
                  </span>
                </div>

                {milestone.description && (
                  <p style={{ 
                    margin: '10px 0', 
                    color: '#666',
                    fontSize: '14px' 
                  }}>
                    {milestone.description}
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
                  <span>Date: {new Date(milestone.date).toLocaleDateString()}</span>
                  {milestone.progress !== undefined && (
                    <div style={{ flex: 1, marginLeft: '20px' }}>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#eee',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${milestone.progress}%`,
                          height: '100%',
                          backgroundColor: '#4caf50',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ 
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '5px',
                        display: 'block',
                        textAlign: 'right'
                      }}>
                        Progress: {milestone.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}