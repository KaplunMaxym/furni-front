import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { IPagination } from '@/types/IPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Integration1CLogService } from '@/services/integration-1c/integration-1c-log.service';
import { useIntegrationLogFilterStore } from '@/store/integration-log/useIntegrationLogFilter';
import {
    IIntegrationLog,
    IIntegrationLogSummary,
} from '@/screens/integration-log/types/IIntegrationLog';

interface IntegrationLogsResponse {
    meta: IPagination;
    summary: IIntegrationLogSummary;
    logs: IIntegrationLog[];
}

export const useIntegrationLogsQuery = () => {
    const {
        page, limit, search, status, userId, dateFrom, dateTo, sortBy, sortOrder,
    } = useIntegrationLogFilterStore();

    // Селекти й дати застосовуються одразу, текст — із затримкою
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(status !== null && { status }),
        ...(userId !== null && { userId }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
    };

    return useQuery({
        queryKey: ['all-integration-log', filterParams],
        queryFn: () =>
            Integration1CLogService.getLogs(filterParams).then(
                response => response.data.data as IntegrationLogsResponse,
            ),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
