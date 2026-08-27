import { useMutation, useQueryClient } from '@tanstack/react-query';
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";
import {ILinkAccessoryForm} from "@/screens/profile-system/types/profile-system/ILinkAccessoryForm";

export const useProfileAccessoryLinkMutation = (profileSystemId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['link-profile-accessory', profileSystemId],
        mutationFn: (data: ILinkAccessoryForm) => ProfileSystemService.updateLinkAccessory(profileSystemId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
    });
};