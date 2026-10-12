import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import {useOrderQuery} from "@/screens/order/hooks/order/useOrderQuery";
import {useOrderFilterStore} from "@/store/order/order-store/useOrderFilter";
import useModal from "@/hooks/useModal";
import React, {useState} from "react";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import {Table} from "@/ui/table/table";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import {cn} from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import {useOrderUpdateMutation} from "@/screens/order/hooks/order/useOrderUpdateMutation";
import {useOrderStatus} from "@/screens/order/hooks/order-status/useOrderStatus";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import {formatDateTime} from "@/utils/time/formatDateTime";
import {useNavigate} from "react-router";
import {Eye} from "lucide-react";
import {useClient} from "@/screens/client/hooks/useClient";
import {IOrderQuery} from "@/screens/order/types/order/IOrderQuery";
import {PRICE_CATEGORIES} from "@/screens/order/types/order/IOrderForm";
import RowActionsCell from '@/ui/table/RowActionsCell';
import FiltersBar from '@/ui/filters/FiltersBar';
import TableStateRows from '@/ui/table/TableStateRows';
import PageHeader from "@/ui/page-header/PageHeader";
import SortableTh from '@/ui/table/SortableTh';
import { DateRangeField } from '@/componets/date-picker/DatePicker';
import {useAuthStore} from "@/store/auth/authReducer";
import {isDealerRole} from "@/config/RoleEnum";

