import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

// Inline PS controller SVG
function PSControllerSVG() {
  return (
    <svg
      viewBox="0 0 200 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-40 h-auto opacity-30"
    >
      {/* Controller body */}
      <path
        d="M40 45 C15 45 5 70 10 95 C15 115 35 125 55 110 L70 90 H130 L145 110 C165 125 185 115 190 95 C195 70 185 45 160 45 L130 40 L115 20 H85 L70 40 Z"
        fill="#3A3A5C"
        stroke="#003087"
        strokeWidth="2"
      />
      {/* Left analog stick */}
      <circle cx="70" cy="82" r="12" fill="#242444" stroke="#3A3A5C" strokeWidth="1.5" />
      <circle cx="70" cy="82" r="6" fill="#1A1A2E" />
      {/* Right analog stick */}
      <circle cx="120" cy="82" r="12" fill="#242444" stroke="#3A3A5C" strokeWidth="1.5" />
      <circle cx="120" cy="82" r="6" fill="#1A1A2E" />
      {/* D-pad */}
      <rect x="55" y="55" width="10" height="28" rx="2" fill="#242444" />
      <rect x="46" y="64" width="28" height="10" rx="2" fill="#242444" />
      {/* Buttons — cross, circle, square, triangle */}
      <circle cx="148" cy="65" r="5" fill="#003087" opacity="0.8" /> {/* cross */}
      <circle cx="160" cy="57" r="5" fill="#CC0000" opacity="0.8" /> {/* circle */}
      <rect x="136" y="53" width="10" height="10" rx="1.5" fill="#555588" opacity="0.8" /> {/* square */}
      <polygon points="154,42 160,54 148,54" fill="#007755" opacity="0.8" /> {/* triangle */}
      {/* Touchpad */}
      <rect x="88" y="57" width="24" height="16" rx="6" fill="#2A2A50" stroke="#3A3A5C" strokeWidth="1" />
      {/* Share / Options */}
      <circle cx="82" cy="52" r="4" fill="#2A2A50" stroke="#3A3A5C" strokeWidth="1" />
      <circle cx="118" cy="52" r="4" fill="#2A2A50" stroke="#3A3A5C" strokeWidth="1" />
      {/* PS button */}
      <circle cx="100" cy="52" r="7" fill="#003087" opacity="0.9" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Controller illustration */}
        <div className="flex justify-center mb-6">
          <PSControllerSVG />
        </div>

        {/* 404 */}
        <div className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover mb-4 leading-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Страница не найдена</h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          Кажется, эта страница улетела в другой регион. Попробуйте поискать нужное или вернитесь на главную.
        </p>

        {/* Search */}
        <div className="mb-6">
          <SearchBar placeholder="Поиск игр..." className="w-full" />
        </div>

        {/* Home link */}
        <Link href="/">
          <Button variant="default" size="md">
            <Home size={15} />
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
