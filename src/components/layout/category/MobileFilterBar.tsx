
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchFilters } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileFilterBarProps {
  onFilterChange: (filters: SearchFilters) => void;
  onNearbyClick: () => void;
  selectedRegion?: string;
  isLoading?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  activeFiltersCount?: number;
}

export function MobileFilterBar({
  onFilterChange,
  onNearbyClick,
  selectedRegion = 'كل المناطق',
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  activeFiltersCount = 0
}: MobileFilterBarProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-16 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث عن أي شيء..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pr-10 bg-white dark:bg-dark-card"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Button */}
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-between bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        onClick={onNearbyClick}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="font-medium">فلترة النتائج</span>
        </div>
        {activeFiltersCount > 0 && (
          <Badge variant="destructive" className="rounded-full">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
