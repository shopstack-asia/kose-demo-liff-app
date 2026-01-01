'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, List, Typography, Tag, Empty } from 'antd';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';

const { Text, Title } = Typography;

interface MyCoupon {
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

export default function MyCouponsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<MyCoupon[]>([]);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          router.push('/');
          return;
        }

        const profileResponse = await apiClient.patch<{
          customer?: { id: string };
        }>('/customer/profile', {
          line_user_id: lineProfile.userId,
        });

        if (profileResponse.success && profileResponse.data?.customer?.id) {
          const customerId = profileResponse.data.customer.id;
          const response = await apiClient.get<MyCoupon[]>(
            `/customer/coupons?customer_id=${customerId}`
          );

          if (response.success && response.data) {
            setCoupons(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load coupons:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCoupons();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  const formatDiscount = (coupon: MyCoupon) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}% OFF`;
      case 'fixed':
        return `฿${coupon.discount_value} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return '';
    }
  };

  const isExpired = (coupon: MyCoupon) => {
    return new Date(coupon.expired_at) < new Date();
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
      <PageHeader title="My Coupons" />

      {coupons.length === 0 ? (
        <Card>
          <Empty
            description="No coupons yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary">Claim coupons from the catalog to get started</Text>
          </Empty>
        </Card>
      ) : (
        <List
          dataSource={coupons}
          renderItem={(coupon) => {
            const expired = isExpired(coupon);
            const used = !!coupon.used_at;

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
                      {coupon.title}
                    </Title>
                    <Tag color={used ? 'default' : expired ? 'red' : 'green'}>
                      {used ? 'Used' : expired ? 'Expired' : 'Active'}
                    </Tag>
                  </div>
                  <Text>{coupon.description}</Text>
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 18, color: '#2C2C2C' }}>
                      {formatDiscount(coupon)}
                    </Text>
                    {coupon.min_purchase && (
                      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                        Min. purchase: ฿{coupon.min_purchase.toLocaleString()}
                      </Text>
                    )}
                    <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                      Valid until: {formatDate(coupon.expired_at)}
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

