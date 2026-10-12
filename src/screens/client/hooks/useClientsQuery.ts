import {useQuery, keepPreviousData} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {ClientService} from "@/services/client/client.service";
import {IClientsQuery} from "@/screens/client/types/IClientsQuery";
import {useClientFilterStore} from "@/store/client/useClientFilter";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";

export const useClientsQuery = () => {
    const {page, limit, search, sortBy, sortOrder} = useClientFilterStore();

    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit,
        ...(debouncedSearch.trim() && {search: debouncedSearch.trim()}),
    };

    return useQuery({
        queryKey: ['all-client', filterParams],
        queryFn: () => ClientService.getClients(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination, clients: Array<IClientsQuery> }),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
