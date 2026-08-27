import { useMutation, useQueryClient } from '@tanstack/react-query';
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";
import {ILinkMaterialForm} from "@/screens/profile-system/types/profile-system/ILinkMaterialForm";

export const useProfileMaterialLinkMutation = (profileSystemId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['link-profile-material', profileSystemId],
        mutationFn: (data: ILinkMaterialForm) => ProfileSystemService.updateLinkDetailMaterial(profileSystemId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
    });
};