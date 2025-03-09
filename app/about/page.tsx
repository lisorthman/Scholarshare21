"use client"; // Mark this component as a Client Component

import React from 'react';
import NavBar from '../../components/Navbar'; // Import NavBar

const AboutPage: React.FC = () => {
  return (
    <div
      style={{
        fontFamily: 'Space Grotesk, sans-serif',
        color: '#000', // Black color for all text
        minHeight: '100vh', // Ensure the page takes full height
        backgroundColor: 'white', // Match the background color of the Login/Restore page
      }}
    >
      {/* NavBar - Full Width */}
      <div
        style={{
          width: '100%', // Ensure NavBar spans the full width
        }}
      >
        <NavBar />
      </div>

      {/* Main Content - Centered with Max Width */}
      <div
        style={{
          maxWidth: '1200px', // Limit the width of the content
          margin: '0 auto', // Center the content
          padding: '40px 20px', // Add padding for spacing
        }}
      >
        {/* Flex Container for "What is ScholarShare?" and Mission Box */}
        <div
          style={{
            display: 'flex',
            gap: '20px', // Reduced gap between sections
            alignItems: 'flex-start',
          }}
        >
          {/* Left Side - "What is ScholarShare?" and Description */}
          <div
            style={{
              flex: '1',
            }}
          >
            {/* Main Heading */}
            <div
              style={{
                fontSize: '2.25rem', // Adjustable font size (36px)
                marginBottom: '1.25rem', // Adjustable margin (20px)
              }}
            >
              What is
              <br /> {/* Line break */}
              <span style={{ fontWeight: 'bold' }}>ScholarShare</span>?
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '1.125rem', // Adjustable font size (18px)
                lineHeight: '1.6',
                marginBottom: '2.5rem', // Adjustable margin (40px)
              }}
            >
              ScholarShare is a revolutionary platform designed to democratize access to academic knowledge and foster global research collaboration. By enabling researchers to upload and showcase their work, it creates a seamless ecosystem where students, academics, and institutions can discover, engage with, and build upon cutting-edge research from around the world. Our mission is to break down barriers to knowledge and empower the global academic community through open and accessible research sharing.
            </p>

            {/* Image */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center', // Center the image horizontally
                marginBottom: '4.5rem', // Adjustable margin (40px)
              }}
            >
              <img
                src="/Group 31.png" // Path to the image in the public folder
                alt="ScholarShare Illustration"
                style={{
                  width: '45%', // Adjust width as needed
                  maxWidth: '500px', // Limit maximum width
                  height: 'auto', // Maintain aspect ratio
                }}
              />
            </div>
          </div>

          {/* Right Side - Mission Box */}
          <div
            style={{
              flex: '0 0 300px', // Fixed width for the box
              marginTop: '1.875rem', // Adjustable margin (30px)
            }}
          >
            <div
              style={{
                backgroundColor: '#F5F5F5', // Ash color
                borderRadius: '20px', // Curved edges
                padding: '1.25rem', // Adjustable padding (20px)
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
              }}
            >
              <h2
                style={{
                  fontSize: '1.5rem', // Adjustable font size (24px)
                  fontWeight: 'bold',
                  marginBottom: '0.625rem', // Adjustable margin (10px)
                  textAlign: 'center', // Center-align the Mission title
                }}
              >
                Mission
              </h2>
              <p
                style={{
                  fontSize: '1rem', // Adjustable font size (16px)
                  lineHeight: '1.6',
                }}
              >
                ScholarShare is dedicated to making academic knowledge accessible by providing an open platform where researchers and students can share, discover, and collaborate on groundbreaking research, fostering innovation and global academic growth.
              </p>
            </div>
          </div>
        </div>

        {/* New Full-Width Container Box - How it Works */}
        <div
          style={{
            backgroundColor: '#F5F5F5', // Ash color
            borderRadius: '20px', // Curved edges
            padding: '2rem', // Adjustable padding (32px)
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
            marginBottom: '2.5rem', // Adjustable margin (40px)
          }}
        >
          {/* How it Works Heading */}
          <h2
            style={{
              fontSize: '2.25rem', // Adjustable font size (36px)
              fontWeight: '600', // Slightly bolder (600 is semi-bold)
              marginBottom: '0.25rem', // Adjustable margin (20px)
              textAlign: 'left', // Left-align the heading
              letterSpacing: '0.5px',
            }}
          >
            How it works
          </h2>

          {/* Flex Container for Paragraph and Image */}
          <div
            style={{
              display: 'flex',
              gap: '1.25rem', // Adjustable gap (20px)
              alignItems: 'center', // Align items vertically
              marginBottom: '0.9rem',
            }}
          >
            {/* Paragraph */}
            <p
              style={{
                fontSize: '1.125rem', // Adjustable font size (18px)
                lineHeight: '1.6',
                flex: '1', // Take up remaining space
                textAlign: 'left', // Left-align the paragraph
              }}
            >
              ScholarShare indexes research papers from data providers including institutional and subject repositories, preprint servers, and open access and hybrid journals.
              <br />
              <br />
              ScholarShare currently contains <strong>318M</strong> open access articles collected from <strong>12K</strong> data providers around the world.
            </p>

            {/* Image */}
            <img
              src="/tempImageRKvQCR 1.png" // Path to the image in the public folder
              alt="Map Illustration"
              style={{
                width: '60%', // Increased width (60% of the container)
                maxWidth: '500px', // Increased maximum width
                height: 'auto', // Maintain aspect ratio
                borderRadius: '10px', // Add rounded corners to the image
                marginTop: '-40px', // Move the image slightly upward
              }}
            />
          </div>
        </div>

        {/* New Full-Width Container Box - What Next! */}
        <div
          style={{
            backgroundColor: '#F5F5F5', // Ash color
            borderRadius: '20px', // Curved edges
            padding: '2rem', // Adjustable padding (32px)
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
            marginBottom: '2.5rem', // Adjustable margin (40px)
          }}
        >
          {/* What Next! Heading */}
          <h2
            style={{
              fontSize: '2.25rem', // Adjustable font size (36px)
              fontWeight: '500', // Slightly bolder (600 is semi-bold)
              marginBottom: '1.25rem', // Adjustable margin (20px)
              textAlign: 'left', // Left-align the heading
              letterSpacing: '0.5px',
            }}
          >
            What Next!
          </h2>

          {/* Paragraph */}
          <p
            style={{
              fontSize: '1.125rem', // Adjustable font size (18px)
              lineHeight: '1.6',
              textAlign: 'left', // Left-align the paragraph
              marginBottom: '0.75rem', // Adjustable margin (20px)
            }}
          >
            As we continue to develop ScholarShare, our next steps include refining the platform’s features, enhancing user experience, and integrating advanced tools for seamless collaboration. We aim to launch a beta version for feedback, ensuring the platform meets the needs of researchers and students worldwide before a full-scale release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;