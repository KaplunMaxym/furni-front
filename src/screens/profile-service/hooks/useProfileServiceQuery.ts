import { useQuery } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { useProfileServiceFilterStore } from '@/store/profile-service/useProfileServiceFilter';
import { ProfileServiceService } from '@/services/profile-service/profile-service.service';
import { IProfileService } from '@/screens/profile-service/types/IProfileService';

export const useProfileServiceQuery = () => {
    const useProfileServiceFilter = () => {
        const { page, limit } = useProfileServiceFilterStore();
        return { page, limit };
    };
    const filterParams = useProfileServiceFilter();
    return useQuery({
        queryKey: ['all-profile-service', filterParams],
        queryFn: () =>
            ProfileServiceService.getProfileServices(filterParams)
                .then(data =>
                    data.data.data as { meta: IPagination; profileServices: Array<IProfileService> }
                ),
    });
};