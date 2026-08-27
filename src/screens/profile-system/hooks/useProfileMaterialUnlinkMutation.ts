import { useMutation, useQueryClient } from '@tanstack/react-query';
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";
import {IUnlinkMaterialForm} from "@/screens/profile-system/types/profile-system/IUnlinkMaterialForm";

export const useProfileMaterialUnlinkMutation = (profileSystemId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['unlink-profile-material', profileSystemId],
        mutationFn: (data: IUnlinkMaterialForm) => ProfileSystemService.deleteLinkDetailMaterial(profileSystemId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
    });
};