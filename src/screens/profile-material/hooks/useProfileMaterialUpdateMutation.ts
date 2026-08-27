import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileMaterialService } from '@/services/profile-material/profile-material.service';
import { IProfileMaterialForm } from '@/screens/profile-material/types/IProfileMaterialForm';

export const useProfileMaterialUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-profile-material'],
        mutationFn: ({ id, ...data }: IProfileMaterialForm & { id: number }) =>
            ProfileMaterialService.updateProfileMaterial(id, data as IProfileMaterialForm),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-profile-material'] });
        },
    });
};