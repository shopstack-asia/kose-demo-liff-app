/**
 * Mock Point History Data for Profile Page
 */

export interface ProfilePointTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'EXPIRE';
  points: number;
  title: string;
  description: string;
  date: string;
}

// Mock data for profile page
export const mockProfilePointHistory: ProfilePointTransaction[] = [
  {
    id: 'pt_profile_1',
    type: 'EARN',
    points: 1500,
    title: 'Offline Purchase',
    description: 'Purchase at Central World - Sekkisei Clear Wellness Set',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_2',
    type: 'REDEEM',
    points: -300,
    title: 'Coupon Redemption',
    description: 'Redeemed Infinity Pure Moisture Bundle coupon',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_3',
    type: 'EARN',
    points: 800,
    title: 'Online Purchase',
    description: 'Purchase at KOSE Online Store - Decorte AQ Meliority Cream',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_4',
    type: 'EARN',
    points: 200,
    title: 'Welcome Bonus',
    description: 'Welcome to KOSE membership program',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_5',
    type: 'REDEEM',
    points: -500,
    title: 'Coupon Redemption',
    description: 'Redeemed Sekkisei Clear Wellness Set coupon',
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_6',
    type: 'EARN',
    points: 1200,
    title: 'Offline Purchase',
    description: 'Purchase at Robinsons - Esprique Precious Rich Cream',
    date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_7',
    type: 'EXPIRE',
    points: -100,
    title: 'Points Expired',
    description: 'Points expired due to inactivity',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pt_profile_8',
    type: 'EARN',
    points: 600,
    title: 'Online Purchase',
    description: 'Purchase at KOSE Online Store - One by Kose Clear Turn Mask',
    date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const profilePointHistoryMock = {
  getHistory(customerId: string): ProfilePointTransaction[] {
    // Return mock data sorted by date (latest first)
    return [...mockProfilePointHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
};

