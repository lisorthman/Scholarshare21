"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddCategoryForm from "@/components/AddCategoryForm";
import { User } from "@/types/user"; // Import the User type

// Define types for your data structures
interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string | Date;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  const fetchCategories = async (token: string) => {
    try {
      console.log("Fetching categories with token:", token);
      const response = await fetch("/api/admin/fetch-category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch categories: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data: Category[] = await response.json();
      console.log("Fetched categories:", data);
      setCategories(data);
      setError(data.length === 0 ? "No categories found" : "");
    } catch (error) {
      console.error("Error fetching admin categories:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load categories"
      );
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    console.log("Token found in localStorage:", token);

    if (!token) {
      console.log("No token found, redirecting to /signin");
      setIsAuthenticated(false);
      router.push("/signin");
      return;
    }

    const verifyToken = async () => {
      try {
        console.log("Verifying token...");
        const response = await fetch("/api/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log("Token verification response:", data);

        if (data.valid && data.user?.role === "admin") {
          setUser(data.user);
          setIsAuthenticated(true);
          fetchCategories(token);
        } else {
          console.log(
            "Token invalid or user not admin, redirecting to /unauthorized"
          );
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

  if (isAuthenticated === null) return <p>Loading...</p>;
  if (!isAuthenticated) return null;

  return (
    <DashboardLayout user={user}>
      <div
        style={{
          backgroundColor: "#D8CBB0",
          minHeight: "100vh",
          padding: "2rem",
          width: "100%",
        }}
      >
        <h1
          style={{ fontSize: "20px", fontWeight: "600", marginBottom: "1rem" }}
        >
          All Category
        </h1>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "2rem",
            minHeight: "100vh",
          }}
        >
          {/* Search and Add New button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                width: "60%",
              }}
            >
              <FiSearch
                size={20}
                style={{ marginRight: "0.5rem", color: "#777" }}
              />
              <input
                type="text"
                placeholder="Search Here"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "14px",
                }}
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: "#EFE9DC",
                border: "1px solid #ccc",
                padding: "0.5rem 1.5rem",
                borderRadius: "10px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              + Add New
            </button>
          </div>

          {/* Add Category Modal */}
          {showForm && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 50,
              }}
            >
              <AddCategoryForm
                onClose={() => {
                  setShowForm(false);
                  const token =
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null;
                  if (token) fetchCategories(token);
                }}
              />
            </div>
          )}

          {/* Categories Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#EFEFEF", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Category</th>
                <th style={{ padding: "0.75rem" }}>Contents</th>
                <th style={{ padding: "0.75rem" }}>Joined Date</th>
                <th style={{ padding: "0.75rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "1.5rem" }}>
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        style={{ marginRight: "0.5rem" }}
                      />
                      {item.name}
                    </td>
                    <td style={{ padding: "1.5rem" }}>
                      {item.description || "N/A"}
                    </td>
                    <td style={{ padding: "1.5rem" }}>
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td
                      style={{
                        padding: "1.5rem",
                        display: "flex",
                        gap: "0.75rem",
                      }}
                    >
                      <FiEdit2 style={{ cursor: "pointer" }} />
                      <FiTrash2 style={{ cursor: "pointer" }} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: "1.5rem", textAlign: "center" }}
                  >
                    {error || "No categories found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}