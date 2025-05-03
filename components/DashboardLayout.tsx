"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DashboardHeader from "./DashboardHeader";
import { User } from "@/types/user";

// Define prop types for child components
interface DashboardHeaderProps {
  onMenuClick: () => void;
  title: string;
  role?: "admin" | "researcher" | "user"; // Make role optional
}

interface SidebarProps {
  role?: "admin" | "researcher" | "user"; // Make role optional
  onLogout: () => void;
  onPageChange: (page: string) => void;
  isVisible: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null; // Updated to allow null
  defaultPage?: string;
}

export default function DashboardLayout({
  children,
  user,
  defaultPage = "Dashboard",
}: DashboardLayoutProps) {
  const router = useRouter();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(defaultPage);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/signin");
  };

  // Loading state if user is null
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <p>Loading user data...</p>
      </div>
    );
  }

  // Safe role access with fallback
  const userRole = ["admin", "researcher", "user"].includes(user.role)
    ? (user.role as "admin" | "researcher" | "user")
    : "user"; // Default to "user" for both Sidebar and DashboardHeader

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "auto",
        backgroundColor: "#f0f2f5",
        fontFamily: "Arial, sans-serif",
        
      }}
    >
      <Navbar />

      <div
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <DashboardHeader
          onMenuClick={() => setIsSidebarVisible(!isSidebarVisible)}
          title={currentPage}
          role={userRole}
        />
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "250px",
            backgroundColor: "#ffffff",
            boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)",
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            transform: isSidebarVisible ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease",
            zIndex: 10,
          }}
        >
          <Sidebar
            role={userRole}
            onLogout={handleLogout}
            onPageChange={(page) => setCurrentPage(page)}
            isVisible={isSidebarVisible}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            overflowY: "auto",
            marginLeft: isSidebarVisible ? "250px" : "0",
            transition: "margin-left 0.3s ease",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
