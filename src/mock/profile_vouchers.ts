/**
 * Mock My Vouchers Data for Profile Page
 */

export interface ProfileVoucher {
  id: string;
  title: string;
  description: string;
  voucher_code: string;
  point_cost?: number;
  expiry_date: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  image_url?: string;
  redeemed_at?: string;
}

// Mock data for profile page
export const mockProfileVouchers: ProfileVoucher[] = [
  {
    id: 'cpn_profile_1',
    title: 'Sekkisei Clear Wellness Set',
    description: 'Get 15% off on Sekkisei Clear Wellness products. Valid for all items in the collection.',
    voucher_code: 'KOSE-VCH-123456',
    point_cost: 500,
    expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
    image_url: '/products/sekkisei-lotion.jpg',
  },
  {
    id: 'cpn_profile_2',
    title: 'Free Shipping',
    description: 'Enjoy free shipping on orders over 1,000฿. No minimum purchase required for members.',
    voucher_code: 'KOSE-VCH-234567',
    point_cost: 0,
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
  },
  {
    id: 'cpn_profile_3',
    title: 'Decorte AQ Meliority Special Offer',
    description: '20% discount on Decorte AQ Meliority premium line. Perfect for your skincare routine.',
    voucher_code: 'KOSE-VCH-345678',
    point_cost: 800,
    expiry_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'EXPIRED',
    redeemed_at: undefined,
  },
  {
    id: 'cpn_profile_4',
    title: 'Infinity Pure Moisture Bundle',
    description: 'Special bundle offer: Buy 2 get 1 free on Infinity Pure Moisture products.',
    voucher_code: 'KOSE-VCH-456789',
    point_cost: 300,
    expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'USED',
    redeemed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cpn_profile_5',
    title: 'Welcome Bonus',
    description: 'Get 10% off your first purchase. Welcome to KOSE membership program.',
    voucher_code: 'KOSE-VCH-567890',
    point_cost: 0,
    expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'AVAILABLE',
  },
];

export const profileVouchersMock = {
  getMyVouchers(customerId: string): ProfileVoucher[] {
    // Return mock data for UI validation
    return mockProfileVouchers;
  },
  markAsUsed(voucherId: string): void {
    const voucher = mockProfileVouchers.find((c) => c.id === voucherId);
    if (voucher && voucher.status === 'AVAILABLE') {
      voucher.status = 'USED';
      voucher.redeemed_at = new Date().toISOString();
    }
  },
};

