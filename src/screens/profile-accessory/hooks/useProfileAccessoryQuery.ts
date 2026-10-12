import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { IProfileAccessory } from '@/screens/profile-accessory/types/IProfileAccessory';
import { ProfileAccessoryService } from '@/services/profile-accessory/profile-accessory.service';
import { useProfileAccessoryFilterStore } from '@/store/profile-accessory/useProfileAccessoryFilter';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const useProfileAccessoryQuery = () => {
    const { page, limit, search, colorId, profileSystemId, sortBy, sortOrder} = useProfileAccessoryFilterStore();

    // Селекти застосовуються одразу, текст — із затримкою
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(colorId !== null && { colorId }),
        ...(profileSystemId !== null && { profileSystemId }),
    };

    return useQuery({
        queryKey: ['all-profile-accessory', filterParams],
        queryFn: () =>
            ProfileAccessoryService.getProfileAccessories(filterParams).then(
                data => data.data.data as { meta: IPagination; profileAccessories: IProfileAccessory[] }
            ),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
