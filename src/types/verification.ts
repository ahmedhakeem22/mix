
export interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    token?: string;
    user?: User;
    token_expires_in_minutes?: number;
    remaining_attempts?: number;
    email_verification_required?: boolean;
    email_sent?: boolean;
  } | null;
  errors?: {
    remaining_attempts?: number;
    wait_minutes?: number;
  };
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  data: {
    token_expires_in_minutes: number;
    remaining_attempts: number;
  } | null;
  errors?: {
    remaining_attempts?: number;
    wait_minutes?: number;
  };
}

export interface AccountSettings {
  id: number;
  user_id: number;
  security: {
    show_phone_to_buyers: boolean;
    enable_location_tracking: boolean;
    share_usage_data: boolean;
  };
  notifications: {
    enable_all_notifications: boolean;
    new_message_notifications: boolean;
    listing_comment_notifications: boolean;
    weekly_email_summary: boolean;
    email_matching_listings: boolean;
    email_offers_promotions: boolean;
    sms_notifications: boolean;
  };
  general: {
    theme: 'light' | 'dark';
    language: string;
    show_nearby_listings: boolean;
    show_currency_rates: boolean;
    enable_image_caching: boolean;
    disable_listing_comments: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface VerificationInfo {
  id: number;
  user_id: number;
  identification_type: string;
  identification_number: string;
  front_document: string | null;
  back_document: string | null;
  country_id: number;
  state_id: number;
  city_id: number;
  zip_code: string;
  address: string;
  verify_by: number | null;
  status: number;
  status_text: string;
  created_at: string;
  updated_at: string;
  country?: {
    id: number;
    name: string;
    status: number;
  };
  state?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  image: string | null;
  state_id: number;
  city_id: number;
  address: string | null;
  email_verified: boolean;
  verified_status: number | null;
  is_suspend: number | null;
}
