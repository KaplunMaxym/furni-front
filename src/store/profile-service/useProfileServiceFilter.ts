import { create } from 'zustand';

interface ProfileServiceFilterStore {
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

export const useProfileServiceFilterStore = create<ProfileServiceFilterStore>(set => ({
    page: 1,
    limit: 20,
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
}));