// components/Sidebar.tsx
import React from 'react';
import styles from './Sidebar.module.scss';
import Link from 'next/link';

interface SidebarProps {
  onLogout: () => void;
  onPageChange?: (pageName: string) => void;
  isVisible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, onPageChange, isVisible }) => {
  const handlePageClick = (pageName: string) => {
    if (onPageChange) {
      onPageChange(pageName);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        {/* Title removed */}
      </div>
      
      <ul className={styles.menuList}>
        <li className={styles.menuItem}>
          <Link 
            href="/admin-dashboard" 
            onClick={() => handlePageClick('Dashboard')}
          >
            Dashboard
          </Link>
        </li>
        <li className={styles.menuItem}>
          <Link 
            href="/admin-dashboard/wishlist" 
            onClick={() => handlePageClick('Wishlist')}
          >
            Wishlist
          </Link>
        </li>
        <li className={styles.menuItem}>
          <Link 
            href="/admin-dashboard/settings" 
            onClick={() => onPageChange && onPageChange('Settings')}
          >
            Settings
          </Link>
        </li>
        <li className={styles.menuItem}>
          <Link 
            href="/admin-dashboard/profile" 
            onClick={() => handlePageClick('Profile')}
          >
            Profile
          </Link>
        </li>
        
        <li className={`${styles.menuItem} ${styles.logoutItem}`}>
          <button 
            onClick={onLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;