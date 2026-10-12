import { ComponentProps, FC } from 'react';

import { cn } from '@/helpers/cn';

type TBodyProps = ComponentProps<'tr'>;

/**
 * Рядок даних.
 *
 * `overflow-x-auto` замість `overflow-x-scroll`: смуга з'являється лише там,
 * де вміст справді не вміщається, а не під кожною клітинкою.
 */
export const TrBody: FC<TBodyProps> = ({ className, ...rest }) => {
    return (
        <tr
            className={cn(
                'border-b border-border transition-colors last:border-0 hover:bg-muted/50',
                '[&>td]:max-w-[300px] [&>td]:overflow-x-auto [&>td]:whitespace-nowrap',
                // text-foreground/80 замість чистого #FAFAFA: суцільна стіна яскраво-білого
                // тексту на темному тлі втомлює, а заголовки й бейджі мають лишатися
                // помітнішими за рядові значення.
                '[&>td]:px-3 [&>td]:py-2 [&>td]:align-middle [&>td]:text-foreground/80',
                className,
            )}
            {...rest}
        />
    );
};
