'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import Rating from '@/components/Rating';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  rating?: number;
  averageRating?: number;
  downloadCount: number;
}

export default function UserWishlist() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Verify token and get user data
        const verifyResponse = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const verifyData = await verifyResponse.json();
        if (!verifyData.valid || verifyData.user.role !== 'user') {
          router.push('/unauthorized');
          return;
        }

        setUser(verifyData.user);

        // Fetch user's wishlist
        const wishlistResponse = await fetch('/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setWishlist(wishlistData);
        } else {
          console.error('Failed to fetch wishlist');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const removeFromWishlist = async (paperId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/wishlist/${paperId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        setWishlist(wishlist.filter(item => item.id !== paperId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleDownload = async (paperId: string, title: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/papers/${paperId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRating = async (paperId: string, rating: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/papers/${paperId}/rate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        // Update the local state to reflect the new rating
        const responseData = await response.json();
        setWishlist(wishlist.map(paper => 
          paper.id === paperId 
            ? { ...paper, rating, averageRating: responseData.averageRating } 
            : paper
        ));
      }
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <DashboardLayout user={user} defaultPage="Wishlist">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Research Paper Wishlist</h1>
          <p className="item-count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="empty-state">
            <p>You haven't saved any research papers yet</p>
            <button 
              className="browse-button"
              onClick={() => router.push('/papers')}
            >
              Browse Research Papers
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((paper) => (
              <div key={paper.id} className="paper-card">
                <div className="paper-thumbnail">
                  {paper.thumbnailUrl ? (
                    <img src={paper.thumbnailUrl} alt={paper.title} />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <span>Research Paper</span>
                    </div>
                  )}
                </div>
                
                <div className="paper-details">
                  <h3 onClick={() => router.push(`/papers/${paper.id}`)} className="paper-title">
                    {paper.title}
                  </h3>
                  <p className="paper-authors">{paper.authors.join(', ')}</p>
                  <p className="paper-abstract">{paper.abstract.substring(0, 150)}...</p>
                  <p className="paper-meta">
                    Published: {new Date(paper.publicationDate).toLocaleDateString()} • 
                    Downloads: {paper.downloadCount}
                  </p>
                  
                  <div className="paper-rating">
                    <Rating 
                      value={paper.rating} 
                      average={paper.averageRating} 
                      onChange={(rating) => handleRating(paper.id, rating)} 
                    />
                  </div>
                </div>
                
                <div className="paper-actions">
                  <button 
                    onClick={() => handleDownload(paper.id, paper.title)}
                    className="download-button"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(paper.id)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .wishlist-container {
          background-color: #ffffff;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
        }
        
        .wishlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .wishlist-header h1 {
          font-size: 28px;
          margin: 0;
        }
        
        .item-count {
          color: #666;
          font-size: 16px;
        }
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 40px 0;
        }
        
        .empty-state p {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .browse-button {
          background-color:#725454;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .browse-button:hover {
          background-color:#634141;
        }
        
        .wishlist-grid {
          display: grid;
          gap: 20px;
        }
        
        .paper-card {
          display: flex;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .paper-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        
        .paper-thumbnail {
          width: 150px;
          min-height: 180px;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .paper-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .thumbnail-placeholder {
          text-align: center;
          padding: 20px;
          color: #888;
        }
        
        .paper-details {
          flex: 1;
          padding: 20px;
        }
        
        .paper-title {
          font-size: 18px;
          margin: 0 0 8px 0;
          cursor: pointer;
          color: #0070f3;
        }
        
        .paper-title:hover {
          text-decoration: underline;
        }
        
        .paper-authors {
          color: #666;
          font-size: 14px;
          margin: 0 0 12px 0;
        }
        
        .paper-abstract {
          color: #444;
          font-size: 14px;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }
        
        .paper-meta {
          color: #888;
          font-size: 12px;
          margin: 0 0 12px 0;
        }
        
        .paper-actions {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
        }
        
        .download-button {
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        
        .download-button:hover {
          background-color: #0061d9;
        }
        
        .remove-button {
          background-color: transparent;
          color: #ff4444;
          border: 1px solid #ff4444;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .remove-button:hover {
          background-color: #ff4444;
          color: white;
        }
      `}</style>
    </DashboardLayout>
  );
}