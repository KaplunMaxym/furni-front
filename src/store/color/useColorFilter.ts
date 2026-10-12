import { create } from 'zustand';
import { ColorType } from '@/screens/catalog/types/IColor';

interface ColorFilterStore {
    page: number;
    limit: number;
    /** Назва кольору або hex-код. */
    search: string;
    /** Призначення: профіль, ручка, завіса. */
    type: ColorType | null;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSearch: (search: string) => void;
    setType: (type: ColorType | null) => void;
    resetFilters: () => void;
}

/** Зміна фільтра скидає сторінку на першу. */
export const useColorFilterStore = create<ColorFilterStore>(set => ({
    page: 1,
    limit: 10,
    search: '',
    type: null,
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setSearch: search => set({ search, page: 1 }),
    setType: type => set({ type, page: 1 }),
    resetFilters: () => set({ search: '', type: null, page: 1 }),
}));
