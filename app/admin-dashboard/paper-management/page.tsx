
"use client";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { checkGrammar } from "@/app/actions/grammarCheck";
import toast, { Toaster } from 'react-hot-toast';

interface GrammarIssue {
  message: string;
  shortMessage: string;
  replacements: Array<{ value: string }>;
  context: { text: string; offset: number; length: number };
  rule: { id: string; description: string; category: { id: string; name: string } };
}

interface Paper {
  _id: string;
  title: string;
  abstract?: string;
  createdAt: string;
  authorId: { _id: string; name: string; email: string };
  status: "pending" | "approved" | "rejected" | "rejected_ai" | "passed_checks";
  fileUrl: string;
  fileType: string;
  plagiarismScore?: number;
  grammarIssues?: GrammarIssue[];
  lastGrammarCheck?: string;
}

export default function PaperManagement(): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [grammarResult, setGrammarResult] = useState<GrammarIssue[] | null>(null);
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [grammarLoading, setGrammarLoading] = useState<boolean>(false);
  const [lastGrammarCheckTime, setLastGrammarCheckTime] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid && data.user.role === "admin") {
          setUser(data.user);
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.push("/signin");
      }
    };

    verifyToken();
  }, [router]);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const url = `/api/papers?admin=true${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}&status=passed_checks,approved&page=${page}&limit=${limit}`;
      console.log(`Fetching papers from: ${url}`);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Fetch papers error:", errorData);
        throw new Error(errorData.details || "Failed to fetch papers");
      }
      const data = await response.json();
      console.log("Fetched papers:", data.papers);
      setPapers(data.papers || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching papers:", err);
      setError(err.message || "Failed to load papers");
    }
  };

  useEffect(() => {
    if (user) {
      fetchPapers();
    }
  }, [user, searchQuery, page]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const response = await fetch(`/api/papers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update paper");
      }
      const result = await response.json();
      if (!result.emailSent) {
        setError("Action completed, but failed to send notification email");
      } else {
        setError(null);
      }
      toast.success(`Paper ${action === "approve" ? "approved" : "rejected"} successfully!`);
      setIsModalOpen(false);
      setSelectedPaper(null);
      setGrammarResult(null);
      setGrammarError(null);
      await fetchPapers();
    } catch (err: any) {
      console.error("Error updating paper:", err);
      setError(err.message || "Failed to update paper");
      toast.error(err.message || "Failed to update paper");
    }
  };

  const handleGrammarCheck = async (paperId: string) => {
    setGrammarLoading(true);
    setGrammarResult(null);
    setGrammarError(null);
    const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    setLastGrammarCheckTime(currentTime); // Update real-time display immediately
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      // Update lastGrammarCheck in the database
      const updateResponse = await fetch(`/api/papers/${paperId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lastGrammarCheck: currentTime }),
      });
      if (!updateResponse.ok) {
        throw new Error("Failed to update last grammar check time");
      }

      const result = await checkGrammar(paperId, token);
      if (result.success && result.grammarResult) {
        setGrammarResult(result.grammarResult.matches);
        const hasCriticalIssues = result.grammarResult.matches.some(
          (match) => match.rule.category.id === 'GRAMMAR' && match.replacements.length > 0
        );
        toast.success(`Paper ${hasCriticalIssues ? 'rejected' : 'approved'} after grammar check!`);
        await fetchPapers();
      } else {
        setGrammarError(result.error || "Failed to check grammar");
        toast.error(result.error || "Failed to check grammar");
      }
    } catch (err: any) {
      console.error("Grammar check error:", err);
      setGrammarError(err.message || "Failed to check grammar");
      toast.error(err.message || "Failed to check grammar");
    } finally {
      setGrammarLoading(false);
    }
  };

  const handleDownload = (fileUrl: string, title: string, fileType: string) => {
    const extension = fileType === "application/pdf" ? ".pdf" : ".docx";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${title}${extension}`;
    link.click();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPaper(null);
    setGrammarResult(null);
    setGrammarError(null);
  };

  if (!user) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const statusColors: Record<string, string> = {
    approved: "#41A446",
    pending: "#F4B740",
    rejected: "#D84727",
    rejected_ai: "#D84727",
    passed_checks: "#41A446",
  };

  return (
    <DashboardLayout user={user}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Paper Management</h1>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Here"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Details</th>
                  <th>Submitted Date</th>
                  <th>Owner</th>
                  <th>Similarity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.length > 0 ? (
                  papers.map((item) => (
                    <tr key={item._id}>
                      <td data-label="Title">{item.title}</td>
                      <td data-label="Details">{item.abstract || "N/A"}</td>
                      <td data-label="Submitted Date">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td data-label="Owner">
                        {item.authorId?.name || "Unknown"}
                      </td>
                      <td data-label="Similarity">
                        {item.plagiarismScore !== undefined ? `${item.plagiarismScore}%` : "N/A"}
                      </td>
                      <td data-label="Status">
                        <span
                          style={{
                            backgroundColor: statusColors[item.status],
                            color: "white",
                            padding: "0.25rem 1rem",
                            borderRadius: "20px",
                            fontSize: "12px",
                            display: "inline-block",
                            minWidth: "80px",
                            textAlign: "center",
                          }}
                        >
                          {item.status === "passed_checks"
                            ? "Passed Checks"
                            : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td data-label="Actions" className="action-buttons">
                        <button
                          className="view-button"
                          onClick={() => {
                            setSelectedPaper(item);
                            setIsModalOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="download-button"
                          onClick={() => handleDownload(item.fileUrl, item.title, item.fileType)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No papers found with status 'passed_checks' or 'approved'. Please check the database or upload new papers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedPaper && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              ✕
            </button>
            <h2 className="modal-title">Verification Request Details</h2>
            <div className="modal-field">
              <label>Name:</label>
              <span>{selectedPaper.authorId?.name || "Unknown"}</span>
            </div>
            <div className="modal-field">
              <label>Email:</label>
              <span>{selectedPaper.authorId?.email || "N/A"}</span>
            </div>
            <div className="modal-field">
              <label>Paper:</label>
              <span>{selectedPaper.title}</span>
            </div>
            <div className="modal-field">
              <label>Submitted date:</label>
              <span>
                {new Date(selectedPaper.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="modal-field">
              <label>Similarity:</label>
              <span>{selectedPaper.plagiarismScore !== undefined ? `${selectedPaper.plagiarismScore}%` : "N/A"}</span>
            </div>
            <div className="modal-field">
              <label>Last Grammar Check:</label>
              <span>
                {lastGrammarCheckTime || (selectedPaper.lastGrammarCheck
                  ? new Date(selectedPaper.lastGrammarCheck).toLocaleDateString()
                  : "Not checked")}
              </span>
            </div>
            <div className="modal-field description-field">
              <label>
                <span className="pdf-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 1H12C12.5523 1 13 1.44772 13 2V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V2C3 1.44772 3.44772 1 4 1Z"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 5H11"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 7H11"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 9H8"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Any additional description:
              </label>
              <div className="modal-description">
                {selectedPaper.abstract || "N/A"}
              </div>
            </div>
            <div className="modal-field">
              <label>File:</label>
              <button
                className="download-button"
                onClick={() => handleDownload(selectedPaper.fileUrl, selectedPaper.title, selectedPaper.fileType)}
              >
                Download {selectedPaper.fileType === "application/pdf" ? "PDF" : "DOCX"}
              </button>
            </div>
            <div className="modal-field">
              <label>Grammar Check:</label>
              <button
                className="grammar-check-button"
                onClick={() => handleGrammarCheck(selectedPaper._id)}
                disabled={grammarLoading}
              >
                {grammarLoading ? "Checking..." : "Check Grammar Level"}
              </button>
            </div>
            {grammarError && (
              <div className="modal-field">
                <label>Grammar Check Error:</label>
                <div className="grammar-error">
                  <p style={{ color: '#D84727' }}>
                    {grammarError.includes('API limit reached')
                      ? `${grammarError} Please contact support or try again later.`
                      : grammarError}
                  </p>
                </div>
              </div>
            )}
            {grammarResult && (
              <div className="modal-field">
                <label>Grammar Issues:</label>
                <div className="grammar-results">
                  {grammarResult.length > 0 ? (
                    <ul>
                      {grammarResult.map((issue, index) => (
                        <li key={index}>
                          <strong>{issue.shortMessage || issue.message}</strong>
                          <p>Context: {issue.context.text.slice(0, 50)}...</p>
                          <p>Suggestions: {issue.replacements.map((r) => r.value).join(', ') || 'None'}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No grammar issues found.</p>
                  )}
                </div>
              </div>
            )}
            {selectedPaper.grammarIssues && selectedPaper.grammarIssues.length > 0 && (
              <div className="modal-field">
                <label>Previous Grammar Issues:</label>
                <div className="grammar-results">
                  <ul>
                    {selectedPaper.grammarIssues.map((issue, index) => (
                      <li key={index}>
                        <strong>{issue.shortMessage || issue.message}</strong>
                        <p>Context: {issue.context.text.slice(0, 50)}...</p>
                        <p>Suggestions: {issue.replacements.map((r) => r.value).join(', ') || 'None'}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          background-color: #d8cbb0;
          padding: 1rem;
          border-radius: 12px;
          min-height: 100vh;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
          width: 100%;
        }

        .dashboard-content {
          background-color: white;
          padding: 1rem;
          border-radius: 12px;
          margin: 0 auto;
        }

        .dashboard-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .search-bar {
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .dashboard-table thead tr {
          background-color: #efefef;
          text-align: left;
        }

        .dashboard-table th,
        .dashboard-table td {
          padding: 0.75rem;
          vertical-align: top;
        }

        .dashboard-table tbody tr {
          border-bottom: 1px solid #ddd;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          width: 150px;
        }

        .view-button,
        .download-button,
        .grammar-check-button {
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid #c2ddf9;
          background-color: #e7f0fd;
          color: #0070f3;
        }

        .download-button {
          border-color: #b2d8b2;
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .grammar-check-button {
          border-color: #f0b2d8;
          background-color: #fce4ec;
          color: #c2185b;
        }

        .grammar-check-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .pagination-button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          border: 1px solid #c2ddf9;
          background-color: #e7f0fd;
          color: #0070f3;
        }

        .pagination-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 14px;
          color: #333;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          border: 4px solid #d8cbb0;
          width: 90%;
          max-width: 500px;
          position: relative;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .modal-field {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .modal-field label {
          font-weight: 600;
          font-size: 14px;
        }

        .modal-field span {
          font-size: 14px;
          font-weight: 400;
        }

        .description-field label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pdf-icon {
          display: inline-block;
        }

        .modal-description {
          background: #e0e0e0;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 14px;
          min-height: 40px;
          font-weight: 400;
        }

        .grammar-results,
        .grammar-error {
          background: #f9f9f9;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 14px;
          max-height: 200px;
          overflow-y: auto;
        }

        .grammar-results ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .grammar-results li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0.5rem;
          }

          .dashboard-content {
            padding: 0.5rem;
          }

          .dashboard-title {
            font-size: 18px;
            margin-bottom: 1rem;
          }

          .search-bar {
            padding: 0.5rem;
          }

          .search-input {
            font-size: 12px;
          }

          .dashboard-table {
            font-size: 12px;
          }

          .dashboard-table th,
          .dashboard-table td {
            padding: 0.5rem;
          }

          .action-buttons {
            flex-direction: column;
            width: auto;
            gap: 0.25rem;
          }

          .view-button,
          .download-button,
          .grammar-check-button,
          .pagination-button {
            padding: 4px 8px;
            font-size: 11px;
          }

          .dashboard-table thead {
            display: none;
          }

          .dashboard-table tbody tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 0.5rem;
          }

          .dashboard-table tbody td {
            display: flex;
            justify-content: space-between;
            padding: 0.25rem 0;
            border: none;
          }

          .dashboard-table tbody td:before {
            content: attr(data-label);
            font-weight: 600;
            width: 40%;
            flex-shrink: 0;
          }

          .dashboard-table tbody td.action-buttons {
            flex-direction: row;
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .dashboard-table tbody td.action-buttons:before {
            display: none;
          }

          .modal-content {
            padding: 1rem;
            max-width: 90%;
          }

          .modal-title {
            font-size: 16px;
          }

          .modal-field label,
          .modal-field span {
            font-size: 12px;
          }

          .modal-description,
          .grammar-results,
          .grammar-error {
            min-height: 30px;
            font-size: 12px;
          }

          @media (max-width: 480px) {
            .dashboard-title {
              font-size: 16px;
            }

            .search-input {
              font-size: 10px;
            }

            .dashboard-table {
              font-size: 10px;
            }

            .dashboard-table tbody td:before {
              width: 50%;
            }

            .modal-title {
              font-size: 14px;
            }

            .modal-description,
            .grammar-results,
            .grammar-error {
              min-height: 20px;
              font-size: 10px;
            }
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
