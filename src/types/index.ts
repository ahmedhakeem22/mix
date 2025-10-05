export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiError; // إضافة errors كخاصية اختيارية
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
export interface LoginSuccessData {
  user: User;
  token: string;
}

export interface ApiError {
  remaining_attempts?: number;
  wait_minutes?: number;
  [key: string]: any; // للتعامل مع أخطاء التحقق (validation errors) الأخرى
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  email?: string;
  avatar?: string;
  avatar_url?: string;
  image?: string;
  name: string;
  city: string;
  bio?: string;
  about?: string;
  created_at: string;
  updated_at: string;
  verified?: boolean;
  wallet_balance?: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  image?: string;
  image_url?: string;
  parent_id?: number;
  children?: Category[];
  subcategories?: Category[];
  childcategories?: Category[];
  slug?: string;
  count?: number;
}

export interface Brand {
  id: number;
  name: string;
  title?: string;
  logo?: string;
  category_id?: number;
}

export interface ListingImage {
  id?: number | string;
  image_id?: number | string;
  image_url: string;
  url: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  images: (string | ListingImage)[];
  image?: string | ListingImage;
  main_image_url?: string;
  category: string;
  city: string;
  city_name?: string;
  location?: string;
  address?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  featured?: boolean;
  condition?: 'new' | 'used' | 'refurbished';
  listing_type?: 'sell' | 'rent' | 'wanted' | 'buy' | 'exchange' | 'service';
  brand_id?: number;
  model?: string;
  year?: number;
  negotiable?: boolean;
  is_negotiable?: boolean;
  status?: 'active' | 'sold' | 'expired' | 'promoted' | 'pending' | 'rejected';
  views_count?: number;
  viewCount?: number;
  subcategory?: string;
  district?: string;
  comments_count?: number;
  distance_km?: number;
  is_favorited?: boolean;
}

export interface ListingDetails extends Omit<Listing, 'location'> {
  user: User;
  category_id: number;
  category_name?: string;
  child_category_id?: number | string;
  sub_category_id?: number | string;
  sub_category_name?: string;
  state_id?: number;
  city_id?: number;
  district_id?: number;
  state?: string;
  lat?: number;
  lon?: number;
  location?: string;
  brand?: Brand;
  views_count?: number;
  favorites_count?: number;
  is_favorited?: boolean;
  phone_hidden?: boolean;
  distance_km?: number;
  related?: Listing[];
  comments?: Comment[];
}

export interface SearchFilters {
  search?: string;
  category_id?: number;
  sub_category_id?: number | string;
  child_category_id?: number | string;
  subcategory_id?: number;
  city_id?: number;
  district_id?: number;
  brand_id?: number;
  state_id?: number;
  min_price?: number;
  max_price?: number;
  condition?: 'new' | 'used' | 'refurbished';
  product_condition?: 'new' | 'used' | 'refurbished';
  listing_type?: 'sell' | 'rent' | 'wanted' | 'buy' | 'exchange' | 'service';
  featured?: boolean;
  verified_user?: boolean;
  with_images?: boolean;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at';
  sort_by?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at';
  radius?: number;
  page?: number;
  per_page?: number;
  lat?: number;
  lon?: number;
  user_id?: number;
}

export interface City {
  id: number;
  name: string;
  country_id?: number;
  state_id?: number;
}

export interface State {
  id: number;
  name: string;
  country_id?: number;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  listing_id?: number;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: number;
  listing: Listing;
  other_user: User;
  last_message: Message;
  unread_count: number;
  updated_at: string;
  participants?: User[];
}

export interface Ad extends Listing {}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  user: User;
  listing_id: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface Favorite {
  id: number;
  user_id: number;
  listing_id: number;
  created_at: string;
}

export interface SubCategory extends Category {
  parent_id: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  email?: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  } | null;
}

// Image types for better type safety
export interface MainImage {
  image_id?: number | string;
  image_url: string;
  url: string;
}

export interface GalleryImage {
  id?: number | string;
  image_id?: number | string;
  image_url: string;
  url: string;
}
export interface UserSettings {
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
    language: 'ar' | 'en';
    show_nearby_listings: boolean;
    show_currency_rates: boolean;
    enable_image_caching: boolean;
    disable_listing_comments: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AccountSettings {

  account_info: unknown; 
  verify_info: unknown;
  business_hours: unknown;
  user_settings: UserSettings;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface DeleteAccountPayload {
    reason: string;
    description?: string;
}

export interface ChatParticipant {
  id: number;
  full_name: string;
  image: string;
  phone?: string;
}

export interface LastMessage {
  id: number;
  message: { text: string };
  file_url?: string;
  created_at: string;
}

export interface Chat {
  id: number;
  other_participant: ChatParticipant | null;
  last_message: LastMessage | null;
  unread_messages_count: number;
  updated_at: string; 
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  message: {
    text: string;
  };
  file_url: string | null;
  is_seen: boolean;
  sent_by_me: boolean;
  sender_type: 'user' | 'member';
  created_at: string;
  timestamp: string;
}
export interface VerifyPhonePayload {
  phone: string;
  otp_code: string;
}

export interface ResendOtpPayload {
  phone: string;
}

export interface RequestPasswordResetOtpPayload {
  phone: string;
}

export interface ResetPasswordWithOtpPayload {
  phone: string;
  otp_code: string;
  password: string;
  password_confirmation: string;
}

export interface ResendOtpResponseData {
  token_expires_in_minutes: number;
  remaining_attempts: number;
}

// Dashboard statistics types
export interface DashboardSummary {
  views: { total: number | string; change: number };
  inquiries: { total: number | string; change: number };
  active_listings: { count: number; limit: number };
  conversion_rate: { rate: number; change: number };
}

export interface DashboardViewsPoint {
  name: string;
  views: number;
}

export interface DashboardPerformancePoint {
  name: string;
  views: number;
  inquiries: number;
}

export interface DashboardStatistics {
  summary: DashboardSummary;
  views_chart: DashboardViewsPoint[];
  performance_chart: DashboardPerformancePoint[];
}
