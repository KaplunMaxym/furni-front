import {useQuery} from "@tanstack/react-query";
import {IProfileSystem} from "@/screens/profile-system/types/profile-system/IProfileSystem";
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";

export const useProfileSystem = () => {
    return useQuery({
        queryKey: ['all-profile-system-simple'],
        queryFn: () => ProfileSystemService.getProfileSystemSimple()
            .then(data => data.data.data as IProfileSystem[])
    })
}