# Backdoor Store — Design Specification

## Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#1A1A2E` | Page background, body |
| `card` | `#242444` | Cards, modals, dropdowns |
| `input` | `#2E2E50` | Input fields, hover states |
| `border` | `#3A3A5C` | Borders, dividers |
| `accent` | `#003087` | PS Blue — primary CTA, active states |
| `accent-hover` | `#0070D1` | PS Blue hover, gradients, links |
| `foreground` | `#FFFFFF` | Primary text |
| `muted` | `#B0B0B0` | Secondary text, placeholders, icons |
| `discount-green` | `#00C853` | Discount badges, success states |
| `discount-red` | `#FF1744` | Destructive, error states, cart badge |
| `ps-gold` | `#FFD700` | Preorder badge, premium accents |
| `footer-bg` | `#0D0D1F` | Footer background (slightly darker than body) |

### Gradient palette
- Hero orb 1: `radial-gradient(circle, rgba(0,48,135,0.2), transparent)` — large, top-left
- Hero orb 2: `radial-gradient(circle, rgba(0,112,209,0.15), transparent)` — medium, bottom-right
- Hero heading: `linear-gradient(to right, #0070D1, #00A8FF)` on clipped text
- Card gradient overlay: `linear-gradient(to top, rgba(36,36,68,0.8), transparent)` — cover image bottom
- Image placeholder: `linear-gradient(to bottom-right, #003087, #1A1A4E, #0070D1)`

---

## Typography

**Font pairing:** Inter (single versatile typeface with weight range)
- Source: `next/font/google` with `subsets: ['latin', 'cyrillic']`
- Already loaded in `app/layout.tsx`

| Role | Weight | Size | Class |
|------|--------|------|-------|
| Hero H1 | 800 (extrabold) | 48–64px | `text-5xl lg:text-6xl font-extrabold` |
| Section heading | 700 (bold) | 20px | `text-xl font-bold` |
| Product title (card) | 600 (semibold) | 14px | `text-sm font-semibold` |
| Price (lg) | 800 (extrabold) | 30px | `text-3xl font-extrabold` |
| Price (md) | 700 (bold) | 20px | `text-xl font-bold` |
| Body / description | 400 (regular) | 14px | `text-sm` |
| Muted/secondary | 400 (regular) | 12px | `text-xs text-muted` |
| Label/uppercase | 700 (bold) | 10px | `text-[10px] font-bold uppercase tracking-widest` |

---

## Spacing Scale

Using Tailwind default scale (4px base unit):
- Component padding: `p-3` (12px) for cards, `p-5` (20px) for modals
- Section gaps: `gap-12` (48px) between carousel sections
- Card gap: `gap-4` (16px) in grids and carousels
- Header height: 64px (`h-16`)
- Mobile header height: 56px

---

## Shadow System

| Level | Class / Value |
|-------|---------------|
| Card default | `border border-border` (no shadow) |
| Card hover | `shadow-[0_16px_40px_rgba(0,48,135,0.3)]` |
| Button CTA | `shadow-[0_0_20px_rgba(0,48,135,0.4)]` hover: `shadow-[0_0_28px_rgba(0,112,209,0.5)]` |
| Discount badge | `shadow-[0_2px_8px_rgba(0,200,83,0.4)]` |
| Modal | `shadow-[0_24px_64px_rgba(0,0,0,0.6)]` |
| Dropdown | `shadow-[0_16px_40px_rgba(0,0,0,0.5)]` |
| Active accent element | `shadow-[0_0_12px_rgba(0,48,135,0.5)]` |
| Cart badge | `shadow-[0_2px_8px_rgba(255,23,68,0.5)]` |

---

## Animation Spec

### Timing functions
- Default interactive: `ease-[cubic-bezier(0.4,0,0.2,1)]` — Material Design standard
- Drawer/slide: same cubic-bezier, `duration: 350ms`
- Micro-interactions: `200ms` for color/opacity changes
- Card hover: `300ms` translateY, `500ms` image scale
- Dropdown appear: `180ms`
- Modal appear: `250ms` scale + opacity

