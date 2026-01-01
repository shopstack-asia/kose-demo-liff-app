'use client';

import { Typography, Button, Card } from 'antd';
import { LineOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface LinePermissionPageProps {
  onRetry?: () => void;
}

export function LinePermissionPage({ onRetry }: LinePermissionPageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 20,
      }}
    >
      <Card style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <LineOutlined style={{ fontSize: 64, color: '#06C755', marginBottom: 24 }} />
        <Title level={3} style={{ marginBottom: 16 }}>
          กรุณาเปิดผ่าน LINE
        </Title>
        <Paragraph style={{ color: '#666', marginBottom: 24 }}>
          แอปพลิเคชันนี้ต้องการเข้าถึงข้อมูลโปรไฟล์ LINE ของคุณ
          <br />
          <br />
          กรุณากดปุ่ม "อนุญาต" เพื่อให้แอปพลิเคชันเข้าถึงข้อมูลโปรไฟล์ของคุณ
        </Paragraph>
        {onRetry && (
          <Button type="primary" block size="large" onClick={onRetry}>
            ลองอีกครั้ง
          </Button>
        )}
      </Card>
    </div>
  );
}

