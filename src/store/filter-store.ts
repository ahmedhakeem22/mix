import { create } from 'zustand';
import { SearchFilters } from '@/types';

interface FilterState {
  filters: SearchFilters;
  setFilters: (newFilters: Partial<SearchFilters>) => void;
  setCategory: (categoryId?: number, subcategoryId?: number, childCategoryId?: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  setFilters: (newFilters) => set((state) => {
    const hasPage = Object.prototype.hasOwnProperty.call(newFilters, 'page');
    const updatedFilters = { ...state.filters, ...newFilters };

    if (!hasPage) {
      updatedFilters.page = 1;
    } else if (newFilters.page === undefined) {
      delete updatedFilters.page;
    }

    return { filters: updatedFilters };
  }),
  setCategory: (categoryId, subcategoryId, childCategoryId) => set((state) => ({
    filters: {
      ...state.filters,
      category_id: categoryId,
      sub_category_id: subcategoryId,
      child_category_id: childCategoryId,
      page: 1,
    },
  })),
  resetFilters: () => set({ filters: {} }),
}));
