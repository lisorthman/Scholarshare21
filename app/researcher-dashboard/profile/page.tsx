'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { UserRole } from '@/types/user';

export default function ResearcherProfile() {
  const router = useRouter();
  const [user, setUser] = useState<{ 
    name: string; 
    email: string; 
    role: string;
    institution?: string;
    researchField?: string;
    publications?: number;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.user.role === 'researcher') {
          // Add mock research data for demo
          setUser({
            ...data.user,
            role: data.user.role as 'admin' | 'researcher' | 'user', // Ensure role matches the User type
            institution: data.user.institution || 'University of Research',
            researchField: data.user.researchField || 'Computer Science',
            publications: data.user.publications || 12,
          });
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
      }
    };

    verifyToken();
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Profile">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '30px',
            fontSize: '36px',
            color: '#555'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>{user.name}</h1>
            <p style={{ color: '#666', marginBottom: '5px' }}>{user.email}</p>
            <p style={{ color: '#0070f3', fontWeight: '500' }}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Research Information</h2>
            <p style={{ marginBottom: '10px' }}><strong>Institution:</strong> {user.institution}</p>
            <p style={{ marginBottom: '10px' }}><strong>Research Field:</strong> {user.researchField}</p>
            <p><strong>Publications:</strong> {user.publications}</p>
          </div>

          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Account Details</h2>
            <p style={{ marginBottom: '10px' }}><strong>Email:</strong> {user.email}</p>
            <p style={{ marginBottom: '10px' }}><strong>Account Type:</strong> Researcher</p>
            <p><strong>Member Since:</strong> January 2023</p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Recent Activity</h2>
          <div style={{ marginBottom: '10px' }}>
            <p><strong>Last Login:</strong> 2 hours ago</p>
            <p><strong>Last Paper Upload:</strong> 3 days ago</p>
          </div>
          <button
            style={{
              backgroundColor: 'transparent',
              color: '#0070f3',
              border: '1px solid #0070f3',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0070f3';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#0070f3';
            }}
          >
            View Full Activity
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}