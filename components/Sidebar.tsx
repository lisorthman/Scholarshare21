import React from 'react';
import styles from './Sidebar.module.scss';  // Importing the styles

const Sidebar: React.FC = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        {/* Title removed */}
      </div>
      
      <ul className={styles.menuList}>
        <li className={styles.menuItem}><a href="/dashboard">Dashboard</a></li>
        <li className={styles.menuItem}><a href="/usercollection">Wishlist</a></li>
        <li className={styles.menuItem}><a href="/settings">Settings</a></li>
        <li className={styles.menuItem}><a href="/profile">Profile</a></li>
        
        {/* Logout Button at the bottom */}
        <li className={`${styles.menuItem} ${styles.logoutItem}`}><a href="/logout">Logout</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;