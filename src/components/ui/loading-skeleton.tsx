
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'image' | 'circle' | 'button';
  count?: number;
  animated?: boolean;
}

export function Skeleton({
  className,
  variant = 'default',
  count = 1,
  animated = true,
  ...props
}: SkeletonProps) {
  const variants = {
    default: "h-4 w-full",
    card: "h-[160px] w-full rounded-md",
    text: "h-4 w-3/4",
    image: "h-[200px] w-full rounded-md",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-md",
  };

  const baseClasses = "bg-gray-200 dark:bg-dark-muted rounded relative overflow-hidden";
  const variantClasses = variants[variant];
  const animationClasses = animated 
    ? "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent"
    : "";

  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses, animationClasses, className)}
            style={{ animationDelay: `${i * 100}ms` }}
            {...props}
          />
        ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 dark:border-dark-border dark:bg-dark-card">
      <Skeleton variant="image" />
      <Skeleton variant="text" className="mt-2" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex justify-between items-center mt-4">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="button" className="w-1/4" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Skeleton variant="circle" className="h-14 w-14" />
      <Skeleton variant="text" className="w-16 h-3" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-2">
      <Skeleton variant="circle" className="h-12 w-12 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" className="h-6 w-1/3" />
      <div className="flex gap-2">
        <Skeleton variant="button" className="w-1/3" />
        <Skeleton variant="button" className="w-1/3" />
        <Skeleton variant="button" className="w-1/3" />
      </div>
      <Skeleton variant="default" className="h-8" />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

// Component to provide loading state wrapper with skeleton
export function WithSkeleton<T>({
  isLoading,
  data,
  skeletonCount = 3,
  skeletonVariant = 'default',
  children,
  SkeletonComponent,
}: {
  isLoading: boolean;
  data: T | undefined | null;
  skeletonCount?: number;
  skeletonVariant?: 'default' | 'card' | 'text' | 'image' | 'circle' | 'button';
  children: (data: T) => React.ReactNode;
  SkeletonComponent?: React.ComponentType;
}) {
  if (isLoading) {
    if (SkeletonComponent) {
      return (
        <>
          {Array(skeletonCount)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="animate-pulse">
                <SkeletonComponent />
              </div>
            ))}
        </>
      );
    }
    return <Skeleton variant={skeletonVariant} count={skeletonCount} />;
  }

  if (!data) {
    return <div className="text-center py-4 text-muted-foreground">لا توجد بيانات</div>;
  }

  return <>{children(data)}</>;
}

// Add keyframe animation for shimmer effect to your global CSS
// @keyframes shimmer {
//   100% {
//     transform: translateX(100%);
//   }
// }
