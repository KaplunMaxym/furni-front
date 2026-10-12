import React from "react";

import Hint from "@/ui/hint/Hint";

export interface ParamGroupProps {
    title?: string;
    /** Що це за група полів — розкривається з іконки біля заголовка. */
    hint?: string;
    columns?: 2 | 3 | 4;
    children: React.ReactNode;
}

/**
 * Колонки задані адаптивно, а не одним числом.
 *
 * Раніше `grid-cols-3` тримався на будь-якій ширині: у колонці контенту, яка
 * після появи бокового меню звузилася, три поля з підписами на кшталт
 * «Корекція довжини, з боку» ставали нечитабельними.
 */
const COLS: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

const ParamGroup: React.FC<ParamGroupProps> = ({ title, hint, columns = 3, children }) => (
    <div>
        {title && (
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
                {hint && <Hint title={title}>{hint}</Hint>}
            </p>
        )}
        <div className={`grid ${COLS[columns]} gap-3`}>{children}</div>
    </div>
);

export default ParamGroup;
