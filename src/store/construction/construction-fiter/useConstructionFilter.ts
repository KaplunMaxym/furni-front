import { create } from 'zustand';

interface IConstructionFilterState {
    page: number;
    limit: number;
    /** Номер замовлення або номер конструкції — одним рядком. */
    search: string;
    status: number | string;
    profileSystemId: number | string;
    /** Діапазон дат створення, `YYYY-MM-DD`. */
    dateFrom: string;
    dateTo: string;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSearch: (search: string) => void;
    setStatus: (status: number | string) => void;
    setProfileSystemId: (profileSystemId: number | string) => void;
    setDateFrom: (dateFrom: string) => void;
    setDateTo: (dateTo: string) => void;
    resetFilters: () => void;
}

/**
 * Замість двох окремих полів («Номер замовлення» і «Номер конструкції») —
 * один пошук на обидва номери. Користувач тримає в руках один номер і не має
 * спершу вирішувати, до якої з двох колонок він належить.
 *
 * `setLimit` тепер теж скидає сторінку: на четвертій сторінці по 20 записів
 * перемикання на 80 лишало page=4, тобто показувало 240-й запис і далі.
 */
export const useConstructionFilterStore = create<IConstructionFilterState>(set => ({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    profileSystemId: '',
    dateFrom: '',
    dateTo: '',
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
    setSearch: search => set({ search, page: 1 }),
    setStatus: status => set({ status, page: 1 }),
    setProfileSystemId: profileSystemId => set({ profileSystemId, page: 1 }),
    setDateFrom: dateFrom => set({ dateFrom, page: 1 }),
    setDateTo: dateTo => set({ dateTo, page: 1 }),
    resetFilters: () => set({ search: '', status: '', profileSystemId: '', dateFrom: '', dateTo: '', page: 1 }),
}));
