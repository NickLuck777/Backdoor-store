'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuthUser {
  id: number;
  email: string;
  role?: string;
  createdAt?: string;
}

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

// Listen for storage changes (login in another tab) and our own custom event
// (login in the same tab — `storage` doesn't fire for the tab that wrote it).
export const AUTH_CHANGED_EVENT = 'backdoor:auth-changed';

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Hook for reading the currently authenticated user.
 *
 * Strategy:
 *  - Check localStorage for access token.
 *  - If present, fetch /auth/me via React Query.
 *  - Re-runs whenever the token changes (login/logout in same or other tab).
 *
 * Returns isLoading=true only while we're actually fetching — when there's
 * no token at all, isLoading is false and isAuthenticated is false.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = React.useState<string | null>(() => readToken());

  // React to login/logout events from anywhere in the app.
  React.useEffect(() => {
    const sync = () => setToken(readToken());

    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
    };
  }, []);

  const query = useQuery<AuthUser>({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      const { data } = await api.get<AuthUser>('/auth/me');
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    queryClient.removeQueries({ queryKey: ['user-orders'] });
  }, [queryClient]);

  return {
    user: query.data ?? null,
    isAuthenticated: !!token && !!query.data,
    isLoading: !!token && query.isLoading,
    logout,
  };
}

/**
 * Call this from login/register pages right after writing the token to
 * localStorage so the rest of the app reacts immediately.
 */
export function notifyAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
