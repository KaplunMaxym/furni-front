import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileMaterialService } from '@/services/profile-material/profile-material.service';
import { IProfileMaterialForm } from '@/screens/profile-material/types/IProfileMaterialForm';

export const useProfileMaterialCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-profile-material'],
        mutationFn: (data: IProfileMaterialForm) =>
            ProfileMaterialService.createProfileMaterial(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
    });
};