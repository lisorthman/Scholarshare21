"use client"; // Mark this component as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import NavBar from '../components/Navbar'; // Import NavBar
import Footer from '@/components/Footer';

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0); // Track current slide
  const router = useRouter(); // Initialize the router

  // Slides data
  const slides = [
    {
      heading: 'Your Gateway to Global Research',
      subheading: 'Revolutionizing Research for All',
      paragraph:
        'Making research papers accessible to everyone, everywhere, ScholarShare connects researchers, students, and innovators to foster collaboration and inspire global discovery.',
      buttonText: 'Get Started',
      image: '/design-removebg-preview 1.png', // Image path
    },
    {
      heading: 'Slide 2 Heading',
      subheading: 'Slide 2 Subheading',
      paragraph: 'This is the content for the second slide.',
      buttonText: 'Learn More',
      image: '/image2.png', // Replace with your image path
    },
    {
      heading: 'Slide 3 Heading',
      subheading: 'Slide 3 Subheading',
      paragraph: 'This is the content for the third slide.',
      buttonText: 'Explore',
      image: '/image3.png', // Replace with your image path
    },
  ];

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Function to handle Get Started button click
  const handleGetStartedClick = () => {
    router.push('/signup'); // Redirect to the signup page
  };

  // Data for the six boxes
  const boxes = [
    {
      color: '#9E8F8F', // color
      heading: 'Free Access to ', // Heading text
      subheading: 'research paper', // Subheading text
      image: '/21532509_6432092 1.png', // Replace with your image path
      route: '/feature1', // Route for this box
    },
    {
      color: '#E0D8C3', // color
      heading: 'Advanced search',
      subheading: 'Functionality',
      image: '/Vector.png', // Replace with your image path
      route: '/feature2', // Route for this box
    },
    {
      color: '#F3F3F3', // color
      heading: 'Can add papers ',
      subheading: 'to library',
      image: '/Untitled-1 1.png', // Replace with your image path
      route: '/feature3', // Route for this box
    },
    {
      color: '#F3F3F3', // color
      heading: 'Profile analytics',
      subheading: 'for Users',
      extraSubheading: 'Publishers', // Extra subheading for the 4th box
      image: '/Vector1.png', // Replace with your image path
      route: '/feature4', // Route for this box
    },
    {
      color: '#E0D8C3', // color
      heading: 'Rate &',
      subheading: 'Review',
      image: '/jj_design-removebg-preview 1.png', // Replace with your image path
      route: '/feature5', // Route for this box
    },
    {
      color: '#9E8F8F', // color
      heading: 'Feature platform',
      subheading: 'for Researchers',
      image: '/529567-removebg-preview.png', // Replace with your image path
      route: '/feature6', // Route for this box
    },
  ];

  // Function to handle Learn More click
  const handleLearnMoreClick = (route: string) => {
    router.push(route); // Navigate to the specified route
  };

  return (
    <div
      style={{
        fontFamily: 'Space Grotesk, sans-serif',
        color: '#000', // Black color for all text
        minHeight: '100vh', // Ensure the page takes full height
        backgroundColor: 'white', // Match the background color
      }}
    >
      {/* NavBar - Full Width */}
      <div
        style={{
          width: '100%', // Ensure NavBar spans the full width
          position: 'sticky',
        }}
      >
        <NavBar />
      </div>

      {/* Slideshow Section */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {/* Main Ash-Colored Box */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#F5F5F5',
              borderRadius: '0 40px 40px 40px',
              padding: '40px',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                overflow: 'hidden',
              }}
            >
              {/* Text Content */}
              <div
                style={{
                  flex: '1',
                  minWidth: '300px',
                  maxWidth: '600px',
                }}
              >
                <h1
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '550',
                    marginBottom: '10px',
                    lineHeight: '1.2',
                  }}
                >
                  {slides[0].heading}
                </h1>
                <h2
                  style={{
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                    fontWeight: '400',
                    marginBottom: '20px',
                    color: '#555',
                  }}
                >
                  {slides[0].subheading}
                </h2>
                <p
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    lineHeight: '1.6',
                    marginBottom: '40px',
                    color: '#333',
                  }}
                >
                  {slides[0].paragraph}
                </p>
                <button
                  onClick={handleGetStartedClick}
                  style={{
                    backgroundColor: '#000',
                    color: '#FFF',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    fontWeight: '500',
                    fontFamily: 'Space Grotesk, sans-serif',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#000')}
                >
                  {slides[0].buttonText}
                </button>
              </div>
              {/* Image */}
              <div
                style={{
                  flex: '1',
                  minWidth: '300px',
                  maxWidth: '400px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={slides[0].image}
                  alt="Slide Illustration"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Heading */}
      <div
        style={{
          width: '100%',
          maxWidth: '1240px', // Match the max-width of the slideshow
          margin: '0 auto', // Center the box
          padding: '20px', // Add padding for spacing
        }}
      >
        <div
          style={{
            backgroundColor: '#E5E28C', // Ash color to match the slideshow
            borderRadius: '5px', // Curved edges
            padding: '5px', // Inner padding
            width: 'fit-content', // Adjust width to fit content
            maxHeight: '50px',
          }}
        >
          <h2
            style={{
              fontSize: '2rem', // Adjust font size
              fontWeight: '450', // Semi-bold
              color: '#000', // Black text
              margin: 0, // Remove default margin
            }}
          >
            Features
          </h2>
        </div>
      </div>

      {/* Six Boxes Below Features Heading */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px', // Match the max-width of the slideshow
          margin: '0 auto', // Center the box
          padding: '20px', // Add padding for spacing
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns
          gridTemplateRows: 'repeat(3, 1fr)', // 3 rows
          gap: '20px', // Space between boxes
        }}
      >
        {boxes.map((box, index) => (
          <div
            key={index}
            style={{
              backgroundColor: box.color, // Dynamic color for each box
              borderRadius: '20px', // Curved edges
              padding: '20px', // Inner padding
              display: 'flex',
              alignItems: 'center', // Center items vertically
              justifyContent: 'space-between', // Space between text and image
              height: '250px', // Adjust height of the box
              width: '100%', // Adjust width of the box
              position: 'relative', // For positioning text container
              border: '2px solid #000', // Add a border to the box
              borderBottomWidth: '6px', // Make the bottom border thicker
            }}
          >
            {/* Text Content (Left Side) */}
            <div
              style={{
                flex: '1', // Take up remaining space
                display: 'flex',
                flexDirection: 'column', // Stack heading and subheading vertically
                gap: '0', // Reduced space between heading and subheading
                marginTop: '-100px', // Move text slightly to the top
                marginLeft: '10px', // Move text slightly to the left
              }}
            >
              {/* Heading in a White Box */}
              <div
                style={{
                  backgroundColor:
                    index === 2 || index === 3
                      ? 'rgba(99, 65, 65, 0.14)' // Change opacity for 4th and 5th boxes
                      : 'rgba(255, 255, 255, 0.8)', // Default opacity
                  borderRadius: '5px', // Curved edges
                  padding: '2px', // Inner padding
                  width: 'fit-content', // Adjust width to fit content
                }}
              >
                <h3
                  style={{
                    fontSize: '1.5rem', // Adjust font size
                    fontWeight: '600', // Bold
                    margin: 0, // Remove default margin
                  }}
                >
                  {box.heading}
                </h3>
              </div>

              {/* Subheading in a White Box */}
              <div
                style={{
                  backgroundColor:
                    index === 2 || index === 3
                      ? 'rgba(99, 65, 65, 0.14)' // Change opacity for 4th and 5th boxes
                      : 'rgba(255, 255, 255, 0.8)', // Default opacity
                  borderRadius: '5px', // Curved edges
                  padding: '2px', // Inner padding
                  width: 'fit-content', // Adjust width to fit content
                }}
              >
                <h3
                  style={{
                    fontSize: '1.5rem', // Adjust font size
                    fontWeight: '600', // Semi-bold
                    margin: 0, // Remove default margin
                  }}
                >
                  {box.subheading}
                </h3>
              </div>

              {/* Extra Subheading for 5th Box */}
              {index === 3 && (
                <div
                  style={{
                    backgroundColor: 'rgba(99, 65, 65, 0.14)', // Change opacity for 5th box
                    borderRadius: '5px', // Curved edges
                    padding: '2px', // Inner padding
                    width: 'fit-content', // Adjust width to fit content
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.5rem', // Adjust font size
                      fontWeight: '600', // Semi-bold
                      margin: 0, // Remove default margin
                    }}
                  >
                    {box.extraSubheading}
                  </h3>
                </div>
              )}
            </div>

            {/* Image (Right Side) */}
            <div
              style={{
                width: '50%', // Adjust width
                display: 'flex',
                justifyContent: 'center', // Center the image
                alignItems: 'center', // Center the image vertically
              }}
            >
              <img
                src={box.image} // Dynamic image path
                alt="Feature Illustration"
                style={{
                  width: '100%', // Responsive width
                  maxWidth: '190px', // Maximum width for the image
                  height: 'auto', // Maintain aspect ratio
                }}
              />
            </div>

            {/* Learn More Logo and Text (Bottom) */}
            <div
              style={{
                position: 'absolute', // Position absolutely at the bottom
                bottom: '20px', // Move to the bottom
                left: '20px', // Align with the text
                display: 'flex',
                alignItems: 'center', // Center items vertically
                gap: '10px', // Space between logo and text
                cursor: 'pointer', // Add pointer cursor
              }}
              onClick={() => handleLearnMoreClick(box.route)} // Navigate on click
            >
              {/* Learn More Logo */}
              <img
                src="/learnmore.png" // Path to the Learn More logo
                alt="Learn More"
                style={{
                  width: '25px', // Adjust logo size
                  height: '25px', // Adjust logo size
                }}
              />
              {/* Learn More Text */}
              <span
                style={{
                  fontSize: '1.2rem', // Adjust font size
                  fontWeight: '500', // Semi-bold
                  color: '#000', // Black text
                }}
              >
                Learn More
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the Homepage Content */}
      <div
        style={{
          maxWidth: '1200px', // Limit the width of the content
          margin: '0 auto', // Center the content
          padding: '40px 20px', // Add padding for spacing
        }}
      >
        {/* Add more sections here */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;