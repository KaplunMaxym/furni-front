import React from 'react';

import { IDashboardMonthPoint } from '@/screens/main/types/IDashboard';
import { monthLabel } from '@/screens/main/utils/formatMonth';

interface MonthlyChartProps {
    data: IDashboardMonthPoint[];
}

/** Висота області стовпчиків, px. */
const CHART_HEIGHT = 150;

/** Щоб одиничне значення не перетворилося на невидиму смужку. */
const MIN_BAR = 3;

/**
 * Замовлення й конструкції по місяцях.
 *
 * Висоти рахуємо в пікселях, а не у відсотках. Відсоток height резолвиться
 * від висоти батька, а колонка всередині flex-рядка має висоту auto —
 * тому стовпчики виходили нульовими й графіка просто не було видно.
 *
 * Кольори — chart-1 і chart-2 із палітри проєкту dashboard. Максимум спільний
 * для обох рядів, мінімум 1 — інакше на порожній базі ділили б на нуль.
 */
const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
    const max = Math.max(1, ...data.flatMap(p => [p.orders, p.constructions]));

    const barHeight = (value: number): number =>
        value > 0 ? Math.max(MIN_BAR, Math.round((value / max) * CHART_HEIGHT)) : 0;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-3">
                {data.map(point => (
                    <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                        <div
                            className="flex w-full items-end justify-center gap-1"
                            style={{ height: CHART_HEIGHT }}
                        >
                            <div
                                className="w-1/3 rounded-t-sm bg-chart-1 transition-all"
                                style={{ height: barHeight(point.orders) }}
                                title={`Замовлень: ${point.orders}`}
                            />
                            <div
                                className="w-1/3 rounded-t-sm bg-chart-2 transition-all"
                                style={{ height: barHeight(point.constructions) }}
                                title={`Конструкцій: ${point.constructions}`}
                            />
                        </div>

                        <span className="text-[11px] text-muted-foreground">
                            {monthLabel(point.month)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-chart-1" /> Замовлення
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-chart-2" /> Конструкції
                </span>
            </div>
        </div>
    );
};

export default MonthlyChart;
