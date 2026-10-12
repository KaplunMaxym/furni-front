import * as React from 'react';

import { cn } from '@/helpers/cn';

/** Скелет завантаження з проєкту dashboard. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('animate-pulse rounded-md bg-accent', className)} {...props} />;
}

export { Skeleton };
