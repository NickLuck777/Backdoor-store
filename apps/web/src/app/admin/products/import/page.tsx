'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useImportProducts } from '@/lib/hooks/useAdmin';
import { CsvImportZone } from '@/components/admin/CsvImportZone';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

const CSV_COLUMNS = [
  { name: 'title', required: true, desc: 'Название продукта' },
  { name: 'slug', required: true, desc: 'URL-slug (уникальный)' },
  { name: 'type', required: true, desc: 'GAME | SUBSCRIPTION | TOPUP_CARD | DONATE | ACCOUNT' },
  { name: 'region', required: true, desc: 'TURKEY | INDIA | UKRAINE' },
  { name: 'price', required: true, desc: 'Цена в рублях (число)' },
  { name: 'originalPrice', required: false, desc: 'Оригинальная цена (опционально)' },
  { name: 'discount', required: false, desc: 'Скидка в % (опционально)' },
  { name: 'imageUrl', required: false, desc: 'URL изображения (опционально)' },
  { name: 'edition', required: false, desc: 'Издание: Standard, Deluxe (опционально)' },
  { name: 'platform', required: false, desc: 'PS4 | PS5 | PS4_PS5 (опционально)' },
];

const EXAMPLE_CSV = `title,slug,type,region,price,originalPrice,discount,imageUrl,edition,platform
"God of War: Ragnarok",god-of-war-ragnarok,GAME,TURKEY,3500,4200,17,https://example.com/gow.jpg,Standard,PS4_PS5
"PS Plus Essential 1 Month",ps-plus-essential-1m,SUBSCRIPTION,TURKEY,700,,,,,
"PSN Top-Up 500 TL",psn-topup-500-try,TOPUP_CARD,TURKEY,1800,,,,,
`;

function downloadExampleCsv() {
  const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductsImportPage() {
  const mutation = useImportProducts();

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await mutation.mutateAsync(formData);
      toast.success('Импорт завершён');
    } catch {
      toast.error('Ошибка при импорте');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Импорт продуктов</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">Загрузите CSV файл для массового добавления или обновления продуктов</p>
      </div>

      {/* CSV format guide */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#4DA6FF]" />
            <h3 className="text-sm font-semibold text-white">Формат CSV файла</h3>
          </div>
          <Button variant="outline" size="sm" onClick={downloadExampleCsv}>
            <Download size={14} />
            Скачать шаблон
          </Button>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D4A]">
                <th className="pb-2 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Столбец</th>
                <th className="pb-2 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Обязателен</th>
                <th className="pb-2 text-left text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider">Описание</th>
              </tr>
            </thead>
            <tbody>
              {CSV_COLUMNS.map((col, i) => (
                <tr key={col.name} className={i % 2 === 0 ? 'bg-[#1A1C2A]' : ''}>
                  <td className="py-2 pr-4">
                    <code className="text-xs bg-[#111827] text-[#4DA6FF] px-2 py-0.5 rounded-md font-mono">
                      {col.name}
                    </code>
                  </td>
                  <td className="py-2 pr-4">
                    {col.required ? (
                      <span className="text-xs text-[#00C853] font-semibold">Да</span>
                    ) : (
                      <span className="text-xs text-[#B0B0B0]">Нет</span>
                    )}
                  </td>
                  <td className="py-2 text-xs text-[#B0B0B0]">{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import zone */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Загрузить файл</h3>
        <CsvImportZone
          onImport={handleImport}
          isLoading={mutation.isPending}
          result={mutation.data ?? null}
        />
      </div>
    </div>
  );
}
