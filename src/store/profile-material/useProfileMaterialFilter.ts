import { create } from 'zustand';

export interface ProfileMaterialFilters {
    /** Назва, артикул або код 1С — одним рядком. */
    search: string;
    colorId: number | null;
    profileSystemId: number | null;
}

interface ProfileMaterialFilterStore extends ProfileMaterialFilters {
    page: number;
    limit: number;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setFilter: <K extends keyof ProfileMaterialFilters>(
        key: K,
        value: ProfileMaterialFilters[K],
    ) => void;
    resetFilters: () => void;
}

const EMPTY_FILTERS: ProfileMaterialFilters = {
    search: '',
    colorId: null,
    profileSystemId: null,
};

/**
 * Будь-яка зміна фільтра скидає сторінку на першу.
 *
 * Інакше виходило б так: користувач на пʼятій сторінці звужує вибірку до
 * трьох записів і бачить порожню таблицю — бо пʼятої сторінки вже немає.
 */
export const useProfileMaterialFilterStore = create<ProfileMaterialFilterStore>(set => ({
    page: 1,
    limit: 10,
    ...EMPTY_FILTERS,
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setFilter: (key, value) => set({ [key]: value, page: 1 } as never),
    resetFilters: () => set({ ...EMPTY_FILTERS, page: 1 }),
}));
