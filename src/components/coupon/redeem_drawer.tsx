'use client';

import { Drawer, Typography, Tag, Button, Divider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';

const { Title, Text } = Typography;

export interface RedeemCoupon {
  id: string;
  title: string;
  description: string;
  coupon_code: string;
  expiry_date: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  point_cost?: number;
}

interface RedeemDrawerProps {
  open: boolean;
  coupon: RedeemCoupon | null;
  onClose: () => void;
  onMarkUsed: (couponId: string) => void;
}

export function RedeemDrawer({ open, coupon, onClose, onMarkUsed }: RedeemDrawerProps) {
  if (!coupon) return null;

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('D MMM YYYY');
  };

  const handleMarkUsed = () => {
    onMarkUsed(coupon.id);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="90vh"
      closable={false}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* HEADER */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseOutlined style={{ fontSize: 20, color: '#666' }} />
          </button>
          <Title level={3} style={{ margin: 0, textAlign: 'center', fontWeight: 600, color: '#2C2C2C' }}>
            {coupon.title}
          </Title>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* COUPON SUMMARY */}
          <div style={{ marginBottom: 32 }}>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8, color: '#2C2C2C' }}>
              {coupon.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 16, lineHeight: 1.6 }}>
              {coupon.description}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Tag
                color="success"
                style={{
                  borderRadius: 12,
                  padding: '4px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  border: 'none',
                }}
              >
                {coupon.status}
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Valid until: {formatDate(coupon.expiry_date)}
            </Text>
          </div>

          <Divider style={{ margin: '32px 0' }} />

          {/* QR CODE SECTION */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '24px',
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: 16,
              }}
            >
              <QRCodeSVG
                value={coupon.coupon_code}
                size={240}
                level="H"
                includeMargin={true}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', color: '#666' }}>
              Show this QR code to staff to redeem
            </Text>
          </div>

          {/* USAGE INSTRUCTION */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12, color: '#999' }}>
              This coupon can be used once only. Screenshot is not accepted.
            </Text>
          </div>
        </div>

        {/* FIXED ACTION AREA */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', background: '#ffffff' }}>
          <Button
            type="primary"
            block
            size="large"
            onClick={handleMarkUsed}
            style={{
              borderRadius: 12,
              height: 48,
              fontWeight: 500,
              background: '#1f4da1',
              border: 'none',
            }}
          >
            Mark as Used
          </Button>
        </div>
      </div>
    </Drawer>
  );
}


