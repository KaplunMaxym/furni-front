import { FC, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

import { cn } from '@/helpers/cn';
import ThemeSwitch from '@/ui/theme/ThemeSwitch';
import { SHELL_HEADER_HEIGHT } from '@/features/layout/shellMetrics';

/**
 * Верхня смуга застосунку.
 *
 * Тут живе те, що не належить жодній сторінці: вигляд інтерфейсу й
 * сповіщення. Досі такого місця не було — тема стояла в бічному меню, серед
 * розділів, хоч розділом не є.
 *
 * Смуга навмисно порожня ліворуч: заголовок сторінки малює сама сторінка
 * через `PageHeader`, і дублювати його тут означало б два заголовки один
 * під одним.
 */
const TopBar: FC = () => {
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Клік повз меню закриває його — інакше воно висить, доки не натиснеш дзвінок ще раз
    useEffect(() => {
        if (!isNotificationsOpen) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!notificationsRef.current?.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [isNotificationsOpen]);

    return (
        <header
            className={cn(
                // Висота спільна з шапкою меню — щоб рамки склались в одну лінію
                SHELL_HEADER_HEIGHT,
                'flex shrink-0 items-center justify-end gap-2 border-b border-border bg-card px-4',
            )}
        >
            <div className="relative" ref={notificationsRef}>
                <button
                    type="button"
                    onClick={() => setNotificationsOpen(open => !open)}
                    aria-label="Сповіщення"
                    title="Сповіщення"
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                        isNotificationsOpen
                            ? 'bg-accent/60 text-foreground'
                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )}
                >
                    <Bell className="h-4 w-4" />
                </button>

                {isNotificationsOpen && (
                    <div className="absolute right-0 top-11 z-50 w-[280px] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                        <p className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Сповіщення
                        </p>

                        {/*
                          * Джерела сповіщень ще немає — ні на беку, ні в
                          * моделі. Порожній стан чесніший за приховану
                          * кнопку: видно, де вони зʼявляться, і що зараз
                          * дивитись нема чого.
                          */}
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                            Поки що порожньо
                        </p>
                    </div>
                )}
            </div>

            <ThemeSwitch />
        </header>
    );
};

export default TopBar;
