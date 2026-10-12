import { cn } from '@/helpers/cn';

export interface SegmentedTab<T extends string> {
    key: T;
    label: string;
    /** Лічильник праворуч від назви — скільки записів у розділі. */
    count?: number;
}

interface SegmentedTabsProps<T extends string> {
    tabs: ReadonlyArray<SegmentedTab<T>>;
    value: T;
    onChange: (key: T) => void;
    className?: string;
}

/**
 * Перемикач розділів у стилі проєкту dashboard.
 *
 * Активний сегмент підсвічений сам, без окремої «пігулки», що їздить під
 * кнопками. Стара реалізація рахувала зсув як `index * 100%` і жорстко
 * задавала ширину `w-1/2` — вона трималася рівно доти, доки розділів було
 * два й обидві назви мали схожу довжину.
 *
 * Тут `grid-flow-col` + `auto-cols-fr`: усі сегменти рівні між собою й
 * підганяються під найширшу назву. Просто `flex` дав би ширину за вмістом —
 * «Замовлення» вийшло б помітно ширшим за «Статуси», і підсвітка активного
 * розділу стрибала б у розмірі при перемиканні.
 */
function SegmentedTabs<T extends string>({ tabs, value, onChange, className }: SegmentedTabsProps<T>) {
    return (
        <div
            role="tablist"
            className={cn(
                // Класи з shared/ui/tabs.tsx проєкту dashboard
                'inline-grid w-fit shrink-0 grid-flow-col auto-cols-fr items-center rounded-md bg-muted p-0.5 text-muted-foreground/70',
                className,
            )}
        >
            {tabs.map(tab => {
                const active = tab.key === value;

                return (
                    <button
                        key={tab.key}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'inline-flex items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap',
                            'transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            active
                                ? 'bg-background text-foreground shadow-xs'
                                : 'hover:text-muted-foreground',
                        )}
                    >
                        {tab.label}

                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 text-xs tabular-nums',
                                    active ? 'bg-muted text-foreground' : 'bg-background/60 text-muted-foreground',
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export default SegmentedTabs;
