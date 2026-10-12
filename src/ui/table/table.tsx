import { ComponentProps, FC } from 'react';

import { cn } from '@/helpers/cn';

interface ITableProps extends ComponentProps<'table'> {
    /**
     * Не давати таблиці рости вище за вікно: вміст гортається всередині.
     *
     * За замовчуванням вимкнено — сталу висоту тримає розмір сторінки, і на
     * десяти рядках коробка на пів екрана виглядала б порожньою. Вмикати варто
     * лише там, де рядків свідомо багато.
     */
    maxHeight?: boolean;
}

/**
 * Таблиця у стилі проєкту dashboard.
 *
 * Обгортка потрібна саме як окремий div: заокруглення на самому `<table>`
 * браузери не клiпають — кутові клітинки все одно вилазять за радіус.
 *
 * Сітки з рамками навколо кожної клітинки більше немає: рядки розділені
 * однією лінією знизу. На широких таблицях (матеріали, аксесуари) суцільна
 * сітка з'їдала увагу сильніше за самі дані.
 */
export const Table: FC<ITableProps> = ({ className, children, maxHeight = false, ...rest }) => {
    return (
        <div
            className={cn(
                'w-full overflow-auto rounded-lg border border-border bg-card',
                maxHeight && 'max-h-[calc(100dvh-260px)]',
            )}
        >
            <table
                className={cn('w-full caption-bottom border-collapse text-sm', className)}
                {...rest}
            >
                {children}
            </table>
        </div>
    );
};
