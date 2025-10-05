
import React, { useRef, useEffect, useState } from 'react';
import { Category } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubCategoryButtonsProps {
  items: Category[] | { id: number; name: string }[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  level?: 'sub' | 'child';
}

export function SubCategoryButtons({ 
  items, 
  selectedId, 
  onSelect,
  level = 'sub'
}: SubCategoryButtonsProps) {
  const isSubLevel = level === 'sub';
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  
  // Check scroll position
  const checkScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    
    setShowLeftScroll(container.scrollLeft > 0);
    setShowRightScroll(container.scrollLeft < container.scrollWidth - container.clientWidth - 5);
  };
  
  // Handle scroll events
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkScroll);
    // Check initial scroll state
    checkScroll();
    
    // Add touch scroll momentum for mobile
    if (isMobile) {
      container.style.scrollBehavior = 'smooth';
      container.style.overscrollBehavior = 'contain';
      (container.style as any).WebkitOverflowScrolling = 'touch';
    }
    
    return () => {
      container.removeEventListener('scroll', checkScroll);
    };
  }, [items, isMobile]);
  
  // Scroll buttons handlers
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  
  const buttonSizeClass = isSubLevel 
    ? 'py-1.5 px-3 text-sm' 
    : 'py-1 px-2 text-xs';
  
  const selectedClasses = isSubLevel
    ? 'bg-brand text-white shadow-sm border border-brand' 
    : 'bg-brand/10 border-brand border-2 text-brand shadow-sm font-medium';
  
  const unselectedClasses = isSubLevel
    ? 'bg-white text-gray-700 border border-gray-200 dark:bg-dark-card dark:text-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface' 
    : 'bg-white border border-gray-300 text-gray-600 dark:bg-dark-surface dark:border-dark-border dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card';
  
  return (
    <div className="relative w-full">
      {/* Left scroll button */}
      {showLeftScroll && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full flex items-center bg-gradient-to-r from-white dark:from-dark-background via-white/90 dark:via-dark-background/90 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 rounded-full bg-white/80 dark:bg-dark-card/80 shadow-sm border border-gray-100 dark:border-dark-border"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Scrollable content */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto py-2 px-4 gap-2 no-scrollbar snap-x"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            className={`${buttonSizeClass} whitespace-nowrap rounded-md transition-all snap-start
              ${selectedId === item.id ? selectedClasses : unselectedClasses}
              hover:opacity-90 active:scale-95`
            }
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      
      {/* Right scroll button */}
      {/*{showRightScroll && (*/}
      {/*  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full flex items-center bg-gradient-to-l from-white dark:from-dark-background via-white/90 dark:via-dark-background/90 to-transparent">*/}
      {/*    <Button*/}
      {/*      variant="ghost"*/}
      {/*      size="sm"*/}
      {/*      className="h-7 w-7 rounded-full bg-white/80 dark:bg-dark-card/80 shadow-sm border border-gray-100 dark:border-dark-border"*/}
      {/*      onClick={scrollRight}*/}
      {/*    >*/}
      {/*      <ChevronRight className="h-4 w-4" />*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}
