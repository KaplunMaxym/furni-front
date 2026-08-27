import {useOrderQuery} from "@/screens/order/hooks/order/useOrderQuery";
import {useOrderFilterStore} from "@/store/order/order-store/useOrderFilter";
import useModal from "@/hooks/useModal";
import React, {useState} from "react";
import ToggleOrder from "@/screens/order/shared/toggle-order";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import {Table} from "@/ui/table/table";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import {EditSvg, refreshIcon} from "@/assets";
import {cn} from "@/helpers/cn";
import PaginationControl from "@/componets/pagination/Pagination";
import {useOrderUpdateMutation} from "@/screens/order/hooks/order/useOrderUpdateMutation";
import {useOrderStatus} from "@/screens/order/hooks/order-status/useOrderStatus";
import OrderCreateModal from "@/screens/order/features/order-modals/modal-create-order";
import {formatDateTime} from "@/utils/time/formatDateTime";
import {useNavigate} from "react-router";
import {Eye} from "lucide-react";
import {useClient} from "@/screens/client/hooks/useClient";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import {IOrderFilterForm} from "@/screens/order/types/order/IOrderFilterForm";
import {IOrderQuery} from "@/screens/order/types/order/IOrderQuery";
import {PRICE_CATEGORIES} from "@/screens/order/types/order/IOrderForm";

const Order = () => {
    const {control} = useForm<IOrderFilterForm>()
    const navigate = useNavigate();

    const { data: dataOrder, isPending: isPendingOrder } = useOrderQuery();
    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();
    const { data: dataClients, isPending: isPendingClients } = useClient();

    const {
        page, setPage,
        limit, setLimit,
        client, setClient,
        status, setStatus,
        orderNumber, setOrderNumber
    } = useOrderFilterStore();

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

    const { totalPages, currentPage } = meta;

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
        <>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex items-center flex-row gap-4"}>
                        <ToggleOrder />

                        <SelectorSearch
                            getAndSet={[limit, setLimit]}
                            searchable={false}
                            className={'w-[80px]'}
                            options={[20, 40, 60, 80]}
                        />

                        <Input
                            placeholder={'Номер замовлення'}
                            control={control}
                            name={'orderNumber'}
                            value={orderNumber}
                            className={'w-[180px]'}
                            onChange={(e) => setOrderNumber(e.target.value)}
                        />

                        {!isPendingClients && formattedUsersOptions.length > 0 && (
                            <SelectorSearch
                                getAndSet={[client, (value: string) => setClient(value || '')]}
                                className={'w-[180px]'}
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
                                className={'w-[180px]'}
                                options={formattedOrderStatusOptions}
                                allowClear={true}
                                placeholder={'Всі статуси'}
                                optionValue="value"
                                optionLabel="label"
                                searchable={true}
                            />
                        )}
                    </div>

                    <Button
                        className={"w-auto mx-0 py-0 h-[40px]"}
                        color={"greenDarkgreen"}
                        onClick={() => {
                            modalCreateOrder.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Створити замовлення
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Номер</th>
                                <th>Назва</th>
                                <th>Клієнт</th>
                                <th>Статус</th>
                                <th>Категорія</th>
                                <th>Створено</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataOrder?.orders.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.orderNumber}</td>
                                    <td>{item.name}</td>
                                    <td>{item.client.firstName + ' ' + item.client.lastName}</td>
                                    <td className={'!max-w-[150px] !p-0'}>
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
                                            <span className="text-gray-400">Завантаження...</span>
                                        )}
                                    </td>
                                    <td className={'!max-w-[160px] !p-0'}>
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
                                    <td>{formatDateTime(item.createdAt)}</td>
                                    <td className={"!p-0 flex flex-row g-2"}>
                                        <Button
                                            className={"min-h-[36px] w-fit"}
                                            color="blue"
                                            onClick={() => onView(item)}
                                            title="Переглянути деталі замовлення"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            className={"min-h-[36px] w-fit"}
                                            color="greenDarkgreen"
                                            onClick={() => onEdit(item)}
                                        >
                                            <img
                                                src={EditSvg}
                                                alt={"редагувати"}
                                                className="w-4 h-4"
                                            />
                                        </Button>
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingOrder && (
                                <TrBody>
                                    <td colSpan={6}>
                                        <div
                                            className={cn(
                                                "w-full h-6 animate-spin flex justify-center"
                                            )}
                                        >
                                            <img
                                                src={refreshIcon}
                                                alt={"оновлення"}
                                            />
                                        </div>
                                    </td>
                                </TrBody>
                            )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    disabled={isPendingOrder}
                />
            </div>

            <OrderCreateModal
                {...modalCreateOrder}
                order={selectedOrder}
                onClose={handleModalClose}
            />
        </>
    );
};

export default Order;