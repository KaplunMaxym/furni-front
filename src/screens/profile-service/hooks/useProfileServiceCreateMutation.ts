import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileServiceService } from '@/services/profile-service/profile-service.service';
import { IProfileServiceForm } from '@/screens/profile-service/types/IProfileServiceForm';

export const useProfileServiceCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-profile-service'],
        mutationFn: (data: IProfileServiceForm) =>
            ProfileServiceService.createProfileService(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-service'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-service'] });
        },
    });
};