const Order = () => {
    const navigate = useNavigate();

    /*
     * У дилера всі замовлення — його власні, а цінову категорію він не бачить
     * узагалі. Тож колонки «Клієнт» і «Категорія» та фільтр за клієнтом для
     * нього зникають: перша повторювала б його імʼя в кожному рядку, друга
     * показувала б те, чого йому знати не належить.
     */
    const { role } = useAuthStore();
    const isDealer = isDealerRole(role);

    /** Скільки колонок у таблиці — для colSpan службових рядків. */
    const COLUMN_COUNT = isDealer ? 5 : 7;

    const { data: dataOrder, isPending: isPendingOrder, isFetching } = useOrderQuery();
    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();
    // Довідник клієнтів дилеру закритий — запит просто не робимо
    const { data: dataClients, isPending: isPendingClients } = useClient({ enabled: !isDealer });

    const {
        page, setPage,
        limit, setLimit,
        client, setClient,
        status, setStatus,
        search, setSearch,
        dateFrom, setDateFrom, dateTo, setDateTo,
        resetFilters, sortBy, sortOrder, setSort} = useOrderFilterStore();

    const hasFilters = !!search || (!isDealer && !!client) || !!status || !!dateFrom || !!dateTo;

    const modalCreateOrder = useModal();

    const [selectedOrder, setSelectedOrder] = useState<IOrderQuery | null>(null);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<Record<string, number>>({});
    const [selectedPriceCategory, setSelectedPriceCategory] = useState<Record<number, string>>({});

    const { mutateAsync: mutateAsyncUpdateOrder } = useOrderUpdateMutation();

    const meta = dataOrder?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        limit: 20,
    };

    const { totalItems, totalPages, currentPage } = meta;

    const onEdit = (order: IOrderQuery)  => {
        setSelectedOrder(order);
        modalCreateOrder.onOpen();
    };

    const onView = (order: IOrderQuery) => {
        navigate(`/order/${order.id}`);
    };

    const handleModalClose = () => {
        setSelectedOrder(null);
        modalCreateOrder.onClose();
    };

    const formattedUsersOptions = dataClients?.map(client => ({
        label: `${client.firstName} ${client.lastName}`,
        value: client.id
    })) || [];

    const formattedOrderStatusOptions = dataOrderStatus?.map(orderStatus => ({
        label: orderStatus.title,
        value: orderStatus.id
    })) || [];

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Замовлення"
                    // «Усі» тут неправда: дилеру список звужений до його власних
                    description={isDealer
                        ? 'Ваші замовлення: статус, конструкції та вартість'
                        : 'Усі замовлення з їх статусами, конструкціями та вартістю'}
                />

                {/* limit тут рядок, бо стор замовлень синхронізується з
                    адресним рядком; решта списків тримає його числом */}
                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Номер або назва замовлення"
                    hasFilters={hasFilters}
                    onReset={resetFilters}
                    action={
                        <Button
                            className={"w-auto mx-0 py-0 h-[40px]"}
                            color={"greenDarkgreen"}
                            onClick={() => {
                                modalCreateOrder.onOpen();
                            }}
                        >
                            <PlusSvg width={20} height={20} /> Створити замовлення
                        </Button>
                    }
                >
                    {!isDealer && !isPendingClients && formattedUsersOptions.length > 0 && (
                        <SelectorSearch
                            getAndSet={[client, (value: string) => setClient(value || '')]}
                            className={'w-[200px]'}
                            options={formattedUsersOptions}
                            allowClear={true}
                            placeholder={'Всі клієнти'}
                            optionValue="value"
                            optionLabel="label"
                            searchable={true}
                        />
                    )}

                    {!isPendingOrderStatus && formattedOrderStatusOptions.length > 0 && (
                        <SelectorSearch
                            getAndSet={[status, (value: string) => setStatus(value || '')]}
                            className={'w-[200px]'}
                            options={formattedOrderStatusOptions}
                            allowClear={true}
                            placeholder={'Всі статуси'}
                            optionValue="value"
                            optionLabel="label"
                            searchable={true}
                        />
                    )}

                    {/* Період створення — один вибір на обидві межі */}
                    <DateRangeField
                        from={dateFrom}
                        to={dateTo}
                        onChange={(from, to) => {
                            setDateFrom(from);
                            setDateTo(to);
                        }}
                        placeholder="Період створення"
                        className="w-[280px]"
                    />
                </FiltersBar>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    {/* Під час підвантаження показуємо старі рядки приглушено */}
                    <div
                        className={cn(
                            "w-full transition-opacity",
                            isFetching && !isPendingOrder && "opacity-60",
                        )}
                    >
                        <Table>
                            <thead>
                            <TrHead>
                                <SortableTh field="orderNumber" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Номер</SortableTh>
                                <SortableTh field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Назва</SortableTh>
                                {!isDealer && (
                                    <SortableTh field="client" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Клієнт</SortableTh>
                                )}
                                <th>Статус</th>
                                {!isDealer && <th>Категорія</th>}
                                <SortableTh field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort}>Створено</SortableTh>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataOrder?.orders.map((item) => (
                                <TrBody
                                    key={item.id}
                                    onClick={() => onView(item)}
                                    className="cursor-pointer"
                                >
                                    <td>{item.orderNumber}</td>
                                    <td>{item.name}</td>
                                    {!isDealer && (
                                        <td>{item.client.firstName + ' ' + item.client.lastName}</td>
                                    )}
                                    <td className={'!max-w-[150px]'}>
                                        {!isPendingOrderStatus ? (
                                            <SelectorSearch
                                                getAndSet={[
                                                    selectedOrderStatus[item.id] || item.status?.id || '',
                                                    async (value: number | string) => {
                                                        if (!value || value === '') return;

                                                        const numericValue = Number(value);

                                                        setSelectedOrderStatus(prev => ({
                                                            ...prev,
                                                            [item.id]: numericValue
                                                        }));

                                                        try {
                                                            await mutateAsyncUpdateOrder({
                                                                statusId: numericValue,
                                                                id: item.id
                                                            });
                                                        } catch (error) {
                                                            console.error('Error updating order status:', error);
                                                            setSelectedOrderStatus(prev => {
                                                                const updated = {...prev};
                                                                delete updated[item.id];
                                                                return updated;
                                                            });
                                                        }
                                                    }
                                                ]}
                                                options={formattedOrderStatusOptions}
                                                placeholder={'Обрати статус'}
                                                optionValue="value"
                                                optionLabel="label"
                                                isEmptyValueDisable={true}
                                                searchable={true}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">Завантаження...</span>
                                        )}
                                    </td>
                                    {!isDealer && (
                                    <td className={'!max-w-[160px]'}>
                                        <SelectorSearch
                                            getAndSet={[
                                                selectedPriceCategory[item.id] ?? item.priceCategory ?? 'REPRESENTATIVE',
                                                async (value: string) => {
                                                    if (!value) return;
                                                    setSelectedPriceCategory(prev => ({ ...prev, [item.id]: value }));
                                                    try {
                                                        await mutateAsyncUpdateOrder({ priceCategory: value, id: item.id });
                                                    } catch (error) {
                                                        console.error('Error updating price category:', error);
                                                        setSelectedPriceCategory(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[item.id];
                                                            return updated;
                                                        });
                                                    }
                                                }
                                            ]}
                                            options={PRICE_CATEGORIES}
                                            placeholder={'Категорія'}
                                            optionValue="value"
                                            optionLabel="label"
                                            isEmptyValueDisable={true}
                                            searchable={false}
                                        />
                                    </td>
                                    )}
                                    <td>{formatDateTime(item.createdAt)}</td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            extra={[{
                                                label: 'Переглянути',
                                                icon: <Eye className="h-4 w-4" />,
                                                onSelect: () => onView(item),
                                            }]}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            <TableStateRows
                                columnCount={COLUMN_COUNT}
                                isPending={isPendingOrder}
                                isEmpty={dataOrder?.orders.length === 0}
                                hasFilters={hasFilters}
                                onReset={resetFilters}
                                emptyLabel="Замовлень ще немає"
                            />
                            </tbody>
                        </Table>
                    </div>
                </div>

                <PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    limit={Number(limit)}
                    onLimitChange={value => setLimit(String(value))}
                    disabled={isPendingOrder}
                />
            </div>

            <OrderCreateModal
                {...modalCreateOrder}
                order={selectedOrder}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default Order;