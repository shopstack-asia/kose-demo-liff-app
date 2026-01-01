/**
 * Mock Points Data
 */

import dayjs from 'dayjs';

export interface PointTransaction {
  id: string;
  customer_id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  description: string;
  created_at: string;
}

export interface PointsSummary {
  total_points: number;
  available_points: number;
  expiring_soon: number;
  expiring_points?: number;
  expiring_date?: string;
}

let mockTransactions: PointTransaction[] = [];

export const pointsMock = {
  getSummary(customerId: string): PointsSummary {
    const customerTransactions = mockTransactions.filter(
      (t) => t.customer_id === customerId
    );

    const total = customerTransactions
      .filter((t) => t.type === 'earned')
      .reduce((sum, t) => sum + t.points, 0);

    const redeemed = customerTransactions
      .filter((t) => t.type === 'redeemed')
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    // Mock: Return realistic point summary with expiring points
    const expiringPoints = 300;
    const expiringDate = dayjs().add(3, 'days').toISOString();
    
    return {
      total_points: total || 1250,
      available_points: total - redeemed || 1250,
      expiring_soon: expiringPoints,
      expiring_points: expiringPoints,
      expiring_date: expiringDate,
    };
  },

  getHistory(customerId: string): PointTransaction[] {
    return mockTransactions
      .filter((t) => t.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addTransaction(transaction: Omit<PointTransaction, 'id' | 'created_at'>): PointTransaction {
    const newTransaction: PointTransaction = {
      ...transaction,
      id: 'pt_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  },

  reset(): void {
    mockTransactions = [];
  },
};

