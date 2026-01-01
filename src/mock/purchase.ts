/**
 * Mock Purchase Data
 */

export interface PurchaseProduct {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
}

export interface PurchaseRequest {
  customer_id: string;
  store_name: string;
  store_location: string;
  purchase_date: string;
  total_amount: number;
  invoice_number?: string;
  receipt_image_url?: string;
  notes?: string;
  products?: PurchaseProduct[];
}

export interface PurchaseResponse {
  id: string;
  customer_id: string;
  store_name: string;
  store_location: string;
  purchase_date: string;
  total_amount: number;
  invoice_number?: string;
  points_earned: number;
  receipt_image_url?: string;
  notes?: string;
  products?: PurchaseProduct[];
  created_at: string;
}

let mockPurchases: PurchaseResponse[] = [];

export const purchaseMock = {
  submit(request: PurchaseRequest): PurchaseResponse {
    // Calculate points: 1 point per 10 baht
    const pointsEarned = Math.floor(request.total_amount / 10);

    const purchase: PurchaseResponse = {
      id: 'pur_' + Date.now(),
      ...request,
      points_earned: pointsEarned,
      created_at: new Date().toISOString(),
    };

    mockPurchases.push(purchase);
    return purchase;
  },

  getHistory(customerId: string): PurchaseResponse[] {
    return mockPurchases
      .filter((p) => p.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  reset(): void {
    mockPurchases = [];
  },
};

