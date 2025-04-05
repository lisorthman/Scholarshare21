'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
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
          setFormData({
            name: data.user.name,
            bio: data.user.bio || ''
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

  const handleSave = () => {
    // Add save functionality here
    setEditMode(false);
    alert('Profile updated successfully!');
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px' }}>My Profile</h1>
          {editMode ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} style={primaryButtonStyle}>
                Save
              </button>
              <button onClick={() => setEditMode(false)} style={secondaryButtonStyle}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditMode(true)} style={primaryButtonStyle}>
              Edit Profile
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#555',
              marginBottom: '20px'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button style={secondaryButtonStyle}>
              Change Photo
            </button>
          </div>

          <div style={{ flex: 2 }}>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    style={{ ...inputStyle, minHeight: '100px' }}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{user.name}</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>{user.email}</p>
                {formData.bio && (
                  <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                    <p>{formData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Account Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p style={{ color: '#666', marginBottom: '5px' }}>Member Since</p>
              <p>January 2023</p>
            </div>
            <div>
              <p style={{ color: '#666', marginBottom: '5px' }}>Last Login</p>
              <p>2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const primaryButtonStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '10px 20px',
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

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '16px',
};