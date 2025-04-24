"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

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

  const pdfData = [
    {
      title: "The Impact of Lifestyle on Cardiovascular Diseases",
      details:
        "Explores how diet, exercise, and stress levels influence heart disease risk",
      date: "2025-01-10",
      owner: "Dr. Tarun",
      status: "Approved",
    },
    {
      title: "Organic Farming vs. Conventional Farming: A Comparative Study",
      details:
        "Analyzes the benefits and drawbacks of organic farming in terms of yield, cost, and environmental impact.",
      date: "2024-09-01",
      owner: "Ivor ES",
      status: "Rejected",
    },
    {
      title: "Alternative Fuels for Sustainable Transportation",
      details:
        "Explores biofuels, hydrogen fuel cells, and other alternatives for reducing carbon emissions.",
      date: "2024-08-23",
      owner: "Adhithiya sai",
      status: "Rejected",
    },
    {
      title:
        "The Applications of Fibonacci Sequence in Nature and Architecture",
      details:
        "Examines how this mathematical pattern appears in plants, shells, and historical structures.",
      date: "2024-08-12",
      owner: "Hannah silvas",
      status: "Pending",
    },
    {
      title: "The Role of Poetry in Expressing Human Emotions",
      details:
        "Discusses how poetry has been used throughout history to convey deep emotional and philosophical ideas.",
      date: "2024-07-30",
      owner: "Supun Jayakodi",
      status: "Approved",
    },
    {
      title: "AI-Powered Chatbots for E-Commerce Customer Support",
      details:
        "Studies the effectiveness of AI chatbots in handling customer queries, reducing response time.",
      date: "2024-07-21",
      owner: "-",
      status: "Pending",
    },
  ];

  const statusColors: Record<string, string> = {
    Approved: "#41A446",
    Pending: "#F4B740",
    Rejected: "#D84727",
  };

  return (
    <DashboardLayout user={user}>
      <div
        style={{
          backgroundColor: "#D8CBB0",
          padding: "2rem",
          borderRadius: "12px",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            maxWidth: "auto",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}
          >
            Pdf Approval
          </h1>

          {/* Search Bar */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <input
              type="text"
              placeholder="Search Here"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "14px",
                background: "transparent",
              }}
            />
          </div>

          {/* Table */}
          {/* Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#EFEFEF", textAlign: "left" }}>
                <th style={{ padding: "0.75rem" }}>Title</th>
                <th style={{ padding: "0.75rem" }}>Details</th>
                <th style={{ padding: "0.75rem" }}>Submitted date</th>
                <th style={{ padding: "0.75rem" }}>Owner</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem" }}>Actions</th>{" "}
                {/* New column header */}
              </tr>
            </thead>
            <tbody>
              {pdfData.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "1.5rem", verticalAlign: "top" }}>
                    {item.title}
                  </td>
                  <td style={{ padding: "1.5rem", verticalAlign: "top" }}>
                    {item.details}
                  </td>
                  <td style={{ padding: "1.5rem", verticalAlign: "top" }}>
                    {item.date}
                  </td>
                  <td style={{ padding: "1.5rem", verticalAlign: "top" }}>
                    {item.owner}
                  </td>
                  <td style={{ padding: "1.5rem", verticalAlign: "top" }}>
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
                      {item.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      verticalAlign: "top",
                      width: "250px",
                    }}
                  >
                    {item.status === "Pending" && (
                      <>
                        <button
                          style={{
                            backgroundColor: "#d1f0d1",
                            color: "#1a7f1a",
                            border: "1px solid #a8e6a1",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontSize: "13px",
                            marginRight: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => alert(`Approved: ${item.title}`)}
                        >
                          Approve
                        </button>

                        <button
                          style={{
                            backgroundColor: "#fddddd",
                            color: "#d13434",
                            border: "1px solid #f8bfbf",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontSize: "13px",
                            marginRight: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => alert(`Rejected: ${item.title}`)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      style={{
                        backgroundColor: "#e7f0fd",
                        color: "#0070f3",
                        border: "1px solid #c2ddf9",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      onClick={() => alert(`Viewing PDF: ${item.title}`)}
                    >
                      View
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
