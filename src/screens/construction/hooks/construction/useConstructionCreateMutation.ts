import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ConstructionService} from "@/services/construction/construction/construction.service";
import {IConstructionForm} from "@/screens/construction/type/construction/IConstructionForm";

export const useConstructionCreateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['create-construction'],
        mutationFn: (data: IConstructionForm) => ConstructionService.createConstruction(data),
        onSuccess: async (_, { orderId }) => {
            await queryClient.invalidateQueries({ queryKey: ['all-construction']})
            await queryClient.invalidateQueries({ queryKey: ['get-construction-by-order', orderId]})
            await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId]})
        },
        onError: async (_, { orderId }) => {
            await queryClient.invalidateQueries({ queryKey: ['all-construction']})
            await queryClient.invalidateQueries({ queryKey: ['get-construction-by-order', orderId]})
            await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId]})
        },
    })
}