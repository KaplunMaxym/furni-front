import * as React from 'react';

import { cn } from '@/helpers/cn';

interface ProgressProps extends React.ComponentProps<'div'> {
    /** 0…100. Значення поза межами підрізаємо, щоб смуга не вилізла з доріжки. */
    value: number;
    /** Клас заповненої частини — щоб задавати колір із палітри chart. */
    indicatorClassName?: string;
}

/**
 * Смуга прогресу.
 *
 * У проєкті dashboard вона на `@radix-ui/react-progress`, але вся її користь
 * там — це aria-атрибути навколо двох div. Тягнути радікс у furni-front
 * заради цього не варто, тож ролі проставлені руками.
 */
function Progress({ value, className, indicatorClassName, ...props }: ProgressProps) {
    const safe = Math.min(100, Math.max(0, value));

    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safe}
            className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
            {...props}
        >
            <div
                className={cn('h-full rounded-full bg-chart-2 transition-all', indicatorClassName)}
                style={{ width: `${safe}%` }}
            />
        </div>
    );
}

export { Progress };
