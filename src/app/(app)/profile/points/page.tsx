'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, List, Typography, Tag } from 'antd';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';

const { Text } = Typography;

interface PointTransaction {
  id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  description: string;
  created_at: string;
}

export default function PointsHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  useEffect(() => {
    async function loadHistory() {
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
          const response = await apiClient.get<PointTransaction[]>(
            `/customer/point_history?customer_id=${customerId}`
          );

          if (response.success && response.data) {
            setTransactions(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load point history:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'green';
      case 'redeemed':
        return 'orange';
      case 'expired':
        return 'red';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      <PageHeader title="Point History" />

      {transactions.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No transaction history yet</Text>
          </div>
        </Card>
      ) : (
        <List
          dataSource={transactions}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>{item.description}</Text>
                  <Tag color={getTypeColor(item.type)}>
                    {item.type === 'earned' ? '+' : '-'}
                    {Math.abs(item.points).toLocaleString()} pts
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(item.created_at)}
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

