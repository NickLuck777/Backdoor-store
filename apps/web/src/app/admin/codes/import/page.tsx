'use client';

import * as React from 'react';
import toast from 'react-hot-toast';
import { useImportCodes } from '@/lib/hooks/useAdmin';
import { CsvImportZone } from '@/components/admin/CsvImportZone';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

const CSV_COLUMNS = [
  { name: 'code', required: true, desc: 'Код пополнения (строка)' },
  { name: 'denomination', required: true, desc: 'Номинал (число): 100, 200, 500, 1000...' },
  { name: 'currency', required: true, desc: 'TRY | INR | UAH' },
];

const EXAMPLE_CSV = `code,denomination,currency
ABCD-1234-EFGH-5678,500,TRY
IJKL-9012-MNOP-3456,1000,TRY
QRST-7890-UVWX-1234,100,INR
YZAB-5678-CDEF-9012,500,UAH
`;

function downloadExampleCsv() {
  const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'codes_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function CodesImportPage() {
  const mutation = useImportCodes();

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await mutation.mutateAsync(formData);
      toast.success('Коды импортированы');
    } catch {
      toast.error('Ошибка при импорте кодов');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Импорт кодов</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">
          Загрузите CSV файл для пополнения инвентаря кодов
        </p>
      </div>

      {/* Format guide */}
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
                    <span className="text-xs text-[#00C853] font-semibold">Да</span>
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

      {/* Tips */}
      <div className="bg-[#111827] border border-[#2D2D4A] rounded-2xl p-5">
        <h4 className="text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider mb-3">Важно</h4>
        <ul className="flex flex-col gap-2 text-sm text-[#B0B0B0]">
          <li className="flex items-start gap-2">
            <span className="text-[#003087] mt-0.5">•</span>
            Дубликаты кодов будут пропущены автоматически
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#003087] mt-0.5">•</span>
            Допустимые валюты: TRY, INR, UAH
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#003087] mt-0.5">•</span>
            Коды сразу становятся доступными для продажи после импорта
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#003087] mt-0.5">•</span>
            Максимальный размер файла: 10 MB
          </li>
        </ul>
      </div>
    </div>
  );
}
