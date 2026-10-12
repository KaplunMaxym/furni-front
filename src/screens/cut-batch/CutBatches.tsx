import { useState } from 'react';
import { Download } from 'lucide-react';

import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import PageHeader from '@/ui/page-header/PageHeader';
import FiltersBar from '@/ui/filters/FiltersBar';
import { DateRangeField } from '@/componets/date-picker/DatePicker';
import { Table } from '@/ui/table/table';
import { TrHead } from '@/ui/table/tr-head';
import { TrBody } from '@/ui/table/tr-body';
import SortableTh from '@/ui/table/SortableTh';
import TableStateRows from '@/ui/table/TableStateRows';
import PaginationControl from '@/componets/pagination/Pagination';
import { Badge } from '@/ui/shadcn/badge';
import { cn } from '@/helpers/cn';
import useModal from '@/hooks/useModal';
import { useCutBatchesQuery } from '@/screens/cut-batch/hooks/useCutBatchesQuery';
import { useCutBatchFilterStore } from '@/store/cut-batch/useCutBatchFilter';
import { ICutBatch } from '@/screens/cut-batch/types/ICutBatch';
import CutBatchModal from '@/screens/cut-batch/features/modals/modal-cut-batch';
import { formatBatchDateTime } from '@/screens/cut-batch/utils/format';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 6;

/**
 * Партії різу з 1С.
 *
 * Сторінка читання: партії створює сам обмін, і «порахувати заново» тут немає
 * навмисно — за тим самим номером цех уже отримав карту розкрою й, можливо,
 * порізав метал. Новий розкрій — це нова партія з 1С.
 *
 * Рядок відкривається кліком: дивляться майже кожен, і окрема кнопка
 * «переглянути» лише забирала б колонку в кінці ряду.
 */
const CutBatches = () => {
    const { data, isPending, isFetching } = useCutBatchesQuery();

    const {
        page, setPage, limit, setLimit,
        search, dateFrom, dateTo,
        setFilter, setDateRange, resetFilters,
        sortBy, sortOrder, setSort,
    } = useCutBatchFilterStore();

    const hasFilters = !!search || !!dateFrom || !!dateTo;

    const modalDetails = useModal();
    const [selected, setSelected] = useState<ICutBatch | null>(null);

    const meta = data?.meta ?? { totalItems: 0, totalPages: 1, currentPage: page, limit };

    const openBatch = (batch: ICutBatch) => {
        setSelected(batch);
        modalDetails.onOpen();
    };

    return (
        <MainLayout>
            <div className="flex w-full flex-col gap-3">
                <PageHeader
                    title="Партії різу"
                    description="Розкрій, який 1С забрала у виробництво: прутки, деталі, склад після партії"
                    badges={<Badge variant="outline">Усього: {meta.totalItems}</Badge>}
                />

                <FiltersBar
                    search={search}
                    onSearchChange={value => setFilter('search', value)}
                    searchPlaceholder="Номер партії, номер або назва замовлення"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                >
                    <DateRangeField
                        from={dateFrom}
                        to={dateTo}
                        onChange={(from, to) => setDateRange(from, to)}
                        placeholder="Період"
                        className="w-[280px]"
                    />
                </FiltersBar>

                <div className="flex flex-col items-center justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            'w-full transition-opacity',
                            isFetching && !isPending && 'opacity-60',
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Коли
                                </SortableTh>
                                <SortableTh field="externalId" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Партія
                                </SortableTh>
                                <th>Замовлення</th>
                                <th>Прутків</th>
                                <SortableTh field="freshBarsUsed" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Нових
                                </SortableTh>
                                <th>PDF</th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.batches.map(batch => (
                                <TrBody
                                    key={batch.id}
                                    className="cursor-pointer"
                                    onClick={() => openBatch(batch)}
                                >
                                    <td className="whitespace-nowrap">
                                        {formatBatchDateTime(batch.createdAt)}
                                    </td>
                                    <td className="font-mono text-sm">{batch.externalId}</td>
                                    <td>
                                        <div className="flex flex-col">
                                            {batch.orders.map(order => (
                                                <span key={order.id} className="text-sm">
                                                    <span className="font-mono">№ {order.orderNumber}</span>
                                                    {order.name && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {' '}· {order.name}
                                                        </span>
                                                    )}
                                                </span>
                                            ))}
                                            {!batch.orders.length && '—'}
                                        </div>
                                    </td>
                                    <td className="tabular-nums">{batch.barsCount}</td>
                                    <td className="tabular-nums">{batch.freshBarsUsed}</td>
                                    {/*
                                      * Клік на силці не має відкривати партію: людина
                                      * натиснула «завантажити», а не «подивитись».
                                      */}
                                    <td onClick={event => event.stopPropagation()}>
                                        {batch.pdfUrl ? (
                                            <a
                                                href={batch.pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            >
                                                <Download size={14} /> Завантажити
                                            </a>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                немає
                                            </span>
                                        )}
                                    </td>
                                </TrBody>
                            ))}
                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPending}
                                isEmpty={data?.batches.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="1С ще не забирала розкрій"
                            />
                            </tbody>
                        </Table>
                    </div>
                </div>

                <PaginationControl
                    currentPage={meta.currentPage}
                    totalPages={meta.totalPages}
                    onPageChange={setPage}
                    totalItems={meta.totalItems}
                    limit={limit}
                    onLimitChange={setLimit}
                    disabled={isPending}
                />
            </div>

            <CutBatchModal
                {...modalDetails}
                batch={selected}
                onClose={() => {
                    setSelected(null);
                    modalDetails.onClose();
                }}
            />
        </MainLayout>
    );
};

export default CutBatches;
