
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Clock, CreditCard, TrendingUp, Package, Eye } from 'lucide-react';
import { useUserListings } from '@/hooks/use-api';
import { useUserPromotions, usePromotionPackages } from '@/hooks/use-promotions';
import { PromoteListingDialog } from '@/components/promotions/PromoteListingDialog';
import { UserPromotionsTab } from '@/components/promotions/UserPromotionsTab';

export function PromoteTab() {
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  
  const { data: userListings, isLoading: loadingListings } = useUserListings();
  const { data: promotionsResponse, isLoading: loadingPromotions } = useUserPromotions();
  const { data: packages, isLoading: loadingPackages } = usePromotionPackages();

  if (loadingListings || loadingPromotions || loadingPackages) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const listings = userListings.data || [];
  const promotionsList = promotionsResponse?.data || [];
  const packagesList = Array.isArray(packages) ? packages : [];

  const handlePromoteListing = (listing: any) => {
    setSelectedListing(listing);
    setPromoteDialogOpen(true);
  };

  const activePromotions = promotionsList.filter((p: any) => 
    p.payment_status === 'paid' && 
    p.expires_at && 
    new Date(p.expires_at) > new Date()
  );

  const packageIcons = {
    featured: Star,
    highlight: TrendingUp,
    urgent: Clock,
    top: Eye
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="promote" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="promote">ترقية إعلان</TabsTrigger>
          <TabsTrigger value="packages">الباقات المتاحة</TabsTrigger>
          <TabsTrigger value="history">تاريخ الترقيات</TabsTrigger>
        </TabsList>

        <TabsContent value="promote" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ترقية إعلاناتك
              </CardTitle>
              <p className="text-muted-foreground">
                اختر إعلانًا لترقيته وزيادة ظهوره للمشترين
              </p>
            </CardHeader>
            <CardContent>
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((listing: any) => {
                    const isPromoted = activePromotions.some((p: any) => p.listing?.id === listing.id);
                    
                    return (
                      <Card key={listing.id} className={`relative ${isPromoted ? 'border-brand bg-brand/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                              {listing.main_image_url ? (
                                <img 
                                  src={listing.main_image_url} 
                                  alt={listing.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {listing.price} SYP
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span>{listing.views_count || 0} مشاهدة</span>
                              </div>
                            </div>
                          </div>
                          
                          {isPromoted && (
                            <Badge className="absolute top-2 right-2 bg-brand text-white">
                              مُرقَّى
                            </Badge>
                          )}
                          
                          <Button 
                            className="w-full mt-4" 
                            variant={isPromoted ? "outline" : "default"}
                            onClick={() => handlePromoteListing(listing)}
                            disabled={isPromoted}
                          >
                            {isPromoted ? 'مُرقَّى بالفعل' : 'ترقية الإعلان'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد إعلانات لترقيتها</p>
                  <p className="text-sm">أضف إعلانًا أولاً لتتمكن من ترقيته</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packagesList.map((pkg: any) => {
              const IconComponent = Star; // Default icon for all packages
              
              return (
                <Card key={pkg.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-brand" />
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    </div>
                    <div className="text-2xl font-bold text-brand">
                      {pkg.price} SYP
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{pkg.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{pkg.duration_days} يوم</span>
                      </div>
                    </div>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                        عرض مميز في الصفحة الرئيسية
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                        ظهور أولي في نتائج البحث
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <UserPromotionsTab />
        </TabsContent>
      </Tabs>

      <PromoteListingDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        listing={selectedListing}
      />
    </div>
  );
}
