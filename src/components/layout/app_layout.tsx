'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout } from 'antd';
import { AppHeader } from './app_header';
import { BottomNavigation } from './bottom_navigation';
import { useAuthStatus } from '@/lib/auth_context';

const { Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, customerStatus } = useAuthStatus();

  const handleTabClick = (path: string) => {
    // Guard: redirect to terms if not authenticated
    if (!isAuthenticated || customerStatus === 'new' || customerStatus === 'terms_not_accepted') {
      router.push('/terms');
      return;
    }
    
    // Guard: redirect to register if profile incomplete
    if (customerStatus === 'profile_incomplete') {
      router.push('/register');
      return;
    }
    
    router.push(path);
  };

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppHeader />
      <Content
        style={{
          flex: 1,
          overflow: 'auto',
          paddingBottom: '64px', // Space for bottom nav
          paddingTop: '64px', // Space for header
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Content>
      <BottomNavigation currentPath={pathname} onTabClick={handleTabClick} />
    </Layout>
  );
}

