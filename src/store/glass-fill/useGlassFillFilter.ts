import { create } from 'zustand';

interface IGlassFillFilterState {
    page: number;
    limit: number;
    /** Назва скла або код 1С. Кольору й системи у скла немає. */
    search: string;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSearch: (search: string) => void;
    resetFilters: () => void;
}

/**
 * Зміна кількості рядків і пошуку скидає сторінку на першу.
 *
 * `setLimit` цього раніше не робив — на четвертій сторінці по 20 записів
 * перемикання на 80 лишало page=4, тобто показувало 240-й запис і далі.
 */
export const useGlassFillFilterStore = create<IGlassFillFilterState>(set => ({
    page: 1,
    limit: 10,
    search: '',
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setSearch: search => set({ search, page: 1 }),
    resetFilters: () => set({ search: '', page: 1 }),
}));
