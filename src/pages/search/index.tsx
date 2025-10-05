
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AdFilters } from '@/components/filters/ad-filters';
import { AdCard } from '@/components/ads/ad-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useListings } from '@/hooks/use-api';
import { SearchFilters } from '@/types';
import { useAuth } from '@/context/auth-context';
import { Pagination } from '@/components/custom/pagination';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Loader2, Grid2X2, List, Search, Filter } from 'lucide-react';
import { WithSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [adLayout, setAdLayout] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at'>('created_at');
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: SearchFilters = {};
    
    // Extract filters from URL
    if (searchParams.get('q')) urlFilters.search = searchParams.get('q')!;
    if (searchParams.get('category')) urlFilters.category_id = parseInt(searchParams.get('category')!);
    if (searchParams.get('min_price')) urlFilters.min_price = parseInt(searchParams.get('min_price')!);
    if (searchParams.get('max_price')) urlFilters.max_price = parseInt(searchParams.get('max_price')!);
    if (searchParams.get('location')) urlFilters.city_id = parseInt(searchParams.get('location')!);
    if (searchParams.get('featured')) urlFilters.featured = searchParams.get('featured') === 'true';
    
    setFilters(urlFilters);
  }, [searchParams]);

  const { data: listingsResponse, isLoading: isLoadingListings, error } = useListings({
    page,
    per_page: itemsPerPage,
    sort: sortBy,
    ...filters,
  });

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value.toString());
      }
    });
    setSearchParams(newParams);
  };

  const listings = listingsResponse?.data?.data || [];
  const totalPages = listingsResponse?.data?.last_page || 1;
  const totalResults = listingsResponse?.data?.total || 0;
  
  const searchQuery = filters.search || '';
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-background">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-8">
        {/* Search Header */}
        <div className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border">
          <div className="container px-4 mx-auto py-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-6 h-6 text-brand" />
                <h1 className="text-3xl font-bold text-foreground">نتائج البحث</h1>
              </div>
              
              {searchQuery && (
                <div className="mb-4">
                  <p className="text-lg text-muted-foreground">
                    البحث عن: <span className="font-semibold text-foreground">"{searchQuery}"</span>
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>عُثر على {totalResults.toLocaleString()} نتيجة</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    فلاتر مطبقة
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 mx-auto py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Desktop Filter Sidebar */}
            {!isMobile && (
              <div className="col-span-1 hidden md:block">
                <AdFilters 
                  layout="sidebar" 
                  onLayoutChange={setAdLayout} 
                  currentLayout={adLayout}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}
            
            <div className="col-span-1 md:col-span-3">
              {/* Mobile Filters */}
              {isMobile && (
                <div className="mb-6">
                  <AdFilters 
                    layout="horizontal" 
                    onLayoutChange={setAdLayout} 
                    currentLayout={adLayout}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              )}

              {/* Results Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground">
                    {totalResults > 0 ? `${totalResults.toLocaleString()} نتيجة` : 'لا توجد نتائج'}
                  </p>
                  
                  {hasActiveFilters && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setFilters({});
                        setSearchParams(new URLSearchParams());
                      }}
                      className="text-xs"
                    >
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onValueChange={(value: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at') => {
                      setSortBy(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-36 h-10">
                      <SelectValue placeholder="الترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">الأحدث</SelectItem>
                      <SelectItem value="updated_at">آخر تحديث</SelectItem>
                      <SelectItem value="price_asc">السعر: الأقل أولاً</SelectItem>
                      <SelectItem value="price_desc">السعر: الأعلى أولاً</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Items per page */}
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value, 10));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-16 h-10">
                      <SelectValue placeholder="20" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* View Toggle */}
                  <div className="flex border border-border rounded-lg overflow-hidden bg-background">
                    <Button 
                      variant={adLayout === 'grid' ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setAdLayout('grid')}
                      className="h-10 w-10 rounded-none"
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={adLayout === 'list' ? "default" : "ghost"}
                      size="sm" 
                      onClick={() => setAdLayout('list')}
                      className="h-10 w-10 rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingListings && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              )}

              {/* Error State */}
              {error && !isLoadingListings && (
                <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl">
                  <p className="text-red-500 mb-4">حدث خطأ أثناء تحميل النتائج</p>
                  <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
                </div>
              )}

              {/* Results */}
              {!isLoadingListings && !error && (
                <>
                  {/* Listings Grid */}
                  {Array.isArray(listings) && listings.length > 0 ? (
                    <WithSkeleton
                      isLoading={isLoadingListings}
                      data={listings}
                      SkeletonComponent={CardSkeleton}
                      skeletonCount={itemsPerPage}
                    >
                      {(listingsData) => (
                        <div className={`grid gap-6 ${
                          adLayout === 'grid' 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                            : 'grid-cols-1'
                        }`}>
                          {listingsData.map((listing) => (
                            <AdCard 
                              key={listing.id} 
                              ad={listing} 
                              layout={adLayout}
                            />
                          ))}
                        </div>
                      )}
                    </WithSkeleton>
                  ) : (
                    <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">لم يتم العثور على نتائج</h3>
                      <p className="text-muted-foreground mb-6">
                        جرب تعديل كلمات البحث أو إزالة بعض الفلاتر
                      </p>
                      <Button 
                        onClick={() => {
                          setFilters({});
                          setSearchParams(new URLSearchParams());
                        }}
                      >
                        مسح جميع الفلاتر
                      </Button>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {listings.length > 0 && (
                    <div className="mt-8">
                      <Pagination 
                        currentPage={page} 
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
