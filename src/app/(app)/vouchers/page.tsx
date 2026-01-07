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

interface Voucher {
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

export default function VouchersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [customerId, setCustomerId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const lineProfile = liff.getProfile();
        
        // Load customer ID only if lineProfile exists (for claiming vouchers)
        if (lineProfile) {
          const profileResponse = await apiClient.patch<{
            customer?: { id: string };
          }>('/customer/profile', {
            line_user_id: lineProfile.userId,
          });

          if (profileResponse.success && profileResponse.data?.customer?.id) {
            setCustomerId(profileResponse.data.customer.id);
          }
        }

        // Load vouchers - this is a public catalog, so we can load it without authentication
        const vouchersResponse = await apiClient.get<Voucher[]>('/vouchers/catalog');
        if (vouchersResponse.success && vouchersResponse.data) {
          setVouchers(vouchersResponse.data);
        }
      } catch (error) {
        console.error('Failed to load vouchers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleClaim = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setBottomSheetOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedVoucher || !customerId) return;

    setClaiming(true);
    try {
      const response = await apiClient.post('/vouchers/claim', {
        customer_id: customerId,
        voucher_id: selectedVoucher.id,
      });

      if (response.success) {
        message.success('Voucher claimed successfully!');
        setBottomSheetOpen(false);
        setSelectedVoucher(null);
        // Refresh vouchers
        const vouchersResponse = await apiClient.get<Voucher[]>('/vouchers/catalog');
        if (vouchersResponse.success && vouchersResponse.data) {
          setVouchers(vouchersResponse.data);
        }
      } else {
        message.error(response.error || 'Failed to claim voucher');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setClaiming(false);
    }
  };

  const formatDiscount = (voucher: Voucher) => {
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
        title="Voucher Catalog"
        subtitle="Claim exclusive vouchers and save on your purchases"
      />

      {vouchers.length === 0 ? (
        <Card>
          <Empty
            description="No vouchers available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {vouchers.map((voucher) => (
            <Card
              key={voucher.id}
              cover={
                voucher.image_url ? (
                  <div style={{ height: 180, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                    <img
                      src={voucher.image_url}
                      alt={voucher.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : null
              }
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <Title level={5} style={{ margin: 0, flex: 1 }}>
                    {voucher.title}
                  </Title>
                  <Tag color="green" style={{ marginLeft: 12 }}>
                    {formatDiscount(voucher)}
                  </Tag>
                </div>
                <Paragraph style={{ marginBottom: 8 }}>{voucher.description}</Paragraph>
                {voucher.min_purchase && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Min. purchase: ฿{voucher.min_purchase.toLocaleString()}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Valid until: {formatDate(voucher.valid_to)}
                </Text>
              </div>
              <Button
                type="primary"
                block
                size="large"
                icon={<TagOutlined />}
                onClick={() => handleClaim(voucher)}
              >
                Claim Voucher
              </Button>
            </Card>
          ))}
        </div>
      )}

      <BottomSheet
        open={bottomSheetOpen}
        onClose={() => {
          setBottomSheetOpen(false);
          setSelectedVoucher(null);
        }}
        title="Claim Voucher"
        confirmText="Claim"
        onConfirm={handleConfirmClaim}
        loading={claiming}
      >
        {selectedVoucher && (
          <div>
            <Title level={4}>{selectedVoucher.title}</Title>
            <Paragraph>{selectedVoucher.description}</Paragraph>
            <div style={{ marginTop: 16 }}>
              <Text strong>Discount: </Text>
              <Text>{formatDiscount(selectedVoucher)}</Text>
            </div>
            {selectedVoucher.min_purchase && (
              <div style={{ marginTop: 8 }}>
                <Text strong>Minimum Purchase: </Text>
                <Text>฿{selectedVoucher.min_purchase.toLocaleString()}</Text>
              </div>
            )}
            {selectedVoucher.terms && (
              <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedVoucher.terms}
                </Text>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

