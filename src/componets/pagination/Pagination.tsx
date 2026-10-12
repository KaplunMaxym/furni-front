import { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/helpers/cn';
import { Button } from '@/ui/shadcn/button';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
import { usePaginationNumbers } from '@/helpers/pagination-number/paginationNumber';

/** Скільки рядків на сторінку можна вибрати. */
export const PAGE_SIZES = [10, 20, 50, 100];

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** Скільки всього записів — для підпису «Показано N з M». */
    totalItems?: number;
    /** Скільки рядків уже на екрані; якщо не передати, вважаємо, що весь ліміт. */
    shownItems?: number;
    limit?: number;
    onLimitChange?: (limit: number) => void;
    disabled?: boolean;
}

/**
 * Смуга під таблицею: скільки показано, скільки на сторінку, і самі сторінки.
 *
 * Раніше це були два різні місця. Вибір кількості рядків стояв угорі, серед
 * фільтрів, хоч він нічого не фільтрує; сторінки — окремою смугою по центру
 * внизу, без жодної згадки, скільки всього записів. Тепер усе, що стосується
 * показу списку, лежить в одному рядку під ним.
 *
 * Смуга не зникає на одній сторінці: підпис «Показано 7 з 7» і вибір кількості
 * потрібні й тоді, а зникома смуга ще й змінювала висоту сторінки.
 */
const PaginationControl: FC<PaginationControlProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    shownItems,
    limit,
    onLimitChange,
    disabled = false,
}) => {
    const paginationNumbers = usePaginationNumbers(currentPage, totalPages);
    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= totalPages;
    const hasPages = totalPages > 1;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-3">
                {totalItems !== undefined && (
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                        Показано {shownItems ?? Math.min(limit ?? totalItems, totalItems)} з {totalItems}
                    </span>
                )}

                {limit !== undefined && onLimitChange && (
                    <SelectorSearch
                        getAndSet={[limit, onLimitChange as never]}
                        searchable={false}
                        className="w-[80px]"
                        options={PAGE_SIZES}
                    />
                )}
            </div>

            {hasPages && (
                <nav aria-label="Сторінки" className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Попередня сторінка"
                        disabled={isFirstPage || disabled}
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    >
                        <ChevronLeft />
                        Назад
                    </Button>

                    {paginationNumbers.map((pageNum, index) =>
                        pageNum === -1 ? (
                            <span
                                key={`ellipsis-${index}`}
                                aria-hidden
                                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={pageNum}
                                type="button"
                                // Поточна сторінка обведена, решта без фону —
                                // так видно, де ти, і рядок не рябить кнопками
                                variant={pageNum === currentPage ? 'outline' : 'ghost'}
                                size="iconSm"
                                aria-current={pageNum === currentPage ? 'page' : undefined}
                                disabled={disabled}
                                onClick={() => onPageChange(pageNum)}
                                className={cn('tabular-nums', pageNum === currentPage && 'border-ring')}
                            >
                                {pageNum}
                            </Button>
                        ),
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Наступна сторінка"
                        disabled={isLastPage || disabled}
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    >
                        Далі
                        <ChevronRight />
                    </Button>
                </nav>
            )}
        </div>
    );
};

export default PaginationControl;
