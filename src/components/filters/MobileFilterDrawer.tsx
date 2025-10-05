
import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ArrowRight, Check, ChevronRight, MapPin } from 'lucide-react';
import { 
  Drawer, 
  DrawerTrigger, 
  DrawerContent, 
  DrawerClose, 
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useBrands, useStates, useAllCities, useCurrentLocation } from '@/hooks/use-api';
import { Category, Brand, SearchFilters } from '@/types';
import { FilterSkeleton } from '@/components/ui/loading-skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFilterDrawerProps {
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  selectedCategory?: Category;
}

type FilterSection = 'main' | 'price' | 'category' | 'brand' | 'location' | 'other' | 'sort';

export function MobileFilterDrawer({ 
  onFilterChange, 
  initialFilters,
  selectedCategory 
}: MobileFilterDrawerProps) {
  const isMobile = useIsMobile();
  
  // Filter states
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState(initialFilters?.search || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    selectedCategory?.id || initialFilters?.category_id as number | undefined
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | undefined>(
    initialFilters?.sub_category_id as number | undefined
  );
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(
    initialFilters?.brand_id as number | undefined
  );
  const [selectedStateId, setSelectedStateId] = useState<number | undefined>(
    initialFilters?.state_id as number | undefined
  );
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(
    initialFilters?.city_id as number | undefined
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters?.min_price || 0,
    initialFilters?.max_price || 100000
  ]);
  const [listingType, setListingType] = useState<'sell' | 'rent' | 'wanted' | undefined>(
    initialFilters?.listing_type as 'sell' | 'rent' | 'wanted' | undefined
  );
  const [condition, setCondition] = useState<'new' | 'used' | undefined>(
    initialFilters?.condition as 'new' | 'used' | undefined
  );
  const [nearbyAds, setNearbyAds] = useState(
    initialFilters?.lat && initialFilters.lon ? true : false
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'oldest' | undefined>(
    initialFilters?.sort_by as 'newest' | 'price_asc' | 'price_desc' | 'oldest' | undefined
  );
  
  // Current filter section
  const [activeSection, setActiveSection] = useState<FilterSection>('main');
  const [filtersCount, setFiltersCount] = useState(0);
  const [isDrawerReady, setIsDrawerReady] = useState(false);

  // Fetch data from API
  const { data: categoriesData, isLoading: loadingCategories } = useCategories();
  const { data: brandsData, isLoading: loadingBrands } = useBrands();
  const { data: statesData, isLoading: loadingStates } = useStates();
  const { data: citiesData, isLoading: loadingCities } = useAllCities();
  const { data: locationData, isLoading: loadingLocation } = useCurrentLocation();
  
  // Extract actual data arrays from API responses
  const categories = categoriesData || [];
  const brands = brandsData || [];
  const states = statesData || [];
  const cities = citiesData || [];
  
  // Get subcategories based on selected category
  const subcategories = selectedCategoryId && categories
    ? categories.find(cat => cat.id === selectedCategoryId)?.subcategories || []
    : [];
  
  // Get cities based on selected state
  const stateCities = selectedStateId && cities
    ? cities.filter(city => city.state_id === selectedStateId)
    : [];

  // Calculate number of active filters
  useEffect(() => {
    let count = 0;
    if (searchText) count++;
    if (selectedCategoryId) count++;
    if (selectedSubCategoryId) count++;
    if (selectedBrandId) count++;
    if (selectedStateId) count++;
    if (selectedCityId) count++;
    if (priceRange[0] > 0) count++;
    if (priceRange[1] < 100000) count++;
    if (listingType) count++;
    if (condition) count++;
    if (sortBy) count++;
    if (nearbyAds) count++;
    
    setFiltersCount(count);
  }, [
    searchText, selectedCategoryId, selectedSubCategoryId, selectedBrandId, 
    selectedStateId, selectedCityId, priceRange, listingType, condition, sortBy, nearbyAds
  ]);
  
  // Ensure drawer works properly
  useEffect(() => {
    if (open) {
      // Small delay to ensure transitions work properly
      setTimeout(() => {
        setIsDrawerReady(true);
      }, 50);
    } else {
      setIsDrawerReady(false);
      // Reset to main view when drawer is closed
      setActiveSection('main');
    }
  }, [open]);

  // Apply filters
  const applyFilters = () => {
    // Build filters object
    const filters: SearchFilters = {};
    
    if (searchText) filters.search = searchText;
    if (selectedCategoryId) filters.category_id = selectedCategoryId;
    if (selectedSubCategoryId) filters.sub_category_id = selectedSubCategoryId;
    if (selectedBrandId) filters.brand_id = selectedBrandId;
    if (selectedStateId) filters.state_id = selectedStateId;
    if (selectedCityId) filters.city_id = selectedCityId;

    if (priceRange[0] > 0) filters.min_price = priceRange[0];
    if (priceRange[1] < 100000) filters.max_price = priceRange[1];
    if (listingType) filters.listing_type = listingType;
    if (condition) filters.condition = condition;
    if (sortBy) filters.sort_by = sortBy;

    
    // Add location if nearby ads is selected
    if (nearbyAds && locationData) {
      filters.lat = locationData.lat;
      filters.lon = locationData.lng;
      filters.radius = 20; // 20 km radius
    }
    
    // Close drawer and return filters
    setOpen(false);
    onFilterChange(filters);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setSelectedCategoryId(undefined);
    setSelectedSubCategoryId(undefined);
    setSelectedBrandId(undefined);
    setSelectedStateId(undefined);
    setSelectedCityId(undefined);
    setPriceRange([0, 100000]);
    setListingType(undefined);
    setCondition(undefined);
    setSortBy(undefined);
    setNearbyAds(false);
  };

  // Main menu sections rendering
  const renderMainMenu = () => (
    <div className="flex flex-col space-y-4 p-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن أي شيء..."
          className="pr-10"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      
      <Separator className="my-2 dark:border-dark-border" />
      
      {/* Main menu items */}
      <Button 
        variant="ghost" 
        className="flex items-center justify-between px-4 py-3 h-auto" 
        onClick={() => setActiveSection('price')}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
            <Wallet className="h-4 w-4 text-brand" />
          </div>
          <span>نطاق السعر</span>
        </div>
        {(priceRange[0] > 0 || priceRange[1] < 100000) && (
          <div className="flex items-center text-xs text-muted-foreground">
            {priceRange[0]}ر.س - {priceRange[1]}ر.س
            <ChevronRight className="h-4 w-4 mr-1" />
          </div>
        )}
        {!(priceRange[0] > 0 || priceRange[1] < 100000) && (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        className="flex items-center justify-between px-4 py-3 h-auto" 
        onClick={() => setActiveSection('category')}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
            <Layers className="h-4 w-4 text-brand" />
          </div>
          <span>التصنيف</span>
        </div>
        {selectedCategoryId && categories && (
          <div className="flex items-center text-xs text-muted-foreground">
            {categories.find(cat => cat.id === selectedCategoryId)?.name}
            <ChevronRight className="h-4 w-4 mr-1" />
          </div>
        )}
        {!selectedCategoryId && (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        className="flex items-center justify-between px-4 py-3 h-auto" 
        onClick={() => setActiveSection('brand')}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
            <Gem className="h-4 w-4 text-brand" />
          </div>
          <span>الماركة</span>
        </div>
        {selectedBrandId && brands && (
          <div className="flex items-center text-xs text-muted-foreground">
            {brands.find(b => b.id === selectedBrandId)?.name}
            <ChevronRight className="h-4 w-4 mr-1" />
          </div>
        )}
        {!selectedBrandId && (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        className="flex items-center justify-between px-4 py-3 h-auto" 
        onClick={() => setActiveSection('location')}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
            <MapPin className="h-4 w-4 text-brand" />
          </div>
          <span>الموقع</span>
        </div>
        {(selectedStateId || nearbyAds) && (
          <div className="flex items-center text-xs text-muted-foreground">
            {nearbyAds ? 'القريب مني' : states.find(s => s.id === selectedStateId)?.name}
            <ChevronRight className="h-4 w-4 mr-1" />
          </div>
        )}
        {!(selectedStateId || nearbyAds) && (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        className="flex items-center justify-between px-4 py-3 h-auto" 
        onClick={() => setActiveSection('other')}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
            <Settings2 className="h-4 w-4 text-brand" />
          </div>
          <span>خيارات إضافية</span>
        </div>
        {(listingType || condition) && (
          <div className="flex items-center text-xs text-muted-foreground">
            {condition === 'new' ? 'جديد' : condition === 'used' ? 'مستعمل' : ''}
            {listingType && condition ? ' • ' : ''}
            {listingType === 'sell' ? 'للبيع' : listingType === 'rent' ? 'للإيجار' : listingType === 'wanted' ? 'مطلوب' : ''}
            <ChevronRight className="h-4 w-4 mr-1" />
          </div>
        )}
        {!(listingType || condition) && (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        className="flex items-center justify-between px-4 py-3 h-auto" 
        onClick={() => setActiveSection('sort')}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
            <ArrowUpDown className="h-4 w-4 text-brand" />
          </div>
          <span>الترتيب</span>
        </div>
        {sortBy && (
          <div className="flex items-center text-xs text-muted-foreground">
            {sortBy === 'newest' ? 'الأحدث' : 
             sortBy === 'oldest' ? 'الأقدم' : 
             sortBy === 'price_asc' ? 'السعر: الأقل أولاً' : 
             sortBy === 'price_desc' ? 'السعر: الأعلى أولاً' : ''}
            <ChevronRight className="h-4 w-4 mr-1" />
          </div>
        )}
        {!sortBy && (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
  
  // Section renderers
  const renderPriceSection = () => (
    <div className="space-y-5 p-4 animate-in fade-in">
      <h3 className="text-lg font-bold">نطاق السعر</h3>
      <div className="mb-6">
        <Slider
          value={priceRange}
          max={100000}
          step={1000}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="my-10"
        />
      </div>
      <div className="flex justify-between mb-3">
        <div className="text-sm">{priceRange[0]} SYP</div>
        <div className="text-sm">{priceRange[1]} SYP</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-2 block">من</Label>
          <Input 
            type="number" 
            placeholder="من" 
            className="w-full" 
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
          />
        </div>
        <div>
          <Label className="mb-2 block">إلى</Label>
          <Input 
            type="number" 
            placeholder="إلى" 
            className="w-full" 
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
          />
        </div>
      </div>
    </div>
  );
  
  const renderCategorySection = () => (
    <div className="space-y-5 p-4 animate-in fade-in">
      <h3 className="text-lg font-bold">التصنيف</h3>
      {loadingCategories ? (
        <FilterSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {categories.slice(0, 9).map(category => (
              <div 
                key={category.id}
                className={`flex flex-col items-center p-2 rounded-lg text-center border ${
                  selectedCategoryId === category.id 
                    ? 'border-brand bg-brand/10' 
                    : 'border-border dark:border-dark-border'
                }`}
                onClick={() => {
                  setSelectedCategoryId(selectedCategoryId === category.id ? undefined : category.id);
                  setSelectedSubCategoryId(undefined);
                }}
              >
                <div className={`p-2 rounded-full ${
                  selectedCategoryId === category.id ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-dark-muted'
                }`}>
                  {/* Use the icon from CategoryIcon component */}
                  {(() => {
                    const iconName = category.icon || 'Car';
                    const Icon = iconMap[iconName] || Car;
                    return <Icon className="h-6 w-6" />;
                  })()}
                </div>
                <span className="text-xs mt-2 truncate w-full">
                  {category.name}
                </span>
                {selectedCategoryId === category.id && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-3 w-3 text-brand" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedCategoryId && subcategories.length > 0 && (
            <div className="mt-4">
              <Label className="mb-2 block">التصنيف الفرعي</Label>
              <Select 
                value={selectedSubCategoryId?.toString()} 
                onValueChange={(value) => setSelectedSubCategoryId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف الفرعي" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcat) => (
                    <SelectItem 
                      key={subcat.id} 
                      value={subcat.id?.toString() || ""}
                    >
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  const renderBrandSection = () => (
    <div className="space-y-5 p-4 animate-in fade-in">
      <h3 className="text-lg font-bold">الماركات</h3>
      {loadingBrands ? (
        <FilterSkeleton />
      ) : (
        <>
          <Select 
            value={selectedBrandId?.toString()} 
            onValueChange={(value) => setSelectedBrandId(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الماركة" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem 
                  key={brand.id} 
                  value={brand.id?.toString() || ""}
                >
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="grid grid-cols-3 gap-3 mt-3">
            {brands.slice(0, 9).map(brand => (
              <div 
                key={brand.id}
                className={`flex flex-col items-center p-2 rounded-lg text-center border ${
                  selectedBrandId === brand.id 
                    ? 'border-brand bg-brand/10' 
                    : 'border-border dark:border-dark-border'
                }`}
                onClick={() => setSelectedBrandId(selectedBrandId === brand.id ? undefined : brand.id)}
              >
                <div className="p-1 rounded-full">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <div className={`p-2 rounded-full ${
                      selectedBrandId === brand.id ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-dark-muted'
                    }`}>
                      <div className="h-4 w-4"></div>
                    </div>
                  )}
                </div>
                <span className="text-xs mt-1 truncate w-full">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
  
  const renderLocationSection = () => (
    <div className="space-y-5 p-4 animate-in fade-in">
      <h3 className="text-lg font-bold">الموقع</h3>
      {loadingStates || loadingCities ? (
        <FilterSkeleton />
      ) : (
        <>
          <div>
            <Label className="mb-2 block">المنطقة</Label>
            <Select 
              value={selectedStateId?.toString()} 
              onValueChange={(value) => {
                setSelectedStateId(value ? parseInt(value) : undefined);
                setSelectedCityId(undefined); // Reset city when state changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المنطقة" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem 
                    key={state.id} 
                    value={state.id?.toString() || ""}
                  >
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedStateId && stateCities.length > 0 && (
            <div className="mt-4">
              <Label className="mb-2 block">المنطقة</Label>
              <Select 
                value={selectedCityId?.toString()} 
                onValueChange={(value) => setSelectedCityId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  {stateCities.map((city) => (
                    <SelectItem 
                      key={city.id} 
                      value={city.id?.toString() || ""}
                    >
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="nearby-toggle" className="cursor-pointer">الإعلانات القريبة مني</Label>
            <Switch
              id="nearby-toggle"
              checked={nearbyAds}
              disabled={loadingLocation || !locationData}
              onCheckedChange={setNearbyAds}
            />
          </div>
          
          {loadingLocation && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              جاري تحديد موقعك...
            </div>
          )}
        </>
      )}
    </div>
  );
  
  const renderOtherSection = () => (
    <div className="space-y-5 p-4 animate-in fade-in">
      <h3 className="text-lg font-bold">خيارات إضافية</h3>
      
      <div>
        <Label className="mb-2 block">نوع الإعلان</Label>
        <Select 
          value={listingType || "all"} 
          onValueChange={(value: 'sell' | 'rent' | 'wanted' | 'all') => {
            setListingType(value === 'all' ? undefined : value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الإعلان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="sell">للبيع</SelectItem>
            <SelectItem value="rent">للإيجار</SelectItem>
            <SelectItem value="wanted">مطلوب</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4">
        <Label className="mb-2 block">الحالة</Label>
        <Select 
          value={condition || "all"} 
          onValueChange={(value: 'new' | 'used' | 'all') => {
            setCondition(value === 'all' ? undefined : value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر حالة المنتج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="used">مستعمل</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
  
  const renderSortSection = () => (
    <div className="space-y-5 p-4 animate-in fade-in">
      <h3 className="text-lg font-bold">الترتيب</h3>
      <div className="mt-4">
        <Select 
          value={sortBy || "default"} 
          onValueChange={(value: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'default') => {
            setSortBy(value === 'default' ? undefined : value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر طريقة الترتيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">الافتراضي</SelectItem>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="oldest">الأقدم</SelectItem>
            <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
            <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Helper to render back button for subsections
  const renderBackButton = () => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="absolute left-2 top-4 h-8 w-8 p-0 rounded-full"
      onClick={() => setActiveSection('main')}
    >
      <ArrowRight className="h-4 w-4" />
    </Button>
  );

  // Render different section based on active tab
  const renderSectionContent = () => {
    if (!isDrawerReady) return null;
    
    switch (activeSection) {
      case 'main':
        return renderMainMenu();
      case 'price':
        return (
          <>
            {renderBackButton()}
            {renderPriceSection()}
          </>
        );
      case 'category':
        return (
          <>
            {renderBackButton()}
            {renderCategorySection()}
          </>
        );
      case 'brand':
        return (
          <>
            {renderBackButton()}
            {renderBrandSection()}
          </>
        );
      case 'location':
        return (
          <>
            {renderBackButton()}
            {renderLocationSection()}
          </>
        );
      case 'other':
        return (
          <>
            {renderBackButton()}
            {renderOtherSection()}
          </>
        );
      case 'sort':
        return (
          <>
            {renderBackButton()}
            {renderSortSection()}
          </>
        );
      default:
        return renderMainMenu();
    }
  };

  // Dynamic drawer title
  const getDrawerTitle = () => {
    switch (activeSection) {
      case 'main': return 'تصفية النتائج';
      case 'price': return 'نطاق السعر';
      case 'category': return 'التصنيف';
      case 'brand': return 'الماركة';
      case 'location': return 'الموقع';
      case 'other': return 'خيارات إضافية';
      case 'sort': return 'الترتيب';
      default: return 'تصفية النتائج';
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 flex items-center gap-1 justify-between bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground truncate">{searchText || 'بحث...'}</span>
          <div className="flex items-center">
            {filtersCount > 0 && (
              <div className="bg-brand text-white text-xs w-5 h-5 rounded-full flex items-center justify-center mr-1">
                {filtersCount}
              </div>
            )}
            <Filter className="w-4 h-4 text-brand" />
          </div>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh] flex flex-col dark:bg-dark-background">
        <DrawerHeader className="px-4 pt-4 pb-2 relative">
          <DrawerTitle className={`text-xl font-bold text-center ${activeSection !== 'main' ? 'mx-8' : ''}`}>
            {getDrawerTitle()}
          </DrawerTitle>
          
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-2 top-4 h-8 w-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {renderSectionContent()}
        </div>

        <DrawerFooter className="border-t border-border dark:border-dark-border p-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 dark:border-dark-border dark:hover:bg-dark-muted"
              onClick={resetFilters}
            >
              إعادة ضبط
            </Button>
            <Button 
              className="flex-1"
              onClick={applyFilters}
            >
              تطبيق الفلاتر{filtersCount > 0 ? ` (${filtersCount})` : ''}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Add imports for icons that weren't imported above
import {  Layers, Settings2, ArrowUpDown, Wallet } from 'lucide-react';
import { 
  Car, Home, Smartphone, Mouse, Briefcase, Wrench, Shirt, Gamepad, 
  Gem, ShoppingBag, Utensils, Laptop, BookOpen, Baby, Bike, Camera, 
  FileText, Headphones, Gift, Train, Sofa, MonitorSmartphone, Dog, Users, Building, 
  Paintbrush, Glasses, ShoppingBasket
} from 'lucide-react';
// Import the iconMap from CategoryIcon to avoid duplicating code
const iconMap: Record<string, React.ComponentType<any>> = {
  'Car': Car,
  'Home': Home,
  'Building': Building,
  'Smartphone': Smartphone,
  'MonitorSmartphone': MonitorSmartphone,
  'Mouse': Mouse,
  'Briefcase': Briefcase,
  'Wrench': Wrench,
  'Shirt': Shirt,
  'Gamepad': Gamepad,
  'Gem': Gem,
  'ShoppingBag': ShoppingBag,
  'Utensils': Utensils,
  'Laptop': Laptop,
  'BookOpen': BookOpen,
  'Baby': Baby,
  'Bike': Bike,
  'Camera': Camera,
  'FileText': FileText,
  'Headphones': Headphones,
  'Gift': Gift,
  'Train': Train,
  'Sofa': Sofa,
  'Dog': Dog,
  'Users': Users,
  'Paintbrush': Paintbrush,
  'Glasses': Glasses,
  'ShoppingBasket': ShoppingBasket,
};
