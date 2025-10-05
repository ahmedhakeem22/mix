import { PaginatedResponse, Ad, Comment, User, Category, Brand, Listing, ListingDetails, SearchFilters, ApiResponse } from '@/types';
import axios, { AxiosError } from 'axios';

// Base API URL for the application
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin2.mixsyria.com/api/v1';

// Helper function to get the auth token from storage (localStorage or sessionStorage)
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper function for making API requests with error handling
// async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
//   try {
//     const url = `${API_BASE_URL}${endpoint}`;
    
//     // Setup default headers
//     const defaultHeaders: Record<string, string> = {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json',
//     };
    
//     // Add auth token if available
//     const token = getAuthToken();
//     if (token) {
//       defaultHeaders['Authorization'] = `Bearer ${token}`;
//     }
    
//     // Make the request
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...defaultHeaders,
//         ...(options?.headers || {}),
//       },
//     });
    
//     // Handle non-success responses
//     if (!response.ok) {
//       // Try to parse error response
//       const errorData = await response.json().catch(() => ({}));
      
//       // If unauthorized (401), clear the token
//       if (response.status === 401) {
//         localStorage.removeItem('authToken');
//         sessionStorage.removeItem('authToken');
        
//         // Redirect to login if unauthorized and not already on login page
//         if (!window.location.pathname.includes('/auth/login')) {
//           window.location.href = '/auth/login';
//         }
//       }
      
//       throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
//     }
    
//     // Parse successful response
//     const data = await response.json();
    
//     // Check if the API response follows our expected structure
//     if (data.success === false) {
//       throw new Error(data.message || 'Unknown API error');
//     }
    
//     // Return the whole data object with the ApiResponse structure
//     return data as T;
//   } catch (error) {
//     console.error('API request failed:', error);
//     throw error;
//   }
// }
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    // تحديد ما إذا كان الجسم هو FormData
    const isFormData = options?.body instanceof FormData;

    // إعداد الهيدرات الأساسية
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // إضافة Content-Type فقط إذا لم يكن FormData
    if (!isFormData && options?.body) {
      headers['Content-Type'] = 'application/json';
    }

    // إنشاء كائن الطلب
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers || {}),
      },
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let rawError = '';

      try {
        rawError = await response.text();
      } catch {
        rawError = '';
      }

      let errorData: any;

      if (rawError) {
        try {
          errorData = JSON.parse(rawError);
        } catch {
          errorData = rawError;
        }
      } else {
        errorData = {};
      }

      const errorString = typeof errorData === 'string' ? errorData.trim() : '';

      const errorMessage =
        typeof errorData === 'object' && errorData !== null
          ? errorData.message || `API Error: ${response.status} ${response.statusText}`
          : errorString.length > 0
            ? errorString
            : `API Error: ${response.status} ${response.statusText}`;

      const apiError = new Error(errorMessage);
      (apiError as any).response = {
        status: response.status,
        data: typeof errorData === 'object' && errorData !== null ? errorData : { message: errorMessage }
      };

      throw apiError;
    }

    let rawResponse = '';

    try {
      rawResponse = await response.text();
    } catch {
      rawResponse = '';
    }

    const trimmedResponse = rawResponse.trim();

    if (!trimmedResponse) {
      return undefined as T;
    }

    try {
      return JSON.parse(trimmedResponse) as T;
    } catch {
      return rawResponse as unknown as T;
    }
  } catch (error: any) {
    console.error('API request failed:', error);
    
    const apiError = new Error(error.message || 'Unknown API error');
    
    if (error.response) {
      apiError.response = error.response;
    } else {
      apiError.response = {
        data: {
          success: false,
          message: error.message || 'Network error',
          errors: ['تعذر الاتصال بالخادم']
        }
      };
    }
    
    throw apiError;
  }
}


