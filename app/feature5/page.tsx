'use client';

import React, { ReactNode } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation"; // 🧭 Import router
import { Poppins } from 'next/font/google';
import NavBar from "@/components/Navbar";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface LayoutProps {
  children: ReactNode;
}

const FreeAccessSection = () => {
  const router = useRouter(); // ⬅️ Router hook

  const handleJoinClick = () => {
    router.push("/signup"); // ⬅️ Navigate to signup
  };

  const handleBackToHome = () => {
    router.push("/"); // Navigate back to home page
  };

  return (
    <div 
      className={poppins.className}
      style={{
        color: '#000',
        minHeight: '100vh',
        backgroundColor: 'white',
      }}
    >
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        marginBottom: '20px',
      }}>
        {/* Optional Header */}
      </div>
      
      {/* Rate and Review Section */}
      <div style={{
        backgroundColor: '#f5f1f3',
        padding: '2rem',
        borderRadius: '2rem',
        maxWidth: '900px',
        margin: '2rem auto',
        textAlign: 'center',
        position: 'relative'
      }}>
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
        <h1 style={{ color: '#5b2a3c', fontSize: '1.8rem', fontWeight: 'bold' }}>
          Rate and Review for Research Papers
        </h1>
        <p style={{ fontStyle: 'italic', color: '#a38a96', marginTop: '0.25rem' }}>
          "Find the Research You Need, Faster"
        </p>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginTop: '2rem' 
        }}>
          <Image 
            src="/jj_design-removebg-preview 1.png" 
            alt="Rate and Review Illustration" 
            width={250} 
            height={200} 
          />
        </div>

        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'left' 
        }}>
          <p>
            With the Rate and Review feature, users can provide valuable feedback on research papers,
            helping authors enhance their work while guiding future readers in selecting high-quality content.
          </p>
          <br />
          <p><strong>Key Features</strong></p>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li><strong>Rating System</strong> – Score research papers based on clarity, impact, and relevance.</li>
            <li><strong>Detailed Reviews</strong> – Provide insightful feedback to help authors refine their work.</li>
            <li><strong>Peer Discussions</strong> – Engage in scholarly discussions with fellow researchers.</li>
            <li><strong>Community Trust</strong> – Higher-rated papers gain visibility and credibility.</li>
          </ul>
        </div>

        <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>
          Join us in building a collaborative research environment by sharing your insights!
        </p>

        <button 
          onClick={handleJoinClick}
          style={{
            backgroundColor: '#5b2a3c',
            color: 'white',
            padding: '0.6rem 1.5rem',
            border: 'none',
            borderRadius: '2rem',
            cursor: 'pointer',
            marginTop: '1rem',
            fontWeight: 'bold'
          }}
        >
          JOIN US
        </button>
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
      <FreeAccessSection />
      {children}
    </div>
  );
};

export default Layout;
