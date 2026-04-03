import Link from 'next/link';
import { Home, LayoutGrid } from 'lucide-react';

export default function StoreNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md w-full">
        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="text-[120px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#003087] to-[#1A3A8F] leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-[#003087]/10 border border-[#003087]/30 flex items-center justify-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#003087"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <line x1="11" y1="8" x2="11" y2="11" />
                  <line x1="11" y1="14" x2="11.01" y2="14" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Страница не найдена в магазине
        </h1>
        <p className="text-[#B0B0B0] text-sm leading-relaxed mb-8">
          Похоже, эта страница была удалена или её никогда не существовало. Перейдите в каталог — там точно найдётся что-то интересное.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#0044CC] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            <LayoutGrid size={16} />
            Перейти в каталог
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#242444] hover:bg-[#2E2E54] border border-[#3A3A5C] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            <Home size={16} />
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
