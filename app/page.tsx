// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [data, setData] = useState(null);
  const router = useRouter();

  // Fetch data from your API route
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Slides data
  const slides = [
    {
      heading: 'Your Gateway to Global Research',
      subheading: 'Revolutionizing Research for All',
      paragraph: 'Making research papers accessible to everyone, everywhere, ScholarShare connects researchers, students, and innovators to foster collaboration and inspire global discovery.',
      buttonText: 'Get Started',
      image: '/design-removebg-preview 1.png',
    },
    // Add other slides as needed
  ];

  // Boxes data
  const boxes = [
    {
      color: '#9E8F8F',
      heading: 'Free Access to ',
      subheading: 'research paper',
      image: '/21532509_6432092 1.png',
      route: '/feature1',
    },
    // Add other boxes as needed
  ];

  // Navigation functions
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  const handleGetStartedClick = () => router.push('/signup');
  const handleLearnMoreClick = (route: string) => router.push(route);

  return (
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#000', minHeight: '100vh', backgroundColor: 'white' }}>
      {/* NavBar */}
      <NavBar />

      {/* Slideshow Section */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '1200px' }}>
          {/* Dots Navigation */}
          <div style={{ position: 'absolute', top: '-30px', left: '0px', backgroundColor: '#E0D8C3', borderRadius: '20px 20px 0 0', padding: '10px 50px', display: 'flex', gap: '10px', zIndex: 1, width: '150px', height: '30px' }}>
            {slides.map((_, index) => (
              <div key={index} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: currentSlide === index ? '#563434' : '#9E8F8F' }} />
            ))}
          </div>

          {/* Main Slide Content */}
          <div style={{ width: '100%', backgroundColor: '#F5F5F5', borderRadius: '0 40px 40px 40px', padding: '40px', position: 'relative' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', overflow: 'hidden' }}>
              {/* Text Content */}
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px', transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.5s ease' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '550', marginBottom: '10px', lineHeight: '1.2' }}>
                  {slides[currentSlide].heading}
                </h1>
                <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: '400', marginBottom: '20px', color: '#555' }}>
                  {slides[currentSlide].subheading}
                </h2>
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', lineHeight: '1.6', marginBottom: '40px', color: '#333' }}>
                  {slides[currentSlide].paragraph}
                </p>
                <button
                  onClick={handleGetStartedClick}
                  style={{ backgroundColor: '#000', color: '#FFF', padding: '16px 32px', borderRadius: '8px', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: '500', cursor: 'pointer', border: 'none' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#000')}
                >
                  {slides[currentSlide].buttonText}
                </button>
              </div>

              {/* Image */}
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.5s ease' }}>
                <img
                  src={slides[currentSlide].image}
                  alt="Slide Illustration"
                  style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#FFF', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#FFF', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#E5E28C', borderRadius: '5px', padding: '5px', width: 'fit-content', maxHeight: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '450', color: '#000', margin: 0 }}>Features</h2>
        </div>
      </div>

      {/* Feature Boxes */}
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '20px' }}>
        {boxes.map((box, index) => (
          <div key={index} style={{ backgroundColor: box.color, borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '250px', width: '100%', position: 'relative', border: '2px solid #000', borderBottomWidth: '6px' }}>
            {/* Text Content */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0', marginTop: '-100px', marginLeft: '10px' }}>
              <div style={{ backgroundColor: index === 2 || index === 3 ? 'rgba(99, 65, 65, 0.14)' : 'rgba(255, 255, 255, 0.8)', borderRadius: '5px', padding: '2px', width: 'fit-content' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{box.heading}</h3>
              </div>
              <div style={{ backgroundColor: index === 2 || index === 3 ? 'rgba(99, 65, 65, 0.14)' : 'rgba(255, 255, 255, 0.8)', borderRadius: '5px', padding: '2px', width: 'fit-content' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{box.subheading}</h3>
              </div>
            </div>

            {/* Image */}
            <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={box.image}
                alt="Feature Illustration"
                style={{ width: '100%', maxWidth: '190px', height: 'auto' }}
              />
            </div>

            {/* Learn More Button */}
            <div
              style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => handleLearnMoreClick(box.route)}
            >
              <img src="/learnmore.png" alt="Learn More" style={{ width: '25px', height: '25px' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: '500', color: '#000' }}>Learn More</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Footer />
      </div>

      {/* Debug Data (optional) */}
      {data && (
        <div style={{ display: 'none' }}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HomePage;