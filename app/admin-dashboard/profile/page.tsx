'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

export default function AdminProfile() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        if (data.valid && data.user.role === 'admin') {
          setAdmin(data.user);
          setFormData({
            name: data.user.name,
            email: data.user.email,
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
    // In a real app, you would call your API to save changes
    alert('Profile updated successfully!');
    setEditMode(false);
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <DashboardLayout user={admin} defaultPage="Profile">
      <div style={{ marginTop: '20px', maxWidth: '800px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '28px' }}>Admin Profile</h1>
          {editMode ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} style={primaryButtonStyle}>
                Save Changes
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

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
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
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <button style={secondaryButtonStyle}>
                Change Photo
              </button>
            </div>

            <div style={{ flex: 2 }}>
              {editMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name*</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email*</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={inputStyle}
                      required
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
                  <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{admin.name}</h2>
                  <p style={{ color: '#666', marginBottom: '20px' }}>{admin.email}</p>
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
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Admin Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ color: '#666', marginBottom: '5px' }}>Role</p>
                <p>Administrator</p>
              </div>
              <div>
                <p style={{ color: '#666', marginBottom: '5px' }}>Member Since</p>
                <p>January 2022</p>
              </div>
              <div>
                <p style={{ color: '#666', marginBottom: '5px' }}>Last Login</p>
                <p>Today at 10:30 AM</p>
              </div>
              <div>
                <p style={{ color: '#666', marginBottom: '5px' }}>Account Status</p>
                <p style={{ color: '#2e7d32' }}>Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '16px'
};

const primaryButtonStyle = {
  backgroundColor: '#0070f3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer'
};

const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  color: '#0070f3',
  border: '1px solid #0070f3',
  borderRadius: '6px',
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer'
};