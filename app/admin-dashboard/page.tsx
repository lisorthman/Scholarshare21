'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
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
        if (data.valid && data.user.role === 'admin') {
          setUser(data.user);
        } else {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/signin');
      }
    };

    verifyToken();
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
          Welcome, {user.name}!
        </h1>
        <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6', marginBottom: '30px' }}>
          As an admin, you have full access to manage the system.
        </p>
        <button
          style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
        >
          Manage System
        </button>
      </div>
    </DashboardLayout>
  );
}