"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { FiSearch, FiEdit2 } from "react-icons/fi";

interface AdminUser extends User {
  id: string;
  joinDate: string;
  status: 'active' | 'suspended';
}

export default function UserManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch(`/api/admin/fetch-users?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users || []);
      setError((data.users || []).length === 0 ? "No users found" : "");
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string, reason?: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found, please sign in again.");
        router.push("/signin");
        return;
      }

      const response = await fetch("/api/admin/update-user-status-with-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status: newStatus, reason }),
      });

      if (!response.ok) throw new Error("Failed to update user status");
      const data = await response.json();

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );

      await fetchUsers(token);
      setSelectedUser(null);
      setRejectionReason("");
      alert(data.message);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
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

        if (!response.ok) throw new Error("Token verification failed");
        const data = await response.json();
        if (data.valid && data.user?.role === "admin") {
          setUser(data.user);
          setIsAuthenticated(true);
          fetchUsers(token);
        } else {
          setIsAuthenticated(false);
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsAuthenticated(false);
        router.push("/signin");
      }
    };

    verifyToken();
  }, [router]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id ? {
        ...user,
        status: user.status === 'active' ? 'suspended' : 'active'
      } : user
    ));
  };

  if (isAuthenticated === null) return <p>Loading...</p>;
  if (!isAuthenticated) return null;

  return (
    <DashboardLayout user={user}>
      <div
        style={{
          backgroundColor: "#D8CBB0",
          minHeight: "100vh",
          padding: "1rem",
          width: "100%",
          fontFamily: "'Poppins', sans-serif",
          boxSizing: "border-box",
          "@media (min-width: 768px)": {
            padding: "2rem"
          }
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
          rel="stylesheet"
        />

        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1rem",
            "@media (min-width: 768px)": {
              fontSize: "1.5rem"
            }
          }}
        >
          User Management
        </h1>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "1rem",
            minHeight: "calc(100vh - 4rem)",
            boxSizing: "border-box",
            "@media (min-width: 768px)": {
              padding: "2rem"
            }
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexDirection: "column",
              gap: "1rem",
              "@media (min-width: 768px)": {
                flexDirection: "row",
                gap: "0"
              }
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                width: "100%",
                "@media (min-width: 768px)": {
                  width: "60%"
                }
              }}
            >
              <FiSearch
                size={20}
                style={{ marginRight: "0.5rem", color: "#777" }}
              />
              <input
                type="text"
                placeholder="Search Here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              />
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
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Role</th>
                <th style={tableHeaderStyle}>Joined</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tableCellStyle}>{user.name}</td>
                  <td style={tableCellStyle}>{user.email}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: user.role === 'admin' ? '#e3f2fd' : 
                                      user.role === 'researcher' ? '#e8f5e9' : '#f5f5f5',
                      color: user.role === 'admin' ? '#1976d2' : 
                            user.role === 'researcher' ? '#2e7d32' : '#616161'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{user.joinDate}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      color: user.status === 'active' ? '#2e7d32' : '#d32f2f'
                    }}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: user.status === 'active' ? '#ffebee' : '#e8f5e9',
                        color: user.status === 'active' ? '#d32f2f' : '#2e7d32',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button style={secondaryButtonStyle}>
                      Edit
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