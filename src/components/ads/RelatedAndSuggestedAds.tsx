
import React from 'react';
import { AdCard } from './ad-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '@/types';
import { useRelatedAds, useAds } from '@/hooks/use-api';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

// دالة لتقسيم المصفوفة إلى مجموعات صغيرة (chunks) بحجم معين
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

interface RelatedAndSuggestedAdsProps {
  categoryId?: number;
  excludeId?: number;
  currentAd?: Listing;
}

interface HorizontalAdsSectionProps {
  title: string;
  ads: Listing[];
  sectionId: string;
}

function HorizontalAdsSection({ title, ads, sectionId }: HorizontalAdsSectionProps) {
  const scrollContainer = React.useRef<HTMLDivElement>(null);
  const swiperRef = React.useRef<any>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 320; // عرض بطاقة واحدة + الفجوة بينها
      const currentScroll = scrollContainer.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainer.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // دالة الحصول على رابط الصورة بشكل آمن
  const getImageUrl = (ad: Listing): string => {
    if (ad.image) {
      if (typeof ad.image === 'string') {
        return ad.image;
      }
      if (typeof ad.image === 'object' && 'image_url' in ad.image) {
        return ad.image.image_url;
      }
      if (typeof ad.image === 'object' && 'url' in ad.image) {
        return (ad.image as any).url;
      }
    }
    
    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      const firstImage = ad.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      }
      if (typeof firstImage === 'object' && 'url' in firstImage) {
        return (firstImage as any).url;
      }
    }
    return 'https://placehold.co/200x200';
  };

  if (ads.length === 0) return null;

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h2>
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8"
            aria-label="السابق"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8"
            aria-label="التالffffي"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="hidden md:block relative">
        <div
          ref={scrollContainer}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {ads.map((ad) => (
            <a key={ad.id} href={`/ad/${ad.id}`} className="flex-shrink-0 w-80">
              <AdCard ad={ad} layout="grid" />
            </a>
          ))}
        </div>
      </div>

      {/* موبايل: سلايدر بـ Swiper مع 6 إعلانات لكل صفحة + الأسهم فوق يمين */}
      <div className="md:hidden relative">
        {/* الأسهم فوق يمين */}
        <div className="absolute top-1 right-2 flex space-x-1 z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              // هذا التعامل مع السوايبر عبر ref لو احتجت تحكم
              if (swiperRef.current) swiperRef.current.slidePrev();
            }}
            aria-label="السابق"
            className="h-6 w-6 p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (swiperRef.current) swiperRef.current.slideNext();
            }}
            aria-label="التالي"
            className="h-6 w-6 p-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Swiper
          slidesPerView={1}
          slidesPerGroup={1}
          spaceBetween={10}
          className="w-full"
          navigation={false}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {chunkArray(ads, 6).map((adsChunk, index) => (
            <SwiperSlide key={index}>
              <div className="grid grid-cols-3 gap-3">
                {adsChunk.map((ad) => (
                  <a key={ad.id} href={`/ad/${ad.id}`}
                      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer"
                    >
                      {/* صورة الإعلان أو صورة افتراضية */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getImageUrl(ad) ? (
                          <img
                            src={getImageUrl(ad)}
                            alt={ad.title}
                            className="w-full h-full object-cover object-center hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9.83a2 2 0 00-.59-1.42l-4.82-4.82A2 2 0 0014.17 3H5zm9 1.5V9h4.5L14 4.5zM5 5h7v5h5v10H5V5zm2 7a2 2 0 100 4 2 2 0 000-4zm7.5 2.5l-2.25 3-1.75-2.25-2.5 3.75h10l-3.5-4.5z" />
                          </svg>
                        )}
                      </div>

                      {/* معلومات الإعلان */}
                      <div className="p-2 flex flex-col gap-1 text-xs">
                        <h3 className="font-medium truncate text-foreground hover:text-brand">{ad.title}</h3>

                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">{ad.city_name || 'غير محدد'}</span>
                          {ad.price && (
                            <span className="font-semibold text-brand text-xs">
                              {ad.price.toLocaleString()} SYP
                            </span>
                          )}
                        </div>
                      </div>
                    </a>

                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export function RelatedAndSuggestedAds({ 
  categoryId, 
  excludeId, 
  currentAd 
}: RelatedAndSuggestedAdsProps) {
  const { data: relatedAds } = useRelatedAds(categoryId, excludeId);
  const { data: suggestedAdsResponse } = useAds({ 
    category_id: categoryId, 
    per_page: 12,
    sort: 'newest'
  });

  const filteredSuggestedAds = React.useMemo(() => {
    if (!suggestedAdsResponse) return [];
    
    let adsList: Listing[] = [];
    if (Array.isArray(suggestedAdsResponse)) {
      adsList = suggestedAdsResponse;
    } else if (typeof suggestedAdsResponse === 'object' && suggestedAdsResponse.data && Array.isArray(suggestedAdsResponse.data)) {
      adsList = suggestedAdsResponse.data;
    }
    
    return adsList.filter(ad => ad.id !== excludeId);
  }, [suggestedAdsResponse, excludeId]);

  const filteredRelatedAds = React.useMemo(() => {
    if (!relatedAds) return [];
    return relatedAds.filter(ad => ad.id !== excludeId);
  }, [relatedAds, excludeId]);

  return (
    <div className="space-y-8">
      {filteredRelatedAds.length > 0 && (
        <HorizontalAdsSection
          title="إعلانات مشابهة"
          ads={filteredRelatedAds}
          sectionId="related-ads"
        />
      )}
      
      {filteredSuggestedAds.length > 0 && (
        <HorizontalAdsSection
          title="إعلانات مقترحة"
          ads={filteredSuggestedAds}
          sectionId="suggested-ads"
        />
      )}
    </div>
  );
}

