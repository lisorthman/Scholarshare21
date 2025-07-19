'use client';

import React, { ReactNode } from "react";
import NavBar from "../../components/Navbar";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation"; // ⬅️ Import useRouter

// Configure Poppins font
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface LayoutProps {
  children: ReactNode;
}

const AdvancedSearchSection = () => {
  const router = useRouter(); // ⬅️ Initialize router

  const handleJoinClick = () => {
    router.push("/signup"); // ⬅️ Navigate to signup page
  };

  const handleBackToHome = () => {
    router.push("/"); // Navigate back to home page
  };

  return (
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
        Advanced search Functionality
      </h1>
      <p
        style={{ fontStyle: "italic", color: "#a38a96", marginTop: "0.25rem" }}
      >
        "Find the Research You Need, Faster"
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
            src="/Vector.png"
            alt="Advanced Search Illustration"
            width={250}
            height={250}
            style={{ borderRadius: "1rem" }}
          />
        </div>

        <div style={{ flex: 2, textAlign: "left", minWidth: "300px" }}>
          <p>
            <strong>ScholarShare's</strong> Advanced Search feature is designed
            to help you quickly locate the most relevant research papers with
            precision.
          </p>
          <p>
            Our search functionality is powered by{" "}
            <strong>Elasticsearch</strong>, providing fast and accurate results
            even in large datasets.
          </p>
          <br />
          <p>
            You can combine multiple filters to refine your search, making it
            easier to discover groundbreaking research.
          </p>
          <br />
          <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
            Start exploring with Advanced Search today and uncover the knowledge
            you need!
          </p>

          <button
            onClick={handleJoinClick} // ⬅️ Add onClick event
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
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
      <AdvancedSearchSection />
      {children}
    </div>
  );
};

export default Layout;
