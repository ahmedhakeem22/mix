import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
interface ScrollableContainerProps {
  children: ReactNode;
  className?: string;
  showScrollbar?: boolean;
  scrollbarClassName?: string;
}
export function ScrollableContainer({
  children,
  className,
  showScrollbar = true,
  scrollbarClassName
}: ScrollableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const checkScroll = () => {
    if (containerRef.current) {
      const {
        scrollLeft,
        scrollWidth,
        clientWidth
      } = containerRef.current;
      const hasScroll = scrollWidth > clientWidth;
      setCanScroll(hasScroll);
      setShowScrollLeft(scrollLeft > 0);
      setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);

      // Check scroll on resize
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(container);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [children]);
  return <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div ref={containerRef} className={cn("overflow-x-auto scrollbar-hide", className)} style={{
      scrollBehavior: 'smooth'
    }}>
        {children}
      </div>
      
      {/* Custom Scrollbar */}
      {showScrollbar && canScroll}
    </div>;
}