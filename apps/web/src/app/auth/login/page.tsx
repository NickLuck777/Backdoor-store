'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Lock, Mail, AlertCircle, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password },
      );
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      router.push('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка сервера. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex-1 pt-16 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-[0_0_28px_rgba(0,48,135,0.5)] mb-4">
              <User size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Вход в аккаунт</h1>
            <p className="text-sm text-muted mt-1">Войдите, чтобы отслеживать заказы</p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  leftIcon={<Mail size={16} />}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Пароль
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock size={16} />}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-xl px-3 py-2.5">
                  <AlertCircle size={16} className="text-[#FF1744] flex-shrink-0" />
                  <p className="text-sm text-[#FF8080]">{error}</p>
                </div>
              )}

              <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
                Войти
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/auth/register" className="text-sm text-accent-hover hover:underline">
                Нет аккаунта? Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
