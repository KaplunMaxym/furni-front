import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/helpers/cn";

export interface SectionCardProps {
    title: string;
    /** Короткий підпис під назвою — скільки позицій, до чого належить. */
    description?: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    collapsible?: boolean;
    /** Стан за замовчуванням для згортних карток. */
    defaultOpen?: boolean;
    className?: string;
}

/**
 * Картка розділу.
 *
 * Раніше тут стояли `bg-gray-50`, `text-gray-800`, `border-gray-200` — класи,
 * яких у проєкті немає: `theme.colors` замінює палітру Tailwind, і з неї
 * лишилися тільки ключі зі слешем ('gray/600'). Тобто шапка йшла без фону, а
 * текст успадковував колір звідкись зверху. Тепер токени як у решти карток.
 */
const SectionCard: React.FC<SectionCardProps> = ({
    title,
    description,
    badge,
    children,
    collapsible = false,
    defaultOpen = true,
    className,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
            <div
                className={cn(
                    "flex items-center justify-between gap-3 border-b border-border px-5 py-3",
                    collapsible && "cursor-pointer transition-colors hover:bg-accent/40",
                )}
                onClick={collapsible ? () => setOpen(o => !o) : undefined}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
                        {description && (
                            <p className="truncate text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {badge}
                </div>

                {collapsible && (
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            !open && "-rotate-90",
                        )}
                    />
                )}
            </div>

            {(!collapsible || open) && <div className="p-5">{children}</div>}
        </div>
    );
};

export default SectionCard;
