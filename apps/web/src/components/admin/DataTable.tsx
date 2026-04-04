'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  selectable?: boolean;
  onSelectionChange?: (ids: number[]) => void;
  idKey?: string;
  emptyMessage?: string;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="border-b border-[#2D2D4A]">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 rounded-md" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onSort,
  selectable = false,
  onSelectionChange,
  idKey = 'id',
  emptyMessage = 'Нет данных',
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (key: string) => {
    if (!onSort) return;
    let newDir: SortDir;
    if (sortKey === key) {
      newDir = sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc';
    } else {
      newDir = 'asc';
    }
    setSortKey(newDir ? key : null);
    setSortDir(newDir);
    if (newDir) onSort(key, newDir);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((row) => row[idKey] as number);
      setSelectedIds(new Set(allIds));
      onSelectionChange?.(allIds);
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
    onSelectionChange?.(Array.from(next));
  };

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(row[idKey] as number));
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="overflow-x-auto rounded-xl border border-[#2D2D4A]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111827] border-b border-[#2D2D4A]">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2D2D4A] bg-[#1E2030] accent-[#003087] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider whitespace-nowrap',
                    col.sortable && onSort && 'cursor-pointer hover:text-white select-none',
                    col.headerClassName,
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && onSort && (
                      <span className="inline-flex flex-col opacity-50">
                        {sortKey === col.key && sortDir === 'asc' ? (
                          <ChevronUp size={14} className="text-[#4DA6FF] opacity-100" />
                        ) : sortKey === col.key && sortDir === 'desc' ? (
                          <ChevronDown size={14} className="text-[#4DA6FF] opacity-100" />
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} colCount={columns.length + (selectable ? 1 : 0)} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-16 text-center text-[#B0B0B0]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#1E2030] flex items-center justify-center text-[#2D2D4A] text-2xl">
                      ○
                    </div>
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const rowId = row[idKey] as number;
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr
                    key={rowId ?? rowIdx}
                    className={cn(
                      'border-b border-[#2D2D4A] transition-colors duration-150',
                      rowIdx % 2 === 0 ? 'bg-[#111827]' : 'bg-[#131424]',
                      isSelected && 'bg-[#001E4A]/40',
                      'hover:bg-[#1E2030]',
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          className="w-4 h-4 rounded border-[#2D2D4A] bg-[#1E2030] accent-[#003087] cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('px-4 py-3 text-[#E0E0E0]', col.className)}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-[#B0B0B0]">
            Показано {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} из {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-200',
                    page === pageNum
                      ? 'bg-[#003087] text-white shadow-[0_0_12px_rgba(0,48,135,0.4)]'
                      : 'text-[#B0B0B0] hover:text-white hover:bg-[#1E2030]',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
