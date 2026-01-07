'use client';

import { useState } from 'react';
import { Card, Typography, Empty } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { offersMock, Offer } from '@/mock/offers';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export default function OffersPage() {
  const [offers] = useState<Offer[]>(offersMock.getOffers());

  const handleCardClick = (offer: Offer) => {
    // Future: Navigate to offer detail view
    // For now, just a placeholder
    console.log('View offer details:', offer.id);
    if (offer.link) {
      window.open(offer.link, '_blank');
    }
  };

  const formatDateRange = (dateFrom?: string, dateTo?: string) => {
    if (!dateFrom && !dateTo) return null;
    if (dateFrom && dateTo) {
      return `${dayjs(dateFrom).format('DD MMM YYYY')} - ${dayjs(dateTo).format('DD MMM YYYY')}`;
    }
    if (dateFrom) {
      return `From ${dayjs(dateFrom).format('DD MMM YYYY')}`;
    }
    if (dateTo) {
      return `Until ${dayjs(dateTo).format('DD MMM YYYY')}`;
    }
    return null;
  };

  const getCampaignTypeLabel = (type?: string) => {
    switch (type) {
      case 'new_arrival':
        return 'New Arrival';
      case 'limited':
        return 'Limited Edition';
      case 'special':
        return 'Special Offer';
      case 'promotion':
        return 'Promotion';
      default:
        return null;
    }
  };

  // Marketing content images from offers folder
  const marketingImages = [
    '/offers/offer-1.png',
    '/offers/offer-2.png',
    '/offers/offer-3.png',
  ];

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      <div style={{ padding: '0 16px', paddingTop: 16 }}>
        <PageHeader
          title="Offers"
          subtitle="Special offers and promotions for you"
        />
      </div>

      {/* Marketing Content Images */}
      {marketingImages.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 32 }}>
          {marketingImages.map((imageUrl, index) => (
            <Card
              key={`marketing-${index}`}
              style={{
                marginBottom: 16,
                borderRadius: 12,
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: 0,
              }}
              bodyStyle={{ padding: 0 }}
            >
              <img
                src={imageUrl}
                alt={`Marketing content ${index + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Offers List Section Header */}
      {offers.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <Title
            level={4}
            style={{
              margin: 0,
              fontWeight: 600,
              color: '#2C2C2C',
              fontSize: 18,
            }}
          >
            Available Offers
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: 14,
              color: '#8c8c8c',
              display: 'block',
              marginTop: 4,
            }}
          >
            Explore our special promotions and deals
          </Text>
        </div>
      )}

      {/* Offers List */}
      <div className="page-container" style={{ paddingTop: 0 }}>
        {offers.length === 0 ? (
          <Card
            style={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              background: '#fff',
            }}
          >
            <Empty
              image={<GiftOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Title
                    level={4}
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      fontWeight: 500,
                      color: '#2C2C2C',
                    }}
                  >
                    No offers available
                  </Title>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 14,
                      color: '#8c8c8c',
                      fontWeight: 400,
                    }}
                  >
                    Check back soon for exciting offers
                  </Text>
                </div>
              }
            />
          </Card>
        ) : (
          <div style={{ paddingBottom: '24px' }}>
            {offers.map((offer) => {
            const dateRange = formatDateRange(offer.date_from, offer.date_to);
            const campaignLabel = getCampaignTypeLabel(offer.campaign_type);

            return (
              <Card
                key={offer.id}
                hoverable
                onClick={() => handleCardClick(offer)}
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  background: '#fff',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Hero Image or Gradient Background */}
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundImage: offer.image_url
                      ? `url(${offer.image_url})`
                      : offer.gradient || 'linear-gradient(135deg, #1f4da1 0%, #2c5aa0 50%, #3a6a9f 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  {/* Gradient Overlay for better text readability */}
                  {offer.image_url && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                      }}
                    />
                  )}

                  {/* Campaign Type Badge */}
                  {campaignLabel && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 20,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 11,
                          color: '#1f4da1',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {campaignLabel}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px' }}>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#2C2C2C',
                      lineHeight: 1.4,
                    }}
                  >
                    {offer.title}
                  </Title>

                  {offer.description && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 14,
                        color: '#666',
                        lineHeight: 1.6,
                        display: 'block',
                        marginBottom: 12,
                      }}
                    >
                      {offer.description}
                    </Text>
                  )}

                  {dateRange && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        color: '#8c8c8c',
                        display: 'block',
                        marginTop: 8,
                      }}
                    >
                      {dateRange}
                    </Text>
                  )}
                </div>
              </Card>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
