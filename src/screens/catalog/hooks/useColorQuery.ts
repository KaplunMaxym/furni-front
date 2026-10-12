import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { useColorFilterStore } from '@/store/color/useColorFilter';
import { IColor } from '@/screens/catalog/types/IColor';
import { CatalogService } from '@/services/catalog/catalog.service';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const useColorQuery = () => {
    const { page, limit, search, type, sortBy, sortOrder} = useColorFilterStore();

    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(type && { type }),
    };

    return useQuery({
        queryKey: ['all-colors', filterParams],
        queryFn: () =>
            CatalogService.getColors(filterParams).then(
                data => data.data.data as { meta: IPagination; colors: IColor[] }
            ),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
