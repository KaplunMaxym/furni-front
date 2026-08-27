import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileServiceService } from '@/services/profile-service/profile-service.service';

export const useProfileServiceDelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-profile-service'],
        mutationFn: ({ id }: { id: number }) =>
            ProfileServiceService.deleteProfileService({ id }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-service'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-service'] });
        },
    });
};