import {useQuery, keepPreviousData} from "@tanstack/react-query";
import {IPagination} from "@/types/IPagination";
import {OrderService} from "@/services/order/order/order.service";
import {useOrderFilterStore} from "@/store/order/order-store/useOrderFilter";
import {IOrderQuery} from "@/screens/order/types/order/IOrderQuery";
import {useDebouncedValue} from "@/hooks/useDebouncedValue";

export const useOrderQuery = () => {
    const {page, limit, client, status, search, dateFrom, dateTo, sortBy, sortOrder} = useOrderFilterStore();

    // Селекти застосовуються одразу, текст — із затримкою
    const debouncedSearch = useDebouncedValue(search);

    const filterParams = {
        sortBy,
        sortOrder,
        page,
        limit: Number(limit),
        clientId: client || undefined,
        statusId: status || undefined,
        search: debouncedSearch.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
    };

    return useQuery({
        queryKey: ['all-order', filterParams],
        queryFn: () => OrderService.getAllOrder(filterParams)
            .then(data =>
                data.data.data as { meta: IPagination, orders: Array<IOrderQuery> }),
        // Стара сторінка лишається на екрані, поки їде нова
        placeholderData: keepPreviousData,
    });
};
