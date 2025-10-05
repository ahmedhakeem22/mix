
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/use-api';
import {
    Car, Home, Smartphone, Mouse, Briefcase, Wrench, Shirt, Gamepad,
    Gem, ShoppingBag, Utensils, Laptop, BookOpen, Baby, Bike, Camera, FileText,
    Headphones, Gift, Train
} from 'lucide-react';
import { Category } from '@/types';

const iconMap: Record<string, React.ComponentType<any>> = {
    'Car': Car,
    'Home': Home,
    'Smartphone': Smartphone,
    'Mouse': Mouse,
    'Briefcase': Briefcase,
    'Wrench': Wrench,
    'Shirt': Shirt,
    'Gamepad': Gamepad,
    'Gem': Gem,
    'ShoppingBag': ShoppingBag,
    'Utensils': Utensils,
    'Laptop': Laptop,
    'BookOpen': BookOpen,
    'Baby': Baby,
    'Bike': Bike,
    'Camera': Camera,
    'FileText': FileText,
    'Headphones': Headphones,
    'Gift': Gift,
    'Train': Train
};

export function DesktopCategoryBar() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);

    // Fetch categories from API
    const { data: categories, isLoading: loadingCategories } = useCategories();

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
        <div className="relative bg-white border-b border-border dark:bg-dark-background">
            <div className="container px-4 mx-auto relative py-4">
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

                <div
                    ref={scrollRef}
                    className="scroll-container gap-3 py-1 pl-10 pr-10"
                >
                    {loadingCategories ? (
                        <div className="flex justify-center items-center w-full py-2">
                            <span className="text-muted-foreground">جاري تحميل التصنيفات...</span>
                        </div>
                    ) : categories && categories.length > 0 ? (
                        categories.map((category) => {
                            const iconName = category.icon || 'Car';
                            const Icon = iconMap[iconName] || Car;
                            const isSelected = selectedCategory?.id === category.id;

                            return (
                                <div key={category.id} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleCategoryClick(category)}
                                        className={`category-icon dark:border-dark-border bg-white dark:bg-dark-background min-w-[100px] text-center transition-all ${isSelected ? 'scale-105' : ''}`}
                                    >
                                        <div className={`p-3 rounded-full mx-auto mb-2 transition-colors ${isSelected ? 'bg-brand text-white' : 'bg-brand-light'}`} style={{ width: '56px', height: '56px' }}>
                                            <Icon className={`h-full w-full ${isSelected ? 'text-white' : 'text-brand'}`} />
                                        </div>
                                        <span className="text-sm font-medium truncate block">{category.name}</span>
                                        {/* {category.subcategories && category.subcategories.length > 0 && (
                                            <ChevronDown className={`h-4 w-4 mx-auto mt-1 transition-transform ${isSelected ? 'rotate-180' : ''} ${isSelected ? 'text-brand' : 'text-gray-400'}`} />
                                        )} */}
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

            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                <div className="bg-gray-50 border-t border-border transition-all dark:bg-dark-background">
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

            {selectedSubcategory && selectedSubcategory.subcategories && selectedSubcategory.subcategories.length > 0 && (
                <div className="bg-gray-100 border-t border-border dark:bg-dark-background">
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
