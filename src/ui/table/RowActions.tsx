import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

import { cn } from '@/helpers/cn';

export interface RowAction {
    label: string;
    icon?: React.ReactNode;
    onSelect: () => void;
    /** Небезпечна дія — фарбуємо в червоний і ставимо в кінець списку. */
    danger?: boolean;
    disabled?: boolean;
}

interface RowActionsProps {
    actions: RowAction[];
    className?: string;
}

const MENU_WIDTH = 200;
/** Відступ від краю вікна, щоб меню не липло до нього. */
const VIEWPORT_GAP = 8;

/**
 * Дії рядка таблиці під трьома крапками.
 *
 * Меню рендериться в портал з `position: fixed`, а не поруч із кнопкою.
 * Причина: обгортка таблиці має `overflow-auto` (щоб широкі таблиці можна було
 * прокручувати), а такий контейнер обрізає все, що абсолютно спозиційоване
 * всередині — меню просто не було видно. Портал виносить його з-під обрізання,
 * фіксовані координати рахуємо від кнопки.
 */
const RowActions: React.FC<RowActionsProps> = ({ actions, className }) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const place = useCallback(() => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();

        // Праву кромку меню тримаємо на правій кромці кнопки, але не даємо
        // вилізти за вікно — на вузьких екранах таблиця часто притиснута до краю.
        const left = Math.max(
            VIEWPORT_GAP,
            Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP),
        );

        const below = rect.bottom + 4;
        const menuHeight = menuRef.current?.offsetHeight ?? 0;
        // Не вміщається знизу — відкриваємо вгору.
        const flip = menuHeight > 0 && below + menuHeight > window.innerHeight - VIEWPORT_GAP;

        setPosition({ top: flip ? rect.top - menuHeight - 4 : below, left });
    }, []);

    useLayoutEffect(() => {
        if (open) place();
    }, [open, place]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        // Прокрутка сторінки або самої таблиці зрушила б кнопку з-під меню.
        const onScrollOrResize = () => setOpen(false);

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onScrollOrResize);
        window.addEventListener('scroll', onScrollOrResize, true);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', onScrollOrResize);
            window.removeEventListener('scroll', onScrollOrResize, true);
        };
    }, [open]);

    if (!actions.length) return null;

    return (
        // Клік десь у комірці дій не має відкривати сам запис
        <div className={cn('flex justify-end', className)} onClick={e => e.stopPropagation()}>
            <button
                ref={buttonRef}
                type="button"
                aria-label="Дії"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={e => {
                    e.stopPropagation();
                    setOpen(v => !v);
                }}
                className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    open && 'bg-accent text-accent-foreground',
                )}
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        style={{
                            position: 'fixed',
                            top: position?.top ?? -9999,
                            left: position?.left ?? -9999,
                            width: MENU_WIDTH,
                        }}
                        className={cn(
                            'z-[80] rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-lg',
                            // До першого вимірювання меню стоїть за межами екрана —
                            // ховаємо, щоб не блимало в куті.
                            !position && 'invisible',
                        )}
                    >
                        {actions.map(action => (
                            <button
                                key={action.label}
                                role="menuitem"
                                type="button"
                                disabled={action.disabled}
                                onClick={e => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    action.onSelect();
                                }}
                                className={cn(
                                    // Класи з shared/ui/dropdown-menu.tsx проєкту dashboard
                                    'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                                    'disabled:pointer-events-none disabled:opacity-50',
                                    action.danger
                                        ? 'text-destructive-foreground hover:bg-destructive/40 focus-visible:bg-destructive/40'
                                        : 'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
                                )}
                            >
                                {action.icon && <span className="shrink-0 opacity-70">{action.icon}</span>}
                                {action.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default RowActions;
