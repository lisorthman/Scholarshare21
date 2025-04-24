
// components/DashboardLayout.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DashboardHeader from "./DashboardHeader";
import { User } from "@/types/user";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User; // Now using the User interface
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
    localStorage.removeItem("token");
    router.push("/signin");
  };

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
          role={["admin", "researcher", "user"].includes(user.role) ? (user.role as "admin" | "researcher" | "user") : "user"}
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
            role={["admin", "researcher", "user"].includes(user.role) ? (user.role as "admin" | "researcher" | "user") : undefined}
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
