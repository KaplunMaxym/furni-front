import { create } from 'zustand';

interface ProfileAccessoryFilterStore {
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

export const useProfileAccessoryFilterStore = create<ProfileAccessoryFilterStore>(set => ({
    page: 1,
    limit: 20,
    setPage: page => set({ page }),
    setLimit: limit => set({ limit, page: 1 }),
}));