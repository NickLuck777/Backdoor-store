'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CsvRow {
  [key: string]: string;
}

interface CsvImportZoneProps {
  onImport: (file: File) => void;
  isLoading?: boolean;
  result?: { created: number; updated: number; errors: string[] } | null;
  accept?: string;
  className?: string;
}

function parseCsvPreview(text: string, maxRows = 5): { headers: string[]; rows: CsvRow[] } {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines
    .slice(1, maxRows + 1)
    .map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      return headers.reduce<CsvRow>((acc, header, i) => {
        acc[header] = values[i] ?? '';
        return acc;
      }, {});
    });

  return { headers, rows };
}

export function CsvImportZone({
  onImport,
  isLoading = false,
  result = null,
  accept = '.csv',
  className,
}: CsvImportZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<{ headers: string[]; rows: CsvRow[] } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = React.useCallback((selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(parseCsvPreview(text));
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleImport = () => {
    if (file) onImport(file);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && inputRef.current?.click()}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'flex flex-col items-center justify-center gap-3 text-center',
          file ? 'p-6' : 'p-12 cursor-pointer',
          isDragging
            ? 'border-[#003087] bg-[#003087]/10 scale-[1.01]'
            : file
            ? 'border-[#00C853]/50 bg-[#001A0D]/40'
            : 'border-[#2D2D4A] bg-[#111827] hover:border-[#003087]/50 hover:bg-[#1E2030]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-[#003087]/20 flex items-center justify-center text-[#4DA6FF] flex-shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-[#B0B0B0]">
                {(file.size / 1024).toFixed(1)} KB
                {preview && ` · ${preview.rows.length}+ строк`}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-[#B0B0B0] hover:text-white transition-colors duration-200 p-1.5 hover:bg-white/10 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#1E2030] border border-[#2D2D4A] flex items-center justify-center text-[#B0B0B0]">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Перетащите CSV файл</p>
              <p className="text-xs text-[#B0B0B0] mt-1">или нажмите для выбора файла</p>
            </div>
          </>
        )}
      </div>

      {/* Preview table */}
      {preview && preview.headers.length > 0 && (
        <div className="rounded-xl border border-[#2D2D4A] overflow-x-auto">
          <div className="px-4 py-2 border-b border-[#2D2D4A] bg-[#111827]">
            <span className="text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">
              Предпросмотр (первые {preview.rows.length} строк)
            </span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#0F0F1A]">
                {preview.headers.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold text-[#B0B0B0] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, i) => (
                <tr key={i} className={cn('border-t border-[#2D2D4A]', i % 2 === 0 ? 'bg-[#111827]' : 'bg-[#131424]')}>
                  {preview.headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-[#E0E0E0] max-w-[200px] truncate">
                      {row[h] || <span className="text-[#2D2D4A]">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import result */}
      {result && (
        <div className={cn(
          'rounded-xl border p-4',
          result.errors.length > 0
            ? 'border-[#FF1744]/30 bg-[#2A0009]/40'
            : 'border-[#00C853]/30 bg-[#001A0D]/40',
        )}>
          <div className="flex items-start gap-3">
            {result.errors.length > 0 ? (
              <AlertCircle size={18} className="text-[#FF1744] flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="text-[#00C853] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                Создано: {result.created} · Обновлено: {result.updated}
                {result.errors.length > 0 && ` · Ошибок: ${result.errors.length}`}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i} className="text-xs text-[#FF8080]">
                      {err}
                    </li>
                  ))}
                  {result.errors.length > 5 && (
                    <li className="text-xs text-[#B0B0B0]">
                      ...и ещё {result.errors.length - 5} ошибок
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {file && !result && (
        <div className="flex justify-end">
          <Button onClick={handleImport} loading={isLoading} disabled={isLoading}>
            Импортировать
          </Button>
        </div>
      )}
    </div>
  );
}

export default CsvImportZone;
