'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { removeAdminToken } from '@/lib/admin-api';
import {
  LayoutDashboard,
  Package,
  Upload,
  Tag,
  Grid3X3,
  ClipboardList,
  KeyRound,
  FileText,
  HelpCircle,
  Image,
  Ticket,
  DollarSign,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  Store,
  Menu,
  X,
} from 'lucide-react';

// ─── Nav structure ─────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Дашборд',
    href: '/admin',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Продукты',
    icon: <Package size={18} />,
    children: [
      { label: 'Все продукты', href: '/admin/products' },
      { label: 'Импорт', href: '/admin/products/import' },
      { label: 'Скидки', href: '/admin/products/discounts' },
    ],
  },
  {
    label: 'Категории',
    href: '/admin/categories',
    icon: <Grid3X3 size={18} />,
  },
  {
    label: 'Заказы',
    href: '/admin/orders',
    icon: <ClipboardList size={18} />,
  },
  {
    label: 'Коды',
    icon: <KeyRound size={18} />,
    children: [
      { label: 'Инвентарь', href: '/admin/codes' },
      { label: 'Импорт', href: '/admin/codes/import' },
    ],
  },
  {
    label: 'Контент',
    icon: <FileText size={18} />,
    children: [
      { label: 'Страницы', href: '/admin/content/pages' },
      { label: 'FAQ', href: '/admin/content/faq' },
      { label: 'Баннеры', href: '/admin/content/banners' },
    ],
  },
  {
    label: 'Промокоды',
    href: '/admin/promo',
    icon: <Ticket size={18} />,
  },
  {
    label: 'Курсы валют',
    href: '/admin/rates',
    icon: <DollarSign size={18} />,
  },
  {
    label: 'Пользователи',
    href: '/admin/users',
    icon: <Users size={18} />,
  },
  {
    label: 'Настройки',
    href: '/admin/settings',
    icon: <Settings size={18} />,
  },
];

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function NavItemComponent({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((c) => pathname.startsWith(c.href)) ?? false;

  const [open, setOpen] = React.useState(isActive);

  if (item.children) {
    const anyChildActive = item.children.some((c) => pathname.startsWith(c.href));
    return (
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
            anyChildActive
              ? 'text-white bg-[#003087]/20 border-l-2 border-[#003087]'
              : 'text-[#B0B0B0] hover:text-white hover:bg-white/5',
          )}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                size={14}
                className={cn(
                  'flex-shrink-0 transition-transform duration-200',
                  open && 'rotate-180',
                )}
              />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-[#2D2D4A] pl-4">
            {item.children.map((child) => {
              const childActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200',
                    childActive
                      ? 'text-white bg-[#003087]/20'
                      : 'text-[#B0B0B0] hover:text-white hover:bg-white/5',
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
        'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isActive
          ? 'text-white bg-[#003087]/20 border-l-2 border-[#003087] shadow-[0_0_12px_rgba(0,48,135,0.2)]'
          : 'text-[#B0B0B0] hover:text-white hover:bg-white/5',
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    removeAdminToken();
    router.push('/admin/login');
  };

  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[240px]';

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'bg-[#1A1A2E] border-r border-[#2D2D4A]',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          sidebarWidth,
          // Mobile: hidden by default, shown when mobileOpen
          'max-lg:translate-x-[-100%]',
          mobileOpen && 'max-lg:translate-x-0 max-lg:w-[240px]',
        )}
      >
        {/* Sidebar header */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-[#2D2D4A] px-4 flex-shrink-0',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#003087] flex items-center justify-center text-white flex-shrink-0">
                <Store size={14} />
              </div>
              <span className="font-bold text-sm text-white">Admin Panel</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-[#B0B0B0] hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Menu size={16} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex w-7 h-7 items-center justify-center rounded-lg text-[#B0B0B0] hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-[#2D2D4A]">
          {NAV_ITEMS.map((item) => (
            <NavItemComponent
              key={item.label}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className={cn('p-3 border-t border-[#2D2D4A] flex-shrink-0')}>
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full',
              'text-[#B0B0B0] hover:text-[#FF1744] hover:bg-[#FF1744]/10',
              'transition-all duration-200',
              collapsed && 'justify-center',
            )}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]',
        )}
      >
        {/* Top header */}
        <header className="h-16 bg-[#1A1A2E] border-b border-[#2D2D4A] flex items-center px-6 flex-shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-4 text-[#B0B0B0] hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-[#B0B0B0]">Backdoor Store</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-white">Администратор</span>
              <span className="text-[10px] text-[#B0B0B0]">admin@backdoor.store</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#003087] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-[#111827] p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
