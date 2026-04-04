'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useAdminCategories, useReorderCategories, type AdminCategory } from '@/lib/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GripVertical, Tag } from 'lucide-react';

const CATEGORY_TYPE_LABELS: Record<string, string> = {
  GENRE: 'Жанр',
  COLLECTION: 'Коллекция',
  PUBLISHER: 'Издатель',
  FEATURE: 'Особенность',
};

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const reorderMutation = useReorderCategories();

  const [items, setItems] = React.useState<AdminCategory[]>([]);
  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (categories) {
      setItems([...categories].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [categories]);

  const handleDrop = async () => {
    if (draggingIdx == null || dragOverIdx == null || draggingIdx === dragOverIdx) {
      setDraggingIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newItems = [...items];
    const [moved] = newItems.splice(draggingIdx, 1);
    newItems.splice(dragOverIdx, 0, moved);
    const reordered = newItems.map((item, i) => ({ ...item, sortOrder: i }));
    setItems(reordered);
    setDraggingIdx(null);
    setDragOverIdx(null);

    try {
      await reorderMutation.mutateAsync(
        reordered.map((item) => ({ id: item.id, sortOrder: item.sortOrder })),
      );
      toast.success('Порядок сохранён');
    } catch {
      toast.error('Ошибка при сохранении порядка');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Категории</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">
          Перетащите строки для изменения порядка в каталоге
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-[#B0B0B0] text-sm">
          Категории не найдены
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((cat, i) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => setDraggingIdx(i)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i); }}
              onDrop={handleDrop}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border border-[#2D2D4A] bg-[#1E2030]',
                'transition-all duration-200 cursor-default',
                draggingIdx === i ? 'opacity-40 border-[#003087]/50' : 'hover:border-[#003087]/30',
                dragOverIdx === i && draggingIdx !== i && 'border-[#003087] bg-[#001E4A]/20',
              )}
            >
              <div className="text-[#2D2D4A] hover:text-[#B0B0B0] cursor-grab active:cursor-grabbing transition-colors duration-200">
                <GripVertical size={18} />
              </div>
              <div className="w-6 h-6 rounded-lg bg-[#003087]/20 flex items-center justify-center text-[#4DA6FF] flex-shrink-0">
                <Tag size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{cat.name}</p>
                <p className="text-xs text-[#B0B0B0]">{cat.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#111827] text-[#B0B0B0] border border-[#2D2D4A] px-2 py-0.5 rounded-lg">
                  {CATEGORY_TYPE_LABELS[cat.type] ?? cat.type}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    cat.isActive
                      ? 'bg-[#001A0D] text-[#00C853] border border-[#00C853]/30'
                      : 'bg-[#1A1A2E] text-[#B0B0B0] border border-[#B0B0B0]/30',
                  )}
                >
                  {cat.isActive ? 'Активна' : 'Скрыта'}
                </span>
                <span className="text-xs text-[#B0B0B0] tabular-nums w-6 text-center">
                  {cat.sortOrder + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
