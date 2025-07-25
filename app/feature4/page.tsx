'use client';

import React from "react";
import NavBar from "@/components/Navbar";
import { useRouter } from "next/navigation"; // 🧭 import router
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const ProfileAnalytics = () => {
  const router = useRouter(); // ⬅️ Initialize router

  const handleJoinClick = () => {
    router.push("/signup"); // ⬅️ Redirect to signup
  };

  const handleBackToHome = () => {
    router.push("/"); // Navigate back to home page
  };

  return (
    <div
      className={poppins.className}
      style={{
        color: "#000",
        minHeight: "100vh",
        backgroundColor: "white",
      }}
    >
      <NavBar />
      <div
        style={{
          backgroundColor: "#f5f1f3",
          padding: "2rem",
          borderRadius: "2rem",
          maxWidth: "900px",
          margin: "2rem auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            backgroundColor: "transparent",
            border: "none",
            color: "#5b2a3c",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
            fontWeight: "500",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(91, 42, 60, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>←</span>
          Back to Home
        </button>
        <h1 style={{ color: "#5b2a3c", fontSize: "1.8rem", fontWeight: "bold" }}>
          Profile analytics for Users & Publishers
        </h1>
        <p
          style={{ fontStyle: "italic", color: "#a38a96", marginTop: "0.25rem" }}
        >
          "Gain Insights into Your Research Impact"
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "2rem",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "250px" }}>
            <img
              src="/Vector1.png"
              alt="Analytics Illustration"
              width={200}
              height={200}
              style={{ borderRadius: "1rem" }}
            />
          </div>

          <div style={{ flex: 2, textAlign: "left", minWidth: "300px" }}>
            <p>
              With Profile Analytics, both Users and Research Publishers can track
              engagement, measure research impact, and optimize their
              contributions to the academic community.
            </p>
            <br />
            <p>
              <strong>Key Analytics for Research Publishers</strong>
            </p>
            <ul style={{ paddingLeft: "1.2rem" }}>
              <li>
                📄 <strong>Paper Views & Downloads</strong> – Track research access
              </li>
              <li>
                ✈️ <strong>Engagement Metrics</strong> – View ratings and reviews
              </li>
              <li>
                🔍 <strong>Search Trends</strong> – Discover popular keywords
              </li>
              <li>
                📅 <strong>Researcher Calendar</strong> – Manage deadlines
              </li>
            </ul>
            <br />
            <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
              Make data-driven decisions for your research!
            </p>

            <button
              onClick={handleJoinClick} // 🖱️ Click handler added
              style={{
                backgroundColor: "#5b2a3c",
                color: "white",
                padding: "0.6rem 1.5rem",
                border: "none",
                borderRadius: "2rem",
                cursor: "pointer",
                marginTop: "1rem",
                fontWeight: "bold",
              }}
            >
              JOIN US
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAnalytics;
