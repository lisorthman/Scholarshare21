'use client';

import React, { useState } from 'react'; 
import Link from 'next/link'; // Import the Link component
import Image from 'next/image'; // Import the Image component
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.scss';;

const NavBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  return (
    <nav className={styles.navBar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        {/* Render the logo directly without a Link */}
        <Image
          src="/logo.png" // Ensure this path is correct
          alt="ScholarShare Logo"
          width={250} // Smaller logo size
          height={30}
          priority
        />
      </div>

      {/* Navigation Links */}
      <ul className={styles.navLinks}>
        <li>
          <Link href="/">Home</Link> {/* Link to the homepage */}
        </li>
        <li>
          <Link href="/about">About</Link> {/* Link to the About page */}
        </li>
        <li>
          <Link href="/signin">Signin</Link> {/* Link to the Signup page */}
        </li>
      </ul>

       {/* Functional Search Bar with existing UI */}
       <form onSubmit={handleSearch} className={styles.searchBar}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24">
          <path
            d="M21.53 20.47l-4.8-4.8a8.5 8.5 0 10-1.06 1.06l4.8 4.8a.75.75 0 101.06-1.06zM10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search Bar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
      </form>
    </nav>
  );
};

export default NavBar;