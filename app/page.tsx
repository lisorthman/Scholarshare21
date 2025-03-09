"use client"; // Mark this component as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import NavBar from '../components/Navbar'; // Import NavBar

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
    router.push('/signup'); // Redirect to the login page
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
        }}
      >
        <NavBar />
      </div>

      {/* Slideshow Section */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center', // Center the box horizontally
          alignItems: 'center',
          padding: '60px 20px', // Add padding for spacing
        }}
      >
        {/* Small Left-Aligned Curved Box with Dots */}
        <div
          style={{
            position: 'relative', // Position relative for absolute child
            width: '100%',
            maxWidth: '1200px', // Match the max-width of the main box
          }}
        >
          {/* Dots Container */}
          <div
            style={{
              position: 'absolute',
              top: '-30px', // Position above the main box
              left: '0px', // Align with the main box
              backgroundColor: '#F5F5F5', // Ash color to match the main box
              borderRadius: '20px 20px 0 0', // Curved edges at the top
              padding: '10px 50px', // Padding for the dots
              display: 'flex',
              gap: '10px', // Space between dots
              zIndex: 1, // Ensure it's above the main box
              width: '150px', // Adjust width of the small box
              height: '40px', // Adjust height of the small box
            }}
          >
            {slides.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%', // Circular dots
                  backgroundColor: currentSlide === index ? '#000' : '#CCC', // Black for active, gray for inactive
                  transition: 'background-color 0.3s ease', // Smooth transition
                }}
              />
            ))}
          </div>

          {/* Main Ash-Colored Box */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#F5F5F5', // Ash color
              borderRadius: '0 40px 40px 40px', // Curved edges at the top
              padding: '40px', // Inner padding
              position: 'relative', // For positioning arrows
            }}
          >
            {/* Container for Slides */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Space between text and image
                flexWrap: 'wrap', // Allow wrapping on smaller screens
                overflow: 'hidden', // Hide overflow for sliding effect
              }}
            >
              {/* Text Content */}
              <div
                style={{
                  flex: '1',
                  minWidth: '300px', // Minimum width for text content
                  maxWidth: '600px', // Maximum width for text content
                  transform: `translateX(-${currentSlide * 100}%)`, // Slide effect
                  transition: 'transform 0.5s ease', // Smooth transition
                }}
              >
                {/* Heading */}
                <h1
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)', // Responsive font size
                    fontWeight: '550',
                    marginBottom: '20px', // Spacing below the heading
                    lineHeight: '1.2',
                  }}
                >
                  {slides[currentSlide].heading}
                </h1>

                {/* Subheading */}
                <h2
                  style={{
                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', // Responsive font size
                    fontWeight: '400', // Semi-bold
                    marginBottom: '20px', // Spacing below the subheading
                    color: '#555', // Slightly lighter color for subheading
                  }}
                >
                  {slides[currentSlide].subheading}
                </h2>

                {/* Paragraph */}
                <p
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)', // Responsive font size
                    lineHeight: '1.6',
                    marginBottom: '40px', // Spacing below the paragraph
                    color: '#333', // Slightly lighter color for paragraph
                  }}
                >
                  {slides[currentSlide].paragraph}
                </p>

                {/* Get Started Button */}
                <button
                  onClick={handleGetStartedClick} // Add onClick handler
                  style={{
                    backgroundColor: '#000', // Black background for the button
                    color: '#FFF', // White text
                    padding: '16px 32px', // Increased padding for a bigger button
                    borderRadius: '8px', // Rounded corners
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', // Smaller responsive font size
                    fontWeight: '500', // Adjustable font weight (500 is medium)
                    fontFamily: 'Space Grotesk, sans-serif', // Use Space Grotesk font
                    letterSpacing: '0.5px', // Adjustable letter spacing
                    cursor: 'pointer', // Pointer cursor on hover
                    border: 'none', // Remove default border
                    outline: 'none', // Remove outline
                    transition: 'background-color 0.3s ease', // Smooth hover effect
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')} // Darker on hover
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#000')} // Restore on mouse out
                >
                  {slides[currentSlide].buttonText}
                </button>
              </div>

              {/* Image */}
              <div
                style={{
                  flex: '1',
                  minWidth: '300px', // Minimum width for image
                  maxWidth: '400px', // Maximum width for image
                  display: 'flex',
                  justifyContent: 'center', // Center the image
                  alignItems: 'center',
                  transform: `translateX(-${currentSlide * 100}%)`, // Slide effect
                  transition: 'transform 0.5s ease', // Smooth transition
                }}
              >
                <img
                  src={slides[currentSlide].image} // Dynamic image path
                  alt="Slide Illustration"
                  style={{
                    width: '100%', // Responsive width
                    maxWidth: '400px', // Maximum width for the image
                    height: 'auto', // Maintain aspect ratio
                  }}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              style={{
                position: 'absolute',
                left: '20px', // Position left arrow
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
                color: '#FFF', // White arrow
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              style={{
                position: 'absolute',
                right: '20px', // Position right arrow
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
                color: '#FFF', // White arrow
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              &gt;
            </button>
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default HomePage;