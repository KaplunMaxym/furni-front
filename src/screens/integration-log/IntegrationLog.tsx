import { useState } from 'react';

import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import PageHeader from '@/ui/page-header/PageHeader';
import FiltersBar from '@/ui/filters/FiltersBar';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
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
import { useUsersQuery } from '@/screens/users/hooks/user/useUsersQuery';
import { useIntegrationLogsQuery } from '@/screens/integration-log/hooks/useIntegrationLogsQuery';
import { useIntegrationLogFilterStore } from '@/store/integration-log/useIntegrationLogFilter';
import {
    IIntegrationLog,
    INTEGRATION_LOG_STATUS_LABELS,
    INTEGRATION_LOG_STATUS_OPTIONS,
    IntegrationLogStatus,
} from '@/screens/integration-log/types/IIntegrationLog';
import IntegrationLogModal from '@/screens/integration-log/features/modals/modal-integration-log';
import { formatLogDateTime, formatLogDuration } from '@/screens/integration-log/utils/format';

/** Скільки колонок у таблиці — для colSpan службових рядків. */
const COLUMN_COUNT = 7;

/**
 * Журнал обміну з 1С.
 *
 * Сторінка читання: записи створює сам обмін, і ні редагування, ні видалення
 * тут немає — журнал, який можна підчистити, нічого не доказує.
 *
 * Рядок відкривається кліком, а не кнопкою «переглянути»: у журналі дивляться
 * кожен другий рядок, і окрема кнопка в кінці ряду лише забирала б колонку.
 */
const IntegrationLog = () => {
    const { data, isPending, isFetching } = useIntegrationLogsQuery();

    const {
        page, setPage, limit, setLimit,
        search, status, userId, dateFrom, dateTo,
        setFilter, setDateRange, resetFilters,
        sortBy, sortOrder, setSort,
    } = useIntegrationLogFilterStore();

    /*
     * Список користувачів — для фільтра «хто відправляв».
     *
     * Окремого «простого» ендпоінта в користувачів немає, тому беремо той же
     * список, що й сторінка користувачів: він пагінований, але відправляють у
     * 1С одиниці людей, і першої сторінки достатньо.
     */
    const { data: usersData } = useUsersQuery();

    const hasFilters = !!search || status !== null || userId !== null || !!dateFrom || !!dateTo;

    const modalDetails = useModal();
    const [selected, setSelected] = useState<IIntegrationLog | null>(null);

    const meta = data?.meta ?? { totalItems: 0, totalPages: 1, currentPage: page, limit };
    const summary = data?.summary ?? { total: 0, success: 0, failed: 0 };

    const openLog = (log: IIntegrationLog) => {
        setSelected(log);
        modalDetails.onOpen();
    };

    return (
        <MainLayout>
            <div className="flex w-full flex-col gap-3">
                <PageHeader
                    title="Журнал обміну з 1С"
                    description="Кожна відправка замовлення: що пішло, що відповіла 1С, скільки це зайняло"
                    badges={
                        <>
                            <Badge variant="outline">Усього: {summary.total}</Badge>
                            <Badge variant="success">Успішних: {summary.success}</Badge>
                            {/* Плашку помилок показуємо завжди: нуль помилок — теж відповідь */}
                            <Badge variant={summary.failed > 0 ? 'destructive' : 'secondary'}>
                                Помилок: {summary.failed}
                            </Badge>
                        </>
                    }
                />

                <FiltersBar
                    search={search}
                    onSearchChange={value => setFilter('search', value)}
                    searchPlaceholder="Номер, назва замовлення або текст помилки"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                >
                    <SelectorSearch
                        getAndSet={[
                            status,
                            value => setFilter('status', (value as IntegrationLogStatus) || null),
                        ]}
                        options={INTEGRATION_LOG_STATUS_OPTIONS}
                        optionValue="value"
                        optionLabel="label"
                        placeholder="Будь-який статус"
                        allowClear
                        searchable={false}
                        className="w-[190px]"
                    />

                    <SelectorSearch
                        getAndSet={[
                            userId,
                            value => setFilter('userId', value ? Number(value) : null),
                        ]}
                        options={usersData?.users}
                        optionValue="id"
                        optionLabel="name"
                        placeholder="Будь-який користувач"
                        allowClear
                        className="w-[220px]"
                    />

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
                                <SortableTh field="orderNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Замовлення
                                </SortableTh>
                                <SortableTh field="status" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Статус
                                </SortableTh>
                                <SortableTh field="httpStatus" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Код
                                </SortableTh>
                                <SortableTh field="durationMs" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Тривалість
                                </SortableTh>
                                <SortableTh field="user" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>
                                    Користувач
                                </SortableTh>
                                <th>Помилка</th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {data?.logs.map(log => (
                                <TrBody
                                    key={log.id}
                                    className="cursor-pointer"
                                    onClick={() => openLog(log)}
                                >
                                    <td className="whitespace-nowrap">{formatLogDateTime(log.createdAt)}</td>
                                    <td>
                                        {log.order ? (
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm">№ {log.order.orderNumber}</span>
                                                {log.order.name && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.order.name}
                                                    </span>
                                                )}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <Badge variant={log.status === 'SUCCESS' ? 'success' : 'destructive'}>
                                            {INTEGRATION_LOG_STATUS_LABELS[log.status]}
                                        </Badge>
                                    </td>
                                    <td className="font-mono text-sm">{log.httpStatus ?? '—'}</td>
                                    <td className="whitespace-nowrap">{formatLogDuration(log.durationMs)}</td>
                                    <td>{log.user?.name ?? '—'}</td>
                                    {/*
                                      * Помилка в один рядок із обрізанням: повний текст буває на
                                      * півекрана, і таблиця від нього розповзається. Цілий текст —
                                      * у записі, який відкривається кліком.
                                      */}
                                    <td className="max-w-[280px]">
                                        <span
                                            className="block truncate text-sm text-muted-foreground"
                                            title={log.error ?? undefined}
                                        >
                                            {log.error ?? '—'}
                                        </span>
                                    </td>
                                </TrBody>
                            ))}
                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPending}
                                isEmpty={data?.logs.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="Обміну з 1С ще не було"
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

            <IntegrationLogModal
                {...modalDetails}
                log={selected}
                onClose={() => {
                    setSelected(null);
                    modalDetails.onClose();
                }}
            />
        </MainLayout>
    );
};

export default IntegrationLog;
