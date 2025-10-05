import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { CategoryBar } from '@/components/layout/category/CategoryBar';
import { AdCard } from '@/components/ads/ad-card';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Grid2X2, List, MapPin, Search } from 'lucide-react';
import { useAds, useCurrentLocation, useStates, useCategory } from '@/hooks/use-api';
import { SearchFilters, Listing } from '@/types';
import { Pagination } from '@/components/custom/pagination';
import { WithSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdFilters } from '@/components/filters/ad-filters';
import { MobileFilterSheet } from '@/components/filters/MobileFilterSheet';
import { useLayoutStore } from '@/store/layout-store';
import { useFilterStore } from '@/store/filter-store';
import { useDebounce } from '@/hooks/use-debounce';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function Home() {
  const { adLayout, setAdLayout } = useLayoutStore();
  const { filters, setFilters } = useFilterStore();
  
  const debouncedSearch = useDebounce(filters.search, 500);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  
  const [nearbyEnabled, setNearbyEnabled] = useState<boolean>(() => {
    return localStorage.getItem('nearbyFilterEnabled') === 'true';
  });

  const { data: locationData, isSuccess: locationLoaded } = useCurrentLocation({ enabled: nearbyEnabled });

  useEffect(() => {
    localStorage.setItem('nearbyFilterEnabled', String(nearbyEnabled));
    if (nearbyEnabled) {
      setFilters({ radius: 50 });
    } else {
      const { radius, lat, lon, ...rest } = filters;
      setFilters(rest);
    }
  }, [nearbyEnabled]);

  const apiFilters: SearchFilters = {
    ...filters,
    search: debouncedSearch,
    page: filters.page || 1,
    per_page: 12,
    ...(nearbyEnabled && locationData ? {
      lat: locationData.lat,
      lon: locationData.lng,
    } : {})
  };

  const { data: adsResponse, isLoading: isLoadingAds, error: adsError } = useAds(apiFilters);
  const { data: category, isLoading: isCategoryLoading } = useCategory(filters.category_id, { enabled: !!filters.category_id });

  const handleFilterChange = (newFiltersFromComponent: SearchFilters) => {
    const updatedFilters = { ...filters, ...newFiltersFromComponent };
    if (typeof updatedFilters.radius === 'number' && updatedFilters.radius > 0) {
      setNearbyEnabled(true);
    } else if (newFiltersFromComponent.radius === undefined) {
      setNearbyEnabled(false);
    }
    setFilters(updatedFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };
  
  const getPageTitle = () => {
    if (isCategoryLoading) return 'جاري التحميل...';
    if (category) return `قسم: ${category.name}`;
    if (filters.search) return `نتائج البحث عن: "${filters.search}"`;
    return 'أحدث الإعلانات';
  };
  
  const adData = adsResponse?.data || [];
  const totalPages = adsResponse?.meta?.last_page || 1;
  
  const featuredAds = Array.isArray(adData) ? adData.filter((ad: Listing) => ad.featured) : [];
  const regularAds = Array.isArray(adData) ? adData.filter((ad: Listing) => !ad.featured) : [];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {isMobile && (
        <div className="bg-white dark:bg-dark-background border-b border-border dark:border-dark-border px-4 py-3">
          <form onSubmit={(e) => {
            e.preventDefault();
            setFilters({ search: mobileSearchQuery, page: 1 });
          }}>
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن منتجات، خدمات، وظائف..."
                className="w-full h-10 pr-10 pl-4 rounded-lg border border-input bg-background"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute top-0 right-0 h-full px-3 flex items-center">
                <Search className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </form>
        </div>
      )}

      <CategoryBar />
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container px-4 mx-auto py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {!isMobile && (
              <div className="col-span-1 hidden md:block">
                <AdFilters 
                  layout="sidebar" 
                  onLayoutChange={setAdLayout} 
                  currentLayout={adLayout}
                  onFilterChange={handleFilterChange}
                  initialFilters={filters}
                />
              </div>
            )}
            
            <div className="col-span-1 md:col-span-3">
              {isMobile ? (
                <div className="mb-6 space-y-4">
                  <h1 className="text-lg font-bold">{getPageTitle()}</h1>
                  <div className="flex items-center justify-between gap-2">
                    <MobileFilterSheet onFilterChange={handleFilterChange} currentFilters={filters} />
                    <div className="flex items-center gap-2">
                      <Button variant={nearbyEnabled ? "default" : "outline"} size="icon" onClick={() => setNearbyEnabled(!nearbyEnabled)} className="h-9 w-9 flex-shrink-0">
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Select value={filters.sort || 'newest'} onValueChange={value => setFilters({ sort: value as any })}>
                        <SelectTrigger className="h-9 text-xs flex-1 min-w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">الأحدث</SelectItem>
                          <SelectItem value="price_asc">الأقل سعراً</SelectItem>
                          <SelectItem value="price_desc">الأعلى سعراً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl md:text-2xl font-bold">{getPageTitle()}</h1>
                  <div className="flex items-center gap-3">
                    <Select value={filters.sort || 'newest'} onValueChange={value => setFilters({ sort: value as any })}>
                      <SelectTrigger className="w-40 h-9"><SelectValue placeholder="الترتيب حسب" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">الأحدث</SelectItem>
                        <SelectItem value="oldest">الأقدم</SelectItem>
                        <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                        <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                        <SelectItem value="popular">الأكثر مشاهدة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant={nearbyEnabled ? "default" : "outline"} size="sm" onClick={() => setNearbyEnabled(!nearbyEnabled)} disabled={!locationLoaded} className="flex items-center gap-2 h-9">
                      <MapPin className="h-4 w-4" /><span>القريب مني</span>
                    </Button>
                    <div className="flex border rounded-md overflow-hidden">
                      <Button variant={adLayout === 'grid' ? "default" : "ghost"} size="icon" onClick={() => setAdLayout('grid')} className="h-9 w-9 rounded-none"><Grid2X2 className="h-4 w-4" /></Button>
                      <Button variant={adLayout === 'list' ? "default" : "ghost"} size="icon" onClick={() => setAdLayout('list')} className="h-9 w-9 rounded-none"><List className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              )}
              
              {featuredAds.length > 0 && !filters.category_id && !filters.search && (
                <div className="mb-8 animate-in fade-in">
                  <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">إعلانات مميزة</h2></div>
                  <WithSkeleton isLoading={isLoadingAds} data={featuredAds} SkeletonComponent={CardSkeleton} skeletonCount={3} layout={adLayout}>
                    {(featuredAdsData) => (
                      <div className={`grid gap-4 ${adLayout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {featuredAdsData.slice(0, 3).map((ad) => (<AdCard key={ad.id} ad={ad} layout={adLayout} />))}
                      </div>
                    )}
                  </WithSkeleton>
                </div>
              )}
              
              <div className="animate-in fade-in">
                <WithSkeleton isLoading={isLoadingAds} data={adData} SkeletonComponent={CardSkeleton} skeletonCount={12} layout={adLayout}>
                  {(listingsData) => (
                    listingsData.length > 0 ? (
                      <div className={`grid gap-4 ${adLayout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {listingsData.map((ad) => (<AdCard key={ad.id} ad={ad} layout={adLayout} />))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 dark:bg-dark-surface rounded-lg">
                        <p className="text-muted-foreground mb-4">لا توجد إعلانات تطابق بحثك.</p>
                      </div>
                    )
                  )}
                </WithSkeleton>
                
                {adsError && (
                  <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-red-500 mb-4">حدث خطأ أثناء تحميل الإعلانات.</p>
                    <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
                  </div>
                )}
                
                {!isLoadingAds && !adsError && adsResponse && totalPages > 1 && (
                  <Pagination currentPage={apiFilters.page} totalPages={totalPages} onPageChange={handlePageChange} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}