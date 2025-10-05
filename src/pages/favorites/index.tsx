
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { AdCard } from '@/components/ads/ad-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Grid2X2, List, Search } from 'lucide-react';
import { useFavorites } from '@/hooks/use-api';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { WithSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';

export default function FavoritesPage() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const { data: favoritesData, isLoading } = useFavorites();
  
  // Handle pagination manually for favorites
  const favorites = favoritesData?.data || [];
  const totalFavorites = favorites.length || 0;
  const totalPages = Math.ceil(totalFavorites / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFavorites = favorites.slice(startIndex, endIndex);

  // Sort favorites
  const sortedFavorites = [...currentFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pb-20 md:pb-0">
          {/* Page Header */}
          <div className="bg-accent/30 border-b border-border">
            <div className="container px-4 mx-auto py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    المفضلة
                  </h1>
                  <p className="text-muted-foreground">
                    {totalFavorites > 0 ? `${totalFavorites} عنصر في المفضلة` : 'لا توجد عناصر في المفضلة'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container px-4 mx-auto py-6">
            {/* Controls */}
            {totalFavorites > 0 && (
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">الأحدث</SelectItem>
                      <SelectItem value="oldest">الأقدم</SelectItem>
                      <SelectItem value="price-low">السعر: الأقل أولاً</SelectItem>
                      <SelectItem value="price-high">السعر: الأعلى أولاً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex border rounded-lg overflow-hidden bg-background">
                  <Button 
                    variant={layout === 'grid' ? "default" : "ghost"} 
                    size="icon"
                    onClick={() => setLayout('grid')}
                    className="h-8 w-8 rounded-none"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={layout === 'list' ? "default" : "ghost"}
                    size="icon" 
                    onClick={() => setLayout('list')}
                    className="h-8 w-8 rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Favorites Grid */}
            <WithSkeleton
              isLoading={isLoading}
              data={sortedFavorites}
              SkeletonComponent={CardSkeleton}
              skeletonCount={itemsPerPage}
            >
              {(favorites) => (
                favorites.length > 0 ? (
                  <>
                    <div className={`grid gap-4 ${
                      layout === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                    }`}>
                      {favorites.map((favorite) => (
                        <AdCard 
                          key={favorite.id} 
                          ad={favorite} 
                          layout={layout}
                          isFavorite={true}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            السابق
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="icon"
                                onClick={() => setCurrentPage(page)}
                                className="w-10 h-10"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            التالي
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-accent/30 rounded-2xl">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">لا توجد عناصر في المفضلة</h3>
                    <p className="text-muted-foreground mb-6">
                      لم تقم بإضافة أي إعلانات للمفضلة بعد
                    </p>
                    <Button asChild>
                      <Link to="/">
                        <Search className="ml-2 h-4 w-4" />
                        تصفح الإعلانات
                      </Link>
                    </Button>
                  </div>
                )
              )}
            </WithSkeleton>
          </div>
        </main>
        
        <Footer />
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
