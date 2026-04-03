import { ProductCardSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden min-h-[480px] flex items-end pb-12 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-4">
          <div className="h-5 w-56 bg-[#2A2A4A] rounded-full animate-pulse" />
          <div className="h-14 w-2/3 bg-[#2A2A4A] rounded-xl animate-pulse" />
          <div className="h-14 w-1/2 bg-[#2A2A4A] rounded-xl animate-pulse" />
          <div className="h-5 w-80 bg-[#2A2A4A] rounded-lg animate-pulse mt-2" />
          <div className="flex gap-3 mt-4">
            <div className="h-12 w-44 bg-[#2A2A4A] rounded-xl animate-pulse" />
            <div className="h-12 w-36 bg-[#2A2A4A] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Carousel skeletons */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-12">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section} className="flex flex-col gap-4">
            <div className="h-6 w-48 bg-[#2A2A4A] rounded-lg animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
