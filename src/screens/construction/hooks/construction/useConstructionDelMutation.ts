import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ConstructionService} from "@/services/construction/construction/construction.service";

export const useConstructionDelMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['delete-construction'],
        mutationFn: ({ id }: { id: number; orderId: number }) =>
            ConstructionService.deleteConstruction({ id }),

        onSuccess: async (_, { orderId }) => {
            await queryClient.invalidateQueries({ queryKey: ['all-construction']});
            await queryClient.invalidateQueries({ queryKey: ['get-construction-by-order', orderId]});
            await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId]})
        },
        onError: async (_, { orderId }) => {
            await queryClient.invalidateQueries({ queryKey: ['all-construction']})
            await queryClient.invalidateQueries({ queryKey: ['get-construction-by-order', orderId]})
            await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId]})
        },
    });
};