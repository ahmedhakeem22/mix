
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/hooks/use-api';
import { SearchFilters } from '@/types';
import { MapPin, DollarSign, Package, Star, Building, Calendar } from 'lucide-react';

interface AdvancedFiltersProps {
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  currentFilters: SearchFilters;
}

export function AdvancedFilters({ onFilterChange, currentFilters }: AdvancedFiltersProps) {
  const { data: categories } = useCategories();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.min_price || 0,
    currentFilters.max_price || 100000
  ]);

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    onFilterChange({
      min_price: values[0] || undefined,
      max_price: values[1] || undefined,
    });
  };

  const cities = [
    { id: 1, name: 'الرياض' },
    { id: 2, name: 'جدة' },
    { id: 3, name: 'الدمام' },
    { id: 4, name: 'مكة المكرمة' },
    { id: 5, name: 'المدينة المنورة' },
  ];

  const states = [
    { id: 1, name: 'منطقة الرياض' },
    { id: 2, name: 'منطقة مكة المكرمة' },
    { id: 3, name: 'المنطقة الشرقية' },
    { id: 4, name: 'منطقة المدينة المنورة' },
  ];

  const brands = [
    { id: 1, name: 'تويوتا' },
    { id: 2, name: 'نيسان' },
    { id: 3, name: 'هوندا' },
    { id: 4, name: 'مرسيدس' },
    { id: 5, name: 'بي ام دابليو' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Package className="w-4 h-4" />
            التصنيف
          </Label>
          <Select
            value={currentFilters.category_id?.toString() || 'all'}
            onValueChange={(value) => 
              onFilterChange({ 
                category_id: value === 'all' ? undefined : parseInt(value)
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            المنطقة
          </Label>
          <Select
            value={currentFilters.city_id?.toString() || 'all'}
            onValueChange={(value) => 
              onFilterChange({ 
                city_id: value === 'all' ? undefined : parseInt(value)
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المنطقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المناطق</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building className="w-4 h-4" />
            المنطقة
          </Label>
          <Select
            value={currentFilters.state_id?.toString() || 'all'}
            onValueChange={(value) => 
              onFilterChange({ 
                state_id: value === 'all' ? undefined : parseInt(value)
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المنطقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المناطق</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Star className="w-4 h-4" />
            الماركة
          </Label>
          <Select
            value={currentFilters.brand_id?.toString() || 'all'}
            onValueChange={(value) => 
              onFilterChange({ 
                brand_id: value === 'all' ? undefined : parseInt(value)
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الماركة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الماركات</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">حالة المنتج</Label>
          <Select
            value={currentFilters.condition || currentFilters.product_condition || 'all'}
            onValueChange={(value) => 
              onFilterChange({ 
                condition: value === 'all' ? undefined : value as any,
                product_condition: value === 'all' ? undefined : value as any
              })
            }
          >
            <SelectTrigger>
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

        {/* Listing Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">نوع الإعلان</Label>
          <Select
            value={currentFilters.listing_type || 'all'}
            onValueChange={(value) => 
              onFilterChange({ 
                listing_type: value === 'all' ? undefined : value as any
              })
            }
          >
            <SelectTrigger>
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
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="w-4 h-4" />
          نطاق الأسعار
        </Label>
        <div className="px-3">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={100000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{priceRange[0].toLocaleString()} SYP</span>
            <span>{priceRange[1].toLocaleString()} SYP</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">الحد الأدنى</Label>
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handlePriceRangeChange([value, priceRange[1]]);
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
                handlePriceRangeChange([priceRange[0], value]);
              }}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Location-based Search */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="w-4 h-4" />
          البحث الجغرافي
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">خط الطول</Label>
            <Input
              type="number"
              step="0.000001"
              value={currentFilters.lat || ''}
              onChange={(e) => 
                onFilterChange({ 
                  lat: e.target.value ? parseFloat(e.target.value) : undefined 
                })
              }
              placeholder="24.7136"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">خط العرض</Label>
            <Input
              type="number"
              step="0.000001"
              value={currentFilters.lon || ''}
              onChange={(e) => 
                onFilterChange({ 
                  lon: e.target.value ? parseFloat(e.target.value) : undefined 
                })
              }
              placeholder="46.6753"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">نصف القطر (كم)</Label>
            <Input
              type="number"
              value={currentFilters.radius || ''}
              onChange={(e) => 
                onFilterChange({ 
                  radius: e.target.value ? parseInt(e.target.value) : undefined 
                })
              }
              placeholder="10"
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Switch
          id="featured"
          checked={currentFilters.featured || false}
          onCheckedChange={(checked) => 
            onFilterChange({ featured: checked || undefined })
          }
        />
        <Label htmlFor="featured" className="text-sm font-medium">
          الإعلانات المميزة فقط
        </Label>
      </div>
    </div>
  );
}
