'use client';

import { Carousel, Card, Typography, Rate, Row, Col } from 'antd';
import { homeMock } from '@/mock/home';
import { liff } from '@/lib/liff';

const { Title, Text } = Typography;

export default function HomePage() {
  const heroBanner = homeMock.getHeroBanner();
  const promotions = homeMock.getPromotions();
  const reviews = homeMock.getCustomerReviews();
  const products = homeMock.getHighlightProducts();

  const handleProductClick = (url: string) => {
    if (typeof window !== 'undefined') {
      if (liff.isInLine && liff.isInLine()) {
        // In LINE app, use window.open for external links
        window.open(url, '_blank');
      } else {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div style={{ background: '#faf8f5', minHeight: '100vh' }}>
      {/* HERO BANNER */}
      <div
        style={{
          width: '100%',
          height: '280px',
          background: heroBanner.gradient || 'linear-gradient(135deg, #1f4da1 0%, #2c5aa0 50%, #3a6a9f 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 24px 24px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: '#faf8f5',
            borderRadius: '24px 24px 0 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#ffffff',
            padding: '0 24px',
            zIndex: 1,
          }}
        >
          {heroBanner.title && (
            <Title
              level={2}
              style={{
                color: '#ffffff',
                margin: 0,
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 28,
              }}
            >
              {heroBanner.title}
            </Title>
          )}
          {heroBanner.subtitle && (
            <Text style={{ color: '#ffffff', fontSize: 16, opacity: 0.9 }}>
              {heroBanner.subtitle}
            </Text>
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 24 }}>
        {/* HIGHLIGHT PROMOTIONS CAROUSEL */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#2C2C2C' }}>
              Highlight Promotions
            </Title>
          </div>
          <Carousel
            autoplay
            autoplaySpeed={4000}
            dots={true}
            dotPosition="bottom"
            infinite
            style={{ marginBottom: 24 }}
          >
            {promotions.map((promo) => (
              <div key={promo.id}>
                <Card
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundImage: `url(${promo.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        padding: '24px 16px 16px',
                        color: '#ffffff',
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          color: '#ffffff',
                          margin: 0,
                          marginBottom: 4,
                          fontWeight: 600,
                        }}
                      >
                        {promo.title}
                      </Title>
                      <Text style={{ color: '#ffffff', fontSize: 13, opacity: 0.9 }}>
                        {promo.description}
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>

        {/* CUSTOMER REVIEWS CAROUSEL */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, marginBottom: 4, fontWeight: 600, color: '#2C2C2C' }}>
              Consumer&apos;s Review
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Real reviews from real users
            </Text>
          </div>
          <div className="review-carousel-container" style={{ marginBottom: 24 }}>
            <div className="review-carousel-track">
              {/* Duplicate reviews for seamless loop */}
              {[...reviews, ...reviews].map((review, index) => (
                <div
                  key={`${review.id}-${index}`}
                  style={{
                    flexShrink: 0,
                    width: 'calc(100vw - 64px)',
                    maxWidth: '320px',
                  }}
                >
                  <Card
                    style={{
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(31, 77, 161, 0.08)',
                      height: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: 12,
                          backgroundImage: `url(${review.product_image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8, color: '#2C2C2C' }}>
                          {review.product_name}
                        </Text>
                        <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                      </div>
                    </div>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: '#666',
                        display: 'block',
                        marginBottom: 12,
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;{review.review_text}&rdquo;
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      — {review.reviewer_name}
                    </Text>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HIGHLIGHT PRODUCTS */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#2C2C2C' }}>
              Recommended Products
            </Title>
          </div>
          <Row gutter={[12, 16]}>
            {products.map((product) => (
              <Col span={12} key={product.id}>
                <Card
                  hoverable
                  onClick={() => handleProductClick(product.external_url)}
                  style={{
                    borderRadius: 16,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '180px',
                      backgroundImage: `url(${product.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '16px 16px 0 0',
                    }}
                  />
                  <div style={{ padding: '12px' }}>
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        display: 'block',
                        marginBottom: 4,
                        color: '#2C2C2C',
                        lineHeight: 1.4,
                      }}
                    >
                      {product.name}
                    </Text>
                    {product.tagline && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {product.tagline}
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}

