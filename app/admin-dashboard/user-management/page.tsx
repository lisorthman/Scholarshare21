"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { FiSearch, FiEdit2 } from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "researcher" | "admin";
  joined: string;
  status: string;
  educationQualification?: string; // Add this field
  lastLogin: string; // Add this field to match imported User type
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

  const filteredUsers = users
    .filter((user) => user.role === "researcher")
    .filter((user) =>
      [user.name, user.email, user.role, user.status, user.educationQualification || ""]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

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

          {filteredUsers.length > 0 ? (
            <div>
              {/* Desktop Table */}
              <div
                style={{
                  display: "none",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                    fontWeight: "400"
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#EFEFEF", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Name</th>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Email</th>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Role</th>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Joined</th>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Status</th>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Education Qualification</th>
                      <th style={{ padding: "0.75rem", fontWeight: "600" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "1rem" }}>{user.name}</td>
                        <td style={{ padding: "1rem" }}>{user.email}</td>
                        <td style={{ padding: "1rem" }}>{user.role}</td>
                        <td style={{ padding: "1rem" }}>{user.joined}</td>
                        <td style={{ padding: "1rem" }}>{user.status}</td>
                        <td style={{ padding: "1rem" }}>{user.educationQualification || "-"}</td>
                        <td style={{ padding: "1rem", display: "flex", gap: "0.75rem" }}>
                          <FiEdit2
                            style={{ cursor: "pointer", color: "#4682b4" }}
                            onClick={() => alert(`Edit user: ${user.name}`)}
                          />
                          <button
                            onClick={() => setSelectedUser(user)}
                            style={{
                              backgroundColor: "#4682b4",
                              color: "white",
                              border: "none",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "1rem",
                      backgroundColor: "#fff",
                    }}
                  >
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Joined:</strong> {user.joined}</p>
                    <p><strong>Status:</strong> {user.status}</p>
                    <p><strong>Education Qualification:</strong> {user.educationQualification || "-"}</p>
                    <div style={{ padding: "1rem 0", display: "flex", gap: "0.75rem" }}>
                      <FiEdit2
                        style={{ cursor: "pointer", color: "#4682b4" }}
                        onClick={() => alert(`Edit user: ${user.name}`)}
                      />
                      <button
                        onClick={() => setSelectedUser(user)}
                        style={{
                          backgroundColor: "#D8CBB0",
                          color: "black",
                          border: "none",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              {searchQuery ? "No matching users found" : error || "No users found"}
            </div>
          )}

          {/* Modal for User Details */}
          {selectedUser && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                padding: "1rem",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  width: "100%",
                  maxWidth: "500px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxSizing: "border-box"
                }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>User Details</h2>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Joined:</strong> {selectedUser.joined}</p>
                <p><strong>Status:</strong> {selectedUser.status}</p>
                {selectedUser.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedUser._id, "Active")}
                      style={{
                        backgroundColor: "#90ee90",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "1rem",
                        width: "100%"
                      }}
                    >
                      Approve
                    </button>
                    <div style={{ marginTop: "1rem" }}>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason"
                        style={{
                          width: "100%",
                          height: "100px",
                          padding: "0.5rem",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          resize: "vertical",
                        }}
                      />
                      <button
                        onClick={() => handleStatusChange(selectedUser._id, "Suspended", rejectionReason)}
                        style={{
                          backgroundColor: "#ff6347",
                          color: "white",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                          width: "100%",
                          opacity: !rejectionReason.trim() ? 0.5 : 1
                        }}
                        disabled={!rejectionReason.trim()}
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setRejectionReason("");
                  }}
                  style={{
                    backgroundColor: "#4682b4",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "1rem",
                    width: "100%"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}