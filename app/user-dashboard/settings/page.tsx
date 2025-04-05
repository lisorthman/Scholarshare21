'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

export default function UserSettings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    newsletter: true
  });

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
        if (data.valid && data.user.role === 'user') {
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

  const handleSave = () => {
    // Add save functionality here
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
        <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Account Settings</h1>
        
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            Notification Preferences
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              />
              <span style={checkboxLabel}>Email Notifications</span>
            </label>
            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={settings.newsletter}
                onChange={(e) => setSettings({...settings, newsletter: e.target.checked})}
              />
              <span style={checkboxLabel}>Monthly Newsletter</span>
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            Display Preferences
          </h2>
          <label style={checkboxContainer}>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
            />
            <span style={checkboxLabel}>Dark Mode</span>
          </label>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            Account Security
          </h2>
          <button style={secondaryButtonStyle}>
            Change Password
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
          <button onClick={handleSave} style={primaryButtonStyle}>
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

const checkboxContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
};

const checkboxLabel = {
  fontSize: '16px',
};

const primaryButtonStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  color: '#0070f3',
  border: '1px solid #0070f3',
  borderRadius: '6px',
  padding: '10px 20px',
  cursor: 'pointer',
};