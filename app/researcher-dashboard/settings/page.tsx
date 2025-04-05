'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import type { User } from '@/types/user';

export default function ResearcherSettings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
          setUser(data.user);
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

  const handleSave = async () => {
    // Implement save functionality
    alert('Settings saved successfully!');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Settings">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        width: '100%',
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Research Account Settings</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Notification Preferences</h2>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Email Notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Dark Mode
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Research Preferences</h2>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Primary Research Field</label>
              <input
                type="text"
                value={user.researchField || ''}
                onChange={(e) => setUser({...user, researchField: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter your research field"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Institution</label>
              <input
                type="text"
                value={user.institution || ''}
                onChange={(e) => setUser({...user, institution: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter your institution"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
        >
          Save Changes
        </button>
      </div>
    </DashboardLayout>
  );
}