/**
 * Mock Offers Data
 */

export interface Offer {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  gradient?: string;
  date_from?: string;
  date_to?: string;
  campaign_type?: 'promotion' | 'limited' | 'new_arrival' | 'special';
  link?: string;
}

export const offersMock = {
  getOffers(): Offer[] {
    return [
      {
        id: 'offer_1',
        title: 'New Arrival: Sekkisei Clear Wellness Collection',
        description: 'Experience the power of Japanese botanicals with our latest skincare innovation',
        image_url: '/products/sekkisei-lotion.jpg',
        date_from: '2024-01-01',
        date_to: '2024-03-31',
        campaign_type: 'new_arrival',
      },
      {
        id: 'offer_2',
        title: 'Limited Edition: Decorte AQ Meliority',
        description: 'Ultimate luxury for your skincare routine. Available for a limited time only.',
        gradient: 'linear-gradient(135deg, #1f4da1 0%, #2c5aa0 50%, #3a6a9f 100%)',
        date_from: '2024-01-15',
        date_to: '2024-02-29',
        campaign_type: 'limited',
      },
      {
        id: 'offer_3',
        title: 'Special Promotion: Infinity Pure Moisture',
        description: 'Hydration that lasts all day. Get 20% off on selected items.',
        image_url: '/products/infinity-lotion.jpg',
        date_from: '2024-02-01',
        date_to: '2024-02-28',
        campaign_type: 'promotion',
      },
    ];
  },
};

