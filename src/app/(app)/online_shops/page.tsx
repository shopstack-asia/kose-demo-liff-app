'use client';

import { Typography } from 'antd';
import Image from 'next/image';

const { Title, Text } = Typography;

interface OnlineShop {
  name: string;
  url: string;
  logoPath: string;
}

const onlineShops: OnlineShop[] = [
  {
    name: 'Lazada',
    url: 'https://www.lazada.co.th/shop/kose-official-store/?path=index.htm',
    logoPath: '/online-shops/lazada-logo.png',
  },
  {
    name: 'Shopee',
    url: 'https://shopee.co.th/kose_thailand',
    logoPath: '/online-shops/shopee-logo.png',
  },
  {
    name: 'Central Online',
    url: 'https://www.central.co.th/en/kose',
    logoPath: '/online-shops/central-logo.png',
  },
  {
    name: 'M Online',
    url: 'https://monline.com/th/kose/',
    logoPath: '/online-shops/monline-logo.png',
  },
  {
    name: 'EVEANDBOY',
    url: 'https://www.eveandboy.com/brand/sekkisei?brand_id=5637147195',
    logoPath: '/online-shops/eveandboy-logo.png',
  },
];

export default function OnlineShopsPage() {
  const handleShopClick = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh', padding: '24px 0' }}>
      {/* Header Section */}
      <div style={{ marginBottom: 40, textAlign: 'center', padding: '0 16px' }}>
        <Title
          level={1}
          style={{
            margin: 0,
            marginBottom: 12,
            fontWeight: 600,
            fontSize: 32,
            color: '#2C2C2C',
            letterSpacing: '-0.5px',
          }}
        >
          Online Shop
        </Title>
        <Text
          style={{
            fontSize: 16,
            color: '#666',
            lineHeight: 1.6,
            display: 'block',
          }}
        >
          Shop from Thailand&apos;s leading online channels
        </Text>
      </div>

      {/* Online Shops Logo Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', padding: '0 16px 0 16px' }}>
        {/* Lazada - Full width on top */}
        <div
          onClick={() => handleShopClick(onlineShops[0].url)}
          style={{
            cursor: 'pointer',
            transition: 'opacity 0.3s ease',
            position: 'relative',
            width: '100%',
            aspectRatio: '16/6',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Image
            src={onlineShops[0].logoPath}
            alt={onlineShops[0].name}
            width={1200}
            height={450}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Remaining 4 shops - 2 columns grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 3,
            width: '100%',
          }}
        >
          {onlineShops.slice(1).map((shop, index) => (
            <div
              key={index}
              onClick={() => handleShopClick(shop.url)}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.3s ease',
                position: 'relative',
                width: '100%',
                aspectRatio: '2/1',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Image
                src={shop.logoPath}
                alt={shop.name}
                width={800}
                height={400}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Spacing at bottom */}
      <div style={{ height: 24 }} />
    </div>
  );
}

