import type { Metadata } from 'next';
import ContactsClient from './ContactsClient';

export const metadata: Metadata = {
  title: 'Контакты — Reloc Store',
  description: 'Связаться с поддержкой Reloc Store. Telegram @reloc_support, email support@reloc.ru. Работаем ежедневно 9:00–23:00 МСК.',
};

export default function ContactsPage() {
  return <ContactsClient />;
}
