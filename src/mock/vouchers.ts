/**
 * Mock Vouchers Data
 */

export interface Voucher {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_purchase?: number;
  valid_from: string;
  valid_to: string;
  image_url?: string;
  terms?: string;
}

export interface MyVoucher extends Voucher {
  customer_id: string;
  claimed_at: string;
  used_at?: string;
  expired_at: string;
}

let mockVouchers: Voucher[] = [
  {
    id: 'cpn_1',
    title: 'Welcome Bonus',
    description: 'Get 20% off your first purchase',
    discount_type: 'percentage',
    discount_value: 20,
    min_purchase: 1000,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: '/vouchers/welcome-bonus.svg',
    terms: 'Valid for first purchase only',
  },
  {
    id: 'cpn_2',
    title: 'Free Shipping',
    description: 'Free shipping on orders over 500฿',
    discount_type: 'free_shipping',
    discount_value: 0,
    min_purchase: 500,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: '/vouchers/free-shipping.svg',
  },
  {
    id: 'cpn_3',
    title: 'Sekkisei Special Offer',
    description: 'Get 15% off on Sekkisei Clear Wellness products',
    discount_type: 'percentage',
    discount_value: 15,
    min_purchase: 2000,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: '/vouchers/percentage-off.svg',
    terms: 'Valid for Sekkisei products only',
  },
  {
    id: 'cpn_4',
    title: '฿500 Off',
    description: 'Save ฿500 on purchases over ฿3,000',
    discount_type: 'fixed',
    discount_value: 500,
    min_purchase: 3000,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: '/vouchers/fixed-amount.svg',
    terms: 'Cannot be combined with other offers',
  },
];

let mockMyVouchers: MyVoucher[] = [];

export const vouchersMock = {
  getCatalog(): Voucher[] {
    return mockVouchers.filter((c) => {
      const now = new Date();
      const validFrom = new Date(c.valid_from);
      const validTo = new Date(c.valid_to);
      return now >= validFrom && now <= validTo;
    });
  },

  getMyVouchers(customerId: string): MyVoucher[] {
    return mockMyVouchers
      .filter((c) => c.customer_id === customerId)
      .sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime());
  },

  claim(customerId: string, voucherId: string): MyVoucher | null {
    const voucher = mockVouchers.find((c) => c.id === voucherId);
    if (!voucher) return null;

    const alreadyClaimed = mockMyVouchers.some(
      (c) => c.customer_id === customerId && c.id === voucherId && !c.used_at
    );
    if (alreadyClaimed) return null;

    const myVoucher: MyVoucher = {
      ...voucher,
      customer_id: customerId,
      claimed_at: new Date().toISOString(),
      expired_at: voucher.valid_to,
    };
    mockMyVouchers.push(myVoucher);
    return myVoucher;
  },

  use(customerId: string, voucherId: string): boolean {
    const voucher = mockMyVouchers.find(
      (c) => c.customer_id === customerId && c.id === voucherId && !c.used_at
    );
    if (!voucher) return false;

    voucher.used_at = new Date().toISOString();
    return true;
  },

  reset(): void {
    mockMyVouchers = [];
  },
};

