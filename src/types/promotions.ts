
export interface PromotionPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  is_active: boolean;
}

export interface ListingPromotion {
  id: number;
  payment_method: 'bank_transfer' | 'stripe' | 'wallet';
  payment_status: 'pending' | 'paid' | 'failed';
  transaction_id?: string;
  bank_transfer_proof_url?: string;
  payment_confirmed_at?: string;
  starts_at?: string;
  expires_at?: string;
  amount_paid: number;
  package: PromotionPackage;
  listing: {
    id: number;
    title: string;
    [key: string]: any;
  };
}

export interface PromoteListingRequest {
  promotion_package_id: number;
  payment_method: 'bank_transfer' | 'stripe' | 'wallet';
  bank_transfer_proof?: File;
}

export interface StripePromotionResponse {
  checkout_url: string;
  session_id: string;
}
