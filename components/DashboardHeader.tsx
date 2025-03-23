import React from 'react';
import styles from './DashboardHeader.module.scss';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  return (
    <div className={styles.header}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        ☰
      </button>
      <h1 className={styles.title}>Admin Dashboard</h1>
    </div>
  );
};

export default DashboardHeader;