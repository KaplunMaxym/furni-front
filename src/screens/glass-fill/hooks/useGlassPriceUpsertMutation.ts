import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GlassFillService} from "@/services/glass-fill/glass-fill.service";
import {IGlassPriceForm} from "@/screens/glass-fill/types/IGlassPriceForm";

export const useGlassPriceUpsertMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['upsert-glass-price'],
        mutationFn: (data: IGlassPriceForm) =>
            GlassFillService.upsertGlassPrice(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill'] });
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill-simple'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill'] });
            await queryClient.invalidateQueries({ queryKey: ['all-glass-fill-simple'] });
        },
    });
};