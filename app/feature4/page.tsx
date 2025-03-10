// components/Layout.tsx
import React, { ReactNode } from 'react';
import NavBar from '../../components/Navbar'; // Import NavBar

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        fontFamily: 'Space Grotesk, sans-serif',
        color: '#000',
        minHeight: '100vh',
        backgroundColor: 'white',
      }}
    >
      {/* Add the NavBar */}
      <NavBar />

      {/* Sample Text */}
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          marginBottom: '20px',
        }}
      >
        <h1>Welcome to ScholarShare</h1>
        <p>
          ScholarShare is your gateway to global research. Explore, collaborate,
          and innovate with access to a vast library of research papers.
        </p>
      </div>

      {/* Render the page content */}
      {children}

    </div>
  );
};

export default Layout;