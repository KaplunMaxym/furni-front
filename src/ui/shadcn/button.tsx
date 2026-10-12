import * as React from 'react';

import { cn } from '@/helpers/cn';

/**
 * Кнопка з проєкту dashboard, перенесена як є.
 *
 * Дві відмінності від оригіналу, обидві щоб не тягнути залежності:
 * варіанти зібрані звичайними об'єктами замість `class-variance-authority`,
 * а `asChild` через `@radix-ui/react-slot` не переносив — у furni-front немає
 * жодного місця, де кнопка мала б рендеритись іншим тегом.
 *
 * Решта поведінки збережена: фокус малюється кільцем у три пікселі з
 * підфарбованою рамкою (зовнішній обвід через ring-offset відсував кнопку
 * від сусідів і рвав злиті групи), перехід анімує лише колір і тінь, а
 * вкладена іконка без власного розміру отримує 16 пікселів.
 */
const BASE = [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'text-sm font-medium outline-none transition-[color,box-shadow]',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
].join(' ');

const VARIANTS = {
    default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    // text-foreground, а не text-white: простого `white` у палітрі furni-front
    // немає (є лише 'white/600'), і клас мовчки не згенерувався б.
    destructive:
        'bg-destructive text-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/40',
    outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
} as const;

const SIZES = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
    iconSm: 'h-8 w-8',
    xsm: 'h-6 px-2 text-xs',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export const buttonVariants = ({
    variant = 'default',
    size = 'default',
    className,
}: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
} = {}) => cn(BASE, VARIANTS[variant], SIZES[size], className);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => (
        <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
    ),
);
Button.displayName = 'Button';

export { Button };
