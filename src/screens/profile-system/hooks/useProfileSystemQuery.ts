import {useQuery} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {useGlassFillFilterStore} from "@/store/glass-fill/useGlassFillFilter";
import {IProfileSystem} from "@/screens/profile-system/types/profile-system/IProfileSystem";
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";

export const useProfileSystemQuery = () => {
    const useProfileSystem = () => {
        const {page, limit} = useGlassFillFilterStore();
        return {page, limit}
    };
    const filterParams = useProfileSystem()
    return useQuery({
        queryKey: ['all-profile-system', filterParams],
        queryFn: () => ProfileSystemService.getProfileSystemQuery(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination,  profileSystem: Array<IProfileSystem> })
    })
}