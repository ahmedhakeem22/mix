export interface SearchFilters {
  search?: string;
  category_id?: number;
  sub_category_id?: number;
  child_category_id?: number;
  subcategory_id?: number;
  brand_id?: number;
  state_id?: number;
  city_id?: number;
  district_id?: number;
  min_price?: number;
  max_price?: number;
  condition?: 'new' | 'used' | 'refurbished';
  listing_type?: 'sell' | 'rent' | 'wanted' | 'exchange' | 'service';
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at';
  sort_by?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at';
  featured?: boolean;
  verified_user?: boolean;
  with_images?: boolean;
  lat?: number;
  lon?: number;
  radius?: number;
  user_id?: number;
  page?: number;
  per_page?: number;
}