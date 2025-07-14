import React from 'react';
import styles from './Sidebar.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onLogout: () => void;
  onPageChange?: (pageName: string) => void;
  isVisible?: boolean;
  role?: 'admin' | 'researcher' | 'user';
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isVisible, role }) => {
  const router = useRouter();

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
    { href: '/researcher-dashboard/milestones', label: 'Milestones' },
    { href: '/researcher-dashboard/settings', label: 'Settings' },
    { href: '/researcher-dashboard/profile', label: 'Profile' }
  ];

  // User menu items
  const userMenu = [
    { href: '/user-dashboard', label: 'Dashboard' },
    { href: '/user-dashboard/wishlist', label: 'Wishlist' },
    { href: '/user-dashboard/profile', label: 'Profile' },
    {href: '/user-dashboard/papers', label: 'Research Papers'}
  ];

  const getMenuItems = () => {
    switch(role) {
      case 'admin': return adminMenu;
      case 'researcher': return researcherMenu;
      case 'user': return userMenu;
      default: return [];
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className={`${styles.sidebar} ${isVisible ? styles.visible : ''}`}>
      <ul className={styles.menuList}>
        {getMenuItems().map((item) => (
          <li key={item.href} className={styles.menuItem}>
            <button
              onClick={() => handleNavigation(item.href)}
              className={styles.menuLink}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {item.label}
            </button>
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