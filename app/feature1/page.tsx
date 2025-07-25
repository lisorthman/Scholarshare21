'use client'; // Enables client-side hooks like useRouter

import NavBar from "../../components/Navbar";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation"; // Import useRouter

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const FreeAccessSection = () => {
  const router = useRouter(); // Initialize router

  const handleJoinClick = () => {
    router.push("/signup"); // Navigate to signup page
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
          fontFamily: "sans-serif",
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
          Free Access to Research Paper
        </h1>
        <p
          style={{ fontStyle: "italic", color: "#a38a96", marginTop: "0.25rem" }}
        >
          "Unlock Knowledge Without Barriers"
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
              src="/21532509_6432092 1.png"
              alt="Illustration"
              width={250}
              height={250}
              style={{ borderRadius: "1rem" }}
            />
          </div>

          <div style={{ flex: 2, textAlign: "left", minWidth: "300px" }}>
            <p>
              <strong>At ScholarShare</strong>, we believe that knowledge should
              be accessible to everyone. Our platform provides free access to a
              vast collection of research papers, empowering students,
              researchers, and knowledge seekers worldwide.
            </p>
            <br />
            <p>
              <strong>Why Free Access?</strong>
            </p>
            <ul style={{ paddingLeft: "1.2rem" }}>
              <li>
                Democratizing Research: No paywalls or restrictions—anyone can
                explore cutting-edge research.
              </li>
              <li>
                Global Collaboration: Enables scholars from different backgrounds
                to share and build upon existing work.
              </li>
              <li>
                Support for Innovation: Open access accelerates discoveries in
                science, technology, medicine, and beyond.
              </li>
            </ul>

            <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
              What You Can Do?
            </p>
            <ul style={{ paddingLeft: "1.2rem" }}>
              <li>
                Browse thousands of research papers by title, author, keywords, or
                field of study.
              </li>
              <li>
                Download and cite papers for academic and professional use.
              </li>
              <li>Bookmark and save research for future reference.</li>
              <li>Engage with researchers through discussions and reviews.</li>
            </ul>

            <p style={{ fontWeight: "bold", marginTop: "1rem" }}>
              Join us in making knowledge open for all. Start exploring today!
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

export default FreeAccessSection;
