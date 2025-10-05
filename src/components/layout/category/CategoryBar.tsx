import React from 'react';
import { useCategories } from '@/hooks/use-api';
import { Category } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFilterStore } from '@/store/filter-store';
import { EnhancedMobileCategoryBar } from './EnhancedMobileCategoryBar';
import { cn } from '@/lib/utils';

export function CategoryBar() {
  const isMobile = useIsMobile();
  const { filters, setCategory } = useFilterStore();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const selectedCategory = filters.category_id;
  const selectedSubcategory = filters.sub_category_id;
  const selectedChildCategory = filters.child_category_id;

  const subcategories = selectedCategory && categories
    ? categories.find(cat => cat.id === selectedCategory)?.subcategories || []
    : [];

  const childCategories = selectedSubcategory && subcategories
    ? subcategories.find(sub => sub.id === selectedSubcategory)?.childcategories || []
    : [];

  const handleCategorySelect = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setCategory(undefined, undefined, undefined);
    } else {
      setCategory(categoryId, undefined, undefined);
    }
  };

  const handleSubcategorySelect = (subcategoryId: number) => {
    if (selectedSubcategory === subcategoryId) {
      setCategory(typeof selectedCategory === 'number' ? selectedCategory : undefined, undefined, undefined);
    } else {
      setCategory(typeof selectedCategory === 'number' ? selectedCategory : undefined, subcategoryId, undefined);
    }
  };

  const handleChildCategorySelect = (childCategoryId: number) => {
    if (selectedChildCategory === childCategoryId) {
      setCategory(
        typeof selectedCategory === 'number' ? selectedCategory : undefined,
        typeof selectedSubcategory === 'number' ? selectedSubcategory : undefined,
        undefined
      );
    } else {
      setCategory(
        typeof selectedCategory === 'number' ? selectedCategory : undefined,
        typeof selectedSubcategory === 'number' ? selectedSubcategory : undefined,
        childCategoryId
      );
    }
  };

  const getCategoryImage = (category: Category) => {
    if (category.image_url) return category.image_url;
    if (category.image) return category.image;
    const defaultImages: Record<string, string> = {
      'سيارات': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&h=80&fit=crop',
      'عقارات': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=120&h=80&fit=crop',
      'إلكترونيات': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&h=80&fit=crop',
    };
    for (const [key, image] of Object.entries(defaultImages)) {
      if (category.name.includes(key)) return image;
    }
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=80&fit=crop';
  };

  if (isMobile) {
    return (
      <div dir="rtl" className="bg-white dark:bg-dark-background border-b border-border dark:border-dark-border">
        <EnhancedMobileCategoryBar
          selectedCategory={typeof selectedCategory === 'number' ? selectedCategory : undefined}
          onCategorySelect={handleCategorySelect}
          selectedSubcategory={typeof selectedSubcategory === 'number' ? selectedSubcategory : undefined}
          onSubcategorySelect={handleSubcategorySelect}
          selectedChildCategory={typeof selectedChildCategory === 'number' ? selectedChildCategory : undefined}
          onChildCategorySelect={handleChildCategorySelect}
        />
      </div>
    );
  }

  return (
    <div dir="rtl" className="bg-white dark:bg-dark-background border-b border-border dark:border-dark-border">
      <div className="container mx-auto px-4 py-4 bg-white dark:bg-dark-background">
        
        <div className="overflow-x-auto scrollbar-hover pb-4">
          <div className="flex gap-6 min-w-max">
            {loadingCategories ? (
              <span className="text-sm text-muted-foreground py-4">جاري تحميل التصنيفات...</span>
            ) : (
              categories?.map(category => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="flex flex-col items-center min-w-[80px] group outline-none"
                  >
                    <div className={cn(
                      'relative w-12 h-12 mb-2 rounded-lg flex justify-center items-center transition-all'
                    )}>
                      <img src={getCategoryImage(category)} alt={category.name} className="w-full h-full object-cover rounded-md" />
                    </div>
                    <span className={cn(
                      'text-xs font-medium text-center',
                      isSelected ? 'text-brand' : 'text-foreground'
                    )}>
                      {category.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* التصنيفات الفرعية */}
      {/* التصنيفات الفرعية */}
{selectedCategory && subcategories.length > 0 && (
  <div className="bg-gray-50 dark:bg-dark-surface">
    <div className="container mx-auto px-4 py-2">
      <div className="flex flex-col gap-1">
        {/* سكرول خاص بالـ subcategories */}
        <div className="overflow-x-auto scrollbar-hover pb-2">
          <div className="flex gap-2 min-w-max">
            {subcategories.map(subcategory => {
              const isSelected = selectedSubcategory === subcategory.id;
              return (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategorySelect(subcategory.id)}
                  className={cn(
                    'px-2 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-all',
                    isSelected
                      ? 'bg-brand text-white'
                      : 'bg-white text-foreground hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                  )}
                >
                  {subcategory.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* سكرول منفصل خاص بالـ childCategories */}
        {selectedSubcategory && childCategories.length > 0 && (
          <div className="overflow-x-auto scrollbar-hover pt-1 pb-2">
            <div className="flex gap-2 min-w-max">
              {childCategories.map(childCategory => {
                const isSelected = selectedChildCategory === childCategory.id;
                return (
                  <button
                    key={childCategory.id}
                    onClick={() => handleChildCategorySelect(childCategory.id)}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-all',
                      isSelected
                        ? 'bg-brand text-white'
                        : 'bg-white text-foreground hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                    )}
                  >
                    {childCategory.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
