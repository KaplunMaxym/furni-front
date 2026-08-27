import { create } from 'zustand';

interface ColorFilterStore {
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

export const useColorFilterStore = create<ColorFilterStore>(set => ({
    page: 1,
    limit: 20,
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
}));