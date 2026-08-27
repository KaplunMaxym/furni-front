import { useMutation, useQueryClient } from '@tanstack/react-query';
import {CatalogService} from "@/services/catalog/catalog.service";

export const useColorDelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-color'],
        mutationFn: ({ id }: { id: number }) => CatalogService.deleteColor({ id }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-colors'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-colors'] });
        },
    });
};