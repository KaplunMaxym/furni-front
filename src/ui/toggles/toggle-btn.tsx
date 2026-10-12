'use client'

import { FC, ReactNode } from "react";

import { cn } from "@/helpers/cn";
import { Switch } from "@/ui/shadcn/switch";

interface IToggleBtnProps {
    useStateProps: [value: boolean, toggleFn: () => void];
    children: ReactNode;
    /** Рядок під підписом — пояснює, на що впливає перемикач. */
    description?: ReactNode;
    disabled?: boolean;
    className?: string;
}

/**
 * Рядок із перемикачем: підпис ліворуч, перемикач праворуч.
 *
 * Розкладка й сам перемикач — зі сторінки налаштувань проєкту dashboard.
 * Раніше це була кнопка-плашка з намальованим квадратиком-галочкою: увімкнений
 * і вимкнений стани відрізнялись лише кольором тонкої рамки всередині, і на
 * темному тлі це майже не читалось. До того ж уся плашка виглядала як кнопка
 * дії, хоч нічого не запускала.
 */
export const ToggleBtn: FC<IToggleBtnProps> = ({
    useStateProps,
    children,
    description,
    disabled,
    className,
}) => {
    const [value, toggleFn] = useStateProps;

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5',
                disabled && 'opacity-60',
                className,
            )}
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{children}</p>
                {description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                )}
            </div>

            <Switch checked={value} disabled={disabled} onCheckedChange={toggleFn} />
        </div>
    );
};
