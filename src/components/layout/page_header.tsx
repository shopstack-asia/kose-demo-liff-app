'use client';

import { Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24, padding: '0 16px', marginTop: 16 }}>
      <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
        {title}
      </Title>
      {subtitle && (
        <p style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

