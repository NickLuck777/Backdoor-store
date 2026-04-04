'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { setAdminToken } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

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
      const { data } = await api.post<{ accessToken: string; user: { role: string } }>(
        '/auth/login',
        { email, password },
      );

      if (data.user.role !== 'ADMIN' && data.user.role !== 'MANAGER') {
        setError('Доступ запрещён. Недостаточно прав.');
        return;
      }

      setAdminToken(data.accessToken);
      router.push(from);
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
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#003087]/10 blur-[120px] -top-32 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#0070D1]/8 blur-[100px] bottom-0 right-0" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#003087] flex items-center justify-center shadow-[0_0_28px_rgba(0,48,135,0.5)] mb-4">
            <Store size={28} />
          </div>
          <h1 className="text-xl font-bold text-white">Reloc Store</h1>
          <p className="text-sm text-[#B0B0B0] mt-1">Панель управления</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
          <h2 className="text-base font-semibold text-white mb-6">Войти в панель управления</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@reloc.store"
                leftIcon={<Mail size={16} />}
                autoComplete="email"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#B0B0B0] uppercase tracking-wider mb-1.5">
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
        </div>

        <p className="text-center text-xs text-[#B0B0B0]/50 mt-6">
          Только для авторизованных сотрудников
        </p>
      </div>
    </div>
  );
}
