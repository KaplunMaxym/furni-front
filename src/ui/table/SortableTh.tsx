import { FC, ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/helpers/cn';

export type SortOrder = 'asc' | 'desc';

export interface SortState {
    sortBy?: string;
    sortOrder?: SortOrder;
}

interface SortableThProps extends SortState {
    /** Ключ поля — той самий, що знає бек у своєму білому списку. */
    field: string;
    onSort: (field: string, order: SortOrder) => void;
    children: ReactNode;
    className?: string;
}

/**
 * Заголовок колонки, за яким можна сортувати.
 *
 * Стрілка є завжди — просто бліда, поки колонка не вибрана. Показувати її лише
 * в активної означало б, що про саму можливість сортувати ніхто не здогадається,
 * поки випадково не клацне.
 *
 * Клік перемикає напрямок; на новій колонці починаємо зі зростання.
 */
const SortableTh: FC<SortableThProps> = ({
    field,
    sortBy,
    sortOrder = 'asc',
    onSort,
    children,
    className,
}) => {
    const isActive = sortBy === field;
    const nextOrder: SortOrder = isActive && sortOrder === 'asc' ? 'desc' : 'asc';

    const Icon = !isActive ? ChevronsUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;

    return (
        <th className={className}>
            <button
                type="button"
                onClick={() => onSort(field, nextOrder)}
                aria-label={`Сортувати за «${typeof children === 'string' ? children : field}»`}
                className={cn(
                    'group -mx-1 flex items-center gap-1 rounded px-1 py-0.5 transition-colors',
                    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    isActive ? 'text-foreground' : 'hover:text-foreground',
                )}
            >
                {children}
                <Icon
                    className={cn(
                        'h-3 w-3 shrink-0 transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100',
                    )}
                />
            </button>
        </th>
    );
};

export default SortableTh;
