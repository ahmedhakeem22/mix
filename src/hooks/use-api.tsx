import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useCallback, useMemo } from 'react';
import * as API from '@/services/api';
import { Listing, ListingDetails, Category, Brand, User, SearchFilters, Comment, PaginatedResponse, ApiResponse } from '@/types';
import { profileAPI, dashboardAPI } from '@/services/apis';

// Query keys factory for better cache management
const queryKeys = {
  auth: {
    currentUser: () => ['currentUser'] as const,
  },
  categories: {
    all: () => ['categories'] as const,
    byId: (id: number) => ['category', id] as const,
    subcategories: () => ['subcategories'] as const,
    childCategories: () => ['childcategories'] as const,
  },
  brands: {
    all: () => ['brands'] as const,
    byId: (id: number) => ['brand', id] as const,
  },
  listings: {
    all: (filters?: SearchFilters) => ['listings', filters] as const,
    byId: (id: number) => ['listing', id] as const,
    related: (listingId: number, limit: number) => ['relatedListings', listingId, limit] as const,
    user: (userId?: number) => ['userListings', userId] as const,
    search: (query: string, filters?: SearchFilters) => ['search', query, filters] as const,
  },
  favorites: {
    all: () => ['favorites'] as const,
    byListing: (listingId: number) => ['favorite', listingId] as const,
  },
  location: {
    states: () => ['states'] as const,
    cities: (stateId?: number) => ['cities', stateId] as const,
    allCities: () => ['allCities'] as const,
  },
  user: {
    stats: () => ['user-stats'] as const,
    analytics: () => ['user-analytics'] as const,
  },
} as const;

