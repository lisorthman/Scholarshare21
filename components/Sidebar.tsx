// components/Sidebar.tsx
import React from 'react';
import styles from './Sidebar.module.scss';
import Link from 'next/link';

interface SidebarProps {
  onLogout: () => void;
  onPageChange?: (pageName: string) => void;
  isVisible?: boolean;
  role?: 'admin' | 'researcher' | 'user';
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, onPageChange, isVisible, role }) => {
  const handlePageClick = (pageName: string) => {
    if (onPageChange) {
      onPageChange(pageName);
    }
  };

  // Admin menu items
  const adminMenu = [
    { href: '/admin-dashboard', label: 'Dashboard' },
    { href: '/admin-dashboard/user-management', label: 'User Management' },
    { href: '/admin-dashboard/paper-management', label: 'Paper Management' },
    { href: '/admin-dashboard/add-category', label: 'Add Category' },
    { href: '/admin-dashboard/plagiarism-check', label: 'Plagiarism Check' },
    { href: '/admin-dashboard/profile', label: 'Profile' }
  ];

  // Researcher menu items
  const researcherMenu = [
    { href: '/researcher-dashboard', label: 'Dashboard' },
    { href: '/researcher-dashboard/uploads', label: 'Uploads' },
    { href: '/researcher-dashboard/settings', label: 'Settings' },
    { href: '/researcher-dashboard/profile', label: 'Profile' }
  ];

  // User menu items
  const userMenu = [
    { href: '/user-dashboard', label: 'Dashboard' },
    { href: '/user-dashboard/wishlist', label: 'Wishlist' },
    { href: '/user-dashboard/settings', label: 'Settings' },
    { href: '/user-dashboard/profile', label: 'Profile' }
  ];

  // Get menu items based on role
  const getMenuItems = () => {
    switch(role) {
      case 'admin': return adminMenu;
      case 'researcher': return researcherMenu;
      case 'user': return userMenu;
      default: return [];
    }
  };

  return (
    <div className={`${styles.sidebar} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.sidebarHeader}>
        {/* Title removed */}
      </div>
      
      <ul className={styles.menuList}>
        {getMenuItems().map((item) => (
          <li key={item.href} className={styles.menuItem}>
            <Link 
              href={item.href} 
              onClick={() => handlePageClick(item.label)}
            >
              {item.label}
            </Link>
          </li>
        ))}
        
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