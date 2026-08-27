import { useQuery } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { IProfileAccessory } from '@/screens/profile-accessory/types/IProfileAccessory';
import { ProfileAccessoryService } from '@/services/profile-accessory/profile-accessory.service';
import { useProfileAccessoryFilterStore } from '@/store/profile-accessory/useProfileAccessoryFilter';

export const useProfileAccessoryQuery = () => {
    const useFilter = () => {
        const { page, limit } = useProfileAccessoryFilterStore();
        return { page, limit };
    };
    const filterParams = useFilter();
    return useQuery({
        queryKey: ['all-profile-accessory', filterParams],
        queryFn: () =>
            ProfileAccessoryService.getProfileAccessories(filterParams).then(
                data => data.data.data as { meta: IPagination; profileAccessories: IProfileAccessory[] }
            ),
    });
};