// Optimized hooks with memoization and error handling
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback(({ identifier, password }: { identifier: string; password: string }) => 
      API.authAPI.login(identifier, password), []),
    onSuccess: useCallback((data) => {
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.data.user);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.data.user.first_name} ${data.data.user.last_name}`,
      });
    }, [queryClient]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: error.message,
      });
    }, [])
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: useCallback(async () => {
      const response = await API.authAPI.getCurrentUser();
      return response.data;
    }, []),
    enabled: API.isAuthenticated(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: useCallback(async () => {
      const response = await API.categoriesAPI.getCategories();
      return response.data;
    }, []),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 48 * 60 * 60 * 1000, // 48 hours
  });
}

export function useListings(filters?: SearchFilters) {
  const queryKey = useMemo(() => queryKeys.listings.all(filters), [filters]);
  
  return useQuery({
    queryKey,
    queryFn: useCallback(async () => {
      const response = await API.listingsAPI.getListings(filters);
      return response;
    }, [filters]),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAds(filters?: SearchFilters) {
  return useListings(filters);
}

export function useListing(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.listings.byId(id!),
    queryFn: useCallback(async () => {
      if (!id) throw new Error('No listing ID provided');
      const response = await API.listingsAPI.getListing(id);
      return response.data;
    }, [id]),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAd(id: number | undefined) {
  return useListing(id);
}

export function useRelatedAds(categoryId?: number, excludeId?: number) {
  return useQuery({
    queryKey: ['relatedAds', categoryId, excludeId],
    queryFn: useCallback(async () => {
      if (!categoryId) return [];
      const response = await API.listingsAPI.getListings({ 
        category_id: categoryId, 
        per_page: 8 
      });
      return Array.isArray(response) ? response : response.data || [];
    }, [categoryId]),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback((formData: FormData) => API.listingsAPI.createListing(formData), []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      toast({
        title: "تم إنشاء الإعلان بنجاح",
        description: "سيظهر الإعلان بعد مراجعته",
      });
    }, [queryClient]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الإعلان",
        description: error.message,
      });
    }, [])
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites.all(),
    queryFn: useCallback(async () => {
      const response = await API.listingsAPI.getFavorites();
      return response;
    }, []),
    enabled: API.isAuthenticated(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useIsFavorite(listingId: number) {
  return useQuery({
    queryKey: queryKeys.favorites.byListing(listingId),
    queryFn: useCallback(async () => {
      const response = await API.listingsAPI.checkIsFavorite(listingId);
      return response.data;
    }, [listingId]),
    enabled: API.isAuthenticated() && !!listingId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback((listingId: number) => API.listingsAPI.addToFavorites(listingId), []),
    onMutate: useCallback(async (listingId: number) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.byListing(listingId) });
      const previousValue = queryClient.getQueryData(queryKeys.favorites.byListing(listingId));
      queryClient.setQueryData(queryKeys.favorites.byListing(listingId), true);
      return { previousValue };
    }, [queryClient]),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "تمت الإضافة للمفضلة",
      });
    }, [queryClient]),
    onError: useCallback((error: Error, variables, context) => {
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData(queryKeys.favorites.byListing(variables), context.previousValue);
      }
      toast({
        variant: "destructive",
        title: "خطأ في الإضافة للمفضلة",
        description: error.message,
      });
    }, [queryClient])
  });
}

export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback((listingId: number) => API.listingsAPI.removeFromFavorites(listingId), []),
    onMutate: useCallback(async (listingId: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.byListing(listingId) });
      const previousValue = queryClient.getQueryData(queryKeys.favorites.byListing(listingId));
      queryClient.setQueryData(queryKeys.favorites.byListing(listingId), false);
      return { previousValue };
    }, [queryClient]),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "تمت الإزالة من المفضلة",
      });
    }, [queryClient]),
    onError: useCallback((error: Error, variables, context) => {
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData(queryKeys.favorites.byListing(variables), context.previousValue);
      }
      toast({
        variant: "destructive",
        title: "خطأ في إزالة المفضلة",
        description: error.message,
      });
    }, [queryClient])
  });
}

export function useAddComment(listingId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback((content: string) => API.commentsAPI.addComment(listingId, content), [listingId]),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byId(listingId) });
      toast({
        title: "تم إضافة التعليق بنجاح",
      });
    }, [queryClient, listingId]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة التعليق",
        description: error.message,
      });
    }, [])
  });
}

export function useAddReply(listingId: number, commentId: number | null) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback((content: string) => {
      if (!commentId) throw new Error('Comment ID is required');
      return API.commentsAPI.addReply(commentId, content);
    }, [commentId]),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byId(listingId) });
      toast({
        title: "تم إضافة الرد بنجاح",
      });
    }, [queryClient, listingId]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الرد",
        description: error.message,
      });
    }, [])
  });
}

export function useDeleteComment(listingId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback((commentId: number) => API.commentsAPI.deleteComment(commentId), []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byId(listingId) });
      toast({
        title: "تم حذف التعليق بنجاح",
      });
    }, [queryClient, listingId]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في حذف التعليق",
        description: error.message,
      });
    }, [])
  });
}

export function useEditComment(listingId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback(({ commentId, content }: { commentId: number; content: string }) => 
      API.commentsAPI.editComment(commentId, content), []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byId(listingId) });
      toast({
        title: "تم تعديل التعليق بنجاح",
      });
    }, [queryClient, listingId]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تعديل التعليق",
        description: error.message,
      });
    }, [])
  });
}

export function useDeleteReply(listingId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback(({ commentId, replyId }: { commentId: number; replyId: number }) => 
      API.commentsAPI.deleteReply(replyId), []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byId(listingId) });
      toast({
        title: "تم حذف الرد بنجاح",
      });
    }, [queryClient, listingId]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في حذف الرد",
        description: error.message,
      });
    }, [])
  });
}

export function useEditReply(listingId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: useCallback(({ commentId, replyId, content }: { commentId: number; replyId: number; content: string }) => 
      API.commentsAPI.editReply(replyId, content), []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byId(listingId) });
      toast({
        title: "تم تعديل الرد بنجاح",
      });
    }, [queryClient, listingId]),
    onError: useCallback((error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تعديل الرد",
        description: error.message,
      });
    }, [])
  });
}

// Optimized user analytics with error fallback
export function useUserAnalytics() {
  return useQuery({
    queryKey: queryKeys.user.analytics(),
    queryFn: useCallback(async () => {
      try {
        const response = await profileAPI.getUserStats();
        return response.data;
      } catch (error) {
        console.error('Error fetching user analytics:', error);
        return {
          totalListings: 0,
          activeListings: 0,
          totalViews: 0,
          totalFavorites: 0,
          totalComments: 0
        };
      }
    }, []),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: API.isAuthenticated(),
  });
}

// Dashboard statistics hook
export function useDashboardStatistics() {
  return useQuery({
    queryKey: queryKeys.user.stats(),
    queryFn: useCallback(async () => {
      const response = await dashboardAPI.getStatistics();
      return response;
    }, []),
    enabled: API.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
}

// Export optimized query keys for external use
export { queryKeys };

export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listingId: number) => API.listingsAPI.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      toast({
        title: "تم حذف الإعلان بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في حذف الإعلان",
        description: error.message,
      });
    },
  });
}
