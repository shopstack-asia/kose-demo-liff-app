'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Typography, Tag, Empty, message } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { BottomSheet } from '@/components/common/bottom_sheet';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';

const { Title, Text, Paragraph } = Typography;

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_purchase?: number;
  valid_to: string;
  image_url?: string;
  terms?: string;
}

export default function CouponsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [customerId, setCustomerId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          router.push('/');
          return;
        }

        // Load customer ID
        const profileResponse = await apiClient.patch<{
          customer?: { id: string };
        }>('/customer/profile', {
          line_user_id: lineProfile.userId,
        });

        if (profileResponse.success && profileResponse.data?.customer?.id) {
          setCustomerId(profileResponse.data.customer.id);
        }

        // Load coupons
        const couponsResponse = await apiClient.get<Coupon[]>('/coupons/catalog');
        if (couponsResponse.success && couponsResponse.data) {
          setCoupons(couponsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load coupons:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleClaim = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setBottomSheetOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedCoupon || !customerId) return;

    setClaiming(true);
    try {
      const response = await apiClient.post('/coupons/claim', {
        customer_id: customerId,
        coupon_id: selectedCoupon.id,
      });

      if (response.success) {
        message.success('Coupon claimed successfully!');
        setBottomSheetOpen(false);
        setSelectedCoupon(null);
        // Refresh coupons
        const couponsResponse = await apiClient.get<Coupon[]>('/coupons/catalog');
        if (couponsResponse.success && couponsResponse.data) {
          setCoupons(couponsResponse.data);
        }
      } else {
        message.error(response.error || 'Failed to claim coupon');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setClaiming(false);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Coupon Catalog"
        subtitle="Claim exclusive coupons and save on your purchases"
      />

      {coupons.length === 0 ? (
        <Card>
          <Empty
            description="No coupons available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              cover={
                coupon.image_url ? (
                  <div style={{ height: 180, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                    <img
                      src={coupon.image_url}
                      alt={coupon.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : null
              }
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <Title level={5} style={{ margin: 0, flex: 1 }}>
                    {coupon.title}
                  </Title>
                  <Tag color="green" style={{ marginLeft: 12 }}>
                    {formatDiscount(coupon)}
                  </Tag>
                </div>
                <Paragraph style={{ marginBottom: 8 }}>{coupon.description}</Paragraph>
                {coupon.min_purchase && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Min. purchase: ฿{coupon.min_purchase.toLocaleString()}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Valid until: {formatDate(coupon.valid_to)}
                </Text>
              </div>
              <Button
                type="primary"
                block
                size="large"
                icon={<TagOutlined />}
                onClick={() => handleClaim(coupon)}
              >
                Claim Coupon
              </Button>
            </Card>
          ))}
        </div>
      )}

      <BottomSheet
        open={bottomSheetOpen}
        onClose={() => {
          setBottomSheetOpen(false);
          setSelectedCoupon(null);
        }}
        title="Claim Coupon"
        confirmText="Claim"
        onConfirm={handleConfirmClaim}
        loading={claiming}
      >
        {selectedCoupon && (
          <div>
            <Title level={4}>{selectedCoupon.title}</Title>
            <Paragraph>{selectedCoupon.description}</Paragraph>
            <div style={{ marginTop: 16 }}>
              <Text strong>Discount: </Text>
              <Text>{formatDiscount(selectedCoupon)}</Text>
            </div>
            {selectedCoupon.min_purchase && (
              <div style={{ marginTop: 8 }}>
                <Text strong>Minimum Purchase: </Text>
                <Text>฿{selectedCoupon.min_purchase.toLocaleString()}</Text>
              </div>
            )}
            {selectedCoupon.terms && (
              <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedCoupon.terms}
                </Text>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

