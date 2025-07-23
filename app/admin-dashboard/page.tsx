"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: "user" | "admin" | "researcher";
    _id: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
  } | null>(null);
  const [analytics, setAnalytics] = useState({
    views: 0,
    newUsers: 0,
    totalDownloads: 0,
    paperSubmissions: 0,
    reviewCount: 0,
    registeredResearchers: 0,
    changes: {
      viewsChange: "0.00%",
      newUsersChange: "0.00%",
      totalDownloadsChange: "0.00%",
      paperSubmissionsChange: "0.00%",
      reviewCountChange: "0.00%",
      registeredResearchersChange: "0.00%",
    },
  });
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [totalDownloadsChange, setTotalDownloadsChange] = useState("0.00%");
  const [notifications, setNotifications] = useState<{ msg: string; time: string; type: string; status?: string }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ month: string; users: number }[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          setUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            _id: data.user._id,
            createdAt: data.user.createdAt,
            updatedAt: data.user.updatedAt,
            lastLogin: data.user.lastLogin,
          });
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.push("/signin");
      }
    };

    verifyToken();

    const trackView = async () => {
      try {
        await fetch('/api/admin/track-view', { method: 'POST' });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };
    trackView();
  }, [router]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const result = await response.json();
      setAnalytics(prev => ({
        ...prev,
        views: result.views || 0,
        newUsers: result.newUsers || 0,
        paperSubmissions: result.paperSubmissions || 0,
        reviewCount: result.reviewCount || 0,
        registeredResearchers: result.registeredResearchers || 0,
        changes: {
          ...prev.changes,
          viewsChange: result.changes?.viewsChange || "0.00%",
          newUsersChange: result.changes?.newUsersChange || "0.00%",
          paperSubmissionsChange: result.changes?.paperSubmissionsChange || "0.00%",
          reviewCountChange: result.changes?.countChange || "0.00%",
          registeredResearchersChange: result.changes?.registeredResearchersChange || "0.00%",
        },
      }));
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      console.log("Fetched notifications:", data); // Debug raw API response
      const pendingNotifications = data.filter((notif: { msg: string; time: string; type: string; status?: string }) => 
        notif.type === 'paper' || notif.type === 'researcher' // Include both types
      );
      console.log("Filtered notifications:", pendingNotifications); // Debug filtered result
      setNotifications(pendingNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      const [usersResponse, researchersResponse] = await Promise.all([
        fetch('/api/admin/user-growth?role=user', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/admin/user-growth?role=researcher', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      const usersData = await usersResponse.json();
      const researchersData = await researchersResponse.json();

      const usersMap = usersData.reduce((acc: { [key: string]: number }, item: { month: string; users: number }) => {
        acc[item.month] = item.users;
        return acc;
      }, {});
      const researchersMap = researchersData.reduce((acc: { [key: string]: number }, item: { month: string; users: number }) => {
        acc[item.month] = item.users;
        return acc;
      }, {});

      const allMonths = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07"];
      setChartData({
        labels: allMonths,
        datasets: [
          {
            label: "General Users",
            data: allMonths.map(month => usersMap[month] || 0),
            backgroundColor: "#DCD3D0",
            borderColor: "#DCD3D0",
            borderWidth: 1,
            borderRadius: 5,
          },
          {
            label: "Registered Researchers",
            data: allMonths.map(month => researchersMap[month] || 0),
            backgroundColor: "#704A4A",
            borderColor: "#704A4A",
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching user growth data:", error);
    }
  };

  const fetchTotalDownloads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/total-downloads', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched total downloads data:", data);
      setTotalDownloads(data.totalDownloads || 0);
      setTotalDownloadsChange(`${data.downloadPercentageChange >= 0 ? '+' : ''}${data.downloadPercentageChange.toFixed(2)}%` || "0.00%");
    } catch (error) {
      console.error("Error fetching total downloads:", error);
      setTotalDownloads(0);
      setTotalDownloadsChange("0.00%");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchNotifications();
    fetchUserGrowth();
    fetchTotalDownloads();
    const analyticsInterval = setInterval(fetchAnalyticsData, 30000);
    const notificationsInterval = setInterval(fetchNotifications, 10000);
    const growthInterval = setInterval(fetchUserGrowth, 30000);
    const downloadsInterval = setInterval(fetchTotalDownloads, 30000);
    return () => {
      clearInterval(analyticsInterval);
      clearInterval(notificationsInterval);
      clearInterval(growthInterval);
      clearInterval(downloadsInterval);
    };
  }, []);

  if (!user)
    return (
      <p style={{ textAlign: "center", paddingTop: "2.5rem", fontSize: "1rem" }}>
        Loading...
      </p>
    );

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

  const COLORS = ["#E9D9D4", "#DCD3D0", "#6B4A45", "#713f12"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}>
      <DashboardLayout user={user}>
        <div
          style={{
            padding: "1.5rem",
            fontFamily: "sans-serif",
            width: "100%",
            maxWidth: "100%",
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
                "Welcome, {user.name}!"
              </h1>
              <p
                style={{
                  color: "#1F2937",
                  maxWidth: "48rem",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                }}
              >
                Great job! You've engaged 85% of visitors, welcomed {analytics.newUsers} new
                users this month, and boosted research activity. Keep up the amazing work in growing the ScholarShare community!
              </p>
            </div>

            {/* Analytics Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {[
                { label: "Views", value: analytics.views, change: analytics.changes.viewsChange },
                { label: "New Users", value: analytics.newUsers, change: analytics.changes.newUsersChange },
                { label: "Total Downloads", value: totalDownloads, change: totalDownloadsChange },
                { label: "Paper Submissions", value: analytics.paperSubmissions, change: analytics.changes.paperSubmissionsChange },
                { label: "Review Count", value: analytics.reviewCount, change: analytics.changes.reviewCountChange },
                { label: "Registered Researchers", value: analytics.registeredResearchers, change: analytics.changes.registeredResearchersChange },
              ].map((stat, idx) => {
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
                      opacity: loading && stat.label === "Total Downloads" ? 0.5 : 1,
                      minHeight: "120px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                      {stat.value.toLocaleString()}
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
                          style={{ color: "#DCD3D0", marginRight: "0.25rem" }}
                        />
                      ) : (
                        <ArrowDownRight
                          size={16}
                          style={{ color: "#f87171", marginRight: "0.25rem" }}
                        />
                      )}
                      <span
                        style={{
                          color: isPositive ? "#DCD3D0" : "#f87171",
                          fontWeight: 500,
                        }}
                      >
                        {stat.change}
                      </span>
                    </div>
                    {loading && stat.label === "Total Downloads" && (
                      <p style={{ fontSize: "0.75rem", color: "#fff", marginTop: "0.5rem" }}>
                        Loading...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chart and Panels Section */}
            <div
              style={{
                display: "flex",
                marginTop: "3rem",
                gap: "2rem",
              }}
            >
              {/* Chart Section */}
              <div
                style={{
                  flex: "1 1 70%",
                  borderRadius: "1.5rem",
                  backgroundColor: "#F9FAFB",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#000000",
                    marginBottom: "0.75rem",
                  }}
                >
                  General User and Researcher Growth
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1rem" }}>
                  January - July 2025
                </div>
                <div style={{ width: "100%", minHeight: "400px", position: "relative" }}>
                  {chartData ? (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: "Number of General Users and Researchers Registered per Month",
                          },
                          legend: {
                            position: "top",
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Month",
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Number of Users",
                            },
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "400px",
                      }}
                    >
                      <p>Loading chart...</p>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6B7280" }}>
                  <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    Trending up by {analytics.changes.newUsersChange} this month <ArrowUpRight size={16} />
                  </div>
                  <div style={{ marginTop: "0.25rem" }}>
                    Showing total users and researchers for the last 7 months
                  </div>
                </div>
              </div>

              {/* Notifications Panel */}
              <div
                style={{
                  flex: "1 1 30%",
                  borderRadius: "1rem",
                  backgroundColor: "#F3F4F6",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  maxHeight: "500px",
                  overflowY: "auto",
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
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "1rem",
                        fontSize: "0.875rem",
                        backgroundColor: "#fff",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          width: "1.5rem",
                          height: "1.5rem",
                          borderRadius: "9999px",
                          backgroundColor: notif.type === 'paper' ? '#DCD3D0' : '#E0F7FA',
                          marginRight: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        {notif.type === 'paper' ? '📄' : '👨‍🔬'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{notif.msg}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                          {notif.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#9CA3AF", textAlign: "center" }}>
                    No new notifications.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}