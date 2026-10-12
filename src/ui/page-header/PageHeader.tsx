import { FC, ReactNode } from 'react';

import { cn } from '@/helpers/cn';

interface PageHeaderProps {
    title: ReactNode;
    /** Плашки в тому ж рядку, що й заголовок: номер, клієнт, статус. */
    badges?: ReactNode;
    /** Один рядок про те, що на сторінці — без нього заголовок висить сам по собі. */
    description?: ReactNode;
    /** Кнопка «Повернутися» або інше, що стоїть перед заголовком. */
    leading?: ReactNode;
    /** Дії сторінки — притиснуті до правого краю. */
    actions?: ReactNode;
    className?: string;
}

/**
 * Плашка біля заголовка.
 *
 * Підпис усередині самої плашки, а не поруч із нею: «№ 000001» читається без
 * пояснень, а просто «000001» доводилось розгадувати — номер це, кількість
 * чи код.
 */
export const HeaderBadge: FC<{ children: ReactNode; mono?: boolean }> = ({ children, mono }) => (
    <span
        className={cn(
            'shrink-0 rounded-md border border-input px-2 py-0.5 text-xs text-muted-foreground',
            mono && 'font-mono',
        )}
    >
        {children}
    </span>
);

/**
 * Шапка сторінки: заголовок, плашки поруч і рядок пояснення під ним.
 *
 * Так підписані сторінки в проєкті dashboard. Назва сама по собі не каже, що
 * саме перед тобою: на сторінці замовлення стоїть «TEST» — те, що хтось увів
 * колись. Номер, клієнт і статус лишаються в тому ж рядку плашками, а
 * `description` пояснює сторінку загалом.
 */
const PageHeader: FC<PageHeaderProps> = ({
    title,
    badges,
    description,
    leading,
    actions,
    className,
}) => (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
        {/*
          * Усе по центру одного рядка. Було `items-start` із поправкою `mt-0.5`
          * на кнопку: кнопка, заголовок і плашки різної висоти вирівнювались
          * по верхньому краю, тож стояли трьома сходинками замість однієї лінії.
          */}
        <div className="flex min-w-0 items-center gap-3">
            {leading && <div className="shrink-0">{leading}</div>}

            <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="truncate text-2xl font-semibold leading-none tracking-tight text-foreground">
                        {title}
                    </h2>
                    {badges}
                </div>

                {description && (
                    <p className="mt-1.5 truncate text-sm leading-none text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
);

export default PageHeader;

/**
 * Заголовок розділу всередині сторінки.
 *
 * Сторінки замовлення й профільної системи — це бокове меню й полотно поруч.
 * Полотно починалося одразу з полів чи таблиці, тож те, який саме розділ
 * відкрито, доводилось шукати очима в меню ліворуч. Той самий заголовок і
 * підпис, лише дрібніші за шапку сторінки.
 */
export const SectionHeading: FC<{
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}> = ({ title, description, actions, className }) => (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
        <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground">{title}</h3>
            {description && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{description}</p>
            )}
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
);
