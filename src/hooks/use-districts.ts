
import { useQuery } from '@tanstack/react-query';
import { env } from '@/utils/env';

export interface District {
  id: number;
  name: string;
  city_id: number;
}

// Fetch all districts
export const useDistricts = () => {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async (): Promise<District[]> => {
      const response = await fetch(`${env.API_BASE_URL}/cities/districts`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const data = await response.json();
      return data.data || [];
    },
  });
};

// Fetch districts by city
export const useCityDistricts = (cityId: number | undefined) => {
  return useQuery({
    queryKey: ['districts', 'city', cityId],
    queryFn: async (): Promise<District[]> => {
      if (!cityId) return [];
      const response = await fetch(`${env.API_BASE_URL}/cities/${cityId}/districts`);
      if (!response.ok) {
        throw new Error('Failed to fetch city districts');
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!cityId,
  });
};
