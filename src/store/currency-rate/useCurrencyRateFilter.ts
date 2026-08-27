import { create } from 'zustand';

interface ICurrencyRateFilterStore {
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

export const useCurrencyRateFilterStore = create<ICurrencyRateFilterStore>(set => ({
    page: 1,
    limit: 20,
    setPage: page => set({ page }),
    setLimit: limit => set({ limit }),
}));