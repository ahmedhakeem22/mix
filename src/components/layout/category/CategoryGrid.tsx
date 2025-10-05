
import React, { useState, useEffect, useRef } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { MobilePagination } from './MobilePagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { Category } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategorySkeleton } from '@/components/ui/loading-skeleton';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategorySelect: (category: Category) => void;
  isLoading?: boolean;
}

export function CategoryGrid({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect,
  isLoading = false
}: CategoryGridProps) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [canSwipe, setCanSwipe] = useState({ left: false, right: false });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Show limited items per page on mobile (just 4 in each row for better visibility)
  const ITEMS_PER_PAGE = isMobile ? 8 : categories.length;
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  
  // Calculate currently displayed items
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedCategories = categories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Check if swiping is possible
  useEffect(() => {
    setCanSwipe({
      left: currentPage > 1,
      right: currentPage < totalPages
    });
  }, [currentPage, totalPages]);
  
  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left - next page
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
    
    if (touchEnd - touchStart > 100) {
      // Swipe right - previous page
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Add smooth scrolling for desktop
  const scrollCategories = (direction: 'left' | 'right') => {
    if (!gridRef.current) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    gridRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };
  
  // If loading, show skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 md:grid-cols-10 gap-2 md:gap-3 py-4 px-1">
        {Array(isMobile ? 8 : 10).fill(0).map((_, index) => (
          <CategorySkeleton key={index} />
        ))}
      </div>
    );
  }
  
  if (isMobile) {
    return (
      <div className='dark:border-dark-border border-border bg-white dark:bg-dark-background'>
        {/* Category grid with touch gestures */}
        <div 
          className="grid grid-cols-4 gap-2 py-4 px-1 animate-in fade-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ minHeight: '124px' }} // Fixed height to prevent layout shifts
        >
          {displayedCategories.map((category) => (
            <CategoryIcon 
              key={category.id}
              category={category}
              isSelected={category.id === selectedCategoryId}
              onClick={() => onCategorySelect(category)}
              size="sm"
            />
          ))}
        </div>
        
        {/* Pagination dots - mobile only */}
        {totalPages > 1 && (
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        )}
      </div>
    );
  }
  
  // Desktop version with horizontal scroll
  return (
    <div className="relative py-3">
      {categories.length > 10 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white dark:bg-dark-card shadow-sm rounded-full"
            onClick={() => scrollCategories('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white dark:bg-dark-card shadow-sm rounded-full"
            onClick={() => scrollCategories('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
      
      <div 
        ref={gridRef}
        className="flex overflow-x-auto gap-3 py-1 px-10 no-scrollbar animate-in fade-in"
      >
        {categories.map((category) => (
          <CategoryIcon 
            key={category.id}
            category={category}
            isSelected={category.id === selectedCategoryId}
            onClick={() => onCategorySelect(category)}
            size="lg"
          />
        ))}
      </div>
    </div>
  );
}

