'use client';

import * as React from 'react';
import { Mail, Clock, MapPin, Send } from 'lucide-react';
import { useContactForm } from '@/lib/hooks/useContact';

function ContactForm() {
  const { mutate, isPending, isSuccess, isError } = useContactForm();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Введите ваше имя';
    if (!email.trim()) newErrors.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Некорректный email';
    if (!message.trim()) newErrors.message = 'Введите сообщение';
    else if (message.trim().length < 10)
      newErrors.message = 'Сообщение слишком короткое (минимум 10 символов)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutate({ name: name.trim(), email: email.trim(), message: message.trim() });
  }

  if (isSuccess) {
    return (
      <div className="bg-[#003087]/10 border border-[#003087]/40 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#00C853]/20 border border-[#00C853]/40 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Сообщение отправлено!</h3>
        <p className="text-[#B0B0B0] text-sm">Ответим в течение 24 часов на указанный email.</p>
      </div>
    );
  }

  const inputClass =
    'w-full bg-[#1A1A2E] border border-[#3A3A5C] text-white placeholder-[#B0B0B0] ' +
    'rounded-xl px-4 py-3 text-sm outline-none focus:border-[#003087] focus:ring-2 ' +
    'focus:ring-[#003087]/20 transition-all';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="block text-sm text-[#B0B0B0] mb-1.5">Ваше имя</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          className={inputClass}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm text-[#B0B0B0] mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={inputClass}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm text-[#B0B0B0] mb-1.5">Сообщение</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишите ваш вопрос или проблему..."
          rows={5}
          className={`${inputClass} resize-none`}
        />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>
      {isError && (
        <p className="text-red-400 text-sm">
          Ошибка отправки. Пожалуйста, напишите нам в Telegram напрямую.
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#0044CC]
                   disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold
                   px-6 py-3.5 rounded-xl transition-colors duration-200"
      >
        {isPending ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Отправляем...
          </>
        ) : (
          <>
            <Send size={16} />
            Отправить
          </>
        )}
      </button>
    </form>
  );
}

export default function ContactsClient() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1E1E3A] to-background pt-16 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-3">Контакты</h1>
          <p className="text-[#B0B0B0] text-lg">
            Готовы помочь ежедневно с 9:00 до 23:00 МСК
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {/* Email */}
            <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center">
                  <Mail size={16} className="text-[#6699FF]" />
                </div>
                <span className="text-white font-semibold">Email</span>
              </div>
              <a
                href="mailto:support@backdoor.store"
                className="text-[#6699FF] hover:text-white transition-colors text-sm"
              >
                support@backdoor.store
              </a>
            </div>

            {/* Telegram */}
            <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#6699FF">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.928l-2.946-.924c-.64-.203-.652-.64.136-.95l11.5-4.433c.533-.194.998.13.612.627z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">Telegram</span>
              </div>
              <a
                href="https://t.me/backdoor_support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6699FF] hover:text-white transition-colors text-sm"
              >
                @backdoor_support
              </a>
            </div>

            {/* Working hours */}
            <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center">
                  <Clock size={16} className="text-[#6699FF]" />
                </div>
                <span className="text-white font-semibold">Режим работы</span>
              </div>
              <p className="text-[#B0B0B0] text-sm">Пн-Вс, 9:00–23:00 МСК</p>
            </div>

            {/* VK */}
            <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#4C75A3]/10 border border-[#4C75A3]/30 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#4C75A3">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-.6-1.49.408v1.306c0 .371-.111.6-1.053.6C11.3 17.723 9.5 16.56 8.3 14.56c-1.35-2.17-1.7-3.71-1.7-4.01 0-.279.077-.57.61-.57h1.744c.46 0 .63.2.803.666.9 2.59 2.389 4.86 3.01 4.86.233 0 .34-.107.34-.693v-2.7c-.07-1.244-.729-1.35-.729-1.793 0-.214.168-.43.437-.43h2.743c.371 0 .5.2.5.632v3.633c0 .371.162.5.264.5.233 0 .43-.129.86-.56 1.33-1.492 2.28-3.79 2.28-3.79.129-.279.347-.54.807-.54h1.745c.525 0 .639.27.525.64-.215.997-2.3 3.93-2.3 3.93-.183.3-.252.43 0 .764.183.253 1.02 1.05 1.545 1.684.487.55.847 1.01.968 1.333.1.317-.047.48-.44.48z"/>
                  </svg>
                </div>
                <span className="text-white font-semibold">ВКонтакте</span>
              </div>
              <a
                href="https://vk.com/backdoorstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6699FF] hover:text-white transition-colors text-sm"
              >
                vk.com/backdoorstore
              </a>
            </div>

            {/* Requisites */}
            <div className="bg-[#1E1E38] border border-[#3A3A5C] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center">
                  <MapPin size={16} className="text-[#6699FF]" />
                </div>
                <span className="text-white font-semibold">Реквизиты</span>
              </div>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#B0B0B0]">Юр. лицо</dt>
                  <dd className="text-white">ИП Иванов И.И.</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#B0B0B0]">ИНН</dt>
                  <dd className="text-white font-mono">000000000000</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-[#242444] border border-[#3A3A5C] rounded-2xl p-6 md:p-8 self-start">
            <h2 className="text-xl font-bold text-white mb-1">Написать нам</h2>
            <p className="text-[#B0B0B0] text-sm mb-6">
              Заполните форму — ответим в течение суток
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
