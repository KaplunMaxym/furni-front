import { FC } from 'react';

import { cn } from '@/helpers/cn';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
    className?: string;
}

/**
 * Перемикач із проєкту dashboard.
 *
 * Там це `@radix-ui/react-switch`; сюди перенесені самі стилі, а стан і
 * доступність зроблені на звичайній кнопці з `role="switch"` — radix у
 * furni-front немає, і тягнути залежність заради одного елемента зайве.
 *
 * Розміри й кольори збережені як в оригіналі: доріжка 40×24, повзунок 20×20,
 * `primary` увімкненому, `input` вимкненому.
 */
export const Switch: FC<SwitchProps> = ({
    checked,
    onCheckedChange,
    disabled,
    'aria-label': ariaLabel,
    className,
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={e => {
            // Перемикач часто лежить у формі — щоб клік не відправляв її
            e.preventDefault();
            e.stopPropagation();
            onCheckedChange(!checked);
        }}
        className={cn(
            'inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-transparent',
            'outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-input',
            className,
        )}
    >
        <span
            className={cn(
                'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-xs transition-transform',
                checked ? 'translate-x-4' : 'translate-x-0',
            )}
        />
    </button>
);

export default Switch;
