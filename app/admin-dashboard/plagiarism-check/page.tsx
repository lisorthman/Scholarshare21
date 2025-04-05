'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';

interface PlagiarismReport {
  id: string;
  paperTitle: string;
  author: string;
  similarityScore: number;
  status: 'pending' | 'completed';
  date: string;
}

export default function PlagiarismCheck() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [reports, setReports] = useState<PlagiarismReport[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
          // Mock reports
          setReports([
            {
              id: '1',
              paperTitle: 'Advanced AI Techniques',
              author: 'Dr. Smith',
              similarityScore: 12,
              status: 'completed',
              date: '2023-06-15'
            },
            {
              id: '2',
              paperTitle: 'Quantum Computing Basics',
              author: 'Prof. Johnson',
              similarityScore: 34,
              status: 'completed',
              date: '2023-07-01'
            },
            {
              id: '3',
              paperTitle: 'Climate Change Models',
              author: 'Dr. Lee',
              similarityScore: 8,
              status: 'completed',
              date: '2023-05-22'
            },
            {
              id: '4',
              paperTitle: 'New Biology Findings',
              author: 'Dr. Wilson',
              similarityScore: 0,
              status: 'pending',
              date: '2023-07-10'
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const runPlagiarismCheck = () => {
    if (!selectedFile) return;
    alert(`Plagiarism check initiated for ${selectedFile.name}`);
    // In a real app, you would call your API here
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <DashboardLayout user={admin} defaultPage="Plagiarism Check">
      <div style={{ marginTop: '20px', width: '100%' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>Plagiarism Check</h1>
        
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Check New Paper</h2>
          <div style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            <input
              type="file"
              id="plagiarism-file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="plagiarism-file" style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}>
              Select Paper
            </label>
            <p style={{ color: '#666' }}>
              {selectedFile ? selectedFile.name : 'No file selected'}
            </p>
          </div>
          <button
            onClick={runPlagiarismCheck}
            disabled={!selectedFile}
            style={{
              ...primaryButtonStyle,
              opacity: !selectedFile ? 0.7 : 1,
              cursor: !selectedFile ? 'not-allowed' : 'pointer'
            }}
          >
            Run Plagiarism Check
          </button>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <h2 style={{
            padding: '16px 20px',
            backgroundColor: '#f5f5f5',
            margin: 0,
            fontSize: '20px'
          }}>
            Recent Plagiarism Reports
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                <th style={tableHeaderStyle}>Paper Title</th>
                <th style={tableHeaderStyle}>Author</th>
                <th style={tableHeaderStyle}>Similarity</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle}>{report.paperTitle}</td>
                  <td style={tableCellStyle}>{report.author}</td>
                  <td style={tableCellStyle}>
                    <div style={{
                      width: '100%',
                      backgroundColor: '#eee',
                      borderRadius: '10px',
                      height: '10px',
                      margin: '5px 0'
                    }}>
                      <div style={{
                        width: `${report.similarityScore}%`,
                        height: '100%',
                        backgroundColor: 
                          report.similarityScore > 30 ? '#d32f2f' :
                          report.similarityScore > 15 ? '#ffa000' : '#4caf50',
                        borderRadius: '10px'
                      }}></div>
                    </div>
                    <span>{report.similarityScore}%</span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: report.status === 'completed' ? '#e8f5e9' : '#fff8e1',
                      color: report.status === 'completed' ? '#2e7d32' : '#ff8f00'
                    }}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{report.date}</td>
                  <td style={tableCellStyle}>
                    <button style={secondaryButtonStyle}>
                      View Report
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

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#555'
};

const tableCellStyle = {
  padding: '12px 16px',
  color: '#333'
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
  padding: '8px 16px',
  fontSize: '14px',
  cursor: 'pointer'
};