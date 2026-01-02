'use client';

import { useRouter } from 'next/navigation';
import { Card, Typography, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { useAuthStatus } from '@/lib/auth_context';

const { Paragraph } = Typography;

export default function ThankYouPage() {
  const router = useRouter();
  const { refresh } = useAuthStatus();

  // Remove auto-redirect, let user choose
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     router.push('/profile');
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, [router]);

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <CheckCircleOutlined
          style={{ fontSize: 80, color: '#52c41a', marginBottom: 24 }}
        />
        <PageHeader
          title="Registration Complete!"
          subtitle="Thank you for joining KOSE membership"
        />
      </div>

      <Card>
        <Paragraph style={{ textAlign: 'center', fontSize: 16, marginBottom: 24 }}>
          Your account has been successfully created. You can now start earning
          points and redeeming exclusive coupons.
        </Paragraph>

        <Button
          type="primary"
          block
          size="large"
          onClick={async () => {
            // Refresh auth status before navigating to ensure customerStatus is updated
            await refresh();
            router.push('/purchase');
          }}
          style={{ marginBottom: 12 }}
        >
          Submit Purchase
        </Button>

        <Button
          block
          size="large"
          onClick={async () => {
            // Refresh auth status before navigating to ensure customerStatus is updated
            await refresh();
            router.push('/profile');
          }}
        >
          Go to Profile
        </Button>
      </Card>
    </div>
  );
}

