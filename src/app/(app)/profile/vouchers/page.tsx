'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, List, Typography, Tag, Empty } from 'antd';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';

const { Text, Title } = Typography;

interface MyVoucher {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_purchase?: number;
  valid_to: string;
  used_at?: string;
  expired_at: string;
}

export default function MyVouchersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<MyVoucher[]>([]);

  useEffect(() => {
    async function loadVouchers() {
      try {
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          // RouteGuard handles authentication - just return
          return;
        }

        const profileResponse = await apiClient.patch<{
          customer?: { id: string };
        }>('/customer/profile', {
          line_user_id: lineProfile.userId,
        });

        if (profileResponse.success && profileResponse.data?.customer?.id) {
          const customerId = profileResponse.data.customer.id;
          const response = await apiClient.get<MyVoucher[]>(
            `/customer/vouchers?customer_id=${customerId}`
          );

          if (response.success && response.data) {
            setVouchers(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load vouchers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVouchers();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  const formatDiscount = (voucher: MyVoucher) => {
    switch (voucher.discount_type) {
      case 'percentage':
        return `${voucher.discount_value}% OFF`;
      case 'fixed':
        return `฿${voucher.discount_value} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return '';
    }
  };

  const isExpired = (voucher: MyVoucher) => {
    return new Date(voucher.expired_at) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page-container">
      <PageHeader title="My Vouchers" />

      {vouchers.length === 0 ? (
        <Card>
          <Empty
            description="No vouchers yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary">Claim vouchers from the catalog to get started</Text>
          </Empty>
        </Card>
      ) : (
        <List
          dataSource={vouchers}
          renderItem={(voucher) => {
            const expired = isExpired(voucher);
            const used = !!voucher.used_at;

            return (
              <List.Item>
                <Card
                  style={{
                    width: '100%',
                    opacity: expired || used ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Title level={5} style={{ margin: 0 }}>
                      {voucher.title}
                    </Title>
                    <Tag color={used ? 'default' : expired ? 'red' : 'green'}>
                      {used ? 'Used' : expired ? 'Expired' : 'Active'}
                    </Tag>
                  </div>
                  <Text>{voucher.description}</Text>
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 18, color: '#2C2C2C' }}>
                      {formatDiscount(voucher)}
                    </Text>
                    {voucher.min_purchase && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                        Min. purchase: ฿{voucher.min_purchase.toLocaleString()}
                      </Text>
                    )}
                    <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                      Valid until: {formatDate(voucher.expired_at)}
                    </Text>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}

