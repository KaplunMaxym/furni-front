import { create } from 'zustand';

interface ProfileSystemFilterStore {
    page: number;
    limit: number;
    /** Назва, код або код 1С. */
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
 * Власний стор списку профільних систем.
 *
 * До цього екран брав `page` і `limit` з `useGlassFillFilterStore` — чужого
 * стору скла. Через це перехід на другу сторінку скла мовчки перемикав
 * сторінку й тут, і навпаки.
 */
export const useProfileSystemFilterStore = create<ProfileSystemFilterStore>(set => ({
    page: 1,
    limit: 10,
    search: '',
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setSearch: search => set({ search, page: 1 }),
    resetFilters: () => set({ search: '', page: 1 }),
}));
