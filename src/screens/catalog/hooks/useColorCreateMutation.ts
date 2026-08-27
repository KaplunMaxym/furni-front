import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IColorForm } from '@/screens/catalog/types/IColorForm';
import { CatalogService } from '@/services/catalog/catalog.service';

export const useColorCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-color'],
        mutationFn: (data: IColorForm) => CatalogService.createColor(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-colors'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-colors'] });
        },
    });
};