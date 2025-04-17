"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";

const categories = [
  {
    category: "Engineering",
    contents: "Mechanical, chemical, automobile, Computer Science",
    date: "2025-01-10",
  },
  {
    category: "Mathematics",
    contents: "Statistics, puremaths, Integration, Calculus",
    date: "2024-09-01",
  },
  {
    category: "Medical Science",
    contents: "Anatomy, plant biology, Biochemicals",
    date: "2024-08-23",
  },
  {
    category: "Agricultural",
    contents: "Plant sectors, Animal Husbandry",
    date: "2024-08-12",
  },
  {
    category: "Architecture",
    contents: "Landscape, transport, Quantity surveying",
    date: "2024-07-30",
  },
  {
    category: "Journalism",
    contents: "Tourism",
    date: "2024-07-21",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

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

  if (!user) return <p>Loading...</p>;

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
            <Link 
              href="/addpage"
              style={{
                backgroundColor: "#EFE9DC",
                border: "1px solid #ccc",
                padding: "0.5rem 1.5rem",
                borderRadius: "10px",
                fontWeight: "500",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              + Add New
            </Link>
          </div>

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
              {categories.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      style={{ marginRight: "0.5rem" }}
                    />
                    {item.category}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{item.contents}</td>
                  <td style={{ padding: "0.75rem" }}>{item.date}</td>
                  <td
                    style={{
                      padding: "0.75rem",
                      display: "flex",
                      gap: "0.75rem",
                    }}
                  >
                    <FiEdit2 style={{ cursor: "pointer" }} />
                    <FiTrash2 style={{ cursor: "pointer" }} />
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