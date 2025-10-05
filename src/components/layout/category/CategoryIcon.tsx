
import React from 'react';
import { 
  Car, Home, Smartphone, Mouse, Briefcase, Wrench, Shirt, Gamepad, 
  Gem, ShoppingBag, Utensils, Laptop, BookOpen, Baby, Bike, Camera, 
  FileText, Headphones, Gift, Train, Sofa, MonitorSmartphone, Dog, Users, Building, 
  Paintbrush, Wallet, Glasses, ShoppingBasket
} from 'lucide-react';
import { CategoryIconProps } from './CategoryIconProps';
import { cn } from '@/lib/utils';

// Improved icon map
const iconMap: Record<string, React.ComponentType<any>> = {
  'Car': Car,
  'Home': Home,
  'Building': Building,
  'Smartphone': Smartphone,
  'MonitorSmartphone': MonitorSmartphone,
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
  'Train': Train,
  'Sofa': Sofa,
  'Dog': Dog,
  'Users': Users,
  'Paintbrush': Paintbrush,
  'Wallet': Wallet,
  'Glasses': Glasses,
  'ShoppingBasket': ShoppingBasket,
};

export function CategoryIcon({ category, icon, isSelected = false, onClick, size = 'lg', className }: CategoryIconProps) {
  // Use icon prop if provided, otherwise use category icon, fallback to Car
  const iconName = icon || category?.icon || 'Car';
  const Icon = iconMap[iconName] || Car;
  const categoryName = category?.name || '';
  
  // If only icon is provided without category, render just the icon
  if (icon && !category) {
    return <Icon className={className} />;
  }
  
  const sizeClasses = {
    sm: 'w-16 h-16 p-2',
    lg: 'w-20 h-20 p-3'
  };
  
  const iconSizes = {
    sm: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div
      className={cn(
        "flex flex-col items-center cursor-pointer transition-colors rounded-lg border",
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.lg,
        isSelected 
          ? "bg-brand/10 border-brand text-brand" 
          : "bg-white dark:bg-dark-card border-border hover:bg-muted",
        className
      )}
      onClick={onClick}
    >
      <Icon className={iconSizes[size as keyof typeof iconSizes] || iconSizes.lg} />
      {categoryName && (
        <span className={cn(
          "text-center font-medium leading-tight mt-1",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {categoryName}
        </span>
      )}
    </div>
  );
}
