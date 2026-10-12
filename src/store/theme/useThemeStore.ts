import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

/**
 * Вибрана тема.
 *
 * Клас `dark` вішається на `<html>`, а не на обгортку сторінки: під ним
 * лежать портали — модалки, підказки, тости, — які рендеряться в
 * `document.body` і до жодної обгортки не входять. Якби клас стояв нижче,
 * вони лишалися б у старій темі.
 *
 * Записується одразу в дії, а не ефектом у компоненті: між першим кадром і
 * спрацюванням ефекту сторінка встигала блимнути чужими кольорами.
 */
const applyTheme = (theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

type State = {
    theme: Theme;
};

type Actions = {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

export const useThemeStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            // Темна за замовчуванням — саме в ній система працювала досі
            theme: 'dark',

            setTheme: (theme) => {
                applyTheme(theme);
                set({ theme });
            },

            toggleTheme: () => {
                const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                set({ theme: next });
            },
        }),
        {
            name: 'furni:theme',
            /*
             * Після підняття зі сховища клас треба поставити вручну:
             * `persist` лише повертає значення в стор, до DOM він не
             * торкається. Без цього обрана тема злітала на перезавантаженні.
             */
            onRehydrateStorage: () => (state) => {
                applyTheme(state?.theme ?? 'dark');
            },
        },
    ),
);
