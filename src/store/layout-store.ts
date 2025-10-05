
import { create } from 'zustand';

interface LayoutStore {
  adLayout: 'grid' | 'list';
  setAdLayout: (layout: 'grid' | 'list') => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  adLayout: 'list', // Default to list view
  setAdLayout: (layout) => set({ adLayout: layout }),
}));
