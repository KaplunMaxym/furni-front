import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { useProfileServiceFilterStore } from '@/store/profile-service/useProfileServiceFilter';
import { ProfileServiceService } from '@/services/profile-service/profile-service.service';
import { IProfileService } from '@/screens/profile-service/types/IProfileService';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const useProfileServiceQuery = () => {
    const { page, limit, search, profileSystemId, sortBy, sortOrder} = useProfileServiceFilterStore();

    // Селект застосовується одразу, текст — із затримкою
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(profileSystemId !== null && { profileSystemId }),
    };

    return useQuery({
        queryKey: ['all-profile-service', filterParams],
        queryFn: () =>
            ProfileServiceService.getProfileServices(filterParams).then(
                data => data.data.data as { meta: IPagination; profileServices: Array<IProfileService> }
            ),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
