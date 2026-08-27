import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IConstructionFormUpdate} from "@/screens/construction/type/construction/IConstructionForm";
import {ConstructionService} from "@/services/construction/construction/construction.service";

export const useConstructionUpdateMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['update-construction'],
        mutationFn: ({id, ...data}: IConstructionFormUpdate & { id: number }) =>
            ConstructionService.updateConstruction(id, data),
        onSuccess: async (_, { id, orderId }) => {
            await queryClient.invalidateQueries({ queryKey: ['all-construction']})
            await queryClient.invalidateQueries({ queryKey: ['get-construction', id] })
            await queryClient.invalidateQueries({ queryKey: ['construction-details', id] })
            if (orderId) {
                await queryClient.invalidateQueries({ queryKey: ['get-construction-by-order', orderId]})
                await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId]})
            }
        },
        onError: async (_, { id, orderId }) => {
            await queryClient.invalidateQueries({ queryKey: ['all-construction']})
            await queryClient.invalidateQueries({ queryKey: ['get-construction', id] })
            await queryClient.invalidateQueries({ queryKey: ['construction-details', id] })
            if (orderId) {
                await queryClient.invalidateQueries({ queryKey: ['get-construction-by-order', orderId]})
                await queryClient.invalidateQueries({ queryKey: ['get-order-details', orderId]})
            }
        },
    })
}