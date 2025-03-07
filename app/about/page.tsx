import React from 'react';
import Navbar from '../../components/Navbar';

const AboutPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <h1>About Us</h1>
      <p>This is the about page of our Next.js app.</p>
    </div>
  );
};

export default AboutPage;