// components/Layout.tsx
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
        Can add papers to Library
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
            src="/Untitled-1 1.png"
            alt="Advanced Search Illustration"
            width={250}
            height={250}
            style={{ borderRadius: "1rem" }}
          />
        </div>

        <div style={{ flex: 2, textAlign: "left", minWidth: "300px" }}>
          <p>
            With ScholarShare’s "Wishlist" feature, you can easily save research
            papers for quick access later. No more searching for the same paper
            multiple times—simply add it to your personal library and organize
            your research efficiently.
          </p>
          <br></br>
          <p>Your Research, Always Within Reach</p>
          <br></br>
          <p>
            The library feature ensures that as researcher your research is
            always accessible. Whether you're working on a project or compiling
            references for a paper, you can build your own custom research
            repository with ease.
          </p>
          <br></br>
          <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
            Start building your research wishlist today!
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
