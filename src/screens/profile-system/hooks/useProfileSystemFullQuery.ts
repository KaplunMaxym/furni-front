import { useQuery } from "@tanstack/react-query";
import { ProfileSystemService } from "@/services/profile-system/profile-system.service";
import {IProfileSystemFull} from "@/screens/profile-system/types/profile-system/IProfileSystemFull";

export const useProfileSystemFullQuery = (id: number) => {
    return useQuery({
        queryKey: ['profile-system-full', id],
        queryFn: () =>
            ProfileSystemService.getProfileSystem(id).then(res => res.data.data as IProfileSystemFull),
        enabled: !!id,
    });
};