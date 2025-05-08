'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { MilestoneProgress } from '@/types/milestone';

export default function MilestonePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Verify user
        const authRes = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const userData = await authRes.json();
        if (!userData.valid) {
          throw new Error('Invalid token');
        }

        setUser(userData.user);

        // Fetch milestones
        const milestonesRes = await fetch(`/api/milestones?userId=${userData.user._id}`);
        if (!milestonesRes.ok) {
          throw new Error('Failed to fetch milestones');
        }

        const milestonesData = await milestonesRes.json();
        setMilestones(milestonesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

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
        <h1 style={{ fontSize: '28px', marginBottom: '30px', color: '#1a237e' }}>
          Research Milestones
        </h1>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', padding: '20px' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {milestones.map((milestone) => (
              <div
                key={milestone._id}
                style={{
                  padding: '20px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h3 style={{ margin: 0, color: '#1a237e' }}>{milestone.title}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {milestone.achievedRewards.map((reward, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '15px',
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          fontSize: '14px'
                        }}
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={{ margin: '10px 0', color: '#666' }}>
                  {milestone.description}
                </p>

                <div style={{ marginTop: '15px' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        width: `${milestone.progress}%`,
                        height: '100%',
                        backgroundColor: '#3f51b5',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '5px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}