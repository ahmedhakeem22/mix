
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className,
  showPageNumbers = true
}: PaginationProps) {
  // If there's only one page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show at most 5 pages
    const maxPagesToShow = Math.min(5, totalPages);
    
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // More than 5 pages, calculate which to show
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className={cn("flex justify-center mt-6", className)}>
      <div className="flex items-center gap-1 rtl:flex-row-reverse">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          <span className="sr-only md:not-sr-only md:mr-1 rtl:md:ml-1">السابق</span>
        </Button>

        {showPageNumbers && getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn(
              "min-w-[2.5rem] hidden sm:flex",
              currentPage === page ? "bg-brand hover:bg-brand-dark text-white" : ""
            )}
          >
            {page}
          </Button>
        ))}

        {!showPageNumbers && (
          <span className="px-2 text-sm">
            {currentPage} من {totalPages}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center"
          aria-label="الصفحة التالية"
        >
          <span className="sr-only md:not-sr-only md:ml-1 rtl:md:mr-1">التالي</span>
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
