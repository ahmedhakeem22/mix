
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/use-api';
import { 
  Search, 
  Filter,
  TrendingUp,
  Star,
  Users,
  ArrowRight,
  Package,
  Building,
  Car,
  Smartphone,
  Home,
  ShoppingBag,
  Briefcase,
  Wrench,
  Layers,
  MapPin,
  Eye,
  Heart,
  Calendar,
  Award,
  Sofa,
  Shirt,
  Monitor,
  Gamepad,
  Camera,
  BookOpen,
  Utensils,
  Dumbbell,
  Baby,
  PawPrint,
  Hammer,
  Music,
  Plane,
  GraduationCap,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'سيارات': Car,
  'عقارات': Building,
  'إلكترونيات': Smartphone,
  'أثاث': Sofa,
  'أزياء': Shirt,
  'كمبيوتر': Monitor,
  'ألعاب': Gamepad,
  'تصوير': Camera,
  'كتب': BookOpen,
  'مطعم': Utensils,
  'رياضة': Dumbbell,
  'أطفال': Baby,
  'حيوانات': PawPrint,
  'أدوات': Hammer,
  'موسيقى': Music,
  'سفر': Plane,
  'تعليم': GraduationCap,
  'صحة': Stethoscope,
  'وظائف': Briefcase,
  'خدمات': Wrench,
  'default': Package
};

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'popular'>('name');
  
  const filteredAndSortedCategories = useMemo(() => {
    if (!categories) return [];
    
    let filtered = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'count':
          return (b.count || 0) - (a.count || 0);
        case 'popular':
          return (b.count || 0) - (a.count || 0);
        default:
          return a.name.localeCompare(b.name, 'ar');
      }
    });
    
    return filtered;
  }, [categories, searchQuery, sortBy]);

  const getRandomCount = () => Math.floor(Math.random() * 1000 + 100);
  const getRandomViews = () => Math.floor(Math.random() * 50000 + 5000);
  const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1);
  
  const getCategoryIcon = (categoryName: string) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.includes(key)) return icon;
    }
    return categoryIcons.default;
  };

  const featuredCategories = categories?.slice(0, 6) || [];
  const topBrands = ['تويوتا', 'سامسونج', 'آبل', 'مرسيدس', 'هواوي', 'إل جي'];
  const popularTags = ['جديد', 'مستعمل', 'للبيع', 'للإيجار', 'عرض خاص', 'تخفيض'];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-dark-background dark:to-dark-surface" dir="rtl">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-l from-brand via-brand-dark to-blue-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container px-4 mx-auto py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                استكشف التصنيفات
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                تصفح آلاف المنتجات والخدمات المنظمة في تصنيفات متقدمة
              </p>
              
              {/* Enhanced Search */}
              <div className="relative max-w-xl mx-auto mb-8">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث في التصنيفات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 pl-4 h-14 text-lg bg-white/95 backdrop-blur border-0 shadow-xl rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="bg-white dark:bg-dark-card shadow-lg border-b border-border dark:border-dark-border">
          <div className="container px-4 mx-auto py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand mb-1">{categories?.length || 0}</div>
                <div className="text-sm text-muted-foreground">تصنيف رئيسي</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">إعلان نشط</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">2M+</div>
                <div className="text-sm text-muted-foreground">مشاهدة شهرية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1">4.8</div>
                <div className="text-sm text-muted-foreground">تقييم المستخدمين</div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tags & Brands */}
        <div className="container px-4 mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Popular Tags */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                الكلمات الشائعة
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm px-3 py-1 cursor-pointer hover:bg-brand hover:text-white transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Top Brands */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-brand" />
                العلامات التجارية الرائدة
              </h3>
              <div className="flex flex-wrap gap-2">
                {topBrands.map((brand, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1 cursor-pointer hover:bg-brand hover:text-white transition-colors">
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Display */}
        <div className="container px-4 mx-auto pb-12">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">جميع التصنيفات</h2>
              <p className="text-muted-foreground">
                {filteredAndSortedCategories.length} تصنيف متاح
              </p>
            </div>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'count' | 'popular') => setSortBy(value)}>
              <SelectTrigger className="w-40 h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">حسب الاسم</SelectItem>
                <SelectItem value="count">حسب عدد الإعلانات</SelectItem>
                <SelectItem value="popular">الأكثر شعبية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-xl mx-auto mb-3 animate-pulse" />
                  <div className="bg-muted h-4 rounded mb-2 animate-pulse" />
                  <div className="bg-muted h-3 rounded w-3/4 mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {filteredAndSortedCategories.map((category) => {
                const IconComponent = getCategoryIcon(category.name);
                const adsCount = category.count || getRandomCount();
                const views = getRandomViews();
                const rating = getRandomRating();
                
                return (
                  <div 
                    key={category.id} 
                    className="group cursor-pointer text-center transition-all duration-300 hover:scale-105"
                    onClick={() => navigate(`/category/${category.id}`)}
                  >
                    {/* Category Icon Card */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent border border-brand/20">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand/10"></div>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-brand group-hover:text-brand-dark transition-colors duration-300" />
                      </div>
                      
                      {/* Floating stats on hover */}
                      <div className="absolute inset-0 bg-brand/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Eye className="w-3 h-3" />
                          <span>{views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <h3 className="font-bold text-sm md:text-base text-foreground group-hover:text-brand transition-colors mb-1 line-clamp-1">
                      {category.name}
                    </h3>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      {adsCount.toLocaleString()} إعلان
                    </div>
                    
                    {/* Subcategories indicator */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {category.subcategories.slice(0, 2).map((sub) => (
                          <Badge key={sub.id} variant="outline" className="text-[10px] px-1.5 py-0.5 h-auto">
                            {sub.name}
                          </Badge>
                        ))}
                        {category.subcategories.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-auto">
                            +{category.subcategories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">لم يتم العثور على تصنيفات</h3>
              <p className="text-muted-foreground mb-4">جرب البحث بكلمات مختلفة</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                مسح البحث
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}
