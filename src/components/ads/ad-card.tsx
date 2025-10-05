// src/components/ads/AdCard.tsx

import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Eye, Image as ImageIcon, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Listing } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import React, { useState } from 'react';
import { useAddToFavorites, useRemoveFromFavorites } from '@/hooks/use-api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface AdCardProps {
  ad: Listing;
  layout?: 'grid' | 'list';
  className?: string;
  onFavoriteToggle?: (adId: number) => void;
  isFavorite?: boolean;
}

export function AdCard({ 
  ad, 
  layout = 'list', 
  className, 
  onFavoriteToggle, 
  isFavorite: externalIsFavorite,
}: AdCardProps) {
  const [localIsFavorite, setLocalIsFavorite] = useState(ad.is_favorited || false);
  const { isAuthenticated } = useAuth();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  
  const timeAgo = formatDistanceToNow(new Date(ad.created_at), { 
    addSuffix: true,
    locale: ar
  });

  const isFavorite = externalIsFavorite !== undefined ? externalIsFavorite : localIsFavorite;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب عليك تسجيل الدخول لإضافة للمفضلة",
        variant: "destructive"
      });
      return;
    }

    if (onFavoriteToggle) {
      onFavoriteToggle(ad.id);
    } else {
      setLocalIsFavorite(!isFavorite);
      if (isFavorite) {
        removeFromFavorites.mutate(ad.id);
      } else {
        addToFavorites.mutate(ad.id);
      }
    }
  };

  const getImageUrl = (): string | null => {
    if (ad.main_image_url) return ad.main_image_url;
    if (ad.image && typeof ad.image === 'object' && 'image_url' in ad.image) return (ad.image as any).image_url;
    if (typeof ad.image === 'string' && ad.image) return ad.image;
    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      const firstImage = ad.images[0];
      if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) return (firstImage as any).url;
      if (typeof firstImage === 'string') return firstImage;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const hasValidImage = !!imageUrl;

  const formatDistance = (distanceInKm: number): string => {
    if (distanceInKm < 1) {
      const meters = Math.round(distanceInKm * 1000);
      return `${meters} متر`;
    }
    return `${distanceInKm.toFixed(1)} كم`;
  };

  if (layout === 'grid') {
    return (
      <Link
        to={`/ad/${ad.id}`}
        className={cn(
          "ad-card block border border-border hover:shadow-md transition-shadow bg-white relative h-80 overflow-hidden rounded-lg",
          ad.featured && "featured-ad border-t-2 border-t-brand",
          className
        )}
      >
        <button
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          onClick={handleFavoriteToggle}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
          />
        </button>

        <div className="relative w-full h-40 overflow-hidden">
          {hasValidImage ? (
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center flex-col text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs mt-1">لا توجد صورة</span>
            </div>
          )}

          {ad.featured ? (
            <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
            </div>
          ) : null}
        </div>
        
        <div className="p-3 flex flex-col h-40">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-sm truncate max-w-[180px]" title={ad.title}>{ad.title}</h3>
            {ad.price > 0 && (
              <span className="font-bold text-brand whitespace-nowrap mr-2 text-sm">
                {ad.price.toLocaleString()} SYP
              </span>
            )}
          </div>
          
         <p className="text-muted-foreground text-xs line-clamp-3 mt-1 leading-snug">
            {ad.description}
          </p>
          
          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 ml-1" />
              <span className="truncate max-w-[80px]">{ad.city_name || ad.city || 'غير محدد'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 ml-1" />
              <span>{timeAgo}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-3 w-3 ml-1" />
              <span>{ad.views_count || 0}</span>
            </div>
            
            {ad.distance_km !== undefined && ad.distance_km !== null && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 ml-1 text-brand" />
                <span className="text-brand font-medium">{formatDistance(ad.distance_km)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/ad/${ad.id}`}
      className={cn(
        "ad-card flex border border-border hover:shadow-md transition-shadow bg-white relative h-36 overflow-hidden rounded-lg",
        ad.featured && "featured-ad border-r-2 border-r-brand",
        className
      )}
    >
      <button
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
        onClick={handleFavoriteToggle}
      >
        <Heart
          className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
        />
      </button>

      <div className="w-28 md:w-36 flex-shrink-0 relative overflow-hidden">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        {ad.featured && (
          <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-md" />
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1 justify-between overflow-hidden">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3
              className="font-bold text-base truncate max-w-[150px] md:max-w-[180px]"
              title={ad.title}
            >
              {ad.title}
            </h3>
            {ad.price > 0 && (
              <span className="font-bold text-brand text-sm shrink-0 whitespace-nowrap">
                {ad.price.toLocaleString()} SYP
              </span>
            )}
          </div>

          <p className="text-muted-foreground text-xs mt-1 leading-snug line-clamp-2 max-h-[2.75rem] overflow-hidden">
            {ad.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 ml-1" />
            <span className="truncate max-w-[80px]">{ad.city_name || ad.city || 'غير محدد'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 ml-1" />
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center">
            <Eye className="h-3 w-3 ml-1" />
            <span>{ad.views_count || 0}</span>
          </div>
          
          {ad.distance_km !== undefined && ad.distance_km !== null && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 ml-1 text-brand" />
              <span className="text-brand font-medium">{formatDistance(ad.distance_km)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}