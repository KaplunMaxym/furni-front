import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IColorForm } from '@/screens/catalog/types/IColorForm';
import { CatalogService } from '@/services/catalog/catalog.service';

export const useColorUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-color'],
        mutationFn: ({ id, ...data }: IColorForm & { id: number }) =>
            CatalogService.updateColor(id, data as IColorForm),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-colors'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-colors'] });
        },
    });
};