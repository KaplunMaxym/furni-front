import { FC, useState } from 'react';
import { Download } from 'lucide-react';

import Modal from '@/ui/Modal/Modal';
import { ModalProps } from '@/hooks/useModal/useModal';
import Button from '@/ui/button/Button';
import { Badge } from '@/ui/shadcn/badge';
import { cn } from '@/helpers/cn';
import { refreshIcon } from '@/assets';
import { useCutBatchQuery } from '@/screens/cut-batch/hooks/useCutBatchQuery';
import { ICutBatch } from '@/screens/cut-batch/types/ICutBatch';
import { CutBatchPlan } from '@/screens/cut-batch/component/CutBatchPlan';
import { CutBatchStock } from '@/screens/cut-batch/component/CutBatchStock';
import { formatBatchDateTime } from '@/screens/cut-batch/utils/format';

type Props = ModalProps & {
    /** Рядок, на який натиснули. Потрібен, щоб показати шапку ще до завантаження плану. */
    batch: ICutBatch | null;
};

type Tab = 'plan' | 'stock';

/**
 * Партія різу: карта розкрою й склад після неї.
 *
 * Два таби, а не все підряд: розкрій — це десятки прутків, і проводки по
 * складу під ними ніхто б не знайшов, хоча саме вони потрібні комірнику.
 */
const CutBatchModal: FC<Props> = ({ batch, ...props }) => {
    const [tab, setTab] = useState<Tab>('plan');
    const { data, isPending, isError } = useCutBatchQuery(props.open ? batch?.id ?? null : null);

    const pdfUrl = data?.pdfUrl ?? batch?.pdfUrl ?? null;

    return (
        <Modal {...props} className="max-w-[1100px]">
            <Modal.Title className="gap-2" onClose={props.onClose}>
                <div className="flex flex-wrap items-center gap-2">
                    <span>Партія різу</span>
                    {batch && (
                        <>
                            <span className="font-mono text-xs text-muted-foreground">
                                {batch.externalId}
                            </span>
                            <Badge variant="outline">Прутків: {batch.barsCount}</Badge>
                            <Badge variant="secondary">Нових: {batch.freshBarsUsed}</Badge>
                            <span className="text-xs font-normal text-muted-foreground">
                                {formatBatchDateTime(batch.createdAt)}
                            </span>
                        </>
                    )}
                </div>
            </Modal.Title>

            <Modal.Body className="gap-4">
                {data && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span>
                            Замовлення:{' '}
                            <span className="text-foreground">
                                {data.plan.orders
                                    .map(order => `№${order.orderNumber}`)
                                    .join(', ') || '—'}
                            </span>
                        </span>
                        <span>
                            Пропил: <span className="text-foreground">{data.kerf} мм</span>
                        </span>
                        <span>
                            Деталей на:{' '}
                            <span className="text-foreground">
                                {data.plan.consumption.totalPieceLength.toFixed(0)} мм
                            </span>
                        </span>
                        <span>
                            Відхід:{' '}
                            <span className="text-foreground">
                                {data.plan.consumption.totalWasteLength.toFixed(0)} мм
                            </span>
                        </span>
                    </div>
                )}

                {/* Попередження партії — над табами: їх читають раніше, ніж схему */}
                {data?.plan.warnings.map((warning, index) => (
                    <div
                        key={index}
                        className="rounded-md border border-chart-3/40 bg-chart-3/10 p-3"
                    >
                        <p className="text-sm text-foreground">{warning}</p>
                    </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-1 rounded-md border border-input p-1">
                        {(['plan', 'stock'] as Tab[]).map(value => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTab(value)}
                                className={cn(
                                    'cursor-pointer rounded px-3 py-1 text-sm transition-colors',
                                    tab === value
                                        ? 'bg-secondary text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {value === 'plan' ? 'Розкрій' : 'Склад після партії'}
                            </button>
                        ))}
                    </div>

                    {/*
                      * Силка, а не кнопка з генерацією: файл уже лежить на сервері —
                      * той самий, що пішов у 1С. Перегенерувати його з інтерфейсу
                      * означало б дати цеху другу карту розкрою на той самий метал.
                      */}
                    <a
                        href={pdfUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(!pdfUrl && 'pointer-events-none')}
                    >
                        <Button color="grayGreen" className="mx-0 h-9 w-auto" disabled={!pdfUrl}>
                            <Download size={16} /> PDF розкрою
                        </Button>
                    </a>
                </div>

                <div className="max-h-[60vh] overflow-auto">
                    {isPending && (
                        <div className="flex h-6 w-full animate-spin justify-center">
                            <img src={refreshIcon} alt="оновлення" />
                        </div>
                    )}

                    {isError && (
                        <p className="text-sm text-destructive-foreground">
                            Не вдалося завантажити партію
                        </p>
                    )}

                    {data && tab === 'plan' && (
                        <CutBatchPlan
                            materials={data.plan.materials}
                            constructions={data.constructions}
                        />
                    )}

                    {data && tab === 'stock' && (
                        <CutBatchStock
                            consumed={data.plan.stock.consumed}
                            updated={data.plan.stock.updated}
                            scrap={data.plan.stock.scrap}
                        />
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CutBatchModal;
