import React from 'react';
import styles from './Sidebar.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Upload, 
  Trophy, 
  Wallet, 
  Building2, 
  Settings, 
  UserCircle, 
  Users, 
  FileText, 
  FolderPlus, 
  Search, 
  HeartHandshake, 
  BookOpen,
  LogOut 
} from 'lucide-react';

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
    { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin-dashboard/user-management', label: 'User Management', icon: Users },
    { href: '/admin-dashboard/paper-management', label: 'Paper Management', icon: FileText },
    { href: '/admin-dashboard/add-category', label: 'Add Category', icon: FolderPlus },
    { href: '/admin-dashboard/plagiarism-check', label: 'Plagiarism Check', icon: Search },
    { href: '/admin-dashboard/profile', label: 'Profile', icon: UserCircle }
  ];

  // Researcher menu items
  const researcherMenu = [

    { href: '/researcher-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/researcher-dashboard/uploads', label: 'Uploads', icon: Upload },
    { href: '/researcher-dashboard/milestones', label: 'Milestones', icon: Trophy },
    { href: '/researcher-dashboard/payments', label: 'Earnigs', icon: Wallet },
    { href: '/researcher-dashboard/profile', label: 'Profile', icon: UserCircle }

  ];

  // User menu items
  const userMenu = [

    { href: '/user-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/user-dashboard/wishlist', label: 'Wishlist', icon: HeartHandshake },
    { href: '/user-dashboard/papers', label: 'Research Papers', icon: BookOpen },
    { href: '/user-dashboard/profile', label: 'Profile', icon: UserCircle }

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
                padding: '12px 16px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#634141',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              {item.label}
            </button>
          </li>
        ))}
        
        <li className={`${styles.menuItem} ${styles.logoutItem}`}>
          <button 
            onClick={onLogout}
            className={styles.logoutButton}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              color: '#dc2626',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;