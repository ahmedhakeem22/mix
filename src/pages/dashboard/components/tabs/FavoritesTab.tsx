import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/use-api';
import { AdCard } from '@/components/ads/ad-card';
import { WithSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton';

export function FavoritesTab() {
  const { data: favoritesData, isLoading } = useFavorites();
  const favorites = favoritesData?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>المفضلة</CardTitle>
        <CardDescription> الإعلانات المحفوظة في المفضلة  </CardDescription>
      </CardHeader>
      <CardContent>
        <WithSkeleton
          isLoading={isLoading}
          data={favorites}
          SkeletonComponent={CardSkeleton}
          skeletonCount={3} // Show 3 skeletons while loading
          skeletonProps={{ className: "w-full" }}
        >
          {(data) =>
            data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((favoriteAd) => (
                  <AdCard
                    key={favoriteAd.id}
                    ad={favoriteAd}
                    isFavorite={true}
                    // The layout prop controls the AdCard's internal style
                    layout="grid" 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">لا توجد إعلانات في المفضلة</h3>
                <p className="text-muted-foreground mt-2 mb-4 max-w-xs">
                  اضغط على أيقونة القلب في أي إعلان لإضافته إلى هنا والمشاهدة لاحقًا.
                </p>
                <Button asChild>
                  <Link to="/">تصفح الإعلانات</Link>
                </Button>
              </div>
            )
          }
        </WithSkeleton>
      </CardContent>
    </Card>
  );
}