import React from 'react';

import { Card, CardContent } from '@/ui/shadcn/card';
import { cn } from '@/helpers/cn';

interface KpiCardProps {
    label: string;
    value: number | string;
    unit?: string;
    hint?: string;
    icon: React.ReactNode;
    /** Колір іконки — з палітри chart проєкту dashboard. */
    iconClassName?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, unit, hint, icon, iconClassName }) => (
    <Card>
        <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-card-foreground">
                    {value}
                    {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
                </p>
                {hint && <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>}
            </div>

            <span className={cn('shrink-0 text-muted-foreground', iconClassName)}>{icon}</span>
        </CardContent>
    </Card>
);

export default KpiCard;
