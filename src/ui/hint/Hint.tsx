import { FC, ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

import { cn } from '@/helpers/cn';

interface HintProps {
    /** Пояснення. Може бути кілька абзаців — розкладка їх витримує. */
    children: ReactNode;
    /** Підпис поля, до якого належить підказка — показуємо його заголовком. */
    title?: string;
    className?: string;
}

const WIDTH = 320;
/** Відступ від краю вікна, щоб підказка не тулилась до самої межі. */
const VIEWPORT_PADDING = 8;

/**
 * Підказка біля підпису поля.
 *
 * Через портал і `position: fixed`, а не звичайним `absolute`: панелі
 * параметрів мають `overflow`, і спливаюче вікно всередині них обрізалося б
 * по краю панелі.
 *
 * Відкривається наведенням і фокусом з клавіатури — інакше до неї не дістатись
 * без миші, а це єдине місце, де записано, що означає кожне число.
 */
const Hint: FC<HintProps> = ({ children, title, className }) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    const place = useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Не даємо вилізти за правий край; ліворуч теж є межа
        const left = Math.min(
            Math.max(rect.left + rect.width / 2 - WIDTH / 2, VIEWPORT_PADDING),
            window.innerWidth - WIDTH - VIEWPORT_PADDING,
        );

        setPosition({ top: rect.bottom + 8, left });
    }, []);

    useLayoutEffect(() => {
        if (!open) return;

        place();
        // Сторінка гортається — підказка має або їхати за іконкою, або зникнути
        const hide = () => setOpen(false);
        window.addEventListener('scroll', hide, true);
        window.addEventListener('resize', hide);

        return () => {
            window.removeEventListener('scroll', hide, true);
            window.removeEventListener('resize', hide);
        };
    }, [open, place]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-label={title ? `Що таке «${title}»` : 'Пояснення'}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                // Клік нічого не робить, лише не даємо йому дійти до підпису
                // поля: інакше натиск по іконці ставив би курсор в інпут
                onClick={e => e.preventDefault()}
                className={cn(
                    'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                    'text-muted-foreground/70 outline-none transition-colors',
                    'hover:text-foreground focus-visible:text-foreground',
                    className,
                )}
            >
                <Info className="h-3.5 w-3.5" />
            </button>

            {open && position && createPortal(
                <div
                    role="tooltip"
                    style={{ top: position.top, left: position.left, width: WIDTH }}
                    className={cn(
                        'pointer-events-none fixed z-[90] rounded-lg border border-border bg-popover p-3',
                        'text-xs leading-relaxed text-popover-foreground shadow-lg',
                    )}
                >
                    {title && (
                        <p className="mb-1 text-xs font-semibold text-foreground">{title}</p>
                    )}
                    <div className="space-y-1.5 text-muted-foreground">{children}</div>
                </div>,
                document.body,
            )}
        </>
    );
};

export default Hint;
