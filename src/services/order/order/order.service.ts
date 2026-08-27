import {IQueryPagination} from "@/types/IQueryPagination";
import {
    createOrder,
    deleteOrder,
    getOrderDetails, getOrdersSimpleUrl,
    getOrdersUrl, recalculateOrderCost,
    updateOrder
} from "@/config/api.config";
import instance from "@/services/api/interceptors.api";
import {IOrderForm} from "@/screens/order/types/order/IOrderForm";

export const OrderService = {
    getAllOrder: (params: IQueryPagination) =>
        instance({
            url: getOrdersUrl(),
            method: 'GET',
            params
        }),
    getAllOrderSimple: () =>
        instance({
            url: getOrdersSimpleUrl(),
            method: 'GET',
        }),
    getOrderDetails: (id: number) =>
        instance({
            url: getOrderDetails(id),
            method: 'GET'
        }),
    createOrder: (data: IOrderForm) =>
        instance({
            url: createOrder(),
            method: 'POST',
            data
        }),
    updateOrder: (id: number, data: IOrderForm) =>
        instance({
            url: updateOrder(id),
            method: 'PUT',
            data
        }),
    deleteOrder: ({id}: { id: number }) =>
        instance({
            url: deleteOrder(id),
            method: 'DELETE'
        }),
    recalculateOrderCost: (id: number) =>
        instance({
            url: recalculateOrderCost(id),
            method: 'POST'
        })
};
