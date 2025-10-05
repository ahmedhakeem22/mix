import React from 'react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className }) => {
  if (!error) return null;
  
  return (
    <p className={cn(
      "text-sm font-medium text-destructive mt-1 animate-in fade-in-0 slide-in-from-top-1",
      className
    )}>
      {error}
    </p>
  );
};