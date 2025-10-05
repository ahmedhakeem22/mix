
import React, { useState } from 'react';
import { MapPin, Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategoryFiltersProps {
  onNearbyClick: () => void;
  onRegionSelect: (region: string) => void;
  onFilterClick: () => void;
  selectedRegion?: string;
}

export function CategoryFilters({ 
  onNearbyClick, 
  onRegionSelect, 
  onFilterClick, 
  selectedRegion = 'كل المناطق' 
}: CategoryFiltersProps) {
  const [showRegions, setShowRegions] = useState(false);
  const isMobile = useIsMobile();
  
  // Default regions list
  const regions = [
    'كل المناطق',
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المنطقة المنورة',
    'الدمام',
    'الخبر',
    'تبوك',
    'أبها',
    'حائل',
    'عسير'
  ];
  
  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-dark-background shadow-sm">
      <div className="container px-4 mx-auto py-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 flex-shrink-0 bg-white dark:bg-dark-card h-8"
            onClick={onNearbyClick}
          >
            <MapPin className="w-4 h-4 text-brand" />
            <span className="text-sm">القريب</span>
          </Button>
          
          <Select
            value={selectedRegion}
            onValueChange={onRegionSelect}
          >
            <SelectTrigger className="w-32 h-8 flex-shrink-0 bg-white dark:bg-dark-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 flex items-center gap-1 justify-between bg-white dark:bg-dark-card h-8"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">بحث...</span>
                  <Filter className="w-4 h-4 text-brand" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4 max-h-[80vh] overflow-y-auto bg-white dark:bg-dark-background">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">خيارات الفلترة</h3>
                    <Button variant="ghost" size="sm">إغلاق</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>تصفية حسب السعر</span>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>تصفية حسب الموديل</span>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>تصفية حسب الحالة</span>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>تصفية حسب التاريخ</span>
                    </Button>
                  </div>
                  
                  <Button className="w-full mt-4">تطبيق الفلاتر</Button>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <div className="flex-1 min-w-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center gap-1 bg-white dark:bg-dark-card justify-between h-8"
                onClick={onFilterClick}
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">بحث...</span>
                <Filter className="w-4 h-4 text-brand" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
