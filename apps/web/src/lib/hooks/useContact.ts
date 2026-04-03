'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export function useContactForm() {
  return useMutation<ContactResponse, Error, ContactFormData>({
    mutationFn: async (data: ContactFormData) => {
      const { data: response } = await api.post<ContactResponse>('/contact', data);
      return response;
    },
  });
}
