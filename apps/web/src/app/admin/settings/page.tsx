'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Store, Bell, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Настройки</h1>
        <p className="text-sm text-[#B0B0B0] mt-0.5">Общие настройки панели управления</p>
      </div>

      {/* Store settings */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A] flex items-center gap-2">
          <Store size={16} className="text-[#4DA6FF]" />
          <h3 className="text-sm font-semibold text-white">Настройки магазина</h3>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="admin-label">Название магазина</label>
            <Input defaultValue="Reloc Store" />
          </div>
          <div>
            <label className="admin-label">Email для уведомлений</label>
            <Input type="email" defaultValue="admin@reloc.store" />
          </div>
          <div>
            <label className="admin-label">Telegram для уведомлений</label>
            <Input defaultValue="@reloc_admin" />
          </div>
          <div className="flex justify-end">
            <Button size="sm">Сохранить</Button>
          </div>
        </div>
      </div>

      {/* Notification settings */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A] flex items-center gap-2">
          <Bell size={16} className="text-[#4DA6FF]" />
          <h3 className="text-sm font-semibold text-white">Уведомления</h3>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {[
            { label: 'Уведомлять о новых заказах', defaultChecked: true },
            { label: 'Уведомлять о низком запасе кодов', defaultChecked: true },
            { label: 'Уведомлять о новых пользователях', defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="w-4 h-4 rounded border-border bg-input accent-accent cursor-pointer"
              />
              <span className="text-sm text-[#E0E0E0]">{item.label}</span>
            </label>
          ))}
          <div className="flex justify-end">
            <Button size="sm">Сохранить</Button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#1E2030] border border-[#2D2D4A] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2D2D4A] flex items-center gap-2">
          <Shield size={16} className="text-[#4DA6FF]" />
          <h3 className="text-sm font-semibold text-white">Безопасность</h3>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="admin-label">Текущий пароль</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="admin-label">Новый пароль</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="admin-label">Подтвердите новый пароль</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="flex justify-end">
            <Button size="sm" variant="outline">Изменить пароль</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
