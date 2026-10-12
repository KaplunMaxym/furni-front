import { create } from 'zustand';

export interface ProfileServiceFilters {
    /** Назва або код 1С — одним рядком. */
    search: string;
    profileSystemId: number | null;
}

interface ProfileServiceFilterStore extends ProfileServiceFilters {
    page: number;
    limit: number;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setFilter: <K extends keyof ProfileServiceFilters>(
        key: K,
        value: ProfileServiceFilters[K],
    ) => void;
    resetFilters: () => void;
}

const EMPTY_FILTERS: ProfileServiceFilters = {
    search: '',
    profileSystemId: null,
};

/** Зміна фільтра скидає сторінку на першу — інакше вибірка «зникає». */
export const useProfileServiceFilterStore = create<ProfileServiceFilterStore>(set => ({
    page: 1,
    limit: 10,
    ...EMPTY_FILTERS,
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setFilter: (key, value) => set({ [key]: value, page: 1 } as never),
    resetFilters: () => set({ ...EMPTY_FILTERS, page: 1 }),
}));
