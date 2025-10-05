
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  Grid2X2, 
  List, 
  MapPin, 
  Star, 
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  Grid3X3,
  Package,
  Building2,
  Clock
} from 'lucide-react';
import { SearchFilters } from '@/types';
import { useCategories, useBrands } from '@/hooks/use-api';
import { useStates, useCities } from '@/hooks/use-api.ts';
import { cn } from '@/lib/utils';

interface EnhancedAdFiltersProps {
  layout: 'sidebar' | 'horizontal';
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  currentLayout?: 'grid' | 'list';
  onFilterChange: (filters: SearchFilters) => void;
  selectedCategory?: any;
}

// Mock data for cities/regions until API is fully integrated
const mockRegions = [
  { id: 1, name: 'دمشق', state_id: 1 },
  { id: 2, name: 'حلب', state_id: 2 },
  { id: 3, name: 'حمص', state_id: 3 },
  { id: 4, name: 'حماة', state_id: 4 },
  { id: 5, name: 'اللاذقية', state_id: 5 },
  { id: 6, name: 'طرطوس', state_id: 6 },
  { id: 7, name: 'درعا', state_id: 7 },
  { id: 8, name: 'السويداء', state_id: 8 },
  { id: 9, name: 'القنيطرة', state_id: 9 },
  { id: 10, name: 'إدلب', state_id: 10 },
  { id: 11, name: 'الرقة', state_id: 11 },
  { id: 12, name: 'دير الزور', state_id: 12 },
  { id: 13, name: 'الحسكة', state_id: 13 },
  { id: 14, name: 'ريف دمشق', state_id: 1 }
];

const mockDistricts = [
  // دمشق
  { id: 1, name: 'المزة', city_id: 1 },
  { id: 2, name: 'الشعلان', city_id: 1 },
  { id: 3, name: 'أبو رمانة', city_id: 1 },
  { id: 4, name: 'القصاع', city_id: 1 },
  { id: 5, name: 'المهاجرين', city_id: 1 },
  { id: 6, name: 'كفر سوسة', city_id: 1 },
  // حلب
  { id: 7, name: 'العزيزية', city_id: 2 },
  { id: 8, name: 'الفردوس', city_id: 2 },
  { id: 9, name: 'السليمانية', city_id: 2 },
  { id: 10, name: 'الميدان', city_id: 2 },
];

