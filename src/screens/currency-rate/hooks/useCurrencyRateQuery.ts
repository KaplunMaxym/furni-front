import { useQuery } from '@tanstack/react-query';
import { IPagination } from '@/types/IPagination';
import { useCurrencyRateFilterStore } from '@/store/currency-rate/useCurrencyRateFilter';
import { CurrencyRateService } from '@/services/currency-rate/currency-rate.service';
import {ICurrencyRate} from "@/screens/currency-rate/type/ICurrencyRate";

export const useCurrencyRateQuery = () => {
    const useFilter = () => {
        const { page, limit, sortBy, sortOrder } = useCurrencyRateFilterStore();
        return { page, limit, sortBy, sortOrder };
    };
    const filterParams = useFilter();
    return useQuery({
        queryKey: ['all-currency-rate', filterParams],
        queryFn: () =>
            CurrencyRateService.getCurrencyRates(filterParams)
                .then(data =>
                    data.data.data as { meta: IPagination; currencyRates: Array<ICurrencyRate> }
                ),
    });
};