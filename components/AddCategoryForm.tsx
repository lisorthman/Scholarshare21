"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AddCategoryFormProps {
  onClose?: () => void;
  redirect?: boolean;
  categoryId?: string; // Add categoryId for update mode
  initialName?: string; // Pre-fill name
  initialDescription?: string; // Pre-fill description
  initialParentCategory?: string | null; // Pre-fill parentCategory
  isUpdateMode?: boolean; // Flag to indicate update mode
}

export default function AddCategoryForm({
  onClose,
  redirect = false,
  categoryId,
  initialName = "",
  initialDescription = "",
  initialParentCategory = null,
  isUpdateMode = false,
}: AddCategoryFormProps) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [parentCategory, setParentCategory] = useState(
    initialParentCategory || ""
  );
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AddCategoryForm: Token found:", token);

    if (!token) {
      console.log("AddCategoryForm: No token found, skipping fetch");
      return;
    }

    const fetchCategories = async () => {
      try {
        console.log("AddCategoryForm: Fetching categories...");
        const response = await fetch("/api/admin/fetch-categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error("AddCategoryForm: Fetch failed:", errorData);
          throw new Error(
            `Failed to fetch categories: ${response.status} - ${
              errorData.message || "Unknown error"
            }`
          );
        }
        const data = await response.json();
        console.log("AddCategoryForm: Categories fetched:", data);
        setCategories(data);
      } catch (error) {
        console.error(
          "AddCategoryForm: Error fetching admin categories:",
          error
        );
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    console.log("AddCategoryForm: Submitting form with token:", token);

    if (!token) {
      console.log("AddCategoryForm: No token found, cannot submit");
      setIsSubmitting(false);
      return;
    }

    try {
      const apiUrl = isUpdateMode
        ? `/api/admin/update-category?id=${categoryId}`
        : "/api/admin/Add-category";
      const method = isUpdateMode ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryName,
          description,
          parentCategory: parentCategory || null,
        }),
      });

      const result = await response.json();
      console.log("AddCategoryForm: Submit response:", result);

      if (response.ok) {
        const action = isUpdateMode ? "updated" : "added";
        alert(`Category "${categoryName}" ${action} successfully!`);
        setCategoryName("");
        setDescription("");
        setParentCategory("");
        if (redirect) {
          router.push("/admin/categories");
        }
        if (onClose) {
          onClose();
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("AddCategoryForm: Error submitting form:", error);
      alert(`Failed to ${isUpdateMode ? "update" : "add"} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", width: "100%" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "30px" }}>
        {isUpdateMode ? "Update Category" : "Add New Category"}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#000",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
            }}
          >
            Category Name*
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            style={inputStyle}
            required
            placeholder="Enter category name"
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
            }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: "100px" }}
            placeholder="Enter category description"
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
            }}
          >
            Parent Category (Optional)
          </label>
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select parent category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}
        >
          <button
            type="button"
            onClick={() => {
              setCategoryName("");
              setDescription("");
              setParentCategory("");
            }}
            style={secondaryButtonStyle}
          >
            Clear
          </button>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!categoryName || isSubmitting}
            style={{
              ...primaryButtonStyle,
              opacity: !categoryName || isSubmitting ? 0.7 : 1,
              cursor: !categoryName || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isUpdateMode
              ? isSubmitting
                ? "Updating..."
                : "Update Category"
              : isSubmitting
              ? "Adding..."
              : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "16px",
};

const primaryButtonStyle = {
  backgroundColor: "#EFE9DC",
  color: "black",
  border: "none",
  borderRadius: "6px",
  padding: "12px 24px",
  fontSize: "16px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  backgroundColor: "transparent",
  color: "rgb(206, 171, 162)",
  border: "1px solid rgb(206, 171, 162)",
  borderRadius: "6px",
  padding: "12px 24px",
  fontSize: "16px",
  cursor: "pointer",
};
