import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { AdCard } from '@/components/ads/ad-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { useListings, useCategories } from '@/hooks/use-api';
import { SearchFilters } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Pagination } from '@/components/custom/pagination';
import { 
  Search, 
  Grid2X2, 
  List, 
  SlidersHorizontal,
  X,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: categories } = useCategories();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined,
    sub_category_id: searchParams.get('sub_category_id') ? parseInt(searchParams.get('sub_category_id')!) : undefined,
    city_id: searchParams.get('city_id') ? parseInt(searchParams.get('city_id')!) : undefined,
    state_id: searchParams.get('state_id') ? parseInt(searchParams.get('state_id')!) : undefined,
    brand_id: searchParams.get('brand_id') ? parseInt(searchParams.get('brand_id')!) : undefined,
    min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    condition: (searchParams.get('condition') as any) || undefined,
    product_condition: (searchParams.get('product_condition') as any) || undefined,
    listing_type: (searchParams.get('listing_type') as any) || undefined,
    featured: searchParams.get('featured') === 'true' || undefined,
    sort_by: (searchParams.get('sort_by') as any) || 'newest',
    lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
    lon: searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined,
    radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
  });
  
  const [adLayout, setAdLayout] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Fetch results with improved error handling
  const { data: searchResults, isLoading, error, refetch } = useListings({
    ...filters,
    page,
    per_page: itemsPerPage,
  });
  
  const listings = searchResults?.data || [];
  const totalPages = searchResults?.last_page || 1;
  const totalResults = searchResults?.total || 0;
  
  // Update URL when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params[key] = value.toString();
      }
    });
    
    setSearchParams(params);
  }, [filters, setSearchParams]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setPage(1);
  };
  
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };
  
  const clearFilter = (filterKey: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };
  
  const clearAllFilters = () => {
    setFilters({ sort_by: 'newest' });
    setSearchQuery('');
    setPage(1);
  };
  
  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      value !== undefined && value !== '' && value !== null && 
      !['sort_by', 'page', 'per_page'].includes(key)
    );
  }, [filters]);

  const quickFilters = [
    { label: 'مميز', key: 'featured', value: true },
    { label: 'جديد', key: 'condition', value: 'new' },
    { label: 'مستعمل', key: 'condition', value: 'used' },
    { label: 'للبيع', key: 'listing_type', value: 'sell' },
    { label: 'للإيجار', key: 'listing_type', value: 'rent' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'الأحدث', icon: Clock },
    { value: 'oldest', label: 'الأقدم', icon: Calendar },
    { value: 'price_asc', label: 'السعر من الأقل', icon: ArrowUpDown },
    { value: 'price_desc', label: 'السعر من الأعلى', icon: ArrowUpDown },
    { value: 'popular', label: 'الأكثر مشاهدة', icon: TrendingUp },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-background">
      <Header />
      
      {/* Advanced Search Header */}
      <div className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border">
        <div className="container px-4 mx-auto py-8">
          <div className="max-w-6xl mx-auto">
            {/* Title and Stats */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                البحث المتقدم في الإعلانات
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                ابحث عن كل ما تحتاجه بسهولة وسرعة
              </p>
              
              {/* Quick Stats */}
              <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{totalResults} إعلان متاح</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>{categories?.length || 0} تصنيف</span>
                </div>
              </div>
            </div>
            
            {/* Main Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن أي منتج، خدمة، أو كلمة مفتاحية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 pr-12 h-14 text-lg border-2 focus:border-brand"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-10"
                >
                  بحث متقدم
                </Button>
              </div>
            </form>
            
            {/* Quick Action Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-medium text-muted-foreground">فلاتر سريعة:</span>
              {quickFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant={filters[filter.key as keyof SearchFilters] === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange({ [filter.key]: filter.value })}
                  className="h-8"
                >
                  {filter.label}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-8 mr-2"
              >
                <SlidersHorizontal className="w-4 h-4 ml-1" />
                فلترة متقدمة
              </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <Card className="p-6 mb-6">
                <AdvancedFilters 
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container px-4 mx-auto py-6">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">الفلاتر المطبقة ({activeFilters.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4 ml-1" />
                  مسح الكل
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {activeFilters.map(([key, value]) => (
                  <Badge 
                    key={key}
                    variant="outline" 
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    <span className="text-xs">
                      {key === 'search' ? `"${value}"` : `${key}: ${value}`}
                    </span>
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => clearFilter(key as keyof SearchFilters)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'نتائج البحث'}
              </h2>
              <p className="text-sm text-muted-foreground">
                عرض {listings.length} من أصل {totalResults} إعلان
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Items per page */}
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value, 10));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort */}
              <Select
                value={filters.sort_by || 'newest'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value as any }))}
              >
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Layout Toggle */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button 
                  variant={adLayout === 'grid' ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setAdLayout('grid')}
                  className="h-9 w-9 rounded-none p-0"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={adLayout === 'list' ? "default" : "ghost"}
                  size="sm" 
                  onClick={() => setAdLayout('list')}
                  className="h-9 w-9 rounded-none p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results */}
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse">
                    <div className="bg-muted h-48 rounded-lg mb-3" />
                    <div className="bg-muted h-4 rounded mb-2" />
                    <div className="bg-muted h-4 rounded w-3/4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">حدث خطأ في البحث</h3>
              <p className="text-muted-foreground mb-4">يرجى المحاولة مرة أخرى أو التأكد من الاتصال بالإنترنت</p>
              <Button onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className={cn(
                "grid gap-4",
                adLayout === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {listings.map((listing) => (
                  <AdCard 
                    key={listing.id} 
                    ad={listing} 
                    layout={adLayout}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <div className="mt-8">
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-dark-card rounded-lg">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-4">لم يتم العثور على نتائج</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                جرب تعديل معايير البحث أو استخدم كلمات مفتاحية مختلفة للحصول على نتائج أفضل
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={clearAllFilters}>
                  إعادة ضبط البحث
                </Button>
                <Button variant="outline" onClick={() => navigate('/categories')}>
                  تصفح التصنيفات
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
