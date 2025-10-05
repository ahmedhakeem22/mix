
import { Category } from '@/types';

export interface CategoryIconProps {
  category?: Category;
  icon?: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'lg' | string;
  className?: string;
}
