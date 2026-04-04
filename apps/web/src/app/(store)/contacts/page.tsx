import type { Metadata } from 'next';
import ContactsClient from './ContactsClient';

export const metadata: Metadata = {
  title: 'Контакты — Backdoor Store',
  description: 'Связаться с поддержкой Backdoor Store. Telegram @backdoor_support, email support@backdoor.store. Работаем ежедневно 9:00–23:00 МСК.',
};

export default function ContactsPage() {
  return <ContactsClient />;
}
