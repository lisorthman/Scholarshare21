'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

interface ResearchPaper {
  id: string;
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  citations: number;
}

export default function PaperManagement() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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
          // Mock papers data
          setPapers([
            {
              id: '1',
              title: 'Advanced AI Techniques',
              author: 'Dr. Smith',
              status: 'approved',
              uploadDate: '2023-06-15',
              citations: 42
            },
            {
              id: '2',
              title: 'Quantum Computing Basics',
              author: 'Prof. Johnson',
              status: 'pending',
              uploadDate: '2023-07-01',
              citations: 0
            },
            {
              id: '3',
              title: 'Climate Change Models',
              author: 'Dr. Lee',
              status: 'rejected',
              uploadDate: '2023-05-22',
              citations: 18
            }
          ]);
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

  const filteredPapers = filter === 'all' 
    ? papers 
    : papers.filter(paper => paper.status === filter);

  const updatePaperStatus = (id: string, status: 'approved' | 'rejected') => {
    setPapers(papers.map(paper =>
      paper.id === id ? { ...paper, status } : paper
    ));
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <DashboardLayout user={admin} defaultPage="Paper Management">
      <div style={{ marginTop: '20px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '28px' }}>Paper Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setFilter('all')}
              style={filter === 'all' ? activeFilterButtonStyle : filterButtonStyle}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={filter === 'pending' ? activeFilterButtonStyle : filterButtonStyle}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              style={filter === 'approved' ? activeFilterButtonStyle : filterButtonStyle}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              style={filter === 'rejected' ? activeFilterButtonStyle : filterButtonStyle}
            >
              Rejected
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={tableHeaderStyle}>Title</th>
                <th style={tableHeaderStyle}>Author</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Upload Date</th>
                <th style={tableHeaderStyle}>Citations</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.map((paper) => (
                <tr key={paper.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle}>
                    <a href="#" style={{ color: '#1976d2', textDecoration: 'none' }}>
                      {paper.title}
                    </a>
                  </td>
                  <td style={tableCellStyle}>{paper.author}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 
                        paper.status === 'approved' ? '#e8f5e9' :
                        paper.status === 'rejected' ? '#ffebee' : '#fff8e1',
                      color: 
                        paper.status === 'approved' ? '#2e7d32' :
                        paper.status === 'rejected' ? '#d32f2f' : '#ff8f00'
                    }}>
                      {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{paper.uploadDate}</td>
                  <td style={tableCellStyle}>{paper.citations}</td>
                  <td style={tableCellStyle}>
                    {paper.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updatePaperStatus(paper.id, 'approved')}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            marginRight: '8px'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updatePaperStatus(paper.id, 'rejected')}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: '#ffebee',
                            color: '#d32f2f'
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        marginLeft: '8px'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

const tableHeaderStyle = {
  padding: '12px 16px',
  textAlign: 'left' as const,
  fontWeight: '600',
  color: '#555'
};

const tableCellStyle = {
  padding: '12px 16px',
  color: '#333'
};

const filterButtonStyle = {
  padding: '8px 16px',
  backgroundColor: 'transparent',
  color: '#555',
  border: '1px solid #ddd',
  borderRadius: '6px',
  cursor: 'pointer'
};

const activeFilterButtonStyle = {
  ...filterButtonStyle,
  backgroundColor: '#0070f3',
  color: '#fff',
  border: '1px solid #0070f3'
};

const actionButtonStyle = {
  padding: '6px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};