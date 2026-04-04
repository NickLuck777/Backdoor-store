'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import {
  useAdminFaq,
  useCreateFaqItem,
  useUpdateFaqItem,
  useDeleteFaqItem,
  useReorderFaq,
  type FaqItem,
} from '@/lib/hooks/useAdmin';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Plus, GripVertical, Pencil, Trash2, Check, X as XIcon } from 'lucide-react';

// ─── FAQ Form Dialog ──────────────────────────────────────────────────────────

function FaqFormDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: FaqItem | null;
}) {
  const createMutation = useCreateFaqItem();
  const updateMutation = useUpdateFaqItem();
  const isEdit = !!item;

  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (item) {
      setQuestion(item.question);
      setAnswer(item.answer);
      setIsActive(item.isActive);
    } else {
      setQuestion('');
      setAnswer('');
      setIsActive(true);
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && item) {
        await updateMutation.mutateAsync({ id: item.id, question, answer, isActive });
        toast.success('FAQ обновлён');
      } else {
        await createMutation.mutateAsync({ question, answer, isActive });
        toast.success('FAQ добавлен');
      }
      onClose();
    } catch {
      toast.error('Ошибка при сохранении');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать FAQ' : 'Добавить FAQ'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="admin-label">Вопрос</label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Как оплатить заказ?"
            required
          />
        </div>
        <div>
          <label className="admin-label">Ответ</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Оплата производится через..."
            rows={5}
            required
            className="w-full bg-input border border-border rounded-xl text-foreground text-sm placeholder:text-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-300 resize-none"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-input accent-accent cursor-pointer"
          />
          <span className="text-sm text-[#E0E0E0]">Активен</span>
        </label>
        <div className="flex justify-end gap-3 pt-2 border-t border-[#2D2D4A]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Отмена</Button>
          <Button size="sm" type="submit" loading={isPending}>
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── Draggable FAQ Row ────────────────────────────────────────────────────────

function FaqRow({
  item,
  index,
  onEdit,
  onDelete,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: {
  item: FaqItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onDragStart: (i: number) => void;
  onDragOver: (i: number) => void;
  onDrop: () => void;
  isDragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={onDrop}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border border-[#2D2D4A] bg-[#1E2030]',
        'transition-all duration-200',
        isDragging ? 'opacity-40 border-[#003087]/50' : 'hover:border-[#2D2D4A]/80',
      )}
    >
      <div className="pt-1 text-[#2D2D4A] hover:text-[#B0B0B0] cursor-grab active:cursor-grabbing transition-colors duration-200">
        <GripVertical size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <p className={cn('text-sm font-semibold', item.isActive ? 'text-white' : 'text-[#B0B0B0]')}>
            {item.question}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggle}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300',
                item.isActive ? 'bg-[#003087]' : 'bg-[#2D2D4A]',
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300',
                  item.isActive ? 'translate-x-4' : 'translate-x-1',
                )}
              />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-[#B0B0B0] hover:text-[#FF1744] hover:bg-[#FF1744]/10 transition-all duration-200"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p className="text-xs text-[#B0B0B0] mt-1 line-clamp-2">{item.answer}</p>
      </div>
    </div>
  );
}

// ─── FAQ Page ─────────────────────────────────────────────────────────────────

export default function AdminFaqPage() {
  const { data: faqItems, isLoading } = useAdminFaq();
  const updateMutation = useUpdateFaqItem();
  const deleteMutation = useDeleteFaqItem();
  const reorderMutation = useReorderFaq();

  const [items, setItems] = React.useState<FaqItem[]>([]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<FaqItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (faqItems) {
      setItems([...faqItems].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [faqItems]);

  const handleDragStart = (i: number) => setDraggingIdx(i);
  const handleDragOver = (i: number) => setDragOverIdx(i);

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
      await reorderMutation.mutateAsync(reordered.map((item) => ({ id: item.id, sortOrder: item.sortOrder })));
    } catch {
      toast.error('Ошибка при сохранении порядка');
    }
  };

  const handleToggle = async (item: FaqItem) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, isActive: !item.isActive });
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('FAQ удалён');
    } catch {
      toast.error('Ошибка при удалении');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">FAQ</h1>
          <p className="text-sm text-[#B0B0B0] mt-0.5">
            Перетащите строки для изменения порядка
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
          <Plus size={14} />
          Добавить вопрос
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-[#B0B0B0] text-sm">
          Вопросы не добавлены
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <FaqRow
              key={item.id}
              item={item}
              index={i}
              onEdit={() => { setEditItem(item); setFormOpen(true); }}
              onDelete={() => setDeleteId(item.id)}
              onToggle={() => handleToggle(item)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggingIdx === i}
            />
          ))}
        </div>
      )}

      <FaqFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
        item={editItem}
      />
      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить вопрос"
        message="Вопрос будет удалён безвозвратно. Продолжить?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
