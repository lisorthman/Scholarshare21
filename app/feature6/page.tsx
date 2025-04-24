import React, { ReactNode } from "react";
import NavBar from "../../components/Navbar";
import Image from "next/image";
import { Poppins } from "next/font/google"; // Import Poppins

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
  return (
    <div
      style={{
        backgroundColor: "#f5f1f3",
        padding: "2rem",
        borderRadius: "2rem",
        maxWidth: "900px",
        margin: "2rem auto",
        textAlign: "center",
      }}
    >
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
          <br></br>
          <p>
            <strong>Key Features</strong>
          </p>
          <ul style={{ paddingLeft: "1.2rem" }}>
            <li>
              <strong>Free Access to Research</strong> –Browse and download
              research papers without any subscription.
            </li>
            <li>
              <strong>Effortless Publishing</strong> – Publish your work easily
              and gain worldwide recognitionPeer Review
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
      className={poppins.className} // Apply Poppins here
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
