import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileMaterialService, IProfileMaterialPriceForm } from '@/services/profile-material/profile-material.service';

export const useProfileMaterialPriceUpsertMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['upsert-profile-material-price'],
        mutationFn: (data: IProfileMaterialPriceForm) =>
            ProfileMaterialService.upsertPrice(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
    });
};