import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileMaterialService } from '@/services/profile-material/profile-material.service';

export const useProfileMaterialDelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-profile-material'],
        mutationFn: ({ id }: { id: number }) =>
            ProfileMaterialService.deleteProfileMaterial({ id }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
    });
};