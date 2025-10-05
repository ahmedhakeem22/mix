// src/components/dashboard/AdsTab.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useUserListings } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { Pagination } from '@/components/custom/pagination';
import { MyAdCard } from './MyAdCard';
import { AdFilters } from './AdFilters';

interface AdsTabProps {
  onPromote: (id: number) => void;
  onDelete: (id: number) => void;
}

const AdListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="flex h-40 animate-pulse">
        <div className="w-40 bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-3 p-4">
          <div className="h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </Card>
    ))}
  </div>
);

export function AdsTab({ onPromote, onDelete }: AdsTabProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest',
    search: '',
  });

  const debouncedSearch = useDebounce(filters.search, 500);
  const { user } = useAuth();
  const itemsPerPage = 8;

  const apiFilters = {
    page: page,
    per_page: itemsPerPage,
    status: filters.status === 'all' ? undefined : filters.status,
    search: debouncedSearch || undefined,
    sort: filters.sortBy,
  };

  const { data: response, isLoading, error, refetch } = useUserListings(apiFilters);

  const listings = response?.data || [];
  const totalItems = response?.meta?.total_items || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleRefreshAd = useCallback(async (adId: number) => {
    console.log('Refreshing ad:', adId);
    await refetch();
  }, [refetch]);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">الرجاء تسجيل الدخول لعرض إعلاناتك.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">إعلاناتي ({isLoading ? '...' : totalItems})</h2>
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            تحديث
          </Button>
        </div>
        <AdFilters
          searchQuery={filters.search}
          setSearchQuery={(value) => handleFilterChange('search', value)}
          selectedStatus={filters.status}
          setSelectedStatus={(value) => handleFilterChange('status', value)}
          sortBy={filters.sortBy}
          setSortBy={(value) => handleFilterChange('sortBy', value)}
        />
      </div>

      {isLoading && listings.length === 0 ? (
        <AdListSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-red-500">
            <p className="font-semibold">حدث خطأ في تحميل الإعلانات.</p>
            <p className="text-sm">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">لا توجد إعلانات تطابق المعايير المحددة.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <MyAdCard
              key={listing.id}
              listing={listing}
              onPromote={onPromote}
              onDelete={onDelete}
              onRefresh={handleRefreshAd}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && response && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}