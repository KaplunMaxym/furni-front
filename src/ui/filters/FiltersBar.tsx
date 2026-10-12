import { FC, ReactNode } from 'react';

import SearchInput from '@/ui/input/SearchInput';
import Button from '@/ui/button/Button';

interface FiltersBarProps {
    /** Поле пошуку. Якщо не передати — смуга починається одразу з селектів. */
    search?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    /** Чи є що скидати — від цього залежить видимість кнопки «Скинути». */
    hasFilters: boolean;
    onReset: () => void;
    /** Селекти, специфічні для екрана: колір, профільна система, статус. */
    children?: ReactNode;
    /** Права частина — зазвичай кнопка «Додати». */
    action?: ReactNode;
}

/**
 * Смуга фільтрів над таблицею.
 *
 * Розкладка однакова на всіх списках, відрізняються лише селекти посередині.
 * Тримати сім копій одного ряду означало б, що будь-яка правка відступів
 * робиться сім разів і десь одного разу забудеться.
 *
 * Кількості рядків на сторінку тут більше немає: це не фільтр, а налаштування
 * показу, і його місце — у смузі під таблицею, поруч зі сторінками.
 */
const FiltersBar: FC<FiltersBarProps> = ({
    search,
    onSearchChange,
    searchPlaceholder,
    hasFilters,
    onReset,
    children,
    action,
}) => (
    <div className="flex flex-wrap gap-3 justify-between items-end">
        <div className="flex flex-wrap items-end gap-3">
            {search !== undefined && onSearchChange && (
                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-[280px]"
                />
            )}

            {children}

            {/* Кнопка з'являється лише коли є що скидати */}
            {hasFilters && (
                <Button color="transparent" className="w-auto mx-0 h-9" onClick={onReset}>
                    Скинути
                </Button>
            )}
        </div>

        {action}
    </div>
);

export default FiltersBar;
