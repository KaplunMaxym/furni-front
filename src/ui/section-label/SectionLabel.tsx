import { FC, ReactNode } from 'react';

import { cn } from '@/helpers/cn';

/**
 * Підпис групи всередині картки: «Профілі», «Скло», «Аксесуари», «Послуги».
 *
 * Раніше це був просто дрібний сірий текст того ж кольору, що й назви позицій
 * під ним, — і в довгому розкладі вартості групи не читалися як групи: око
 * бачило суцільний список. Кольором їх виділяти не можна (це не стани й не
 * попередження), тож виділення робить нейтральна підкладка на тон світліша за
 * картку і звичайний, не приглушений колір тексту.
 *
 * `right` — місце для суми групи, якщо вона є.
 */
export const SectionLabel: FC<{
    children: ReactNode;
    right?: ReactNode;
    className?: string;
}> = ({ children, right, className }) => (
    <div
        className={cn(
            'flex items-center justify-between gap-3 bg-muted px-4 py-2',
            'text-xs font-semibold uppercase tracking-wide text-foreground',
            className,
        )}
    >
        <span className="min-w-0 truncate">{children}</span>
        {right && <span className="shrink-0 normal-case">{right}</span>}
    </div>
);

export default SectionLabel;
