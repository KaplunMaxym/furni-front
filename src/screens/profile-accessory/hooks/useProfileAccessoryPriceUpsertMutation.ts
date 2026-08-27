import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ProfileAccessoryService,
    IProfileAccessoryPriceForm,
} from '@/services/profile-accessory/profile-accessory.service';

export const useProfileAccessoryPriceUpsertMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['upsert-profile-accessory-price'],
        mutationFn: (data: IProfileAccessoryPriceForm) =>
            ProfileAccessoryService.upsertPrice(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
    });
};