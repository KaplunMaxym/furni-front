import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

/**
 * Хто увійшов.
 *
 * Ім'я і пошту сервер повертає у відповіді на вхід разом із токенами, але
 * раніше зі всієї відповіді зберігалась лише роль — тож меню могло показати
 * тільки «Адміністратор», без самого користувача.
 *
 * `null` тут означає «сесія стара»: у тих, хто увійшов до цієї зміни, у
 * сховищі полів немає, і вони заповняться при наступному вході.
 */
type SessionUser = {
    role: string | null;
    name: string | null;
    email: string | null;
};

type State = {
    accessToken: string | null;
    refreshToken: string | null;
} & SessionUser;

type Actions = {
    setAccessToken: (value: string | null) => void;
    setRefreshToken: (value: string | null) => void;
    setRole: (value: string | null) => void;
    setTokens: (access: string | null, refresh: string | null, user?: Partial<SessionUser>) => void;
    clearTokens: () => void;
    clearStorage: () => void;
};

export const useAuthStore = create<State & Actions>()(
    persist(
        immer((set) => ({
            accessToken: null,
            refreshToken: null,
            role: null,
            name: null,
            email: null,

            setAccessToken: (value) =>
                set((state) => {
                    state.accessToken = value;
                }),

            setRefreshToken: (value) =>
                set((state) => {
                    state.refreshToken = value;
                }),

            setRole: (value) =>
                set((state) => {
                    state.role = value;
                }),

            setTokens: (access, refresh, user) =>
                set((state) => {
                    state.accessToken = access;
                    state.refreshToken = refresh;
                    state.role = user?.role ?? null;
                    state.name = user?.name ?? null;
                    state.email = user?.email ?? null;
                }),

            clearTokens: () =>
                set((state) => {
                    state.accessToken = null;
                    state.refreshToken = null;
                    state.role = null;
                    state.name = null;
                    state.email = null;
                }),

            clearStorage: () =>
                localStorage.removeItem("auth-storage"),
        })),
        {
            name: "auth-storage",
        }
    )
);