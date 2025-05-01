"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddCategoryForm from "@/components/AddCategoryForm";
import { User } from "@/types/user";

// Define types for your data structures
interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string | Date;
  parentCategory?: string | null; // Add parentCategory to the interface
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null); // State for editing

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

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("No token found, please sign in again.");
        router.push("/signin");
        return;
      }

      const response = await fetch(`/api/admin/delete-category?id=${categoryToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      // Refetch categories to update the table
      await fetchCategories(token);
      alert(data.message);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const openDeleteModal = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setShowDeleteModal(true);
  };

  const openEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setShowForm(true);
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
              onClick={() => {
                setCategoryToEdit(null); // Clear edit mode
                setShowForm(true);
              }}
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

          {/* Add/Update Category Modal */}
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
                  setCategoryToEdit(null);
                  const token =
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null;
                  if (token) fetchCategories(token);
                }}
                categoryId={categoryToEdit?._id}
                initialName={categoryToEdit?.name}
                initialDescription={categoryToEdit?.description}
                initialParentCategory={categoryToEdit?.parentCategory}
                isUpdateMode={!!categoryToEdit}
              />
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && categoryToDelete && (
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
              <div
                style={{
                  backgroundColor: "white",
                  padding: "2rem",
                  borderRadius: "10px",
                  width: "400px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  Confirm Deletion
                </h2>
                <p style={{ fontSize: "14px", marginBottom: "1.5rem" }}>
                  Are you sure you want to delete the category "
                  {categoryToDelete.name}"?
                </p>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={handleDelete}
                    style={{
                      backgroundColor: "#EFE9DC",
                      border: "1px solid #ccc",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                    style={{
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #ccc",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
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
                <th style={{ padding: "0.75rem" }}>Description</th>
                <th style={{ padding: "0.75rem" }}>Created At</th>
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
                      <FiEdit2
                        style={{ cursor: "pointer" }}
                        onClick={() => openEditModal(item)} // Open form in edit mode
                      />
                      <FiTrash2
                        style={{ cursor: "pointer" }}
                        onClick={() => openDeleteModal(item._id, item.name)}
                      />
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