import { ComponentProps, FC } from 'react';

import { cn } from '@/helpers/cn';

type ITHeadProps = ComponentProps<'tr'>;

/** Рядок заголовків. Стилі клітинок задаємо звідси, бо екрани пишуть голі `<th>`. */
export const TrHead: FC<ITHeadProps> = ({ className, ...rest }) => {
    return (
        <tr
            className={cn(
                // Липкий заголовок працює лише коли обгортка таблиці гортається
                // (`maxHeight`); в інших випадках він просто нічого не робить
                'sticky top-0 z-10 border-b border-border bg-muted',
                '[&>th]:h-10 [&>th]:whitespace-nowrap [&>th]:px-3 [&>th]:text-left',
                '[&>th]:text-xs [&>th]:font-medium [&>th]:text-muted-foreground',
                className,
            )}
            {...rest}
        />
    );
};
