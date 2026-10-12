import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { IPagination } from '@/types/IPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { CutBatchService } from '@/services/integration-1c/cut-batch.service';
import { useCutBatchFilterStore } from '@/store/cut-batch/useCutBatchFilter';
import { ICutBatch } from '@/screens/cut-batch/types/ICutBatch';

interface CutBatchesResponse {
    meta: IPagination;
    batches: ICutBatch[];
}

export const useCutBatchesQuery = () => {
    const { page, limit, search, dateFrom, dateTo, sortBy, sortOrder } = useCutBatchFilterStore();

    // Дати застосовуються одразу, текст — із затримкою
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
    };

    return useQuery({
        queryKey: ['all-cut-batch', filterParams],
        queryFn: () =>
            CutBatchService.getBatches(filterParams).then(
                response => response.data.data as CutBatchesResponse,
            ),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
