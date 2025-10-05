import React, { useMemo, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useCategories } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { ScrollableContainer } from './ScrollableContainer';

interface MobileCategoryGridProps {
  selectedCategory?: number | null;
  onCategorySelect?: (categoryId: number | null) => void;
  selectedSubcategory?: number | null;
  onSubcategorySelect?: (subcategoryId: number | null) => void;
  selectedChildCategory?: number | null;
  onChildCategorySelect?: (childCategoryId: number | null) => void;
}

export function EnhancedMobileCategoryBar({
  selectedCategory,
  onCategorySelect,
  selectedSubcategory,
  onSubcategorySelect,
  selectedChildCategory,
  onChildCategorySelect,
}: MobileCategoryGridProps) {
  const { data: categories, isLoading } = useCategories();

  const subcategories =
    selectedCategory && categories
      ? categories.find((cat) => cat.id === selectedCategory)?.subcategories || []
      : [];

  const childCategories =
    selectedSubcategory && subcategories
      ? subcategories.find((sub) => sub.id === selectedSubcategory)?.childcategories || []
      : [];

  const itemsPerPage = 8;

  const getCategoryImage = (category: Category) => {
    if (category.image_url) return category.image_url;
    if (category.image) return category.image;

    const defaultImages: Record<string, string> = {
      'سيارات': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&h=120&fit=crop',
      'عقارات': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=120&h=120&fit=crop',
      'إلكترونيات': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&h=120&fit=crop',
      'أثاث': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=120&h=120&fit=crop',
      'أزياء': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&h=120&fit=crop',
      'وظائف': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      'خدمات': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop',
      'رياضة': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop',
      'تعليم': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&h=120&fit=crop',
      'طعام': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&h=120&fit=crop',
    };

    for (const [key, image] of Object.entries(defaultImages)) {
      if (category.name.includes(key)) return image;
    }

    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=120&fit=crop';
  };

  const pages = useMemo(() => {
    if (!categories) return [];
    const chunks: Category[][] = [];
    for (let i = 0; i < categories.length; i += itemsPerPage) {
      chunks.push(categories.slice(i, i + itemsPerPage));
    }
    return chunks;
  }, [categories]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    rtl: true,
    slides: {
      perView: 1,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div dir="rtl" className="bg-white dark:bg-dark-background border-b border-border dark:border-dark-border">
      {/* Main Categories */}
      <div className="py-3">
        <div ref={sliderRef} className="keen-slider touch-pan-x select-none">
          {pages.map((page, pageIndex) => (
            <div key={pageIndex} className="keen-slider__slide px-4">
              <div className="grid grid-cols-4 gap-2">
                {page.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelect?.(category.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 transition-all",
                      selectedCategory === category.id
                        ? "opacity-100"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    <div className={`w-14 h-14 mb-1 rounded-sm overflow-hidden transition-all`}>
                      <img
                        src={getCategoryImage(category)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=120&fit=crop';
                        }}
                      />
                    </div>
                    <span className={`text-xs text-center font-medium leading-tight w-full px-1 truncate max-w-[56px] ${selectedCategory === category.id ? 'text-brand' : 'text-foreground'}`}>
                      {category.name}
                    </span>
                  </button>
                ))}
                {Array.from({ length: itemsPerPage - page.length }).map((_, i) => (
                  <div key={i} className="invisible" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* indicators */}
        {pages.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {pages.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  instanceRef.current?.moveToIdx(i);
                  setCurrentSlide(i);
                }}
                className={cn(
                  "cursor-pointer transition-all duration-300 rounded-full",
                  i === currentSlide
                    ? "w-6 h-2 bg-brand"
                    : "w-2 h-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subcategories */}
      {selectedCategory && subcategories.length > 0 && (
        <div className="border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
          <div className="px-4 py-3">
            <ScrollableContainer className="overflow-x-auto scrollbar-hide" showScrollbar={subcategories.length > 3}>
              <div className="flex gap-2 min-w-max">
                {subcategories.map((subcategory) => {
                  const isSelected = selectedSubcategory === subcategory.id;
                  return (
                    <button
                      key={subcategory.id}
                      onClick={() => onSubcategorySelect?.(subcategory.id)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-brand text-white'
                          : 'bg-white text-foreground hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  );
                })}
              </div>
            </ScrollableContainer>
          </div>
        </div>
      )}

      {/* Child Categories */}
      {selectedSubcategory && childCategories.length > 0 && (
        <div className="border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
          <div className="px-4 py-2">
            <ScrollableContainer className="overflow-x-auto scrollbar-hide" showScrollbar={childCategories.length > 3}>
              <div className="flex gap-2 min-w-max">
                {childCategories.map((childCategory) => {
                  const isSelected = selectedChildCategory === childCategory.id;
                  return (
                    <button
                      key={childCategory.id}
                      onClick={() => onChildCategorySelect?.(childCategory.id)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-brand text-white'
                          : 'bg-white text-foreground hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                      }`}
                    >
                      {childCategory.name}
                    </button>
                  );
                })}
              </div>
            </ScrollableContainer>
          </div>
        </div>
      )}
    </div>
  );
}
