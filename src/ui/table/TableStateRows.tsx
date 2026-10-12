import { FC } from 'react';

import { TrBody } from '@/ui/table/tr-body';
import { refreshIcon } from '@/assets';

interface TableStateRowsProps {
    /** Скільки колонок у таблиці — інакше службовий рядок не розтягнеться. */
    columnCount: number;
    isPending: boolean;
    isEmpty: boolean;
    hasFilters: boolean;
    /** Потрібне лише там, де є що скидати — на довідниках без фільтрів немає. */
    onReset?: () => void;
    /** Що написати, коли записів немає й фільтри не задані. */
    emptyLabel: string;
}

/**
 * Службові рядки таблиці: завантаження і порожній результат.
 *
 * Порожню таблицю треба пояснити, і пояснення різні: без фільтрів це
 * «довідник ще не заповнений», з фільтрами — «спробуйте інакше». Друге
 * потребує кнопки скидання, бо інакше користувач шукає її очима зверху.
 */
const TableStateRows: FC<TableStateRowsProps> = ({
    columnCount,
    isPending,
    isEmpty,
    hasFilters,
    onReset,
    emptyLabel,
}) => {
    if (isPending) {
        return (
            <TrBody>
                <td colSpan={columnCount}>
                    <div className="w-full h-6 animate-spin flex justify-center">
                        <img src={refreshIcon} alt="оновлення" />
                    </div>
                </td>
            </TrBody>
        );
    }

    if (!isEmpty) return null;

    return (
        <TrBody>
            <td colSpan={columnCount}>
                <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
                    {hasFilters ? (
                        <>
                            <span>За цими фільтрами нічого не знайдено</span>
                            <button
                                type="button"
                                onClick={onReset}
                                className="text-foreground underline-offset-4 hover:underline"
                            >
                                Скинути фільтри
                            </button>
                        </>
                    ) : (
                        <span>{emptyLabel}</span>
                    )}
                </div>
            </td>
        </TrBody>
    );
};

export default TableStateRows;
