import {useQuery, keepPreviousData} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {useProfileSystemFilterStore} from "@/store/profile-system/useProfileSystemFilter";
import {IProfileSystem} from "@/screens/profile-system/types/profile-system/IProfileSystem";
import {ProfileSystemService} from "@/services/profile-system/profile-system.service";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";

export const useProfileSystemQuery = () => {
    const {page, limit, search, sortBy, sortOrder} = useProfileSystemFilterStore();

    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        ...(debouncedSearch.trim() && {search: debouncedSearch.trim()}),
    };

    return useQuery({
        queryKey: ['all-profile-system', filterParams],
        queryFn: () => ProfileSystemService.getProfileSystemQuery(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination, profileSystem: Array<IProfileSystem> }),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
