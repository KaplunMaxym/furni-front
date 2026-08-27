import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileAccessoryService } from '@/services/profile-accessory/profile-accessory.service';
import { IProfileAccessoryForm } from '@/screens/profile-accessory/types/IProfileAccessoryForm';

export const useProfileAccessoryUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-profile-accessory'],
        mutationFn: ({ id, ...data }: IProfileAccessoryForm & { id: number }) =>
            ProfileAccessoryService.updateProfileAccessory(id, data as IProfileAccessoryForm),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
    });
};