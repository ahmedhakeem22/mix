import { ApiResponse, PaginatedResponse } from '@/types';
import { ListingPromotion, StripePromotionResponse } from '@/types/promotions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper function to get the auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function for making API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const token = getAuthToken();
    const isFormData = options?.body instanceof FormData;
    
    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    };
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options?.headers || {}),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
      
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.message || 'Unknown API error');
    }
    
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Promotion package interface - updated to match real API response
export interface PromotionPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  stripe_price_id: string | null;
}

// User promotion interface - updated to match real API response
export interface UserPromotion {
  id: number;
  payment_method: 'bank_transfer' | 'stripe';
  payment_status: 'pending' | 'confirmed' | 'failed';
  transaction_id: string | null;
  bank_transfer_proof_url: string | null;
  payment_confirmed_at: string | null;
  starts_at: string | null;
  expires_at: string | null;
  amount_paid: number;
  admin_notes: string | null;
  created_at: string;
  package: PromotionPackage;
  listing: {
    id: number;
    title: string;
    slug: string;
    image: {
      image_id: string;
      image_url: string;
    };
    is_currently_promoted: boolean;
    promoted_until: string | null;
  };
  user_id: number;
}

// Promotion API calls - updated to use real endpoints
export const promotionAPI = {
  // Get all available promotion packages
  getPromotionPackages: async (): Promise<{ data: PromotionPackage[] }> => {
    return fetchAPI('/promotion-packages');
  },
  
  // General promote listing method
  promoteListing: async (
    listingId: number,
    data: {
      promotion_package_id: number;
      payment_method: 'bank_transfer' | 'stripe' | 'wallet';
      bank_transfer_proof?: File;
    }
  ): Promise<ApiResponse<UserPromotion | StripePromotionResponse>> => {
    if (data.payment_method === 'bank_transfer') {
      const formData = new FormData();
      formData.append('promotion_package_id', data.promotion_package_id.toString());
      formData.append('payment_method', 'bank_transfer');
      if (data.bank_transfer_proof) {
        formData.append('bank_transfer_proof', data.bank_transfer_proof);
      }

      return fetchAPI(`/user/listings/${listingId}/promote`, {
        method: 'POST',
        body: formData,
      });
    } else {
      return fetchAPI(`/user/listings/${listingId}/promote`, {
        method: 'POST',
        body: JSON.stringify({
          promotion_package_id: data.promotion_package_id,
          payment_method: data.payment_method,
        }),
      });
    }
  },
  
  // Promote a listing with bank transfer
  promoteListingWithBankTransfer: async (
    listingId: number,
    data: { promotion_package_id: number; bank_transfer_proof: File; payment_method: 'bank_transfer' }
  ): Promise<ApiResponse<UserPromotion>> => {
    const formData = new FormData();
    formData.append('promotion_package_id', data.promotion_package_id.toString());
    formData.append('payment_method', 'bank_transfer');
    formData.append('bank_transfer_proof', data.bank_transfer_proof);

    return fetchAPI(`/user/listings/${listingId}/promote`, {
      method: 'POST',
      body: formData,
    });
  },

  // Promote a listing with Stripe
  promoteListingWithStripe: async (
    listingId: number,
    data: { promotion_package_id: number; payment_method: 'stripe' }
  ): Promise<ApiResponse<StripePromotionResponse>> => {
    return fetchAPI(`/user/listings/${listingId}/promote`, {
      method: 'POST',
      body: JSON.stringify({
        promotion_package_id: data.promotion_package_id,
        payment_method: 'stripe',
      }),
    });
  },

  // Promote a listing with wallet
  promoteListingWithWallet: async (
    listingId: number,
    data: { promotion_package_id: number; payment_method: 'wallet' }
  ): Promise<ApiResponse<UserPromotion>> => {
    return fetchAPI(`/user/listings/${listingId}/promote`, {
      method: 'POST',
      body: JSON.stringify({
        promotion_package_id: data.promotion_package_id,
        payment_method: 'wallet',
      }),
    });
  },

  // Get user's promotion history
  getUserPromotions: async (): Promise<PaginatedResponse<UserPromotion>> => {
    return fetchAPI('/user/listing-promotions');
  },
};
