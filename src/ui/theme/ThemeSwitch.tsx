import { FC } from 'react';
import { Moon, Sun } from 'lucide-react';

import { cn } from '@/helpers/cn';
import { useThemeStore } from '@/store/theme/useThemeStore';

/**
 * Перемикач теми з іконкою в самому повзунку.
 *
 * Іконки стояли по боках доріжки — сонце ліворуч, місяць праворуч, — і це
 * читалося як два окремі елементи поруч із перемикачем: незрозуміло, чи
 * можна натиснути саме на них. Тепер іконка одна й їде разом із повзунком:
 * вона і є станом, а не підписом до нього.
 *
 * Розміри взяті з `ui/shadcn/switch` (доріжка 40×24, повзунок 20×20), щоб
 * перемикач не відрізнявся від тих, що вже стоять у формах. Окремий
 * компонент, а не проп до спільного: там повзунок навмисно порожній, і
 * іконка всередині нього була б потрібна рівно в цьому одному місці.
 */
const ThemeSwitch: FC<{ className?: string }> = ({ className }) => {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            title={isDark ? 'Світла тема' : 'Темна тема'}
            onClick={toggleTheme}
            className={cn(
                'inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-transparent',
                'outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
                isDark ? 'bg-primary' : 'bg-input',
                className,
            )}
        >
            <span
                className={cn(
                    'pointer-events-none flex h-5 w-5 items-center justify-center rounded-full',
                    'bg-background shadow-xs transition-transform',
                    isDark ? 'translate-x-4' : 'translate-x-0',
                )}
            >
                {isDark
                    ? <Moon className="h-3 w-3 text-foreground" />
                    : <Sun className="h-3 w-3 text-foreground" />}
            </span>
        </button>
    );
};

export default ThemeSwitch;
