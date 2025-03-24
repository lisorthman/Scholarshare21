'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/DashboardHeader';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

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
          headers: {
            'Content-Type': 'application/json',
          },
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

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Header */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '20px',
        }}
      >
        <DashboardHeader onMenuClick={() => setIsSidebarVisible(!isSidebarVisible)} title={''} />
      </div>

      {/* Sidebar and Main Content Container */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative', // Added for sidebar positioning
        }}
      >
        {/* Sidebar with smooth animation */}
        <div
          style={{
            width: '250px',
            backgroundColor: '#ffffff',
            boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            zIndex: 10,
          }}
        >
          <Sidebar onLogout={handleLogout} />
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            overflowY: 'auto',
            marginLeft: isSidebarVisible ? '250px' : '0',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px',
              }}
            >
              Welcome, {user.name}!
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#555',
                lineHeight: '1.6',
                marginBottom: '30px',
              }}
            >
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
        </div>
      </div>
    </div>
  );
}