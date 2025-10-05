import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/use-api';
import { Category } from '@/types';

export function CategoryBar() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);

    // Fetch categories from API
    const { data: categories, isLoading: loadingCategories } = useCategories();

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
        };
        
        for (const [key, image] of Object.entries(defaultImages)) {
            if (category.name.includes(key)) return image;
        }
        
        return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=120&fit=crop';
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', checkScrollButtons);
            // Initial check
            checkScrollButtons();

            return () => {
                scrollEl.removeEventListener('scroll', checkScrollButtons);
            };
        }
    }, []);

    // Handle category selection
    const handleCategoryClick = (category: Category) => {
        if (selectedCategory?.id === category.id) {
            // If clicking the same category, close it
            setSelectedCategory(null);
            setSelectedSubcategory(null);
        } else {
            // Select new category
            setSelectedCategory(category);
            setSelectedSubcategory(null);
        }
    };

    // Handle subcategory selection
    const handleSubcategoryClick = (subcategory: Category) => {
        if (selectedSubcategory?.id === subcategory.id) {
            setSelectedSubcategory(null);
        } else {
            setSelectedSubcategory(subcategory);
        }
    };

    return (
        <div className="relative bg-white border-b border-border">
            <div className="container px-4 mx-auto relative py-4">
                {/* Scroll shadow/gradient on left */}
                {showLeftScroll && (
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 absolute left-4 rounded-full shadow-sm"
                            onClick={scrollLeft}
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>
                )}

                {/* Categories scroll area */}
                <div
                    ref={scrollRef}
                    className="scroll-container gap-4 py-1 pl-10 pr-10"
                >
                    {loadingCategories ? (
                        <div className="flex justify-center items-center w-full py-2">
                            <span className="text-muted-foreground">جاري تحميل التصنيفات...</span>
                        </div>
                    ) : categories && categories.length > 0 ? (
                        categories.map((category) => {
                            const isSelected = selectedCategory?.id === category.id;

                            return (
                                <div key={category.id} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleCategoryClick(category)}
                                        className={`category-icon min-w-[110px] text-center transition-all ${isSelected ? 'scale-105' : ''}`}
                                    >
                                        <div className={`relative w-24 h-24 mx-auto mb-3 overflow-hidden transition-all ${isSelected ? 'scale-105' : 'hover:scale-102'}`}>
                                            <img
                                                src={getCategoryImage(category)}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.parentElement!.innerHTML = `
                                                        <div class="w-full h-full bg-brand/10 flex items-center justify-center">
                                                            <svg class="w-8 h-8 text-brand" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    `;
                                                }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium truncate block ${isSelected ? 'text-brand' : 'text-foreground'}`}>
                                            {category.name}
                                        </span>
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex justify-center items-center w-full py-2">
                            <span className="text-muted-foreground">لا توجد تصنيفات</span>
                        </div>
                    )}
                </div>

                {/* Scroll shadow/gradient on right */}
                {showRightScroll && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 absolute right-4 rounded-full shadow-sm"
                            onClick={scrollRight}
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Subcategories area */}
            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                <div className="bg-gray-50 border-t border-border transition-all">
                    <div className="container px-4 mx-auto py-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {selectedCategory.subcategories.map((subcategory) => {
                                const isSubcategorySelected = selectedSubcategory?.id === subcategory.id;
                                return (
                                    <button
                                        key={subcategory.id}
                                        onClick={() => handleSubcategoryClick(subcategory)}
                                        className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${isSubcategorySelected ? 'bg-brand text-white' : 'bg-white border border-gray-200'
                                            }`}
                                    >
                                        {subcategory.name}
                                        {subcategory.subcategories && subcategory.subcategories.length > 0 && (
                                            <ChevronDown className={`inline-block h-3 w-3 mr-1 ${isSubcategorySelected ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Third level categories */}
            {selectedSubcategory && selectedSubcategory.subcategories && selectedSubcategory.subcategories.length > 0 && (
                <div className="bg-gray-100 border-t border-border">
                    <div className="container px-4 mx-auto py-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedSubcategory.subcategories.map((thirdLevel) => (
                                <Link
                                    key={thirdLevel.id}
                                    to={`/category/${thirdLevel.id}`}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:bg-brand hover:text-white transition-colors"
                                >
                                    {thirdLevel.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