// Authentication related API calls
export const authAPI = {
  // Login user
  login: async (identifier: string, password: string, rememberMe: boolean = true): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetchAPI<ApiResponse<{ token: string; user: User }>>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    
    // Store the token in storage if login successful
    if (response.data?.token) {
      if (rememberMe) {
        localStorage.setItem('authToken', response.data.token);
        sessionStorage.removeItem('authToken');
      } else {
        sessionStorage.setItem('authToken', response.data.token);
        localStorage.removeItem('authToken');
      }
    }
    
    return response;
  },
  
  // Logout user
  logout: async (): Promise<void> => {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } finally {
      // Always clear the token
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  },
  
  // Get the current logged-in user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return fetchAPI('/user/profile');
  },
  
  // Register a new user
  // Register a new user
  register: async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    city_id: number;
    state_id: number;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await axios.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/register',
        userData,
        {
          baseURL: API_BASE_URL,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Store the token in localStorage if registration successful
      if (response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
        sessionStorage.removeItem('authToken');
      }
      
      return response.data;
    } catch (error: any) {
      // تحويل خطأ axios إلى تنسيق موحد
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse<any>>;
        
        if (axiosError.response) {
          // استجابة الخادم مع رمز حالة غير 2xx
          throw {
            response: {
              data: axiosError.response.data
            }
          };
        } else {
          // خطأ في الطلب (مشكلة شبكة)
          throw {
            response: {
              data: {
                success: false,
                message: 'Network Error',
                errors: { network: ['تعذر الاتصال بالخادم'] }
              }
            }
          };
        }
      }
      
      // خطأ غير متوقع
      throw {
        response: {
          data: {
            success: false,
            message: 'Unknown Error',
            errors: { unknown: ['حدث خطأ غير متوقع'] }
          }
        }
      };
    }
  },
};

// Categories related API calls
export const categoriesAPI = {
  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return fetchAPI('/categories');
  },
  
  // Get a single category by ID
  getCategory: async (id: number): Promise<ApiResponse<Category>> => {
    return fetchAPI(`/categories/${id}`);
  },

  // Get all subcategories
  getSubCategories: async (): Promise<ApiResponse<any[]>> => {
    return fetchAPI('/subcategories');
  },

  // Get all child categories
  getChildCategories: async (): Promise<ApiResponse<any[]>> => {
    return fetchAPI('/childcategories');
  },
};

// Brands related API calls
export const brandsAPI = {
  // Get all brands
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    return fetchAPI('/brands');
  },
  
  // Get a single brand by ID
  getBrand: async (id: number): Promise<ApiResponse<Brand>> => {
    return fetchAPI(`/brands/${id}`);
  },
};

