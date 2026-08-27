import instance from '../api/interceptors.api';
import { IQueryPagination } from '@/types/IQueryPagination';
import {
    getCurrencyRateUrl,
    getCurrencyRateSimpleUrl,
    createCurrencyRateUrl,
    updateCurrencyRateUrl,
    deleteCurrencyRateUrl,
} from '@/config/api.config';
import {ICurrencyRateForm} from "@/screens/currency-rate/type/ICurrencyRateForm";

export const CurrencyRateService = {
    getCurrencyRates: (params: IQueryPagination) =>
        instance({
            url: getCurrencyRateUrl(),
            method: 'GET',
            params,
        }),
    getCurrencyRatesSimple: () =>
        instance({
            url: getCurrencyRateSimpleUrl(),
            method: 'GET',
        }),
    createCurrencyRate: (data: ICurrencyRateForm) =>
        instance({
            url: createCurrencyRateUrl(),
            method: 'POST',
            data,
        }),
    updateCurrencyRate: (id: number, data: ICurrencyRateForm) =>
        instance({
            url: updateCurrencyRateUrl(id),
            method: 'PUT',
            data,
        }),
    deleteCurrencyRate: ({ id }: { id: number }) =>
        instance({
            url: deleteCurrencyRateUrl(id),
            method: 'DELETE',
        }),
};