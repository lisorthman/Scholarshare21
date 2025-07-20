
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { checkPlagiarism } from '@/app/actions/plagiarismCheck'

interface PlagiarismReport {
  _id: string;
  paperTitle: string;
  author: string;
  plagiarismScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'rejected_ai' | 'passed_checks';
  createdAt: string;
  rejectionReason?: string;
  checkMessage?: string;
}

export default function PlagiarismCheck() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [reports, setReports] = useState<PlagiarismReport[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token);
    if (!token) {
      console.log('No token found in localStorage, redirecting to signin');
      router.push('/signin');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log('Verify token response:', data);
        if (data.valid && data.user.role === 'admin') {
          setAdmin(data.user);
          fetchReports(token);
        } else {
          console.log('Token invalid or user not admin, redirecting to unauthorized');
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/signin');
      }
    };

    const fetchReports = async (authToken: string) => {
      console.log('Fetching reports with token:', authToken);
      const url = `/api/check-papers?admin=true${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '&status=pending'}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: "no-store",
      });
      const data = await response.json();
      console.log('Fetch reports API response:', data);
      if (response.ok) {
        const mappedReports = data.papers.map((paper: any) => ({
          _id: paper._id,
          paperTitle: paper.title,
          author: typeof paper.authorId === 'object' ? (paper.authorId?.name || 'Unknown') : (paper.authorId || 'Unknown'),
          plagiarismScore: paper.plagiarismScore || 0,
          status: paper.status,
          createdAt: new Date(paper.createdAt).toLocaleDateString(),
          rejectionReason: paper.rejectionReason,
          checkMessage: paper.status === 'passed_checks' ? 'Passed' : paper.status === 'rejected' ? `Failed: Plagiarism score ${paper.plagiarismScore}%` : undefined,
        }));
        console.log('Mapped reports:', mappedReports);
        setReports(mappedReports);
        setError("");
      } else {
        console.error('Fetch error:', data.error);
        setError(data.error || "Failed to load papers");
      }
    };

    verifyToken();
  }, [router, searchQuery]);

  const checkPlagiarismHandler = async (paperId: string) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Plagiarism check token:', token);
      if (!token) {
        router.push('/signin');
        return;
      }

      const result = await checkPlagiarism(paperId, token);
      if (result.success && result.plagiarismScore !== undefined) {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
          router.push('/signin');
          return;
        }
        const url = `/api/check-papers?admin=true${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '&status=pending'}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: "no-store",
        });
        const data = await response.json();
        if (response.ok) {
          const mappedReports = data.papers.map((paper: any) => ({
            _id: paper._id,
            paperTitle: paper.title,
            author: typeof paper.authorId === 'object' ? (paper.authorId?.name || 'Unknown') : (paper.authorId || 'Unknown'),
            plagiarismScore: paper.plagiarismScore || 0,
            status: paper.status,
            createdAt: new Date(paper.createdAt).toLocaleDateString(),
            rejectionReason: paper.rejectionReason,
            checkMessage: paper.status === 'passed_checks' ? 'Passed' : paper.status === 'rejected' ? `Failed: Plagiarism score ${paper.plagiarismScore}%` : undefined,
          }));
          setReports(mappedReports);
          setError("");
        } else {
          console.error('Error refreshing reports:', data.error);
          setError(data.error || "Failed to refresh papers");
        }
      } else {
        console.error('Plagiarism check failed:', result.error);
        setError(result.error || "Plagiarism check failed");
      }
    } catch (error: any) {
      console.error('Plagiarism check client error:', error);
      setError(error.message || "Plagiarism check failed");
    }
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <DashboardLayout user={admin} defaultPage="Plagiarism Check">
      <div className="plagiarism-container">
        <div className="plagiarism-content">
          <h1 className="plagiarism-title">Plagiarism Check</h1>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Here"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="table-wrapper">
            <h2 className="table-header">Researcher Papers</h2>
            {reports.length === 0 ? (
              <p className="no-papers">No pending researcher papers available.</p>
            ) : (
              <table className="plagiarism-table">
                <thead>
                  <tr>
                    <th>Paper Title</th>
                    <th>Author</th>
                    <th>Similarity</th>
                    <th>Status</th>
                    <th>Result</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td data-label="Paper Title">{report.paperTitle}</td>
                      <td data-label="Author">{report.author}</td>
                      <td data-label="Similarity">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${report.plagiarismScore}%`,
                              backgroundColor:
                                report.plagiarismScore > 20
                                  ? '#d32f2f'
                                  : report.plagiarismScore > 15
                                  ? '#ffa000'
                                  : '#4caf50',
                            }}
                          ></div>
                        </div>
                        <span>{report.plagiarismScore}%</span>
                      </td>
                      <td data-label="Status">
                        <span
                          className="status-label"
                          style={{
                            backgroundColor:
                              report.status === 'passed_checks'
                                ? '#e8f5e9'
                                : report.status === 'rejected'
                                ? '#ffebee'
                                : '#fff8e1',
                            color:
                              report.status === 'passed_checks'
                                ? '#2e7d32'
                                : report.status === 'rejected'
                                ? '#c62828'
                                : '#ff8f00',
                          }}
                        >
                          {report.status.charAt(0).toUpperCase() +
                            report.status.slice(1).replace('_', ' ')}
                        </span>
                        {report.rejectionReason && (
                          <p className="rejection-reason">
                            {report.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td data-label="Result">
                        {report.checkMessage && (
                          <span
                            className="result-label"
                            style={{
                              color: report.checkMessage === 'Passed' ? '#2e7d32' : '#c62828',
                              fontWeight: 600,
                            }}
                          >
                            {report.checkMessage}
                          </span>
                        )}
                      </td>
                      <td data-label="Date">{report.createdAt}</td>
                      <td data-label="Actions">
                        <button
                          className="action-button"
                          onClick={() => checkPlagiarismHandler(report._id)}
                        >
                          Run Plagiarism Check
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .plagiarism-container {
          background-color: #d8cbb0;
          padding: 1.5rem;
          border-radius: 12px;
          min-height: 100vh;
          width: 100%;
        }

        .plagiarism-content {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 99%;
          margin: 0 auto;
        }

        .plagiarism-title {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .search-bar {
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          background-color: #f9f9f9;
        }

        .search-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          font-family: "Poppins", sans-serif;
        }

        .error-message {
          color: #c62828;
          font-size: 14px;
          margin-bottom: 1rem;
          text-align: center;
          background-color: #ffebee;
          padding: 0.75rem;
          border-radius: 8px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .table-header {
          padding: 1rem 1.25rem;
          background-color: #f5f5f5;
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .no-papers {
          padding: 1rem 1.25rem;
          color: #666;
          font-size: 14px;
        }

        .plagiarism-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          color: #333;
        }

        .plagiarism-table thead tr {
          background-color: #f5f5f5;
        }

        .plagiarism-table th,
        .plagiarism-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          vertical-align: middle;
        }

        .plagiarism-table th {
          font-weight: 600;
          color: #555;
        }

        .plagiarism-table tbody tr {
          border-bottom: 1px solid #eee;
        }

        .plagiarism-table tbody tr:last-child {
          border-bottom: none;
        }

        .progress-bar {
          width: 100%;
          background-color: #eee;
          border-radius: 10px;
          height: 10px;
          margin: 5px 0;
        }

        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .status-label {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 12px;
          display: inline-block;
          min-width: 80px;
          text-align: center;
        }

        .result-label {
          font-size: 12px;
          display: inline-block;
        }

        .rejection-reason {
          color: #c62828;
          font-size: 12px;
          margin: 0.25rem 0 0 0;
        }

        .action-button {
          background-color: #e7f0fd;
          color: #0070f3;
          border: 1px solid #c2ddf9;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 14px;
          cursor: pointer;
          font-weight: 400;
          transition: background-color 0.3s;
        }

        .action-button:hover {
          background-color: #d0e3ff;
        }

        @media (max-width: 768px) {
          .plagiarism-container {
            padding: 1rem;
          }

          .plagiarism-content {
            padding: 1rem;
          }

          .plagiarism-title {
            font-size: 24px;
            margin-bottom: 1rem;
          }

          .search-bar {
            padding: 0.5rem;
          }

          .search-input {
            font-size: 13px;
          }

          .error-message {
            font-size: 13px;
            padding: 0.5rem;
          }

          .table-header {
            font-size: 18px;
            padding: 0.75rem 1rem;
          }

          .no-papers {
            font-size: 13px;
            padding: 0.75rem 1rem;
          }

          .plagiarism-table th,
          .plagiarism-table td {
            padding: 0.5rem;
          }

          .action-button {
            padding: 0.4rem 0.8rem;
            font-size: 13px;
          }

          .status-label,
          .result-label {
            font-size: 11px;
            min-width: 70px;
          }

          .rejection-reason {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .plagiarism-container {
            padding: 0.5rem;
          }

          .plagiarism-content {
            padding: 0.5rem;
          }

          .plagiarism-title {
            font-size: 20px;
            margin-bottom: 0.75rem;
          }

          .search-bar {
            padding: 0.25rem;
          }

          .search-input {
            font-size: 12px;
          }

          .error-message {
            font-size: 12px;
            padding: 0.5rem;
          }

          .table-header {
            font-size: 16px;
            padding: 0.5rem 0.75rem;
          }

          .no-papers {
            font-size: 12px;
            padding: 0.5rem 0.75rem;
          }

          .plagiarism-table {
            font-size: 12px;
          }

          .plagiarism-table thead {
            display: none;
          }

          .plagiarism-table tbody tr {
            display: block;
            margin-bottom: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 0.5rem;
          }

          .plagiarism-table tbody td {
            display: flex;
            justify-content: space-between;
            padding: 0.25rem 0;
            border: none;
          }

          .plagiarism-table tbody td:before {
            content: attr(data-label);
            font-weight: 600;
            width: 40%;
            color: #555;
          }

          .action-button {
            padding: 0.3rem 0.6rem;
            font-size: 12px;
          }

          .progress-bar {
            height: 8px;
          }

          .status-label,
          .result-label {
            font-size: 10px;
            min-width: 60px;
          }

          .rejection-reason {
            font-size: 10px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
