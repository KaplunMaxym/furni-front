import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";

interface IUserPageState {
    page: number;
    limit: string;
    /** Колонка сортування — ключ, який знає бек. */
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface IUserPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setAll: (prev: Partial<IUserPageState>) => void;
    resetToDefaults: () => void;
}

const defaultState: IUserPageState = {
    page: 1,
    limit: '10',
};

export const useUsersPageStore = create<IUserPageState & IUserPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
    })),
    resetToDefaults: () => set(defaultState),
}));

export const useUsersFilterStore = () => {
    const store = useUsersPageStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IUserPageState>();
    const params = useQueryParams<IUserPageState>();
    const prevState = useRef(state);

    useEffect(() => {
        const stateChanged = JSON.stringify(prevState.current) !== JSON.stringify(state);

        if (stateChanged) {
            navTo('', {
                page: state.page,
                limit: state.limit
            }, false);
        }

        prevState.current = state;
    }, [stateJson]);

    return { ...store, navTo, searchParams: params };
};