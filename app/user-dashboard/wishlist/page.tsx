'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { toast } from 'react-toastify';
import { Download, BookmarkCheck, Eye } from 'lucide-react';

interface ResearchPaper {
  _id: string;
  title: string;
  authors: string[];
  abstract: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  downloadCount: number;
  views?: number;
  category?: string;
}

export default function SavedPapersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [savedPapers, setSavedPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPaperId, setDownloadingPaperId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        // Verify token and get user data
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!verifyResponse.ok) {
          localStorage.removeItem('token');
          router.push('/signin');
          return;
        }

        const { user: userData } = await verifyResponse.json();
        setUser(userData);

        // Fetch saved papers with details
        const savedPapersResponse = await fetch('/api/user/saved-papers', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!savedPapersResponse.ok) {
          throw new Error('Failed to fetch saved papers');
        }

        const responseData = await savedPapersResponse.json();
        
        // Ensure we're working with an array
        const papersArray = Array.isArray(responseData) 
          ? responseData 
          : Array.isArray(responseData?.savedPapers) 
            ? responseData.savedPapers 
            : [];
        
        // Transform data to match ResearchPaper interface
        const formattedPapers = papersArray.map((paper: any) => ({
          _id: paper._id || paper.id,
          title: paper.title,
          authors: paper.authors || [],
          abstract: paper.abstract || '',
          downloadUrl: paper.downloadUrl || paper.fileUrl,
          thumbnailUrl: paper.thumbnailUrl,
          downloadCount: paper.downloadCount || 0,
          views: paper.views || 0,
          category: paper.category || 'uncategorized'
        }));

        setSavedPapers(formattedPapers);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        localStorage.removeItem('token');
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const markAsReadAndRemove = async (paperId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      // First, mark as read in bookshelf
      const markAsReadResponse = await fetch('/api/bookshelf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          paperId,
          action: 'addToRead'
        }),
      });

      if (!markAsReadResponse.ok) {
        throw new Error('Failed to mark as read');
      }

      // Then remove from saved papers
      const removeResponse = await fetch('/api/user/saved-papers', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          paperId,
          action: 'remove'
        }),
      });

      if (removeResponse.ok) {
        setSavedPapers(prev => prev.filter(item => item._id !== paperId));
        toast.success('Paper marked as read and removed from saved papers');
      } else {
        const errorData = await removeResponse.json();
        throw new Error(errorData.message || 'Failed to remove from saved papers');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDownload = async (paperId: string, title: string) => {
    setDownloadingPaperId(paperId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      // Track download in the backend
      const trackResponse = await fetch(`/api/papers/${paperId}/download`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!trackResponse.ok) {
        throw new Error('Download tracking failed');
      }

      // Get the actual file
      const paper = savedPapers.find(p => p._id === paperId);
      if (!paper) return;

      const response = await fetch(paper.downloadUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Update download count in UI
      setSavedPapers(prev => 
        prev.map(paper => 
          paper._id === paperId 
            ? { ...paper, downloadCount: (paper.downloadCount || 0) + 1 } 
            : paper
        )
      );
    } catch (error) {
      console.error('Download failed:', error);
      setError(error instanceof Error ? error.message : 'Download failed');
      toast.error('Failed to download paper');
    } finally {
      setDownloadingPaperId(null);
    }
  };

  const handleViewPaper = async (paperId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      // Track view in the backend
      const trackResponse = await fetch(`/api/papers/${paperId}/view`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!trackResponse.ok) {
        console.error('View tracking failed');
      }

      // Update view count in UI
      setSavedPapers(prev => 
        prev.map(paper => 
          paper._id === paperId 
            ? { ...paper, views: (paper.views || 0) + 1 } 
            : paper
        )
      );

      // Open the paper in a new tab
      const paper = savedPapers.find(p => p._id === paperId);
      if (paper) {
        window.open(paper.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('View tracking failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5D4037]"></div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} defaultPage="Wishlist">
      <div className="saved-papers-container p-4 md:p-6 max-w-7xl mx-auto">
        <div className="saved-papers-header flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Wishlist</h1>
            <p className="text-[#5D4037] mt-1">
              {savedPapers.length} {savedPapers.length === 1 ? 'paper' : 'papers'} in your wishlist.
            </p>
          </div>
          <button 
            className="bg-[#5D4037] hover:bg-[#3E2723] text-white font-medium py-2 px-4 rounded transition whitespace-nowrap"
            onClick={() => router.push('/papers')}
          >
            Browse More Papers
          </button>
        </div>

        {error && (
          <div className="bg-[#FFEBEE] border-l-4 border-[#C62828] p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-[#C62828]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-[#C62828]">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5D4037] mb-4"></div>
            <p className="text-[#5D4037]">Loading your papers...</p>
          </div>
        ) : savedPapers.length === 0 ? (
          <div className="text-center py-12 bg-[#EFEBE9] rounded-lg">
            <svg className="mx-auto h-12 w-12 text-[#8D6E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-[#3E2723]">No papers</h3>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5D4037] hover:bg-[#3E2723] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D4037]"
                onClick={() => router.push('@/app/user-dashboard/papers')}
              >
                Browse Papers
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {savedPapers.map((paper) => (
              <div key={paper._id} className="border border-[#D7CCC8] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48 bg-[#EFEBE9] flex items-center justify-center shrink-0">
                    {paper.thumbnailUrl ? (
                      <img 
                        src={paper.thumbnailUrl} 
                        alt={paper.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center p-4 text-[#8D6E63]">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 
                          className="text-lg md:text-xl font-semibold text-[#5D4037] mb-2 line-clamp-2"
                        >
                          {paper.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1 text-xs font-semibold text-[#5D4037] bg-[#EFEBE9] rounded-full capitalize">
                        {paper.category?.replace(/-/g, " ") || 'uncategorized'}
                      </span>
                    </div>
                    
                    <p className="text-[#5D4037] mb-4 line-clamp-3 text-sm md:text-base">
                      {paper.abstract || 'No abstract available'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-[#8D6E63] mb-4">
                      <span>Downloads: {paper.downloadCount}</span>
                      <span>•</span>
                      <span>Views: {paper.views || 0}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-[#EFEBE9] md:w-48 shrink-0">
                    {/* Download Button - Primary Style */}
                    <button 
                      onClick={() => handleDownload(paper._id, paper.title)}
                      disabled={downloadingPaperId === paper._id}
                      className="bg-[#5D4037] hover:bg-[#3E2723] text-white py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-md hover:shadow-lg"
                    >
                      {downloadingPaperId === paper._id ? (
                        <span className="animate-pulse">Downloading...</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </button>
                    
                    {/* View Paper Button - Secondary Style */}
                    <button
                      onClick={() => handleViewPaper(paper._id)}
                      className="bg-white border border-[#0288D1] text-[#0288D1] hover:bg-[#E3F2FD] py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      View Paper
                    </button>
                    
                    {/* Mark as Read Button - Accent Style */}
                    <button 
                      onClick={() => markAsReadAndRemove(paper._id)}
                      className="bg-[#4CAF50] hover:bg-[#388E3C] text-white py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      Mark as Read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}