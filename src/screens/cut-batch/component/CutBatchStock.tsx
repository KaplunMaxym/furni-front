import { FC } from 'react';

import {
    CUT_BATCH_ORIGIN_LABELS,
    ICutBatchConsumedStock,
    ICutBatchStockRow,
} from '@/screens/cut-batch/types/ICutBatch';

interface CutBatchStockProps {
    consumed: ICutBatchConsumedStock[];
    updated: ICutBatchStockRow[];
    scrap: ICutBatchStockRow[];
}

/**
 * Склад після партії: що списати, що покласти назад, що в брухт.
 *
 * Три окремі списки, а не один з колонкою «дія»: проводки в 1С за ними різні,
 * і єдина таблиця, у якій списання й оприбуткування відрізняються лише одним
 * словом у рядку, — найкоротший шлях задвоїти склад.
 */
export const CutBatchStock: FC<CutBatchStockProps> = ({ consumed, updated, scrap }) => {
    const untouched = updated.filter(row => row.origin === 'UNTOUCHED');
    const remainders = updated.filter(row => row.origin !== 'UNTOUCHED');

    return (
        <div className="flex flex-col gap-3">
            <Section
                title="Списати зі складу"
                description="Прутки, що пішли в різ"
                isEmpty={!consumed.length}
                emptyLabel="Складські прутки не використовувались — різали нові хлисти"
            >
                {consumed.map((row, index) => (
                    <Row
                        key={`${row.stockId}-${row.stockCopy}-${index}`}
                        left={`${row.stockId}${row.stockCopy > 1 ? ` #${row.stockCopy}` : ''}`}
                        middle={`${row.articleCode}${row.color ? ` · ${row.color}` : ''}`}
                        right={`${row.length.toFixed(0)} мм → витрачено ${row.usedLength.toFixed(0)}, лишилось ${row.remainder.toFixed(0)}`}
                    />
                ))}
            </Section>

            <Section
                title="Оприбуткувати залишки"
                description="Нові обрізки, довші за поріг відходу"
                isEmpty={!remainders.length}
                emptyLabel="Нових залишків немає"
            >
                {remainders.map((row, index) => (
                    <Row
                        key={`${row.origin}-${row.length}-${index}`}
                        left={`${row.count} шт`}
                        middle={`${row.articleCode}${row.color ? ` · ${row.color}` : ''}`}
                        right={
                            `${row.length.toFixed(0)} мм · ${CUT_BATCH_ORIGIN_LABELS[row.origin]}` +
                            (row.sourceLength ? ` (з ${row.sourceLength.toFixed(0)} мм)` : '')
                        }
                    />
                ))}
            </Section>

            <Section
                title="У відхід"
                description="Коротше за поріг — на склад не повертається"
                isEmpty={!scrap.length}
                emptyLabel="Відходу немає"
            >
                {scrap.map((row, index) => (
                    <Row
                        key={`scrap-${row.length}-${index}`}
                        left={`${row.count} шт`}
                        middle={`${row.articleCode}${row.color ? ` · ${row.color}` : ''}`}
                        right={`${row.length.toFixed(0)} мм · ${CUT_BATCH_ORIGIN_LABELS[row.origin]}`}
                    />
                ))}
            </Section>

            {untouched.length > 0 && (
                <Section
                    title="Не чіпали"
                    description="Прутки зі складу, які в різ не пішли — рядки для звірки"
                    isEmpty={false}
                    emptyLabel=""
                >
                    {untouched.map((row, index) => (
                        <Row
                            key={`untouched-${row.stockId}-${index}`}
                            left={`${row.stockId ?? '—'} · ${row.count} шт`}
                            middle={`${row.articleCode}${row.color ? ` · ${row.color}` : ''}`}
                            right={`${row.length.toFixed(0)} мм`}
                        />
                    ))}
                </Section>
            )}
        </div>
    );
};

interface SectionProps {
    title: string;
    description: string;
    isEmpty: boolean;
    emptyLabel: string;
    children?: React.ReactNode;
}

const Section: FC<SectionProps> = ({ title, description, isEmpty, emptyLabel, children }) => (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-2.5">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col divide-y divide-border">
            {isEmpty ? (
                <p className="px-4 py-3 text-xs text-muted-foreground">{emptyLabel}</p>
            ) : (
                children
            )}
        </div>
    </div>
);

const Row: FC<{ left: string; middle: string; right: string }> = ({ left, middle, right }) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-xs">
        <span className="font-mono text-foreground">{left}</span>
        <span className="text-muted-foreground">{middle}</span>
        <span className="ml-auto tabular-nums text-muted-foreground">{right}</span>
    </div>
);

export default CutBatchStock;
