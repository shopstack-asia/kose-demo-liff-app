'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout } from 'antd';
import { AppHeader } from './app_header';
import { BottomNavigation } from './bottom_navigation';

const { Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (path: string) => {
    // Simple navigation - RouteGuard handles authentication
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

