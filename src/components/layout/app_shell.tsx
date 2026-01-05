'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout } from 'antd';
import { AppHeader } from './app_header';
import { BottomNavigation } from './bottom_navigation';
import { useAuthStatus } from '@/lib/auth_context';
import { getTargetPage, setTargetPage, clearTargetPage } from '@/lib/redirect_utils';

const { Content } = Layout;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, customerStatus } = useAuthStatus();

  // Check for target page redirect after authentication is complete
  useEffect(() => {
    if (!isLoading && isAuthenticated && customerStatus === 'existing') {
      const targetPage = getTargetPage();
      if (targetPage && pathname !== targetPage) {
        // Only redirect if we're not already on the target page
        // and we're not in a gated flow (terms, register, verify)
        const isGatedFlow = pathname.startsWith('/terms') || 
                           pathname.startsWith('/register') || 
                           pathname.startsWith('/verify') ||
                           pathname.startsWith('/thank-you');
        
        if (!isGatedFlow) {
          clearTargetPage();
          router.replace(targetPage);
        }
      }
    }
  }, [isLoading, isAuthenticated, customerStatus, pathname, router]);

  // Don't show shell on loading/initialization
  if (isLoading && pathname === '/') {
    return <>{children}</>;
  }

  const handleTabClick = (path: string) => {
    // If not authenticated or terms not accepted, redirect to terms
    if (!isAuthenticated || customerStatus === 'new' || customerStatus === 'terms_not_accepted') {
      // Preserve target page if clicking on a specific path
      if (path !== '/terms') {
        setTargetPage(path);
      }
      router.push('/terms');
      return;
    }
    
    // If profile incomplete, allow navigation but show register if needed
    if (customerStatus === 'profile_incomplete' && path !== '/register' && !pathname.startsWith('/verify')) {
      // Preserve target page
      setTargetPage(path);
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

