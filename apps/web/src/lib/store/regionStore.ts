'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Region } from '@/types';

interface RegionStore {
  region: Region;
  setRegion: (region: Region) => void;
}

export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      region: 'TURKEY' as Region,
      setRegion: (region: Region) => set({ region }),
    }),
    {
      name: 'preferred_region',
    },
  ),
);
