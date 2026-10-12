import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { GlassFillService } from '@/services/glass-fill/glass-fill.service';
import { GlassFillQuery } from '@/screens/glass-fill/types/IGlassFillQuery';
import { useGlassFillFilterStore } from '@/store/glass-fill/useGlassFillFilter';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const useGlassFillQuery = () => {
    const { page, limit, search, sortBy, sortOrder} = useGlassFillFilterStore();

    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    };

    return useQuery({
        queryKey: ['all-glass-fill', filterParams],
        queryFn: () =>
            GlassFillService.getGlassFill(filterParams).then(
                data => data.data.data as { meta: IPagination; glassFill: Array<GlassFillQuery> }
            ),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
