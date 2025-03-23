'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar'; // Adjust the import path as needed
import Navbar from '@/components/Navbar'; // Adjust the import path as needed
import DashboardHeader from '@/components/DashboardHeader'; // Adjust the import path as needed


export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // State to control Sidebar visibility

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify the token using the API route
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
        console.log('Token verification response:', data); // Debugging log

        if (data.valid && data.user.role === 'admin') {
          setUser(data.user); // Set user data including the name
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
        <DashboardHeader onMenuClick={() => setIsSidebarVisible(!isSidebarVisible)} />
      </div>

      {/* Sidebar and Main Content Container */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden', // Prevent scrolling issues
        }}
      >
        {/* Sidebar */}
        {isSidebarVisible && (
          <div
            style={{
              width: '250px', // Fixed width for the sidebar
              backgroundColor: '#ffffff',
              boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            overflowY: 'auto', // Allow scrolling for main content
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
              As an admin, you have full access to manage the system. You can oversee users, manage content, and configure settings.
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