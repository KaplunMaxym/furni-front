import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Button from "@/ui/button/Button";
import PlusSvg from "@/assets/plusSvg";
import {Table} from "@/ui/table/table";
import {TrHead} from "@/ui/table/tr-head";
import {TrBody} from "@/ui/table/tr-body";
import { refreshIcon } from "@/assets";
import useModal from "@/hooks/useModal";
import React, {useState} from "react";
import {cn} from "@/helpers/cn";
import {IOrderStatus} from "@/screens/order/types/order-status/IOrderStataus";
import {useOrderStatusQuery} from "@/screens/order/hooks/order-status/useOrderStatusQuery";
import OrderStatusCreateModal from "@/screens/order/features/order-status-modals/modal-create-order-status";
import {useOrderStatsDelMutation} from "@/screens/order/hooks/order-status/useOrderStatusDelMutation";
import RowActionsCell from '@/ui/table/RowActionsCell';
import PageHeader from "@/ui/page-header/PageHeader";

const OrderStatus = () => {
    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatusQuery();

    const modalCreateOrderStatus = useModal();

    const { mutateAsync: deleteOrderStatus } = useOrderStatsDelMutation();

    const [selectedOrderStatus, setSelectedOrderStatus] = useState<IOrderStatus | null>(null);

    const onEdit = (orderStatus: IOrderStatus) => {
        setSelectedOrderStatus(orderStatus);
        modalCreateOrderStatus.onOpen();
    };

    const handleModalClose = () => {
        setSelectedOrderStatus(null);
        modalCreateOrderStatus.onClose();
    };

    const onDelete = async (id: number) => {
        await deleteOrderStatus({ id });
    };

    return (
        <MainLayout>
            <div className={"flex flex-col gap-3 w-full"}>
                <PageHeader
                    title="Статуси замовлень"
                    description="Довідник станів, через які проходить замовлення"
                />

                <div className={"flex gap-4 justify-end items-end"}>
                    <Button
                        className={"w-auto mx-0 py-0 h-[40px]"}
                        color={"greenDarkgreen"}
                        onClick={() => {
                            modalCreateOrderStatus.onOpen();
                        }}
                    >
                        <PlusSvg width={20} height={20} /> Створити статус замовлення
                    </Button>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className="w-full">
                        <Table>
                            <thead>
                            <TrHead>
                                <th>Код</th>
                                <th>Назва</th>
                                <th>Видно дилеру</th>
                                <th className={"w-[120px]"}></th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataOrderStatus?.orderStatus.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.code}</td>
                                    <td>{item.title}</td>
                                    <td>
                                        {/*
                                          * Плашка, а не «так/ні»: у стовпці з
                                          * десятком рядків око чіпляється саме
                                          * за виняток, а виняток тут — прихований
                                          */}
                                        {item.isVisibleToDealer === false ? (
                                            <span className="rounded-md border border-input px-2 py-0.5 text-xs text-muted-foreground">
                                                Приховано
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Показувати</span>
                                        )}
                                    </td>
                                    <td className="w-[60px]">
                                        <RowActionsCell
                                            onEdit={() => onEdit(item)}
                                            onDelete={() => onDelete(item.id)}
                                        />
                                    </td>
                                </TrBody>
                            ))}
                            {isPendingOrderStatus && (
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

            </div>

            <OrderStatusCreateModal
                {...modalCreateOrderStatus}
                orderStatus={selectedOrderStatus}
                onClose={handleModalClose}
            />
        </MainLayout>
    );
};

export default OrderStatus;