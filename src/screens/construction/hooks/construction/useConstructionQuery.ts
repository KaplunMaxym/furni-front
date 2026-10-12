import {useQuery, keepPreviousData} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {ConstructionService} from "@/services/construction/construction/construction.service";
import {IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {useConstructionFilterStore} from "@/store/construction/construction-fiter/useConstructionFilter";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";

export const useConstructionQuery = () => {
    const {page, limit, search, status, profileSystemId, dateFrom, dateTo, sortBy, sortOrder} = useConstructionFilterStore();

    // Селекти застосовуються одразу, текст — із затримкою
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit: Number(limit),
        search: debouncedSearch.trim() || undefined,
        constructionStatusId: status || undefined,
        profileSystemId: profileSystemId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
    };

    return useQuery({
        queryKey: ['all-construction', filterParams],
        queryFn: () => ConstructionService.getAllConstruction(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination, construction: Array<IConstruction> }),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
