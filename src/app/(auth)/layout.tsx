'use client';

import { AuthHeader } from '@/components/layout/auth_header';
import { Layout } from 'antd';

const { Content } = Layout;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuthHeader />
      <Content
        style={{
          flex: 1,
          paddingTop: '64px',
          background: '#faf8f5',
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}

