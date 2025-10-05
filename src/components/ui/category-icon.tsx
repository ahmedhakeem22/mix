
import React from 'react';
import { 
  Car, Home, Smartphone, Laptop, Shirt, Gamepad, 
  Gem, ShoppingBag, Utensils, BookOpen, Baby, Bike, 
  Camera, Headphones, Gift, Sofa, Dog, Users, Building,
  Paintbrush, Glasses, ShoppingBasket, Wrench, Briefcase,
  MonitorSmartphone, Mouse, FileText, Train
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

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
  'Glasses': Glasses,
  'ShoppingBasket': ShoppingBasket,
};

export function CategoryIcon({ name, className = "w-6 h-6" }: CategoryIconProps) {
  const Icon = iconMap[name] || Car;
  return <Icon className={className} />;
}
