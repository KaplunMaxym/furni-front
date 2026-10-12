import { create } from 'zustand';

import { IntegrationLogStatus } from '@/screens/integration-log/types/IIntegrationLog';

export interface IntegrationLogFilters {
    /** Номер чи назва замовлення або текст помилки — одним рядком. */
    search: string;
    status: IntegrationLogStatus | null;
    userId: number | null;
    /** Діапазон дат, `YYYY-MM-DD`. */
    dateFrom: string;
    dateTo: string;
}

interface IntegrationLogFilterStore extends IntegrationLogFilters {
    page: number;
    limit: number;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setFilter: <K extends keyof IntegrationLogFilters>(
        key: K,
        value: IntegrationLogFilters[K],
    ) => void;
    setDateRange: (dateFrom: string, dateTo: string) => void;
    resetFilters: () => void;
}

const EMPTY_FILTERS: IntegrationLogFilters = {
    search: '',
    status: null,
    userId: null,
    dateFrom: '',
    dateTo: '',
};

/** Зміна фільтра скидає сторінку на першу — інакше вибірка «зникає». */
export const useIntegrationLogFilterStore = create<IntegrationLogFilterStore>(set => ({
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
