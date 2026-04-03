import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ rounded = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-[#2A2A4A]',
          'before:absolute before:inset-0',
          'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
          'before:animate-shimmer before:bg-[length:200%_100%]',
          roundedClasses[rounded],
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

// ProductCard skeleton
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden flex flex-col">
      {/* Image */}
      <Skeleton rounded="sm" className="w-full aspect-[3/4]" />
      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <Skeleton rounded="md" className="h-4 w-3/4" />
        <Skeleton rounded="md" className="h-3 w-1/2" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton rounded="md" className="h-6 w-20" />
          <Skeleton rounded="full" className="h-5 w-12" />
        </div>
        <Skeleton rounded="xl" className="h-9 w-full mt-1" />
      </div>
    </div>
  );
}

// CarouselSkeleton — row of ProductCard skeletons
export function CarouselSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-48">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
