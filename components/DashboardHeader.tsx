import React from 'react';
import styles from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title: string; // Add title prop
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick, title }) => {
  return (
    <div className={styles.header}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        ☰
      </button>
      <h1 className={styles.title}>{title}</h1> {/* Use the title prop */}
    </div>
  );
};

export default DashboardHeader;