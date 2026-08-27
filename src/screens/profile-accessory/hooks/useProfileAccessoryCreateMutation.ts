import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileAccessoryService } from '@/services/profile-accessory/profile-accessory.service';
import { IProfileAccessoryForm } from '@/screens/profile-accessory/types/IProfileAccessoryForm';

export const useProfileAccessoryCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-profile-accessory'],
        mutationFn: (data: IProfileAccessoryForm) =>
            ProfileAccessoryService.createProfileAccessory(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
    });
};