/**
 * Mock Home Page Data
 */

export interface HeroBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  gradient?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link?: string;
}

export interface CustomerReview {
  id: string;
  product_name: string;
  product_image_url: string;
  review_text: string;
  rating: number;
  reviewer_name: string;
}

export interface HighlightProduct {
  id: string;
  name: string;
  tagline?: string;
  category?: string;
  image_url: string;
  external_url: string;
}

export const homeMock = {
  getHeroBanner(): HeroBanner {
    return {
      id: 'hero_1',
      title: 'Discover Your Beauty',
      subtitle: 'Premium Japanese Skincare & Cosmetics',
      gradient: 'linear-gradient(135deg, #1f4da1 0%, #2c5aa0 50%, #3a6a9f 100%)',
    };
  },

  getPromotions(): Promotion[] {
    return [
      {
        id: 'promo_1',
        title: 'New Arrival: Sekkisei Clear Wellness',
        description: 'Experience the power of Japanese botanicals',
        image_url: '/products/sekkisei-lotion.jpg',
      },
      {
        id: 'promo_2',
        title: 'Limited Edition: Decorte AQ Meliority',
        description: 'Ultimate luxury for your skincare routine',
        image_url: '/products/decorte-cream.jpg',
      },
      {
        id: 'promo_3',
        title: 'Special Offer: Infinity Pure Moisture',
        description: 'Hydration that lasts all day',
        image_url: '/products/infinity-lotion.jpg',
      },
    ];
  },

  getCustomerReviews(): CustomerReview[] {
    return [
      {
        id: 'review_1',
        product_name: 'Sekkisei Clear Wellness Lotion',
        product_image_url: '/products/sekkisei-lotion.jpg',
        review_text: 'This lotion transformed my skin! So hydrating and gentle.',
        rating: 5,
        reviewer_name: 'Sarah M.',
      },
      {
        id: 'review_2',
        product_name: 'Decorte AQ Meliority Cream',
        product_image_url: '/products/decorte-cream.jpg',
        review_text: 'The most luxurious cream I\'ve ever used. Worth every penny!',
        rating: 5,
        reviewer_name: 'Emma L.',
      },
      {
        id: 'review_3',
        product_name: 'Infinity Pure Moisture Emulsion',
        product_image_url: '/products/infinity-emulsion.jpg',
        review_text: 'Perfect for my sensitive skin. Lightweight and effective.',
        rating: 4,
        reviewer_name: 'Lisa K.',
      },
      {
        id: 'review_4',
        product_name: 'One by Kose Clear Turn Mask',
        product_image_url: '/products/onebykose-mask.jpg',
        review_text: 'My weekly skincare ritual. Leaves skin so smooth!',
        rating: 5,
        reviewer_name: 'Anna T.',
      },
      {
        id: 'review_5',
        product_name: 'INFINITY Unlimited Key Revitalizing Serum',
        product_image_url: '/products/infinity-lotion.jpg',
        review_text: 'Amazing results! My skin feels so revitalized and glowing.',
        rating: 5,
        reviewer_name: 'Maria S.',
      },
      {
        id: 'review_6',
        product_name: 'SEKKISEI CLEAR WELLNESS UV Defense Milk',
        product_image_url: '/products/sekkisei-lotion.jpg',
        review_text: 'Perfect daily protection. Lightweight and doesn\'t feel greasy.',
        rating: 5,
        reviewer_name: 'Jessica W.',
      },
    ];
  },

  getHighlightProducts(): HighlightProduct[] {
    return [
      {
        id: 'prod_home_1',
        name: 'INFINITY Unlimited Key Revitalizing Serum',
        tagline: 'Star Product',
        category: 'Skincare',
        image_url: '/products/infinity-lotion.jpg',
        external_url: 'https://www.kose-th.com/product/infinity-unlimited-key-revitalizing-serum',
      },
      {
        id: 'prod_home_2',
        name: 'SEKKISEI CLEAR WELLNESS UV Defense Milk',
        tagline: 'Sun Protection',
        category: 'Skincare',
        image_url: '/products/sekkisei-lotion.jpg',
        external_url: 'https://www.kose-th.com/product/sekkisei-clear-wellness-uv-defense-milk',
      },
      {
        id: 'prod_home_3',
        name: 'SEKKISEI CLEAR WELLNESS UV Defense Gel 70g',
        tagline: 'Lightweight Protection',
        category: 'Skincare',
        image_url: '/products/sekkisei-lotion.jpg',
        external_url: 'https://www.kose-th.com/product/sekkisei-clear-wellness-uv-defense-gel-70g',
      },
      {
        id: 'prod_home_4',
        name: 'Clear Wellness Vitalizing Serum',
        tagline: 'Revitalizing Essence',
        category: 'Skincare',
        image_url: '/products/sekkisei-lotion.jpg',
        external_url: 'https://www.kose-th.com/product/clear-wellness-vitalizing-serum',
      },
      {
        id: 'prod_home_5',
        name: 'Intensive Wrinkle Serum',
        tagline: 'Anti-Aging Care',
        category: 'Skincare',
        image_url: '/products/decorte-cream.jpg',
        external_url: 'https://www.kose-th.com/product/intensive-wrinkle-serum',
      },
      {
        id: 'prod_home_6',
        name: 'White Washing Wash',
        tagline: 'Deep Cleansing',
        category: 'Skincare',
        image_url: '/products/sekkisei-powder-wash.jpg',
        external_url: 'https://www.kose-th.com/product/white-washing-wash',
      },
    ];
  },
};

