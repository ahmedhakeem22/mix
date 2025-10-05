
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MapPin, Heart, Eye, Star } from 'lucide-react';
import { Listing } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MobileSimilarAdsCarouselProps {
  ads: Listing[];
  title?: string;
  className?: string;
}

export function MobileSimilarAdsCarousel({ 
  ads, 
  title = "إعلانات مشابهة", 
  className 
}: MobileSimilarAdsCarouselProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 6 ads per page
  const adsPerPage = 6;
  const totalPages = Math.ceil(ads.length / adsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => 
    ads.slice(i * adsPerPage, (i + 1) * adsPerPage)
  );
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = (startX - currentX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft + diffX;
  };
  
  const handleTouchEnd = () => {
    if (!isDragging || !containerRef.current) return;
    
    setIsDragging(false);
    const containerWidth = containerRef.current.offsetWidth;
    const scrollLeft = containerRef.current.scrollLeft;
    const newPage = Math.round(scrollLeft / containerWidth);
    
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };
  
  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        containerRef.current.scrollTo({
          left: pageIndex * containerWidth,
          behavior: 'smooth'
        });
      }
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const getImageUrl = (ad: Listing) => {
    if (ad.image) {
      if (typeof ad.image === 'string') return ad.image;
      if (typeof ad.image === 'object' && 'image_url' in ad.image) {
        return ad.image.image_url;
      }
      if (typeof ad.image === 'object' && 'url' in ad.image) {
        return (ad.image as any).url;
      }
    }
    
    if (ad.images && ad.images.length > 0) {
      const firstImage = ad.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (typeof firstImage === 'object' && firstImage && 'url' in firstImage) {
        return (firstImage as any).url;
      }
    }
    
    return '/placeholder.svg';
  };
  
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollLeft = currentPage * containerWidth;
    }
  }, [currentPage]);
  
  if (!ads.length) return null;
  
  return (
    <div className={cn("bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden", className)} dir="rtl">
      {/* Enhanced Header */}
      <div className="relative px-6 py-5 bg-gradient-to-l from-brand/5 to-transparent border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{ads.length} إعلان مشابه</p>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="h-9 w-9 rounded-xl hover:bg-brand/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="text-sm text-muted-foreground font-medium">
                {currentPage + 1} / {totalPages}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="h-9 w-9 rounded-xl hover:bg-brand/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{
            width: `${100 * totalPages}%`,
            transform: `translateX(${(currentPage * 100) / totalPages}%)`,
          }}
        >
          {pages.map((pageAds, pageIndex) => (
            <div 
              key={pageIndex}
              className="grid grid-cols-2 gap-4 p-6"
              style={{ width: `${100 / totalPages}%` }}
            >
              {pageAds.map((ad) => (
                <Card 
                  key={ad.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gray-50 dark:bg-dark-surface rounded-2xl transform hover:scale-105"
                  onClick={() => navigate(`/ad/${ad.id}`)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-t-2xl">
                    <img
                      src={getImageUrl(ad)}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Featured Badge */}
                    {ad.featured && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <Star className="w-3 h-3 ml-1" />
                        مميز
                      </Badge>
                    )}
                    
                    {/* Favorite Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 left-2 w-8 h-8 bg-white/90 hover:bg-white dark:bg-dark-background/90 dark:hover:bg-dark-background rounded-full shadow-lg backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite toggle
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    
                    {/* Quick Stats */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      <Eye className="w-3 h-3" />
                      <span>{ad.views_count || ad.viewCount || 0}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <h4 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-brand transition-colors min-h-[2.5rem]">
                      {ad.title}
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand text-sm">
                        {formatPrice(ad.price)}
                      </span>
                      {(ad.negotiable || ad.is_negotiable) && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-50 text-green-600 border-green-200">
                          قابل للتفاوض
                        </Badge>
                      )}
                    </div>
                    
                    {/* Location & Time */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">{ad.city_name || ad.city || ad.location}</span>
                      </div>
                      <span>منذ يومين</span>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Fill empty slots if needed */}
              {pageAds.length < adsPerPage && Array.from({ length: adsPerPage - pageAds.length }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-gray-50 dark:bg-dark-surface rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center opacity-50">
                  <div className="text-center text-muted-foreground text-xs">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2" />
                    <span>قريباً</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4 bg-gray-50 dark:bg-dark-surface">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentPage 
                  ? "bg-brand w-8 shadow-lg" 
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 w-2"
              )}
            />
          ))}
        </div>
      )}
      
      {/* Navigation Hint */}
      <div className="text-center pb-4 bg-gray-50 dark:bg-dark-surface">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-brand rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-brand rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>اسحب لتصفح المزيد • {currentPage + 1} من {totalPages}</span>
        </div>
      </div>
    </div>
  );
}
