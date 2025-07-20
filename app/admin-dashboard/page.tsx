"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
} from "recharts";

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
  const [notifications, setNotifications] = useState<{ msg: string; time: string; type: string; status?: string }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ month: string; users: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ action: string; time: string }[]>([]);

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
            lastLogin: data.user.lastLogin, // Add lastLogin property
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
      setAnalytics(result);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      const pendingNotifications = data.filter((notif: { msg: string; time: string; type: string; status?: string }) => 
        notif.type === 'paper'
      );
      setNotifications(pendingNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      const response = await fetch('/api/admin/user-growth?role=user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setUserGrowth(data.map((item: any) => ({ month: item.month, users: item.users })));
    } catch (error) {
      console.error("Error fetching user growth data:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/recent-activities', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recent = data.filter((activity: { action: string; time: string }) => {
        const activityTime = new Date(activity.time);
        return activityTime >= oneWeekAgo;
      });
      setRecentActivities(recent);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchNotifications();
    fetchUserGrowth();
    fetchRecentActivities();
    const analyticsInterval = setInterval(fetchAnalyticsData, 30000);
    const notificationsInterval = setInterval(fetchNotifications, 10000);
    const growthInterval = setInterval(fetchUserGrowth, 30000);
    const activitiesInterval = setInterval(fetchRecentActivities, 10000); // Update every 10 seconds
    return () => {
      clearInterval(analyticsInterval);
      clearInterval(notificationsInterval);
      clearInterval(growthInterval);
      clearInterval(activitiesInterval);
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
                { label: "Total Downloads", value: analytics.totalDownloads, change: analytics.changes.totalDownloadsChange },
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
                  flex: "1 1 50%",
                  borderRadius: "1rem",
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
                  General User Growth
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1rem" }}>
                  January - June 2025
                </div>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userGrowth}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} stroke="#D1D5DB" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                        stroke="#374151"
                        fontSize="0.875rem"
                      />
                      <YAxis
                        stroke="#374151"
                        fontSize="0.875rem"
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        cursor={false}
                        contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #D1D5DB", borderRadius: "0" }}
                        itemStyle={{ color: "#374151" }}
                      />
                      <Line
                        type="natural"
                        dataKey="users"
                        stroke="#6B7280"
                        strokeWidth={2}
                        dot={{ fill: "#6B7280" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6B7280" }}>
                  <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    Trending up by {analytics.changes.newUsersChange} this month <ArrowUpRight size={16} />
                  </div>
                  <div style={{ marginTop: "0.25rem" }}>
                    Showing total users for the last 6 months
                  </div>
                </div>
              </div>

              {/* Notifications Panel */}
              <div
                style={{
                  flex: "1 1 25%",
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
                          backgroundColor: notif.type === 'paper' ? '#E8F5E9' : '#E0F7FA',
                          marginRight: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        {notif.type === 'paper' ? '📄' : '🔍'}
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

              {/* Recent Activities Panel */}
              <div
                style={{
                  flex: "1 1 25%",
                  borderRadius: "1rem",
                  backgroundColor: "#F3F4F6",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  maxHeight: "200px",
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
                  Recent Activities
                </h3>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => (
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
                          backgroundColor: "#E0F7FA",
                          marginRight: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        ⚙️
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{activity.action}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#9CA3AF", textAlign: "center" }}>
                    No recent activities.
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