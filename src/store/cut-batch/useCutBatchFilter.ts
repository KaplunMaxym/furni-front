import { create } from 'zustand';

export interface CutBatchFilters {
    /** Номер партії або номер/назва замовлення — одним рядком. */
    search: string;
    /** Діапазон дат, `YYYY-MM-DD`. */
    dateFrom: string;
    dateTo: string;
}

interface CutBatchFilterStore extends CutBatchFilters {
    page: number;
    limit: number;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setFilter: <K extends keyof CutBatchFilters>(key: K, value: CutBatchFilters[K]) => void;
    setDateRange: (dateFrom: string, dateTo: string) => void;
    resetFilters: () => void;
}

const EMPTY_FILTERS: CutBatchFilters = {
    search: '',
    dateFrom: '',
    dateTo: '',
};

/** Зміна фільтра скидає сторінку на першу — інакше вибірка «зникає». */
export const useCutBatchFilterStore = create<CutBatchFilterStore>(set => ({
    page: 1,
    limit: 20,
    ...EMPTY_FILTERS,
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setFilter: (key, value) => set({ [key]: value, page: 1 } as never),
    setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo, page: 1 }),
    resetFilters: () => set({ ...EMPTY_FILTERS, page: 1 }),
}));
