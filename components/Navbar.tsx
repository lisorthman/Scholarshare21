'use client';

import { useSession, signOut } from 'next-auth/react';
import React, { useState } from 'react'; 
import Link from 'next/link'; 
import Image from 'next/image'; 
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.scss';

const NavBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Redirect to /home after successful login
  React.useEffect(() => {
    if (session) {
      router.replace('/home');
    }
  }, [session, router]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className={styles.navBar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        {/* Render the logo directly without a Link */}
        <Image
          src="/logo.png" 
          alt="ScholarShare Logo"
          width={250} // Smaller logo size
          height={30}
          priority
        />
      </div>

    {/* Navigation Links */}
      <ul className={styles.navLinks}>
        <li>
          <Link href={session ? "/home" : "/"}>Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        {session ? (
          <>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <button onClick={handleSignOut} className={styles.signOutButton}>Sign Out</button>
        </li>
          </>
        ) : (
          <li>
        <Link href="/signin">Signin</Link>
          </li>
        )}
      </ul>

       {/*Search Bar*/}
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