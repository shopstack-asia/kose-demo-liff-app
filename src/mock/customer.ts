/**
 * Mock Customer Data
 */

import dayjs from 'dayjs';

export interface CustomerProfile {
  id: string;
  line_user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  line_id?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  image_url?: string;
  terms_accepted: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  member_no?: string;
  tier?: 'silver' | 'gold' | 'platinum';
  tier_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerStatus {
  status: 'new' | 'existing' | 'profile_incomplete' | 'terms_not_accepted';
  customer?: CustomerProfile;
}

// Mock storage (simulating database)
let mockCustomers: CustomerProfile[] = [];

export const customerMock = {
  findByLineUserId(lineUserId: string): CustomerProfile | null {
    return mockCustomers.find((c) => c.line_user_id === lineUserId) || null;
  },

  findById(id: string): CustomerProfile | null {
    return mockCustomers.find((c) => c.id === id) || null;
  },

  create(profile: Partial<CustomerProfile>): CustomerProfile {
    const now = new Date().toISOString();
    const customerId = 'cust_' + Date.now();
    const customer: CustomerProfile = {
      id: customerId,
      line_user_id: profile.line_user_id || '',
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      email: profile.email,
      dob: profile.dob,
      gender: profile.gender,
      image_url: profile.image_url,
      terms_accepted: profile.terms_accepted || false,
      phone_verified: profile.phone_verified || false,
      email_verified: profile.email_verified || false,
      member_no: profile.member_no || `KOS-${customerId.slice(-6).toUpperCase()}`,
      tier: profile.tier || 'silver',
      tier_expiry: profile.tier_expiry || dayjs().add(1, 'year').toISOString(),
      created_at: now,
      updated_at: now,
    };
    mockCustomers.push(customer);
    return customer;
  },

  update(id: string, updates: Partial<CustomerProfile>): CustomerProfile | null {
    const index = mockCustomers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    mockCustomers[index] = {
      ...mockCustomers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockCustomers[index];
  },

  getStatus(lineUserId: string): CustomerStatus {
    const customer = this.findByLineUserId(lineUserId);

    if (!customer) {
      return { status: 'new' };
    }

    if (!customer.terms_accepted) {
      return { status: 'terms_not_accepted', customer };
    }

    if (!customer.first_name || !customer.last_name || !customer.phone) {
      return { status: 'profile_incomplete', customer };
    }

    return { status: 'existing', customer };
  },

  verifyPhone(id: string): boolean {
    const customer = this.update(id, { phone_verified: true });
    return customer !== null;
  },

  verifyEmail(id: string): boolean {
    const customer = this.update(id, { email_verified: true });
    return customer !== null;
  },

  // For testing: reset mock data
  reset(): void {
    mockCustomers = [];
  },
};