### Motion patterns (Framer Motion)
```
// Page element entrance
initial: { opacity: 0, y: 16 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }

// Staggered list (delay per item)
transition: { delay: i * 0.05, max: 0.3 }

// Mobile drawer
initial: { x: '-100%' }
animate: { x: 0 }
transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }

// Dropdown
initial: { opacity: 0, y: -6, scale: 0.97 }
animate: { opacity: 1, y: 0, scale: 1 }
transition: { duration: 0.18 }

// Accordion height
initial: { height: 0, opacity: 0 }
animate: { height: 'auto', opacity: 1 }
transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }

// Cart badge bump
animate: { scale: [1, 1.25, 1] }
transition: { duration: 0.35 }
```

### CSS-only animations (Tailwind keyframes)
- `animate-shimmer` — skeleton loading shimmer, 2s infinite, `bg-[length:200%_100%]`
- `animate-spin` — button loading spinner (Loader2 icon)

---

## Component Variants

### Button
| Variant | Background | Text | Shadow | Hover |
|---------|-----------|------|--------|-------|
| default | `#003087` | white | PS blue glow | `#0070D1` + stronger glow |
| ghost | transparent | white | none | `rgba(255,255,255,0.1)` bg |
| outline | transparent | white | none | border + text accent-hover |
| destructive | `#FF1744` | white | red glow | `#CC0000` |

Sizes: sm (h-8, text-sm), md (h-10, text-sm), lg (h-12, text-base)
Loading: Loader2 spinner replaces left icon slot

### Badge
| Variant | Background | Text | Notes |
|---------|-----------|------|-------|
| discount | `#00C853` | white | Pill shape, green glow |
| preorder | `#FFD700` | black | Gold pill |
| platform | `rgba(0,0,0,0.7)` | white | Small, border, blur |
| region | `#242444` | `#B0B0B0` | With flag emoji |
| new | `#003087` | white | Blue pill |

---

## Background Treatments

### Hero section
- 3 blurred color orbs (absolute positioned, pointer-events-none):
  - 500px circle, `bg-accent/20`, `blur-[120px]`, top-left
  - 400px circle, `bg-accent-hover/15`, `blur-[100px]`, bottom-right
  - 300px circle, `bg-ps-gold/5`, `blur-[80px]`, center-right
- Dot grid overlay: 40px grid, `#3A3A5C` at `opacity: 0.04`

### Cards
- Background: `#242444`
- Border: `#3A3A5C` at rest, `rgba(0,48,135,0.4)` on hover
- No background orbs — clean surface

### Header (scrolled)
- `bg-background/90` + `backdrop-blur-md`
- `border-b border-border/50`
- `shadow-[0_4px_24px_rgba(0,0,0,0.4)]`

---

## Mobile Breakpoints

- Base: 375px (mobile-first)
- `sm`: 640px — 2 cards wide, trust bar 3-col
- `md`: 768px — desktop search visible, header 64px
- `lg`: 1024px — filter sidebar visible, 4-col grid, 5 carousel cards
- `xl`: 1280px — max-width container

### Carousel widths per breakpoint
- Mobile: `w-44` (176px) — 2 visible cards
- sm: `w-48` (192px) — 3 visible cards  
- md: `w-52` (208px) — 5 visible cards on lg

### Grid cols
- `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

---

## Key Design Decisions

1. **No inline styles** — all design tokens defined in `tailwind.config.ts`, used via class names only
2. **Dark mode as base** — `darkMode: ['class']` with `<html class="dark">` — no light mode implemented
3. **PlayStation aesthetic without licensing** — navy blue palette evokes PS Store without using official assets; custom SVG PlayStation logo placeholder
4. **Skeleton over spinner** — content-aware skeleton shapes (3:4 aspect for card images) instead of generic spinners
5. **Framer Motion for meaningful animations** — drawer, modal, accordion, badges; NOT for every element (avoid motion overload)
6. **IntersectionObserver lazy loading** — homepage carousels only fetch/render when approaching viewport
7. **Embla Carousel** — touch-friendly, no CSS scroll-snap conflict, arrow buttons appear on group hover only
8. **Zustand + persist middleware** — cart and region persist to localStorage; no SSR hydration issues via `partialize`
