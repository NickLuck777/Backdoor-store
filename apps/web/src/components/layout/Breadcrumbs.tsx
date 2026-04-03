import * as React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Навигация" className={cn('flex items-center gap-1.5 text-xs', className)}>
      <Link
        href="/"
        className="text-muted hover:text-white transition-colors duration-200 flex items-center"
      >
        <Home size={13} />
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight size={12} className="text-border flex-shrink-0" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-muted hover:text-white transition-colors duration-200 truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
