"use client"; // Mark this component as a Client Component

import React, { useState } from 'react';
import styles from './Navbar.module.scss';
import Link from 'next/link';
import Button from './Button'; // Import the Button component
import InputField from './InputField'; // Import the InputField component

const Navbar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = () => {
    alert(`You searched for: ${searchTerm}`);
  };

  return (
    <nav className={styles.navbar}>
      <h1>My Next.js App</h1>
      <div>
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="/about" className={styles.link}>
          About
        </Link>
        <Link href="/signup" className={styles.link}>
          Signup
        </Link>
      </div>
      <InputField
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button onClick={handleSearch} variant="primary">
        Search
      </Button>
    </nav>
  );
};

export default Navbar;