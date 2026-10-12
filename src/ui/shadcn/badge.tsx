import * as React from 'react';

import { cn } from '@/helpers/cn';

/**
 * Бейдж із проєкту dashboard.
 *
 * Варіанти зібрані звичайним об'єктом, а не через `class-variance-authority`:
 * заради чотирьох рядків класів тягнути нову залежність у furni-front немає
 * сенсу, а поведінка та сама.
 */
/*
 * Скрізь явний колір рамки, навіть 'border-transparent'.
 *
 * Базові класи задають `border` (товщину), а `theme.colors` у цьому проєкті
 * замінює дефолтну палітру Tailwind — тож типового кольору рамки немає, і без
 * явного класу вона малюється currentColor, тобто кольором тексту. Саме звідси
 * бралася біла обводка навколо бейджів.
 *
 * З тієї ж причини тут `text-foreground` (#FAFAFA), а не `text-white`:
 * простого `white` у палітрі немає (є лише 'white/600'), і клас мовчки
 * не генерувався б.
 */
const VARIANTS = {
    default: 'border-transparent bg-secondary text-foreground',
    secondary: 'border-transparent bg-secondary text-foreground',
    // destructive-foreground — яскраво-червоний (#FB2C36) на темно-червоному
    // фоні (#82181A): разом не читаються. Тому текст світлий.
    destructive: 'border-transparent bg-destructive text-foreground',
    outline: 'border-border text-foreground',
    success: 'border-transparent bg-chart-2/15 text-chart-2',
    warning: 'border-transparent bg-chart-3/15 text-chart-3',
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap',
                'rounded-full border px-2 py-0.5 text-xs font-medium leading-normal',
                VARIANTS[variant],
                className,
            )}
            {...props}
        />
    );
}

export { Badge };