// Listings related API calls
export const listingsAPI = {
  // Get all listings with filters
  getListings: async (params?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Listing>>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }
    
    return fetchAPI(`/listings?${queryParams.toString()}`);
  },
  

  getListing: async (id: number): Promise<ApiResponse<ListingDetails>> => {
    return fetchAPI(`/listing/${id}`);
  },
  
  createListing: async (listingData: FormData): Promise<ApiResponse<Listing>> => {
    try {
      const response = await fetchAPI<ApiResponse<Listing>>('/user/listings', {
        method: 'POST',
        body: listingData,
      });
      
      console.log("Listing created successfully:", response.data);
      return response;
    } catch (error) {
      console.error("Listing creation error:", error);
      
      if (error?.response?.data) {
        return error.response.data;
      }
      
      throw {
        success: false,
        message: 'فشل في إنشاء الإعلان',
        errors: ['ح��ث خطأ غير متوقع أثناء محاولة إنشاء الإعلان']
      };
    }
  },

  updateListing: async (id: number, listingData: FormData): Promise<ApiResponse<Listing>> => {
    try {
      listingData.append('_method', 'PUT');
      
      const response = await fetchAPI<ApiResponse<Listing>>(`/user/listings/${id}`, {
        method: 'POST',
        body: listingData,
      });
      
      console.log("Listing updated successfully:", response.data);
      return response;
    } catch (error) {
      console.error("Listing update error:", error);
      
      if (error?.response?.data) {
        return error.response.data;
      }
      
      throw {
        success: false,
        message: 'فشل في تحديث الإعلان',
        errors: ['حدث خطأ غير متوقع أثناء محاولة تحديث الإعلان']
      };
    }
  },

  deleteListing: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await fetchAPI<ApiResponse<void>>(`/user/listings/${id}`, {
        method: 'DELETE',
      });
      
      console.log("Listing deleted successfully");
      return response;
    } catch (error) {
      console.error("Listing deletion error:", error);
      
      if (error?.response?.data) {
        return error.response.data;
      }
      
      throw {
        success: false,
        message: 'فشل في حذف الإعلان',
        errors: ['حدث خطأ غير متوقع أثناء محاولة حذف الإعلان']
      };
    }
  },
  
  // Add a comment to a listing
  addComment: async (listingId: number, content: string): Promise<ApiResponse<Comment>> => {
    return fetchAPI(`/user/listings/${listingId}/comments`, {
      method: 'POST',
      body: JSON.stringify({content}),
    });
  },
  
  // Add a reply to a comment
  addReply: async (listingId: number, commentId: number, content: string): Promise<ApiResponse<Comment>> => {
    return fetchAPI(`/user/listings/${listingId}/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deleteReply: async (listingId: number, commentId: number, replyId: number): Promise<ApiResponse<void>> => {
    return fetchAPI(`/user/listings/${listingId}/comments/${commentId}/replies/${replyId}`, {
      method: 'DELETE',
    });
  },

  editReply: async (listingId: number, commentId: number, replyId: number, content: string): Promise<ApiResponse<Comment>> => {
    return fetchAPI(`/user/listings/${listingId}/comments/${commentId}/replies/${replyId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  editComment: async (listingId: number, commentId: number, content: string): Promise<ApiResponse<Comment>> => {
    return fetchAPI(`/user/listings/${listingId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },
  
  // Delete a comment
  deleteComment: async (listingId: number, commentId: number): Promise<ApiResponse<void>> => {
    return fetchAPI(`/user/listings/${listingId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
  
  // Get listing comments
  getComments: async (listingId: number): Promise<ApiResponse<Comment[]>> => {
    return fetchAPI(`/listings/${listingId}/comments`);
  },
  
  // Get related listings
  getRelatedListings: async (listingId: number, limit: number = 4): Promise<ApiResponse<Listing[]>> => {
    return fetchAPI(`/listings/${listingId}/related?limit=${limit}`);
  },
  
  // Add listing to favorites
  addToFavorites: async (listingId: number): Promise<ApiResponse<void>> => {
    return fetchAPI(`/user/listings/${listingId}/favorite`, {
      method: 'POST',
    });
  },
  
  // Remove listing from favorites
  removeFromFavorites: async (listingId: number): Promise<ApiResponse<void>> => {
    return fetchAPI(`/user/listings/${listingId}/favorite`, {
      method: 'DELETE',
    });
  },
  
  // Get user favorites
  getFavorites: async (): Promise<ApiResponse<Listing[]>> => {
    return fetchAPI('/user/favorites');
  },
  
  // Check if listing is favorited
  isFavorite: async (listingId: number): Promise<ApiResponse<boolean>> => {
    try {
      await fetchAPI(`/user/listings/${listingId}/is-favorite`);
      return { success: true, data: true, message: 'Is favorite' };
    } catch (error) {
      return { success: true, data: false, message: 'Not favorite' };
    }
  },
};

// Location related API calls
export const locationAPI = {
  // Get states/provinces
  getStates: async (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    return fetchAPI('/states');
  },
  
  // Get cities for a state
  getCities: async (stateId: number): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    return fetchAPI(`/states/${stateId}/cities`);
  },
  
  // Get all cities
  getAllCities: async (): Promise<ApiResponse<{ id: number; name: string; state_id: number }[]>> => {
    return fetchAPI('/cities');
  },
  
    getDistrictsByCity: async (cityId: number): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    return fetchAPI(`/cities/${cityId}/districts`);
  },

  // Get user's current location
  getCurrentLocation: async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
};

// User related API calls
export const userAPI = {
  // Update user profile
  updateProfile: async (userData: FormData): Promise<ApiResponse<User>> => {
    return fetchAPI('/user/profile/update', {
      method: 'POST',
      body: userData,
      headers: {
        // Let the browser set Content-Type with the correct boundary for FormData
      },
    });
  },
  
  // Get user listings
  getUserListings: async (userId?: number): Promise<ApiResponse<Listing[]>> => {
    const endpoint = userId ? `/users/${userId}/listings` : '/user/listings';
    return fetchAPI(endpoint);
  },
  
  // Change password
  changePassword: async (data: { current_password: string; password: string; password_confirmation: string }): Promise<ApiResponse<void>> => {
    return fetchAPI('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get user statistics
  getUserStatistics: async (): Promise<ApiResponse<any>> => {
    return fetchAPI('/user/statistics');
  },
};

// Search related API calls
export const searchAPI = {
  // Search listings
  searchListings: async (search: string, filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Listing>>> => {
    const queryParams = new URLSearchParams({ search });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }
    
    return fetchAPI(`/search?${queryParams.toString()}`);
  },
};

// For backward compatibility
export const useAds = listingsAPI.getListings;
export const useAd = listingsAPI.getListing;
export const useRelatedAds = listingsAPI.getRelatedListings;
export const useCreateAd = listingsAPI.createListing;
export const useUpdateAd = listingsAPI.updateListing;
export const useDeleteAd = listingsAPI.deleteListing;

export const useEditComment = listingsAPI.editComment;
export const useDeleteReply = listingsAPI.deleteReply;
export const useEditReply = listingsAPI.editReply;
