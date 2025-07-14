'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.scss';

const NavBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [authState, setAuthState] = useState({
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    role: typeof window !== 'undefined' ? localStorage.getItem('role') : null
  });

  // Sync auth state across tabs/windows
  React.useEffect(() => {
    const handleStorageChange = () => {
      setAuthState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role')
      });
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Get role-specific color
  const getRoleColor = () => {
    switch(authState.role) {
      case 'admin': return '#FF5733';  // Orange-red for admin
      case 'researcher': return '#FF5733';  // Blue for researcher
      case 'user': return '#FF5733';  // Green for user
      default: return 'inherit';
    }
  };

  // Format role for display
  const formattedRole = authState.role ? 
    authState.role.charAt(0).toUpperCase() + authState.role.slice(1) : 
    null;



  return (
    <nav className={styles.navBar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <Image
          src="/logo.png"
          alt="ScholarShare Logo"
          width={250}
          height={30}
          priority
        />
      </div>

      {/* Navigation Links */}
      <ul className={styles.navLinks}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          {authState.token ? (
            <Link 
              href={`/${authState.role}-dashboard`}
              style={{ color: getRoleColor() }}
              className={styles.navLink}
            >
              {formattedRole}
            </Link>
          ) : (
            <Link href="/signin">Signin</Link>
          )}
        </li>
      </ul>

      {/* Search Bar */}
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