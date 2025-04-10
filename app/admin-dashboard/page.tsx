"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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

  if (!user)
    return (
      <p
        style={{
          textAlign: "center",
          paddingTop: "2.5rem",
          fontSize: "1rem",
        }}
      >
        Loading...
      </p>
    );

  const stats = [
    { label: "Views", value: "7,265", change: "+11.01%" },
    { label: "Visits", value: "3,671", change: "-0.03%" },
    { label: "New Users", value: "256", change: "+15.03%" },
    { label: "Active Users", value: "2,318", change: "+6.08%" },
  ];

  const projects = [
    { manager: "ByeWind", date: "Jun 24, 2025", status: "In Progress" },
    { manager: "Natali Craig", date: "Mar 10, 2025", status: "Complete" },
    { manager: "Drew Cano", date: "Nov 10, 2025", status: "Pending" },
    { manager: "Orlando Diggs", date: "Dec 20, 2025", status: "Approved" },
    { manager: "Andi Lane", date: "Jul 25, 2025", status: "Rejected" },
  ];

  const statusStyles: Record<string, React.CSSProperties> = {
    "In Progress": { backgroundColor: "#E0E7FF", color: "#4338CA" },
    Complete: { backgroundColor: "#D1FAE5", color: "#065F46" },
    Pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
    Approved: { backgroundColor: "#FDE68A", color: "#854D0E" },
    Rejected: { backgroundColor: "#E5E7EB", color: "#6B7280" },
  };

  const usersByLocation = [
    { label: "United States", value: 52.1 },
    { label: "Canada", value: 22.8 },
    { label: "Mexico", value: 13.9 },
    { label: "Other", value: 11.2 },
  ];
  const chartData = {
    "Users by Location": [
      { label: "India", value: 40 },
      { label: "USA", value: 30 },
      { label: "UK", value: 20 },
      { label: "Others", value: 10 },
    ],
    "Users by Age": [
      { label: "18-24", value: 35 },
      { label: "25-34", value: 40 },
      { label: "35-44", value: 15 },
      { label: "45+", value: 10 },
    ],
  };

  const COLORS = ["#E9D9D4", "#DCD3D0", "#6B4A45", "#713f12"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}>
      <DashboardLayout user={user}>
        <div
          style={{
            padding: "1.5rem",
            fontFamily: "sans-serif",
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "1rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {/* Breadcrumb */}
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6B7280",
                marginBottom: "1.5rem",
              }}
            >
              <span>Dashboards</span> /{" "}
              <span
                style={{
                  fontWeight: "500",
                  color: "#000",
                  marginLeft: "0.5rem",
                }}
              >
                Overview
              </span>
            </div>

            {/* Welcome Section */}
            <div
              style={{
                marginBottom: "2.5rem",
                borderRadius: "1rem",
                backgroundColor: "#DCD3D0",
                padding: "2rem 1.5rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  marginBottom: "0.75rem",
                  color: "#000",
                }}
              >
                "Welcome, Admin!"
              </h1>
              <p
                style={{
                  color: "#1F2937",
                  maxWidth: "48rem",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                }}
              >
                Great job! You've engaged 85% of visitors, welcomed 120 new
                users this month, and boosted active researchers by 30%. Keep up
                the amazing work in growing the ScholarShare community and
                making research more accessible!
              </p>
            </div>

            {/* Stats Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {stats.map((stat, idx) => {
                const isPositive = stat.change.startsWith("+");
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: "1rem",
                      backgroundColor: "#6B4A45",
                      color: "white",
                      padding: "1.25rem 1.5rem",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                      {stat.value}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "0.25rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      {isPositive ? (
                        <ArrowUpRight
                          size={16}
                          style={{ color: "#4ade80", marginRight: "0.25rem" }}
                        />
                      ) : (
                        <ArrowDownRight
                          size={16}
                          style={{ color: "#f87171", marginRight: "0.25rem" }}
                        />
                      )}
                      <span
                        style={{
                          color: isPositive ? "#4ade80" : "#f87171",
                          fontWeight: 500,
                        }}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart and Notifications Section */}
            <div
              style={{
                display: "flex",
                marginTop: "3rem",
                flexWrap: "wrap",
                gap: "2rem",
              }}
            >
              {/* Chart Section */}
              <div
                style={{
                  flex: "1 1 60%",
                  borderRadius: "1rem",
                  backgroundColor: "#F9FAFB",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    marginBottom: "1rem",
                    color: "#A78BFA",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      borderBottom: "2px solid #A78BFA",
                      paddingBottom: "0.25rem",
                    }}
                  >
                    Users
                  </span>
                  <span style={{ color: "#9CA3AF" }}>Projects</span>
                  <span style={{ color: "#9CA3AF" }}>Operating Status</span>
                </div>

                {/* Line Chart (Mockup) */}
                <div
                  style={{
                    height: "200px",
                    borderTop: "1px solid #E5E7EB",
                    borderBottom: "1px solid #E5E7EB",
                    position: "relative",
                    marginTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                    (month, i) => (
                      <div
                        key={i}
                        style={{ textAlign: "center", position: "relative" }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "#000",
                            borderRadius: "9999px",
                            margin: "0 auto",
                            marginBottom: "0.5rem",
                            border: "2px solid white",
                          }}
                        />
                        <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                          {month}
                        </div>
                      </div>
                    )
                  )}
                  <svg
                    viewBox="0 0 300 100"
                    preserveAspectRatio="none"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <path
                      d="M0,80 C50,20 100,60 150,30 C200,80 250,50 300,60"
                      stroke="#6B4A45"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* Notifications Section */}
              <div
                style={{
                  flex: "1 1 30%",
                  borderRadius: "1rem",
                  backgroundColor: "#F3F4F6",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  Notifications
                </h3>
                {[
                  { msg: "You fixed a bug.", time: "Just now" },
                  { msg: "New user registered.", time: "59 minutes ago" },
                  { msg: "You fixed a bug.", time: "12 hours ago" },
                  {
                    msg: "Andi Lane subscribed to you.",
                    time: "Today, 11:59 AM",
                  },
                ].map((notif, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "#E5E7EB",
                        marginRight: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      🛠️
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{notif.msg}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                        {notif.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            <div
              style={{
                marginBottom: "2rem",
                backgroundColor: "#fff",
                padding: "1rem 1rem",
                borderRadius: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Projects</h2>
              <table
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr style={{ margin: "2rem 2rem", color: "#6B7280" }}>
                    <th>Manager</th>
                    <th>Date</th>
                    <th>Last updated</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj, i) => (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#E9D9D4" : "#D4BEB8",
                        borderRadius: "0.75rem",
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        {proj.manager}
                      </td>
                      <td>{proj.date}</td>
                      <td>{proj.date}</td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            fontWeight: 500,
                            fontSize: "0.75rem",
                            ...statusStyles[proj.status],
                          }}
                        >
                          {proj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Charts Section */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "2rem",
                marginBottom: "4rem",
              }}
            >
              {["Users by Location", "Users by Age"].map((title, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: "1 1 45%",
                    backgroundColor: "#fff",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
                    {title}
                  </h3>

                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "200px",
                      marginBottom: "1rem",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData[title]}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          label
                        >
                          {chartData[title].map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "#374151" }}>
                    {chartData[title].map((item, index) => (
                      <li key={index} style={{ marginBottom: "0.25rem" }}>
                        ● {item.label} - {item.value}%
                      </li>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}