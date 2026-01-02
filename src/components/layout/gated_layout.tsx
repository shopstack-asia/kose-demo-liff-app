'use client';

import { ReactNode } from 'react';
import { Layout } from 'antd';
import { AppHeader } from './app_header';

const { Content } = Layout;

interface GatedLayoutProps {
  children: ReactNode;
}

export function GatedLayout({ children }: GatedLayoutProps) {
  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppHeader />
      <Content
        style={{
          flex: 1,
          overflow: 'auto',
          paddingTop: '64px', // Space for header
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}


