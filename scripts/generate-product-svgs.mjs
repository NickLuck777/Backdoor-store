// One-shot generator for PSN top-up cards, PS Plus subscriptions, and banners.
// Run from repo root: node scripts/generate-product-svgs.mjs
// Outputs into apps/web/public/images/{cards,banners}/

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CARDS = resolve(ROOT, 'apps/web/public/images/cards');
const BANNERS = resolve(ROOT, 'apps/web/public/images/banners');
mkdirSync(CARDS, { recursive: true });
mkdirSync(BANNERS, { recursive: true });

// ===========================================================================
// PSN TOP-UP CARDS — 600x800, dark blue PSN brand
// ===========================================================================
const psnCard = ({ amount, currency, region, accent = '#0070D1', flag = '' }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#003791"/>
      <stop offset="0.6" stop-color="#001a52"/>
      <stop offset="1" stop-color="#000a26"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.25" r="0.65">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="0.4" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#grid)"/>
  <rect width="600" height="800" fill="url(#glow)"/>
  <rect width="600" height="800" fill="url(#shine)"/>

  <!-- Card border -->
  <rect x="24" y="24" width="552" height="752" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>

  <!-- PS logo circle -->
  <circle cx="300" cy="180" r="62" fill="none" stroke="#ffffff" stroke-width="3"/>
  <text x="300" y="205" font-family="Arial Black, Arial, sans-serif" font-size="62" font-weight="900" fill="#ffffff" text-anchor="middle">PS</text>

  <!-- Brand line -->
  <text x="300" y="290" font-family="Arial, sans-serif" font-size="17" fill="#ffffff" text-anchor="middle" letter-spacing="4" font-weight="600">PLAYSTATION®NETWORK</text>
  <line x1="100" y1="320" x2="500" y2="320" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>

  <!-- Denomination -->
  <text x="300" y="500" font-family="Arial Black, Arial, sans-serif" font-size="${amount.length >= 4 ? 140 : 170}" font-weight="900" fill="#ffffff" text-anchor="middle">${amount}</text>
  <text x="300" y="580" font-family="Arial Black, Arial, sans-serif" font-size="56" font-weight="900" fill="#FFD23F" text-anchor="middle" letter-spacing="2">${currency}</text>

  <!-- Footer -->
  <line x1="100" y1="660" x2="500" y2="660" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>
  <text x="300" y="700" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" fill-opacity="0.8" text-anchor="middle" letter-spacing="3" font-weight="600">WALLET TOP-UP</text>
  <text x="300" y="730" font-family="Arial, sans-serif" font-size="15" fill="#ffffff" fill-opacity="0.55" text-anchor="middle" letter-spacing="4">${region}${flag ? ' · ' + flag : ''}</text>
</svg>`;

const cards = [
  { file: 'psn-try-50.svg',   amount: '50',   currency: 'TL',  region: 'TÜRKİYE', flag: '🇹🇷', accent: '#0070D1' },
  { file: 'psn-try-100.svg',  amount: '100',  currency: 'TL',  region: 'TÜRKİYE', flag: '🇹🇷', accent: '#0070D1' },
  { file: 'psn-try-200.svg',  amount: '200',  currency: 'TL',  region: 'TÜRKİYE', flag: '🇹🇷', accent: '#0070D1' },
  { file: 'psn-try-500.svg',  amount: '500',  currency: 'TL',  region: 'TÜRKİYE', flag: '🇹🇷', accent: '#0070D1' },
  { file: 'psn-try-1000.svg', amount: '1000', currency: 'TL',  region: 'TÜRKİYE', flag: '🇹🇷', accent: '#0070D1' },
  { file: 'psn-inr-500.svg',  amount: '500',  currency: 'INR', region: 'INDIA',   flag: '🇮🇳', accent: '#FF9933' },
  { file: 'psn-inr-1000.svg', amount: '1000', currency: 'INR', region: 'INDIA',   flag: '🇮🇳', accent: '#FF9933' },
  { file: 'psn-inr-2000.svg', amount: '2000', currency: 'INR', region: 'INDIA',   flag: '🇮🇳', accent: '#FF9933' },
];

for (const c of cards) {
  // Strip emoji because some renderers don't have emoji glyphs in SVG fonts
  const noEmoji = { ...c, flag: '' };
  writeFileSync(resolve(CARDS, c.file), psnCard(noEmoji));
}

// ===========================================================================
// PS PLUS — 600x800, gold/orange branding
// ===========================================================================
const psPlusCard = ({ tier, tierLabel, gradTop, gradMid, gradBot, accent }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${gradTop}"/>
      <stop offset="0.55" stop-color="${gradMid}"/>
      <stop offset="1" stop-color="${gradBot}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.25" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1.5" fill="#ffffff" fill-opacity="0.08"/>
    </pattern>
  </defs>

  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#dots)"/>
  <rect width="600" height="800" fill="url(#glow)"/>
  <rect width="600" height="800" fill="url(#shine)"/>

  <rect x="24" y="24" width="552" height="752" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>

  <!-- PS logo -->
  <circle cx="300" cy="170" r="58" fill="none" stroke="#ffffff" stroke-width="3"/>
  <text x="300" y="194" font-family="Arial Black, Arial, sans-serif" font-size="58" font-weight="900" fill="#ffffff" text-anchor="middle">PS</text>

  <!-- "PLUS" wordmark -->
  <text x="300" y="320" font-family="Arial Black, Arial, sans-serif" font-size="92" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="6">PLUS</text>

  <!-- Tier badge -->
  <rect x="120" y="380" width="360" height="70" rx="12" fill="#ffffff" fill-opacity="0.95"/>
  <text x="300" y="429" font-family="Arial Black, Arial, sans-serif" font-size="40" font-weight="900" fill="${accent}" text-anchor="middle" letter-spacing="6">${tier}</text>

  <!-- Duration -->
  <text x="300" y="540" font-family="Arial Black, Arial, sans-serif" font-size="80" font-weight="900" fill="#ffffff" text-anchor="middle">3</text>
  <text x="300" y="595" font-family="Arial, sans-serif" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="6" font-weight="700">МЕСЯЦА</text>

  <!-- Footer -->
  <line x1="100" y1="660" x2="500" y2="660" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"/>
  <text x="300" y="700" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" fill-opacity="0.85" text-anchor="middle" letter-spacing="3" font-weight="600">PLAYSTATION®PLUS</text>
  <text x="300" y="730" font-family="Arial, sans-serif" font-size="15" fill="#ffffff" fill-opacity="0.7" text-anchor="middle" letter-spacing="3">${tierLabel}</text>
</svg>`;

writeFileSync(resolve(CARDS, 'ps-plus-essential-3m.svg'), psPlusCard({
  tier: 'ESSENTIAL',
  tierLabel: 'MULTIPLAYER · MONTHLY GAMES',
  gradTop: '#FFD23F',
  gradMid: '#F5A100',
  gradBot: '#A85700',
  accent: '#A85700',
}));

writeFileSync(resolve(CARDS, 'ps-plus-extra-3m.svg'), psPlusCard({
  tier: 'EXTRA',
  tierLabel: 'GAME CATALOG · 400+ GAMES',
  gradTop: '#FF6B35',
  gradMid: '#D43200',
  gradBot: '#6B1500',
  accent: '#9A2400',
}));

// ===========================================================================
// BANNERS — 1920x640, hero-format wide banners
// ===========================================================================
const banner = ({ title, subtitle, cta, gradTop, gradBot, accent }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${gradTop}"/>
      <stop offset="1" stop-color="${gradBot}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.5" r="0.6">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.6"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000000" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1920" height="640" fill="url(#bg)"/>
  <rect width="1920" height="640" fill="url(#grid)"/>
  <rect width="1920" height="640" fill="url(#glow)"/>
  <rect width="1920" height="640" fill="url(#fade)"/>

  <!-- Decorative circles right side -->
  <circle cx="1450" cy="320" r="240" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2"/>
  <circle cx="1450" cy="320" r="180" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2"/>
  <circle cx="1450" cy="320" r="120" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2"/>

  <!-- PS logo right -->
  <circle cx="1450" cy="320" r="60" fill="none" stroke="#ffffff" stroke-width="3"/>
  <text x="1450" y="345" font-family="Arial Black, Arial, sans-serif" font-size="58" font-weight="900" fill="#ffffff" text-anchor="middle">PS</text>

  <!-- Subtitle -->
  <text x="120" y="220" font-family="Arial, sans-serif" font-size="26" fill="${accent}" letter-spacing="6" font-weight="700">${subtitle}</text>

  <!-- Title -->
  <text x="120" y="340" font-family="Arial Black, Arial, sans-serif" font-size="84" font-weight="900" fill="#ffffff" letter-spacing="-1">${title}</text>

  <!-- CTA -->
  <rect x="120" y="410" width="280" height="64" rx="32" fill="#ffffff"/>
  <text x="260" y="452" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" fill="${gradBot}" text-anchor="middle" letter-spacing="2">${cta}</text>
</svg>`;

writeFileSync(resolve(BANNERS, 'turkey-deals.svg'), banner({
  subtitle: 'TÜRKİYE STORE',
  title: 'ЛУЧШИЕ ИГРЫ ПО ЦЕНАМ ТУРЦИИ',
  cta: 'СМОТРЕТЬ →',
  gradTop: '#0070D1',
  gradBot: '#001a52',
  accent: '#FFD23F',
}));

writeFileSync(resolve(BANNERS, 'ps-plus.svg'), banner({
  subtitle: 'PLAYSTATION®PLUS',
  title: 'ИГРАЙ БОЛЬШЕ ЗА МЕНЬШЕ',
  cta: 'ПОДПИСАТЬСЯ →',
  gradTop: '#F5A100',
  gradBot: '#6B1500',
  accent: '#FFFFFF',
}));

writeFileSync(resolve(BANNERS, 'topup-psn.svg'), banner({
  subtitle: 'PLAYSTATION®NETWORK',
  title: 'ПОПОЛНИ КОШЕЛЁК ЗА МИНУТУ',
  cta: 'ПОПОЛНИТЬ →',
  gradTop: '#0070D1',
  gradBot: '#000a26',
  accent: '#00CFFF',
}));

console.log('Generated:');
console.log('  cards:', cards.length + 2, 'files');
console.log('  banners: 3 files');
