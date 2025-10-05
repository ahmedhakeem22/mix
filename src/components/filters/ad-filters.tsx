import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X, DollarSign, Star, Settings, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useStates, useAllCities } from '@/hooks/use-api';
import { useCityDistricts } from '@/hooks/use-districts';
import { SearchFilters } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { requestUserLocation } from '@/utils/location';
import { useFilterStore } from '@/store/filter-store';

interface AdFiltersProps {
  layout: 'sidebar' | 'horizontal';
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  currentLayout?: 'grid' | 'list';
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters: SearchFilters;
}

export function AdFilters({
  layout,
  onLayoutChange,
  currentLayout,
  onFilterChange,
  initialFilters
}: AdFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(initialFilters);
  const { resetFilters: resetGlobalFilters } = useFilterStore();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const { data: states = [] } = useStates();
  const { data: cities = [] } = useAllCities();
  const { data: districts = [] } = useCityDistricts(localFilters.city_id);

  const stateCities = localFilters.state_id ? cities.filter(city => city.state_id === localFilters.state_id) : [];

  const handleFilterUpdate = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value,
    }));
  };

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled) {
      setIsLoadingLocation(true);
      try {
        const location = await requestUserLocation();
        setLocalFilters(prev => ({ ...prev, lat: location.lat, lon: location.lng, radius: prev.radius || 5 }));
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      setLocalFilters(prev => {
        const { lat, lon, radius, ...rest } = prev;
        return rest;
      });
    }
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetLocalAndGlobalFilters = () => {
    setLocalFilters({});
    resetGlobalFilters();
  };
  
  const activeFiltersCount = Object.values(localFilters).filter(value => value !== undefined && value !== '').length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3"><DollarSign className="h-4 w-4 text-brand" /><Label className="text-sm font-medium">نطاق السعر</Label></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">من</Label>
            <Input 
              type="number" 
              placeholder="0" 
              defaultValue={localFilters.min_price || ''}
              onBlur={e => handleFilterUpdate('min_price', e.target.value === '' ? undefined : e.target.value)}
              className="text-right" 
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">إلى</Label>
            <Input 
              type="number" 
              placeholder="∞" 
              defaultValue={localFilters.max_price || ''}
              onBlur={e => handleFilterUpdate('max_price', e.target.value === '' ? undefined : e.target.value)}
              className="text-right" 
            />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" /><Label className="text-sm font-medium">المنطقة والمدينة</Label></div>
        <Select value={localFilters.state_id?.toString() || 'all'} onValueChange={value => { handleFilterUpdate('state_id', value === 'all' ? undefined : parseInt(value)); handleFilterUpdate('city_id', undefined); handleFilterUpdate('district_id', undefined); }}>
          <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المناطق</SelectItem>
            {states.map(state => (<SelectItem key={state.id} value={state.id.toString()}>{state.name}</SelectItem>))}
          </SelectContent>
        </Select>
        {localFilters.state_id && stateCities.length > 0 && (
          <Select value={localFilters.city_id?.toString() || 'all'} onValueChange={value => { handleFilterUpdate('city_id', value === 'all' ? undefined : parseInt(value)); handleFilterUpdate('district_id', undefined); }}>
            <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {stateCities.map(city => (<SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
        {localFilters.city_id && districts.length > 0 && (
          <Select value={localFilters.district_id?.toString() || 'all'} onValueChange={value => handleFilterUpdate('district_id', value === 'all' ? undefined : parseInt(value))}>
            <SelectTrigger><SelectValue placeholder="اختر الحي" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأحياء</SelectItem>
              {districts.map(district => (<SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" /><Label className="text-sm font-medium">القريب مني</Label></div>
          <Switch checked={!!localFilters.radius} onCheckedChange={handleLocationToggle} disabled={isLoadingLocation} />
        </div>
        {!!localFilters.radius && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">المسافة (كلم)</Label>
            <Select value={localFilters.radius?.toString() || '5'} onValueChange={value => handleFilterUpdate('radius', parseInt(value))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 كلم</SelectItem>
                <SelectItem value="10">10 كلم</SelectItem>
                <SelectItem value="20">20 كلم</SelectItem>
                <SelectItem value="50">50 كلم</SelectItem>
                <SelectItem value="80">80 كلم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {isLoadingLocation && <p className="text-xs text-muted-foreground">جاري تحديد الموقع...</p>}
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Star className="h-4 w-4 text-brand" /><Label className="text-sm font-medium">الإعلانات المميزة فقط</Label></div>
        <Switch checked={!!localFilters.featured} onCheckedChange={checked => handleFilterUpdate('featured', checked || undefined)} />
      </div>
      <Separator />
      <div>
        <div className="flex items-center gap-2 mb-3"><CheckCircle className="h-4 w-4 text-brand" /><Label className="text-sm font-medium">حالة السلعة</Label></div>
        <div className="grid grid-cols-3 gap-2">
          {[{ value: '', label: 'الكل' }, { value: 'new', label: 'جديد' }, { value: 'used', label: 'مستخدم' }].map(item => (
            <Button key={item.value} variant={localFilters.condition === item.value || (localFilters.condition === undefined && item.value === '') ? "default" : "outline"} size="sm" onClick={() => handleFilterUpdate('condition', item.value)} className="text-xs">{item.label}</Button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center gap-2 mb-3"><Settings className="h-4 w-4 text-brand" /><Label className="text-sm font-medium">نوع الإعلان</Label></div>
        <div className="grid grid-cols-2 gap-2">
          {[{ value: '', label: 'الكل' }, { value: 'sell', label: 'بيع' }, { value: 'wanted', label: 'مطلوب' }, { value: 'rent', label: 'إيجار' }, { value: 'exchange', label: 'مقايضة' }, { value: 'service', label: 'وظائف' }].map(item => (
            <Button key={item.value} variant={localFilters.listing_type === item.value || (localFilters.listing_type === undefined && item.value === '') ? "default" : "outline"} size="sm" onClick={() => handleFilterUpdate('listing_type', item.value)} className="text-xs">{item.label}</Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium mb-3 block">ترتيب الإعلانات من</Label>
        <Select value={localFilters.sort || 'newest'} onValueChange={value => handleFilterUpdate('sort', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="oldest">الأقدم</SelectItem>
            <SelectItem value="price_asc">السعر: الأقل للأعلى</SelectItem>
            <SelectItem value="price_desc">السعر: الأعلى للأقل</SelectItem>
            <SelectItem value="popular">الأكثر مشاهدة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={resetLocalAndGlobalFilters} className="flex-1">إعادة تعيين</Button>
        <Button onClick={applyFilters} className="flex-1">تطبيق الفلاتر</Button>
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 h-9">
            <Filter className="w-4 h-4" /><span>فلترة</span>{activeFiltersCount > 0 && (<Badge variant="destructive" className="text-xs">{activeFiltersCount}</Badge>)}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-right">خيارات التصفية</SheetTitle>
              {activeFiltersCount > 0 && (<Button variant="ghost" onClick={resetLocalAndGlobalFilters} size="sm"><X className="w-4 h-4 mr-1" />مسح الكل</Button>)}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4"><FilterContent /></div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="ابحث عن أي شيء..." value={localFilters.search || ''} onChange={e => handleFilterUpdate('search', e.target.value)} className="pr-10" />
        </div>
        <Button onClick={applyFilters}><Search className="w-4 h-4" /></Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <FilterContent />
      </div>
    </div>
  );
}