
import React from 'react';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function MobilePagination({ currentPage, totalPages, onChange }: MobilePaginationProps) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center py-2 gap-2">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-2 h-2 rounded-full transition-all ${
            currentPage === i + 1 
            ? 'bg-brand scale-125' 
            : 'bg-gray-300 dark:bg-dark-muted'
          }`}
          aria-label={`صفحة ${i + 1}`}
        />
      ))}
    </div>
  );
}
