'use client';

import { HomeOutlined, ShoppingOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';

interface BottomNavigationProps {
  currentPath: string;
  onTabClick: (path: string) => void;
}

export function BottomNavigation({ currentPath, onTabClick }: BottomNavigationProps) {
  const tabs = [
    { key: 'home', path: '/home', label: 'Home', icon: <HomeOutlined /> },
    { key: 'purchase', path: '/purchase', label: 'Purchase', icon: <ShoppingOutlined /> },
    { key: 'coupons', path: '/coupons', label: 'Coupons', icon: <TagOutlined /> },
    { key: 'profile', path: '/profile', label: 'Profile', icon: <UserOutlined /> },
  ];

  const isActive = (path: string) => {
    if (path === '/home') {
      return currentPath === '/home';
    }
    if (path === '/profile') {
      return currentPath === '/profile' || currentPath.startsWith('/profile/');
    }
    if (path === '/purchase') {
      return currentPath === '/purchase' || currentPath.startsWith('/purchase/');
    }
    if (path === '/coupons') {
      return currentPath === '/coupons' || currentPath.startsWith('/coupons/');
    }
    return currentPath === path;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        return (
          <button
            key={tab.key}
            onClick={() => onTabClick(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px 0',
              color: active ? '#2C2C2C' : '#8c8c8c',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 12, fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

