import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileAccessoryService } from '@/services/profile-accessory/profile-accessory.service';

export const useProfileAccessoryDelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-profile-accessory'],
        mutationFn: ({ id }: { id: number }) =>
            ProfileAccessoryService.deleteProfileAccessory({ id }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-accessory'] });
        },
    });
};