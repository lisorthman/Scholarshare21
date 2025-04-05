// components/DashboardHeader.tsx
import React from 'react';
import styles from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title: string;
  role: string; // Add role prop
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick, title, role }) => {
  const formattedTitle = `${role.charAt(0).toUpperCase() + role.slice(1)}${title ? ` / ${title}` : ''}`;

  return (
    <div className={styles.header}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        ☰
      </button>
      <h1 className={styles.title}>{formattedTitle}</h1>
    </div>
  );
};

export default DashboardHeader;