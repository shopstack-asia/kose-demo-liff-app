/**
 * Shared Types
 */

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface CustomerProfile {
  id: string;
  line_user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  image_url?: string;
  terms_accepted: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerStatus {
  status: 'new' | 'existing' | 'profile_incomplete' | 'terms_not_accepted';
  customer?: CustomerProfile;
}

