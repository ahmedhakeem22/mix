
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce function for real-time filtering
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

// Format date function
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format currency function
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ar-SA') + ' SYP';
}

// Get image URL with fallback
export function getImageUrl(url?: string): string {
  if (!url) return '/placeholder.svg';
  
  // Check if it's already an absolute URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Check if it's a relative URL
  if (url.startsWith('/')) {
    return url;
  }
  
  // Fallback
  return '/placeholder.svg';
}
