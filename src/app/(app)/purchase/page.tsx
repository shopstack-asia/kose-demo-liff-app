'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Typography, Empty } from 'antd';
import { PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { mockPurchaseHistory, PurchaseHistory } from '@/mock/purchase_history';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export default function PurchasePage() {
  const router = useRouter();
  const [purchases] = useState<PurchaseHistory[]>(mockPurchaseHistory);

  const handleCardClick = (purchase: PurchaseHistory) => {
    // Future: Navigate to purchase detail view
    // For now, just a placeholder
    console.log('View purchase details:', purchase.id);
  };

  const handleAddNew = () => {
    router.push('/purchase/new');
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMM YYYY');
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString('en-US')}`;
  };

  return (
    <div className="page-container">
      <PageHeader
        title="My Purchases"
        subtitle="Your offline purchase history"
      />

      {purchases.length === 0 ? (
        <Card>
          <Empty
            image={<ShoppingOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <div>
                <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                  No purchases yet
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Add your offline purchase to earn points
                </Text>
              </div>
            }
          />
        </Card>
      ) : (
        <div style={{ paddingBottom: '80px' }}>
          {purchases.map((purchase) => {
            return (
              <Card
                key={purchase.id}
                hoverable
                onClick={() => handleCardClick(purchase)}
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                    {purchase.store_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {formatDate(purchase.purchase_date)}
                  </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Total Amount
                    </Text>
                    <Text strong style={{ fontSize: 18, color: '#1f4da1' }}>
                      {formatCurrency(purchase.total_amount)}
                    </Text>
                  </div>
                  {purchase.receipt_no && (
                    <div style={{ textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                        Receipt No.
                      </Text>
                      <Text style={{ fontSize: 14 }}>{purchase.receipt_no}</Text>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Fixed bottom button */}
      <div
        style={{
          position: 'fixed',
          bottom: '64px', // Above bottom nav
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #f0f0f0',
          padding: '16px',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
        }}
      >
        <Button
          type="primary"
          block
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          style={{
            backgroundColor: '#1f4da1',
            borderColor: '#1f4da1',
            height: '48px',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Add New Purchase
        </Button>
      </div>
    </div>
  );
}
