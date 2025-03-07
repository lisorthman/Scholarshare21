import React from 'react';
import Navbar from '../components/Navbar';

const HomePage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <h1>Welcome to My Next.js App</h1>
      <p>This is the homepage.</p>
    </div>
  );
};

export default HomePage;