'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Avatar, Typography, Tabs, Tag, Button, Empty, message } from 'antd';
import { EditOutlined, GiftOutlined, UserOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';
import dayjs from 'dayjs';
import { profileCouponsMock, ProfileCoupon } from '@/mock/profile_coupons';
import { profilePointHistoryMock, ProfilePointTransaction } from '@/mock/profile_point_history';
import { RedeemDrawer } from '@/components/coupon/redeem_drawer';

const { Title, Text } = Typography;

interface CustomerProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  image_url?: string;
  member_no?: string;
  tier?: 'silver' | 'gold' | 'platinum';
  tier_expiry?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [points, setPoints] = useState(0);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [expiringDate, setExpiringDate] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<ProfileCoupon[]>([]);
  const [transactions, setTransactions] = useState<ProfilePointTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('coupons');
  const [redeemDrawerOpen, setRedeemDrawerOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ProfileCoupon | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          router.push('/');
          return;
        }

        const response = await apiClient.patch<{
          status: string;
          customer?: CustomerProfile;
        }>('/customer/profile', {
          line_user_id: lineProfile.userId,
        });

        if (response.success && response.data?.customer) {
          const customer = response.data.customer;
          setProfile(customer);

          // Load points
          if (customer.id) {
            const pointsResponse = await apiClient.get<{ 
              available_points: number;
              expiring_points?: number;
              expiring_date?: string;
            }>(`/customer/points?customer_id=${customer.id}`);
            
            if (pointsResponse.success && pointsResponse.data) {
              setPoints(pointsResponse.data.available_points || 0);
              setExpiringPoints(pointsResponse.data.expiring_points || 0);
              setExpiringDate(pointsResponse.data.expiring_date || null);
            }

            // Load mock coupons
            const mockCoupons = profileCouponsMock.getMyCoupons(customer.id);
            setCoupons(mockCoupons);

            // Load mock point history
            const mockHistory = profilePointHistoryMock.getHistory(customer.id);
            setTransactions(mockHistory);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return null;
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return { bg: '#E5E4E2', text: '#2C2C2C', border: '#C0C0C0' };
      case 'gold':
        return { bg: '#FFF8DC', text: '#B8860B', border: '#FFD700' };
      case 'silver':
        return { bg: '#F5F5F5', text: '#696969', border: '#C0C0C0' };
      default:
        return { bg: '#F5F5F5', text: '#999', border: '#ddd' };
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return 'Platinum';
      case 'gold':
        return 'Gold';
      case 'silver':
        return 'Silver';
      default:
        return 'Member';
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMM YYYY');
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD MMM YYYY, HH:mm');
  };

  const formatExpiryMessage = (points: number, dateString: string) => {
    const expiryDate = dayjs(dateString);
    const daysUntilExpiry = expiryDate.diff(dayjs(), 'days');
    
    if (daysUntilExpiry <= 0) {
      return `${points.toLocaleString()} points expiring on ${expiryDate.format('D MMM YYYY')}`;
    } else if (daysUntilExpiry === 1) {
      return `${points.toLocaleString()} points expiring tomorrow`;
    } else if (daysUntilExpiry <= 7) {
      return `${points.toLocaleString()} points expiring in ${daysUntilExpiry} days`;
    } else {
      return `${points.toLocaleString()} points expiring on ${expiryDate.format('D MMM YYYY')}`;
    }
  };

  const handleRedeemCoupon = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (coupon && coupon.status === 'AVAILABLE') {
      setSelectedCoupon(coupon);
      setRedeemDrawerOpen(true);
    }
  };

  const handleMarkUsed = (couponId: string) => {
    profileCouponsMock.markAsUsed(couponId);
    const updatedCoupons = profileCouponsMock.getMyCoupons(profile?.id || '');
    setCoupons(updatedCoupons);
    message.success('Coupon marked as used');
  };

  const tierColors = getTierColor(profile.tier);

  const tabItems = [
    {
      key: 'coupons',
      label: 'My Coupons',
      children: (
        <div style={{ marginTop: 24 }}>
          {coupons.length === 0 ? (
            <Card
              style={{
                borderRadius: 16,
                background: '#fafafa',
                border: 'none',
                textAlign: 'center',
                padding: '48px 24px',
              }}
            >
              <Empty
                description={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    No coupons yet
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Claim coupons from the catalog to get started
                </Text>
              </Empty>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {coupons.map((coupon) => {
                const isAvailable = coupon.status === 'AVAILABLE';
                const isUsed = coupon.status === 'USED';
                const isExpired = coupon.status === 'EXPIRED';

                return (
                  <Card
                    key={coupon.id}
                    style={{
                      borderRadius: 16,
                      background: isAvailable ? '#ffffff' : '#fafafa',
                      border: 'none',
                      boxShadow: isAvailable 
                        ? '0 2px 8px rgba(31, 77, 161, 0.08)' 
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      opacity: !isAvailable ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0, marginBottom: 6, fontWeight: 600, color: '#2C2C2C' }}>
                          {coupon.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
                          {coupon.description}
                        </Text>
                      </div>
                      <Tag
                        color={isAvailable ? 'success' : isUsed ? 'default' : 'error'}
                        style={{
                          borderRadius: 12,
                          padding: '2px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                          border: 'none',
                        }}
                      >
                        {coupon.status}
                      </Tag>
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          {coupon.point_cost && coupon.point_cost > 0 ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Cost: <Text strong style={{ color: '#1f4da1' }}>{coupon.point_cost} points</Text>
                            </Text>
                          ) : (
                            <Text strong style={{ fontSize: 14, color: '#1f4da1' }}>
                              Free
                            </Text>
                          )}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Valid until: {formatDate(coupon.expiry_date)}
                        </Text>
                      </div>

                      {isAvailable && (
                        <Button
                          type="primary"
                          block
                          size="large"
                          onClick={() => handleRedeemCoupon(coupon.id)}
                          style={{
                            borderRadius: 12,
                            height: 44,
                            fontWeight: 500,
                            background: '#1f4da1',
                            border: 'none',
                          }}
                        >
                          Redeem
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'history',
      label: 'Point History',
      children: (
        <div style={{ marginTop: 24 }}>
          {transactions.length === 0 ? (
            <Card
              style={{
                borderRadius: 16,
                background: '#fafafa',
                border: 'none',
                textAlign: 'center',
                padding: '48px 24px',
              }}
            >
              <Empty
                description={
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    No transaction history yet
                  </Text>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Your point transactions will appear here
                </Text>
              </Empty>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {transactions.map((transaction, index) => {
                const isEarn = transaction.type === 'EARN';
                const isRedeem = transaction.type === 'REDEEM';
                const isExpire = transaction.type === 'EXPIRE';

                return (
                  <Card
                    key={transaction.id}
                    style={{
                      borderRadius: 16,
                      background: '#ffffff',
                      border: 'none',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      opacity: isExpire ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: isEarn ? '#1f4da1' : isRedeem ? '#faad14' : '#ff4d4f',
                            }}
                          />
                          <Text strong style={{ fontSize: 15, color: '#2C2C2C', fontWeight: 600 }}>
                            {transaction.title}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginLeft: 20, lineHeight: 1.6 }}>
                          {transaction.description}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8, marginLeft: 20 }}>
                          {formatDateTime(transaction.date)}
                        </Text>
                      </div>
                      <Text
                        strong
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: isEarn ? '#1f4da1' : isRedeem ? '#faad14' : '#ff4d4f',
                          minWidth: 80,
                          textAlign: 'right',
                        }}
                      >
                        {isEarn ? '+' : '-'}
                        {Math.abs(transaction.points).toLocaleString()} pts
                      </Text>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh', paddingBottom: 24 }}>
      <PageHeader title="My Profile" />

      {/* CONTENT CONTAINER - LAYERED CARD */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          margin: '0 16px',
          padding: '24px',
          marginTop: 8,
        }}
      >
        {/* PREMIUM MEMBER CARD */}
        <Card
          style={{
            borderRadius: 20,
            background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
            border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 20,
            padding: '32px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Watermark Pattern */}
          <div
            style={{
              position: 'absolute',
              bottom: -20,
              right: -20,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(31, 77, 161, 0.06) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Avatar with Edit Icon */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
              <Avatar
                size={100}
                src={profile.image_url}
                icon={<UserOutlined />}
                style={{
                  border: '3px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <button
                onClick={() => router.push('/profile/edit')}
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(31, 77, 161, 0.3)',
                  background: '#1f4da1',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 77, 161, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 77, 161, 0.3)';
                }}
              >
                <EditOutlined style={{ color: '#ffffff', fontSize: 16 }} />
              </button>
            </div>

            {/* Member No */}
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16, letterSpacing: 0.5 }}>
              Member No: {profile.member_no || `KOS-${profile.id.slice(-6).toUpperCase()}`}
            </Text>

            {/* Tier Badge */}
            <div style={{ marginBottom: 12 }}>
              <Tag
                style={{
                  background: tierColors.bg,
                  color: tierColors.text,
                  border: `2px solid ${tierColors.border}`,
                  borderRadius: 20,
                  padding: '6px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  margin: 0,
                }}
              >
                {getTierLabel(profile.tier)}
              </Tag>
            </div>

            {/* Tier Expiry */}
            {profile.tier_expiry && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                Valid until {formatDate(profile.tier_expiry)}
              </Text>
            )}
          </div>
        </Card>

        {/* POINTS CARD */}
        <Card
          style={{
            borderRadius: 20,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 20,
            padding: '24px',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Available Points
              </Text>
              <Title level={2} style={{ margin: 0, color: '#1f4da1', fontSize: 42, fontWeight: 700, lineHeight: 1.2 }}>
                {points.toLocaleString()}
              </Title>
              {expiringPoints > 0 && expiringDate && (
                <Text style={{ fontSize: 13, display: 'block', marginTop: 12, color: '#faad14' }}>
                  {formatExpiryMessage(expiringPoints, expiringDate)}
                </Text>
              )}
            </div>
            <GiftOutlined style={{ fontSize: 56, color: '#1f4da1', opacity: 0.15 }} />
          </div>
        </Card>

        {/* TABS SECTION */}
        <Card
          style={{
            borderRadius: 20,
            background: '#ffffff',
            border: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
          bodyStyle={{ padding: '20px 16px' }}
        >
          <Tabs
            className="profile-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{
              padding: 0,
            }}
            tabBarStyle={{
              marginBottom: 0,
              borderBottom: '1px solid #f0f0f0',
            }}
            tabBarGutter={32}
          />
        </Card>
      </div>

      {/* REDEEM DRAWER */}
      <RedeemDrawer
        open={redeemDrawerOpen}
        coupon={selectedCoupon}
        onClose={() => {
          setRedeemDrawerOpen(false);
          setSelectedCoupon(null);
        }}
        onMarkUsed={handleMarkUsed}
      />
    </div>
  );
}
