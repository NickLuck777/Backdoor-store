import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ src, alt, width, height, priority, className }: OptimizedImageProps) {
  return (
    <Image
      src={src || '/images/placeholder-game.svg'}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjQyNDQ0Ii8+PC9zdmc+"
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/images/placeholder-game.svg';
      }}
    />
  );
}
