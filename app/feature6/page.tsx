'use client';

import React from "react";
import NavBar from "../../components/Navbar";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation"; // 🧭 import useRouter

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const AdvancedSearchSection = () => {
  const router = useRouter(); // ⬅️ initialize router

  const handleJoinClick = () => {
    router.push("/signup"); // ⬅️ redirect to signup
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
          Feature platform for Researchers
        </h1>
        <p
          style={{ fontStyle: "italic", color: "#a38a96", marginTop: "0.25rem" }}
        >
          "Search and Organize Research Effortlessly"
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
            <Image
              src="/529567-removebg-preview.png"
              alt="Advanced Search Illustration"
              width={250}
              height={250}
              style={{ borderRadius: "1rem" }}
            />
          </div>

          <div style={{ flex: 2, textAlign: "left", minWidth: "300px" }}>
            <p>
              ScholarShare is the ultimate destination for researchers, providing
              a one-stop platform for publishing, sharing, and collaborating on
              academic work. Whether you're a seasoned scholar or just starting,
              our platform ensures global visibility, peer engagement, and
              professional growth.
            </p>
            <br />
            <p><strong>Key Features</strong></p>
            <ul style={{ paddingLeft: "1.2rem" }}>
              <li>
                <strong>Free Access to Research</strong> – Browse and download
                research papers without any subscription.
              </li>
              <li>
                <strong>Effortless Publishing</strong> – Publish your work easily
                and gain worldwide recognition.
              </li>
              <li>
                <strong>Feedback</strong> – Receive insightful feedback to refine
                your research.
              </li>
              <li>
                <strong>Profile Analytics </strong> – Track your impact,
                citations, and engagement.
              </li>
            </ul>
            <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
              Join ScholarShare today and take your research journey to the next
              level!
            </p>

            <button
              onClick={handleJoinClick}
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

export default AdvancedSearchSection;
