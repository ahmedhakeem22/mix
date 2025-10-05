
import React, { memo, useMemo } from 'react';
import { useCategories } from '@/hooks/use-api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryIcon } from './CategoryIcon';
import { cn } from '@/lib/utils';

interface MobileCategoryBarProps {
  selectedCategory?: number;
  onCategorySelect?: (categoryId: number) => void;
  className?: string;
}

const MobileCategoryBar = memo(({ selectedCategory, onCategorySelect, className }: MobileCategoryBarProps) => {
  const { data: categories, isLoading } = useCategories();

  const categoryItems = useMemo(() => {
    if (!categories) return [];
    
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      isSelected: selectedCategory === category.id,
    }));
  }, [categories, selectedCategory]);

  if (isLoading) {
    return (
      <div className={cn("flex gap-2 p-4", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="flex gap-2 p-4">
        {categoryItems.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect?.(category.id)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all duration-200",
              category.isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <CategoryIcon icon={category.icon} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium truncate w-full text-center">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
});

MobileCategoryBar.displayName = 'MobileCategoryBar';

export default MobileCategoryBar;
