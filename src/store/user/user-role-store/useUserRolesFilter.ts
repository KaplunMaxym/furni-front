import { create } from 'zustand';
import { useNavigateWithParams } from "@/utils/useNavigate/useNavigateWithParams";
import { useQueryParams } from "@/utils/useQueryParams/useQueryParams";
import { useEffect, useRef } from "react";

interface IUserRolesPageState {
    page: number;
    limit: string;
}

interface IUserRolesPageAction {
    setPage: (page: number) => void;
    setLimit: (limit: string) => void;
    setAll: (prev: Partial<IUserRolesPageState>) => void;
    resetToDefaults: () => void;
}

const defaultState: IUserRolesPageState = {
    page: 1,
    limit: '100',
};

export const useUserRolesPageStore = create<IUserRolesPageState & IUserRolesPageAction>((set) => ({
    ...defaultState,

    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    setAll: (value) => set((prev) => ({
        page: value?.page ?? prev.page,
        limit: value?.limit ?? prev.limit,
    })),
    resetToDefaults: () => set(defaultState),
}));

export const useUserRolesFilterStore = () => {
    const store = useUserRolesPageStore();
    const stateJson = JSON.stringify(store);
    const state = JSON.parse(stateJson);
    const navTo = useNavigateWithParams<IUserRolesPageState>();
    const params = useQueryParams<IUserRolesPageState>();
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