import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";

interface IOrderPageState {
    page: number;
    limit: string;
    client: number | string;
    status: number | string;
    /** Номер або назва замовлення — одним рядком. */
    search: string;
    /** Діапазон дат створення, `YYYY-MM-DD`. */
    dateFrom: string;
    dateTo: string;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface IOrderPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setClient: (client: number | string) => void;
    setStatus: (status: number | string) => void;
    setSearch: (search: string) => void;
    setDateFrom: (dateFrom: string) => void;
    setDateTo: (dateTo: string) => void;
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setAll: (prev: Partial<IOrderPageState>) => void;
    resetFilters: () => void;
    resetToDefaults: () => void;
}

const defaultState: IOrderPageState = {
    page: 1,
    limit: '10',
    client: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
};

export const useOrderPageStore = create<IOrderPageState & IOrderPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    // Вибір клієнта теж скидає сторінку: інакше на пʼятій сторінці звужена
    // вибірка показувала б порожню таблицю, бо пʼятої сторінки вже немає.
    setClient: (client) => set({ client, page: 1 }),
    setStatus: (status) => set({ status, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
    setDateTo: (dateTo) => set({ dateTo, page: 1 }),
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
        client: value?.client ?? prev.client,
        status: value?.status ?? prev.status,
        search: value?.search ?? prev.search,
        dateFrom: value?.dateFrom ?? prev.dateFrom,
        dateTo: value?.dateTo ?? prev.dateTo,
    })),
    // Скидає лише фільтри, лишаючи вибраний розмір сторінки
    resetFilters: () => set({ client: '', status: '', search: '', dateFrom: '', dateTo: '', page: 1 }),
    resetToDefaults: () => set(defaultState),
}));

export const useOrderFilterStore = () => {
    const store = useOrderPageStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IOrderPageState>();
    const params = useQueryParams<IOrderPageState>();
    const prevState = useRef(state);

    useEffect(() => {
        const stateChanged = JSON.stringify(prevState.current) !== JSON.stringify(state);

        if (stateChanged) {
            const filteredState: Record<string, string | number> = {
                page: state.page,
                limit: state.limit
            };

            if (state.client) filteredState.client = state.client;
            if (state.status) filteredState.status = state.status;
            if (state.search) filteredState.search = state.search;
            if (state.dateFrom) filteredState.dateFrom = state.dateFrom;
            if (state.dateTo) filteredState.dateTo = state.dateTo;

            navTo(window.location.pathname, filteredState, false);
        }

        prevState.current = state;
    }, [stateJson]);

    return { ...store, navTo, searchParams: params };
};
