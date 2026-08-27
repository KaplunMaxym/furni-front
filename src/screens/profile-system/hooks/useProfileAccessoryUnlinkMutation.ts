import { useMutation, useQueryClient } from '@tanstack/react-query';
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";
import {IUnlinkAccessoryForm} from "@/screens/profile-system/types/profile-system/IUnlinkAccessoryForm";

export const useProfileAccessoryUnlinkMutation = (profileSystemId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['unlink-profile-accessory', profileSystemId],
        mutationFn: (data: IUnlinkAccessoryForm) => ProfileSystemService.deleteUnlinkAccessory(profileSystemId, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile-system-full', profileSystemId] });
        },
    });
};