export function EnhancedAdFilters({ 
  layout, 
  onLayoutChange, 
  currentLayout = 'grid', 
  onFilterChange,
  selectedCategory 
}: EnhancedAdFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [categoryViewMode, setCategoryViewMode] = useState<'grid' | 'list'>('grid');
  const [brandViewMode, setBrandViewMode] = useState<'grid' | 'list'>('grid');
  const [openSections, setOpenSections] = useState({
    categories: true,
    subcategories: true,
    brands: true,
    price: true,
    location: true,
    features: true,
    condition: true,
    timing: false
  });

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: states } = useStates();
  const { data: cities } = useCities(filters.state_id);

  const getCategoryImage = (category: any) => {
    if (category.image_url) return category.image_url;
    if (category.image) return category.image;
    
    const defaultImages: Record<string, string> = {
      'سيارات': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=200&fit=crop',
      'عقارات': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&h=200&fit=crop',
      'إلكترونيات': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
      'أثاث': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop',
      'أزياء': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
      'وظائف': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      'خدمات': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop',
      'رياضة': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    };
    
    for (const [key, image] of Object.entries(defaultImages)) {
      if (category.name.includes(key)) return image;
    }
    
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=200&fit=crop';
  };

  const getBrandImage = (brand: any) => {
    if (brand.logo_url) return brand.logo_url;
    if (brand.image) return brand.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=120&background=f8fafc&color=1e293b&font-size=0.4`;
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 100000]);
    onFilterChange({});
  };

  const selectedCategoryObj = categories?.find(cat => cat.id === filters.category_id);
  const displayedSubcategories = selectedCategoryObj?.subcategories || [];

  if (layout === 'horizontal') {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border p-6 mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث في الإعلانات..."
            className="pr-12 h-12 rounded-xl border-2 focus:border-brand"
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Select value={filters.category_id?.toString() || 'all'} onValueChange={(value) => updateFilters({ category_id: value === 'all' ? undefined : parseInt(value) })}>
            <SelectTrigger className="w-40 h-10 rounded-lg">
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التصنيفات</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.sort || 'default'} 
            onValueChange={(value) => updateFilters({ 
              sort: value === 'default' ? undefined : value as 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'created_at' | 'updated_at'
            })}
          >
            <SelectTrigger className="w-32 h-10 rounded-lg">
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الافتراضي</SelectItem>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
              <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
            </SelectContent>
          </Select>

          {onLayoutChange && (
            <div className="flex border border-border rounded-lg overflow-hidden bg-background">
              <Button 
                variant={currentLayout === 'grid' ? "default" : "ghost"} 
                size="sm"
                onClick={() => onLayoutChange('grid')}
                className="rounded-none h-10"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={currentLayout === 'list' ? "default" : "ghost"}
                size="sm" 
                onClick={() => onLayoutChange('list')}
                className="rounded-none h-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={clearFilters} className="h-10 rounded-lg">
            <X className="h-4 w-4 ml-1" />
            مسح الفلاتر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 space-y-4"> {/* Made sidebar wider */}
      {/* Search & Quick Actions */}
      <Card className="shadow-lg border-2 border-brand/20 bg-gradient-to-br from-white to-brand/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-brand" />
              فلترة متقدمة
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث..."
                className="pr-10 rounded-lg border-2 focus:border-brand"
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="w-full rounded-lg border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <X className="h-4 w-4 ml-1" />
              مسح جميع الفلاتر
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Categories */}
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <Card className="shadow-lg border border-border">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-brand" />
                  التصنيفات
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <Button 
                      variant={categoryViewMode === 'grid' ? "default" : "ghost"} 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryViewMode('grid');
                      }}
                      className="h-6 w-6 p-0 rounded-none"
                    >
                      <Grid3X3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant={categoryViewMode === 'list' ? "default" : "ghost"}
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryViewMode('list');
                      }}
                      className="h-6 w-6 p-0 rounded-none"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.categories && "rotate-180")} />
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent>
              <ScrollArea className="h-96"> {/* Increased height for larger images */}
                {categoryViewMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-3"> {/* 2 columns for larger images */}
                    {categories?.map((category) => (
                      <div 
                        key={category.id}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 cursor-pointer transition-all hover:bg-muted/50 rounded-xl",
                          filters.category_id === category.id && "bg-brand/10 border-2 border-brand/30"
                        )}
                        onClick={() => updateFilters({ 
                          category_id: filters.category_id === category.id ? undefined : category.id 
                        })}
                      >
                        <div className="w-24 h-20 overflow-hidden flex-shrink-0 rounded-xl"> {/* Larger image size */}
                          <img
                            src={getCategoryImage(category)}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=200&fit=crop';
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-xs truncate w-full leading-tight">{category.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {category.count || Math.floor(Math.random() * 500 + 50)} إعلان
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories?.map((category) => (
                      <div 
                        key={category.id}
                        className={cn(
                          "flex items-center gap-3 p-3 cursor-pointer transition-all hover:bg-muted/50 rounded-lg",
                          filters.category_id === category.id && "bg-brand/10"
                        )}
                        onClick={() => updateFilters({ 
                          category_id: filters.category_id === category.id ? undefined : category.id 
                        })}
                      >
                        <div className="w-20 h-16 overflow-hidden flex-shrink-0 rounded-lg">
                          <img
                            src={getCategoryImage(category)}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{category.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.count || Math.floor(Math.random() * 500 + 50)} إعلان
                          </div>
                        </div>
                        <Checkbox 
                          checked={filters.category_id === category.id}
                          onChange={() => {}}
                          className="pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Brands */}
      <Collapsible open={openSections.brands} onOpenChange={() => toggleSection('brands')}>
        <Card className="shadow-lg border border-border">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand" />
                  العلامات التجارية
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <Button 
                      variant={brandViewMode === 'grid' ? "default" : "ghost"} 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBrandViewMode('grid');
                      }}
                      className="h-6 w-6 p-0 rounded-none"
                    >
                      <Grid3X3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant={brandViewMode === 'list' ? "default" : "ghost"}
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setBrandViewMode('list');
                      }}
                      className="h-6 w-6 p-0 rounded-none"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.brands && "rotate-180")} />
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent>
              <ScrollArea className="h-96">
                {brandViewMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {brands?.slice(0, 24).map((brand) => (
                      <div 
                        key={brand.id}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 cursor-pointer transition-all hover:bg-muted/50 rounded-xl",
                          filters.brand_id === brand.id && "bg-brand/10 border-2 border-brand/30"
                        )}
                        onClick={() => updateFilters({ 
                          brand_id: filters.brand_id === brand.id ? undefined : brand.id 
                        })}
                      >
                        <div className="w-20 h-20 overflow-hidden flex-shrink-0 bg-gray-50 rounded-xl"> {/* Larger brand image */}
                          <img
                            src={getBrandImage(brand)}
                            alt={brand.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs text-center font-medium truncate w-full leading-tight">
                          {brand.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {brands?.slice(0, 20).map((brand) => (
                      <div 
                        key={brand.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                          filters.brand_id === brand.id && "bg-brand/10"
                        )}
                        onClick={() => updateFilters({ 
                          brand_id: filters.brand_id === brand.id ? undefined : brand.id 
                        })}
                      >
                        <div className="w-16 h-16 overflow-hidden flex-shrink-0 bg-gray-50 rounded-lg">
                          <img
                            src={getBrandImage(brand)}
                            alt={brand.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{brand.name}</div>
                        </div>
                        <Checkbox 
                          checked={filters.brand_id === brand.id}
                          onChange={() => {}}
                          className="pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Location - Enhanced with precise coordinates */}
      <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
        <Card className="shadow-lg border border-border">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  الموقع المحدد
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.location && "rotate-180")} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">المحافظة</Label>
                  <Select
                    value={filters.state_id?.toString() || 'all'}
                    onValueChange={(value) => updateFilters({ 
                      state_id: value === 'all' ? undefined : parseInt(value),
                      city_id: undefined // Reset city when state changes
                    })}
                  >
                    <SelectTrigger className="rounded-lg border-2 focus:border-brand">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل المحافظات</SelectItem>
                      {states?.map((state) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">المدينة/المنطقة</Label>
                  <Select
                    value={filters.city_id?.toString() || 'all'}
                    onValueChange={(value) => updateFilters({ 
                      city_id: value === 'all' ? undefined : parseInt(value)
                    })}
                  >
                    <SelectTrigger className="rounded-lg border-2 focus:border-brand">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل المدن</SelectItem>
                      {(cities || mockRegions)?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">الحي/المنطقة الفرعية</Label>
                  <Select
                    value={filters.district_id?.toString() || 'all'}
                    onValueChange={(value) => updateFilters({ 
                      district_id: value === 'all' ? undefined : parseInt(value)
                    })}
                  >
                    <SelectTrigger className="rounded-lg border-2 focus:border-brand">
                      <SelectValue placeholder="اختر الحي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الأحياء</SelectItem>
                      {mockDistricts
                        .filter(district => !filters.city_id || district.city_id === filters.city_id)
                        .map((district) => (
                          <SelectItem key={district.id} value={district.id.toString()}>
                            {district.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">خط الطول</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={filters.lat || ''}
                      onChange={(e) => updateFilters({ 
                        lat: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="33.5138"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">خط العرض</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={filters.lon || ''}
                      onChange={(e) => updateFilters({ 
                        lon: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="36.2765"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">نصف القطر (كم)</Label>
                  <Input
                    type="number"
                    value={filters.radius || ''}
                    onChange={(e) => updateFilters({ 
                      radius: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="10"
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <Card className="shadow-lg border border-border">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-brand" />
                  نطاق السعر
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.price && "rotate-180")} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{priceRange[0].toLocaleString()} ل.س</span>
                <span>{priceRange[1].toLocaleString()} ل.س</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">الحد الأدنى</Label>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPriceRange([value, priceRange[1]]);
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">الحد الأعلى</Label>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 100000;
                      setPriceRange([priceRange[0], value]);
                    }}
                    className="h-8"
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => updateFilters({ min_price: priceRange[0], max_price: priceRange[1] })}
                className="w-full rounded-lg bg-brand hover:bg-brand-dark"
              >
                تطبيق نطاق السعر
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Condition & Features */}
      <Collapsible open={openSections.condition} onOpenChange={() => toggleSection('condition')}>
        <Card className="shadow-lg border border-border">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-brand" />
                  الحالة والمميزات
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.condition && "rotate-180")} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">حالة المنتج</Label>
                <Select
                  value={filters.condition || 'all'}
                  onValueChange={(value) => updateFilters({ 
                    condition: value === 'all' ? undefined : value as any
                  })}
                >
                  <SelectTrigger className="rounded-lg border-2 focus:border-brand">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="used">مستعمل</SelectItem>
                    <SelectItem value="refurbished">مجدد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">نوع الإعلان</Label>
                <Select
                  value={filters.listing_type || 'all'}
                  onValueChange={(value) => updateFilters({ 
                    listing_type: value === 'all' ? undefined : value as any
                  })}
                >
                  <SelectTrigger className="rounded-lg border-2 focus:border-brand">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="sell">للبيع</SelectItem>
                    <SelectItem value="rent">للإيجار</SelectItem>
                    <SelectItem value="wanted">مطلوب</SelectItem>
                    <SelectItem value="exchange">مقايضة</SelectItem>
                    <SelectItem value="service">خدمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="featured"
                    checked={!!filters.featured}
                    onCheckedChange={(checked) => updateFilters({ featured: checked === true ? true : undefined })}
                  />
                  <Label htmlFor="featured" className="text-sm">الإعلانات المميزة فقط</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="verified"
                    checked={!!filters.verified_user}
                    onCheckedChange={(checked) => updateFilters({ verified_user: checked === true ? true : undefined })}
                  />
                  <Label htmlFor="verified" className="text-sm">مستخدمين موثقين فقط</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="with_images"
                    checked={!!filters.with_images}
                    onCheckedChange={(checked) => updateFilters({ with_images: checked === true ? true : undefined })}
                  />
                  <Label htmlFor="with_images" className="text-sm">مع صور فقط</Label>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Layout Controls */}
      {onLayoutChange && (
        <Card className="shadow-lg border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Grid2X2 className="h-4 w-4 text-brand" />
              نوع العرض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex border border-border rounded-lg overflow-hidden bg-background">
              <Button 
                variant={currentLayout === 'grid' ? "default" : "ghost"} 
                size="sm"
                onClick={() => onLayoutChange('grid')}
                className="flex-1 rounded-none"
              >
                <Grid2X2 className="h-4 w-4 ml-1" />
                شبكة
              </Button>
              <Button 
                variant={currentLayout === 'list' ? "default" : "ghost"}
                size="sm" 
                onClick={() => onLayoutChange('list')}
                className="flex-1 rounded-none"
              >
                <List className="h-4 w-4 ml-1" />
                قائمة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
