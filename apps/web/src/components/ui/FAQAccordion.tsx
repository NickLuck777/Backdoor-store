'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  searchQuery?: string;
  className?: string;
}

function highlightText(text: string, query?: string): React.ReactNode {
  if (!query || query.trim() === '') return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-accent/40 text-white rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function FAQAccordion({ items, searchQuery, className }: FAQAccordionProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (!searchQuery?.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {filtered.length === 0 && (
        <p className="text-muted text-sm text-center py-8">Ничего не найдено</p>
      )}
      {filtered.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              'rounded-xl border overflow-hidden transition-all duration-300',
              'bg-card',
              isOpen
                ? 'border-accent shadow-[0_0_16px_rgba(0,48,135,0.25)] border-l-4 border-l-accent'
                : 'border-border hover:border-border/80',
            )}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              aria-expanded={isOpen}
            >
              <span className="text-foreground font-semibold text-sm leading-snug">
                {highlightText(item.question, searchQuery)}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex-shrink-0 text-muted"
              >
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-muted leading-relaxed border-t border-border pt-4">
                    {highlightText(item.answer, searchQuery)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default FAQAccordion;
