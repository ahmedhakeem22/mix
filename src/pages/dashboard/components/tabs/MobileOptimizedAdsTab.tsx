
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listingsAPI } from '@/services/apis';
import { Listing, ListingImage } from '@/types';
import { Eye, Edit, Trash2, TrendingUp, Calendar, MapPin, Search, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useCurrentUser } from '@/hooks/use-api';

interface MobileOptimizedAdsTabProps {
  onPromote: (id: number) => void;
  onDelete: (id: number) => void;
}

export function MobileOptimizedAdsTab({ onPromote, onDelete }: MobileOptimizedAdsTabProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const { data: userListingsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['userListings', currentUser?.id, currentPage, selectedStatus, searchQuery, sortBy],
    queryFn: () => listingsAPI.getListings({ 
      user_id: currentUser!.id,
      page: currentPage,
      per_page: itemsPerPage,
      search: searchQuery || undefined,
      sort: sortBy
    }),
    enabled: !!currentUser?.id,
  });

  const listings = userListingsResponse?.data?.data || [];
  const totalPages = Math.ceil((userListingsResponse?.data?.total || 0) / itemsPerPage);

  const handleRefreshAd = async (adId: number) => {
    try {
      console.log('Refreshing ad:', adId);
      await refetch();
    } catch (error) {
      console.error('Error refreshing ad:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white text-xs">نشط</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white text-xs">في الانتظار</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">مرفوض</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-gray-400 text-gray-600 text-xs">منتهي الصلاحية</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getAdImage = (listing: Listing) => {
    if (listing.main_image_url) return listing.main_image_url;
    if (listing.image && typeof listing.image === 'object' && 'image_url' in listing.image) {
      return (listing.image as ListingImage).image_url;
    }
    if (typeof listing.image === 'string' && listing.image) return listing.image;
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      const firstImage = listing.images[0];
      if (firstImage) {
        if (typeof firstImage === 'object') {
          return (firstImage as ListingImage).url || (firstImage as ListingImage).image_url;
        }
        if (typeof firstImage === 'string') return firstImage;
      }
    }
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-red-500 mb-4">حدث خطأ في تحميل الإعلانات</p>
        <Button onClick={() => refetch()} size="sm">
          <RefreshCw className="h-4 w-4 ml-1" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">إعلاناتي ({listings.length})</h2>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="البحث في إعلاناتي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-10"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="flex-1 h-10">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="pending">في الانتظار</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="expired">منتهي الصلاحية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="flex-1 h-10">
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
              <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
              <SelectItem value="popular">الأكثر مشاهدة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد إعلانات تطابق المعايير المحددة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing: Listing) => {
              const timeAgo = formatDistanceToNow(new Date(listing.created_at), { 
                addSuffix: true,
                locale: ar
              });

              return (
                <Card key={listing.id} className="overflow-hidden shadow-sm border border-gray-200">
                  <CardContent className="p-0">
                    {/* Fixed layout container */}
                    <div className="flex h-24"> {/* Fixed height container */}
                      {/* Image - Fixed dimensions */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={getAdImage(listing)}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';
                          }}
                        />
                        <div className="absolute top-1 right-1">
                          {getStatusBadge(listing.status || 'active')}
                        </div>
                      </div>

                      {/* Content - Fixed flex layout */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0"> {/* min-w-0 prevents overflow */}
                        {/* Top section */}
                        <div className="flex-1 min-h-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-semibold text-sm line-clamp-1 flex-1 min-w-0">
                              {listing.title}
                            </h3>
                            {listing.price && (
                              <span className="font-bold text-brand text-sm flex-shrink-0">
                                {Number(listing.price).toLocaleString()} ل.س
                              </span>
                            )}
                          </div>
                          
                          {/* Stats - Fixed height */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {timeAgo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {listing.views_count || 0}
                            </span>
                            {listing.city && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{listing.city}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons - Fixed at bottom */}
                        <div className="flex justify-end gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPromote(listing.id)}
                            className="h-7 w-7 p-0"
                            title="ترويج"
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefreshAd(listing.id)}
                            className="h-7 w-7 p-0"
                            title="تحديث"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/edit-ad/${listing.id}`)}
                            className="h-7 w-7 p-0"
                            title="تعديل"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(listing.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            title="حذف"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Simple pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 pb-20">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage} من {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
