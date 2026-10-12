import React from 'react';

import { IDashboardSystemShare } from '@/screens/main/types/IDashboard';
import { Progress } from '@/ui/shadcn/progress';

interface SystemsShareProps {
    data: IDashboardSystemShare[];
}

/** Кольори смуг — палітра chart із проєкту dashboard. */
const BARS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

const SystemsShare: React.FC<SystemsShareProps> = ({ data }) => {
    const total = data.reduce((sum, s) => sum + s.constructions, 0);

    if (!total) {
        return <p className="text-sm text-muted-foreground">Конструкцій ще немає.</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {data.map((system, i) => {
                const percent = Math.round((system.constructions / total) * 100);

                return (
                    <div key={system.code} className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="truncate text-card-foreground">{system.title}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {system.constructions} · {percent}%
                            </span>
                        </div>
                        <Progress value={percent} indicatorClassName={BARS[i % BARS.length]} />
                    </div>
                );
            })}
        </div>
    );
};

export default SystemsShare;
