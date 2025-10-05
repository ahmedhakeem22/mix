
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionAPI } from '@/services/promotion-api';
import { toast } from '@/hooks/use-toast';
import { isAuthenticated } from '@/services/api';

// Promotion hooks
export function usePromotionPackages() {
  return useQuery({
    queryKey: ['promotion-packages'],
    queryFn: async () => {
      const response = await promotionAPI.getPromotionPackages();
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - packages don't change often
  });
}

export function useUserPromotions() {
  return useQuery({
    queryKey: ['user-promotions'],
    queryFn: async () => {
      const response = await promotionAPI.getUserPromotions();
      return response;
    },
    enabled: isAuthenticated(),
  });
}

export function usePromoteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listingId, data }: {
      listingId: number;
      data: {
        promotion_package_id: number;
        payment_method: 'bank_transfer' | 'stripe';
        bank_transfer_proof?: File;
      };
    }) => promotionAPI.promoteListing(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast({
        title: "تم إرسال طلب الترقية بنجاح",
        description: "سيتم مراجعة طلبك وتفعيل الترقية قريباً",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في ترقية الإعلان",
        description: error.message,
      });
    },
  });
}

export function usePromoteWithBankTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, data }: { 
      listingId: number; 
      data: { promotion_package_id: number; bank_transfer_proof: File; payment_method: 'bank_transfer' } 
    }) => {
      const response = await promotionAPI.promoteListingWithBankTransfer(listingId, {
        promotion_package_id: data.promotion_package_id,
        bank_transfer_proof: data.bank_transfer_proof,
        payment_method: 'bank_transfer'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-promotions'] });
    },
  });
}

export function usePromoteWithStripe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, data }: { 
      listingId: number; 
      data: { promotion_package_id: number; payment_method: 'stripe' } 
    }) => {
      const response = await promotionAPI.promoteListingWithStripe(listingId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-promotions'] });
    },
  });
}

export function usePromoteWithWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, data }: { 
      listingId: number; 
      data: { promotion_package_id: number; payment_method: 'wallet' } 
    }) => {
      const response = await promotionAPI.promoteListingWithWallet(listingId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-promotions'] });
    },
  });
}
