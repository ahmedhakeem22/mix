import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, X, MapPin, DollarSign, Calendar, Star, Navigation } from 'lucide-react';
import { SearchFilters } from '@/types';
import { useStates, useCities } from '@/hooks/use-api.ts';
import { useCityDistricts } from '@/hooks/use-districts';
import { useFilterStore } from '@/store/filter-store';

interface MobileFilterSheetProps {
  onFilterChange: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
  triggerButton?: React.ReactNode;
}

export function MobileFilterSheet({
  onFilterChange,
  currentFilters = {},
  triggerButton
}: MobileFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);
  const { resetFilters: resetGlobalFilters } = useFilterStore();
  
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, isOpen]);

  const { data: states } = useStates();
  const { data: cities } = useCities(filters.state_id);
  const { data: districts } = useCityDistricts(filters.city_id);

  const handleFilterUpdate = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value
    }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetLocalAndGlobalFilters = () => {
    setFilters({});
    resetGlobalFilters();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (value === undefined || value === null || value === '') return false;
    // Don't count default/all values as active filters
    if (value === 'all' || value === 'default') return false;
    // Don't count page and per_page as filters
    if (key === 'page' || key === 'per_page') return false;
    return true;
  }).length;

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="relative flex items-center gap-2 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-brand dark:hover:border-brand transition-colors">
      <Filter className="w-4 h-4 text-brand" />
      <span className="text-sm font-medium">فلترة</span>
      {activeFiltersCount > 0 && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-0 bg-white dark:bg-dark-background p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-right">خيارات التصفية</SheetTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetLocalAndGlobalFilters} className="text-red-500 hover:text-red-600">
                  <X className="w-4 h-4 ml-1" />
                  مسح الكل
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand" /><Label className="text-sm font-medium">المحافظة</Label></div>
              <Select value={filters.state_id?.toString() || 'all'} onValueChange={value => { const stateId = value === 'all' ? undefined : parseInt(value); handleFilterUpdate('state_id', stateId); if (stateId !== filters.state_id) { handleFilterUpdate('city_id', undefined); handleFilterUpdate('district_id', undefined); } }}>
                <SelectTrigger className="text-right"><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المحافظات</SelectItem>
                  {states?.map(state => (<SelectItem key={state.id} value={state.id.toString()}>{state.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand" /><Label className="text-sm font-medium">المنطقة</Label></div>
              <Select value={filters.city_id?.toString() || 'all'} onValueChange={value => { const cityId = value === 'all' ? undefined : parseInt(value); handleFilterUpdate('city_id', cityId); if (cityId !== filters.city_id) { handleFilterUpdate('district_id', undefined); } }} disabled={!filters.state_id}>
                <SelectTrigger className="text-right"><SelectValue placeholder={filters.state_id ? "اختر المنطقة" : "اختر المحافظة أولاً"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {cities?.map(city => (<SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand" /><Label className="text-sm font-medium">الحي</Label></div>
              <Select value={filters.district_id?.toString() || 'all'} onValueChange={value => handleFilterUpdate('district_id', value === 'all' ? undefined : parseInt(value))} disabled={!filters.city_id}>
                <SelectTrigger className="text-right"><SelectValue placeholder={filters.city_id ? "اختر الحي" : "اختر المنطقة أولاً"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأحياء</SelectItem>
                  {districts?.map(district => (<SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-sm font-medium">البحث حسب الموقع</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-brand" /><span className="text-sm">تفعيل البحث بالموقع</span></div>
                <Switch checked={!!filters.radius} onCheckedChange={checked => { if (checked) { handleFilterUpdate('radius', 10); } else { handleFilterUpdate('radius', undefined); handleFilterUpdate('lat', undefined); handleFilterUpdate('lon', undefined); } }} />
              </div>
              {filters.radius && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">نطاق البحث</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ value: 5, label: '5 كم' }, { value: 10, label: '10 كم' }, { value: 25, label: '25 كم' }, { value: 50, label: '50 كم' }].map(range => (<Button key={range.value} variant={filters.radius === range.value ? "default" : "outline"} size="sm" onClick={() => handleFilterUpdate('radius', range.value)} className="text-sm">{range.label}</Button>))}
                  </div>
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-brand" /><Label className="text-sm font-medium">نطاق السعر</Label></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label className="text-xs text-muted-foreground">الحد الأدنى</Label><Input type="number" placeholder="0" value={filters.min_price || ''} onChange={(e) => handleFilterUpdate('min_price', e.target.value ? parseInt(e.target.value) : undefined)} className="text-right" /></div>
                <div className="space-y-2"><Label className="text-xs text-muted-foreground">الحد الأقصى</Label><Input type="number" placeholder="100000" value={filters.max_price || ''} onChange={(e) => handleFilterUpdate('max_price', e.target.value ? parseInt(e.target.value) : undefined)} className="text-right" /></div>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">حالة المنتج</Label>
              <div className="grid grid-cols-3 gap-2">
                {[{ value: '', label: 'الكل' }, { value: 'new', label: 'جديد' }, { value: 'used', label: 'مستعمل' }].map(condition => (<Button key={condition.value} variant={filters.condition === condition.value || (!filters.condition && condition.value==='') ? "default" : "outline"} size="sm" onClick={() => handleFilterUpdate('condition', condition.value || undefined)} className="text-sm">{condition.label}</Button>))}
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">نوع الإعلان</Label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: '', label: 'الكل' }, { value: 'sell', label: 'للبيع' }, { value: 'rent', label: 'للإيجار' }, { value: 'service', label: 'خدمة' }, { value: 'job', label: 'وظائف' }].map(type => (<Button key={type.value} variant={filters.listing_type === type.value  || (!filters.listing_type && type.value==='')? "default" : "outline"} size="sm" onClick={() => handleFilterUpdate('listing_type', type.value || undefined)} className="text-sm">{type.label}</Button>))}
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label className="text-sm font-medium">خيارات خاصة</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-brand" /><span className="text-sm">الإعلانات المميزة فقط</span></div>
                <Switch checked={filters.featured || false} onCheckedChange={checked => handleFilterUpdate('featured', checked || undefined)} />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand" /><Label className="text-sm font-medium">ترتيب النتائج</Label></div>
              <Select value={filters.sort || 'default'} onValueChange={value => handleFilterUpdate('sort', value === 'default' ? undefined : value)}>
                <SelectTrigger className="text-right"><SelectValue placeholder="اختر طريقة الترتيب" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">افتراضي</SelectItem>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="popular">الأكثر مشاهدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-6 pt-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={resetLocalAndGlobalFilters} className="text-sm">إعادة تعيين</Button>
              <Button onClick={applyFilters} className="text-sm bg-brand hover:bg-brand/90">تطبيق الفلاتر ({activeFiltersCount})</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}