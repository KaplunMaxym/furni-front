import { create } from 'zustand';

interface ICurrencyRateFilterStore {
    page: number;
    limit: number;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

export const useCurrencyRateFilterStore = create<ICurrencyRateFilterStore>(set => ({
    page: 1,
    limit: 10,
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit }),
}));