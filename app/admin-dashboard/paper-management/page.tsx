"use client";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Paper {
  _id: string;
  title: string;
  abstract?: string;
  createdAt: string;
  authorId: { _id: string; name: string; email: string };
  status: "pending" | "approved" | "rejected";
}

export default function AdminDashboard(): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      const url = `/api/papers?admin=true${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch papers");
      }
      const data = await response.json();
      setPapers(data.papers || []);
    } catch (err) {
      console.error("Error fetching papers:", err);
      setError("Failed to load papers");
    }
  };

  useEffect(() => {
    if (user) {
      fetchPapers();
    }
  }, [user, searchQuery]);

  if (!user) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const statusColors: Record<string, string> = {
    approved: "#41A446",
    pending: "#F4B740",
    rejected: "#D84727",
  };

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Pdf Approval</h1>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Here"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Details</th>
                  <th>Submitted Date</th>
                  <th>Owner</th>
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
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </span>
                      </td>
                      <td data-label="Actions" className="action-buttons">
                        <button
                          className="view-button"
                          onClick={() => alert(`Viewing PDF: ${item.title}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No papers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          background-color: #d8cbb0;
          padding: 1rem;
          border-radius: 12px;
          min-height: 100vh;
          box-sizing: border-box;
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
          width: 100px; /* Adjusted width since only View button remains */
        }

        .view-button {
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid #c2ddf9;
          background-color: #e7f0fd;
          color: #0070f3;
        }

        /* Responsive Styles */
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

          .view-button {
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
            font-weight: bold;
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
        }
      `}</style>
    </DashboardLayout>
  );
}
