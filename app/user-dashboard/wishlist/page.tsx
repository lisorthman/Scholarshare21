'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  image: string;
  savedDate: string;
}

export default function UserWishlist() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

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
          // Mock wishlist data - replace with actual API call
          setWishlist([
            {
              id: '1',
              title: 'Advanced Research Methods',
              description: 'Comprehensive guide to modern research techniques',
              image: '/placeholder-book.jpg',
              savedDate: '2023-05-15'
            },
            {
              id: '2',
              title: 'Data Analysis Toolkit',
              description: 'Essential tools for data processing and visualization',
              image: '/placeholder-book.jpg',
              savedDate: '2023-06-02'
            },
            {
              id: '3',
              title: 'Academic Writing Masterclass',
              description: 'Improve your paper writing skills',
              image: '/placeholder-book.jpg',
              savedDate: '2023-06-10'
            }
          ]);
          setLoading(false);
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

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  if (!user) return <p>Loading...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Wishlist">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px' }}>My Wishlist</h1>
          <p style={{ color: '#666' }}>{wishlist.length} items</p>
        </div>

        {loading ? (
          <p>Loading wishlist items...</p>
        ) : wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Your wishlist is empty</p>
            <button 
              style={{
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/resources')}
            >
              Browse Resources
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {wishlist.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                border: '1px solid #eee',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#f5f5f5',
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                
                <div style={{ flex: 1, padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>{item.description}</p>
                  <p style={{ color: '#888', fontSize: '12px' }}>Saved on {item.savedDate}</p>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ff4444',
                      border: '1px solid #ff4444',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      // ':hover' pseudo-class is not supported in inline styles
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}