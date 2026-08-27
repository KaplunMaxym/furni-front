import { useMutation, useQueryClient } from '@tanstack/react-query';
import {OrderService} from "@/services/order/order/order.service";

export const useOrderRecalculateMutation = (orderId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['recalculate-cost'],
        mutationFn: () => OrderService.recalculateOrderCost(orderId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId] });
        },
    });
};