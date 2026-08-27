import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileServiceService } from '@/services/profile-service/profile-service.service';
import { IProfileServiceForm } from '@/screens/profile-service/types/IProfileServiceForm';

export const useProfileServiceUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-profile-service'],
        mutationFn: ({ id, ...data }: IProfileServiceForm & { id: number }) =>
            ProfileServiceService.updateProfileService(id, data as IProfileServiceForm),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-service'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-service'] });
        },
    });
};