/**
 * Mock Purchase History Data
 */

export interface PurchaseHistory {
  id: string;
  purchase_date: string;
  store_name: string;
  total_amount: number;
  receipt_no?: string;
  created_at: string;
}

export const mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: 'pur_001',
    purchase_date: '2024-01-15',
    store_name: 'Central World (ZEN)',
    total_amount: 2450,
    receipt_no: 'INV-2024-001234',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'pur_002',
    purchase_date: '2024-01-10',
    store_name: 'Robinson Rama 9',
    total_amount: 1890,
    receipt_no: 'INV-2024-001189',
    created_at: '2024-01-10T14:20:00Z',
  },
  {
    id: 'pur_003',
    purchase_date: '2024-01-08',
    store_name: 'Matsumoto Kiyoshi Siam Square',
    total_amount: 3200,
    receipt_no: 'INV-2024-001156',
    created_at: '2024-01-08T16:45:00Z',
  },
  {
    id: 'pur_004',
    purchase_date: '2024-01-05',
    store_name: 'Tsuruha Icon Siam',
    total_amount: 1560,
    receipt_no: 'INV-2024-001098',
    created_at: '2024-01-05T11:15:00Z',
  },
  {
    id: 'pur_005',
    purchase_date: '2024-01-02',
    store_name: 'EVEANDBOY Siam Square One',
    total_amount: 2780,
    receipt_no: 'INV-2024-001045',
    created_at: '2024-01-02T09:30:00Z',
  },
  {
    id: 'pur_006',
    purchase_date: '2023-12-28',
    store_name: 'Central Ladprao',
    total_amount: 4200,
    receipt_no: 'INV-2023-009876',
    created_at: '2023-12-28T15:20:00Z',
  },
  {
    id: 'pur_007',
    purchase_date: '2023-12-25',
    store_name: 'Beautrium Flagship Store Siam Square',
    total_amount: 1350,
    created_at: '2023-12-25T13:10:00Z',
  },
];

