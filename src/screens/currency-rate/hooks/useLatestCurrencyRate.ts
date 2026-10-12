import { useQuery } from '@tanstack/react-query';

import { CurrencyRateService } from '@/services/currency-rate/currency-rate.service';
import { ICurrencyRate } from '@/screens/currency-rate/type/ICurrencyRate';

/**
 * Останній курс — для вводу цін у гривні.
 *
 * У базі всі прайси лежать у доларах, бо саме в доларах їх дає постачальник.
 * Але набирати ціну зручніше в тій валюті, у якій щойно бачив рахунок, тож
 * форми дають перемикач: набране в гривні ділиться на цей курс, і в базу
 * все одно лягає долар.
 *
 * Курс тут потрібен лише як коефіцієнт переведення в мить набору. У самих
 * замовленнях він не бере участі: там `OrderCost` зберігає власний курс на
 * момент розрахунку, і зміна цього довідника вже пораховані рахунки не
 * рухає.
 */
export const useLatestCurrencyRate = () => {
    const { data, isPending } = useQuery({
        queryKey: ['all-currency-rate-simple'],
        queryFn: () =>
            CurrencyRateService.getCurrencyRatesSimple()
                .then(res => res.data.data.currencyRates as ICurrencyRate[]),
        // Курс міняють раз на день — частіше питати нема сенсу
        staleTime: 5 * 60_000,
    });

    /*
     * Список приходить відсортованим за датою вниз, тож перший і є свіжий.
     * `null`, а не одиниця, коли курсу немає: мовчазний курс 1 перетворив би
     * гривневу ціну на доларову й тихо помножив прайс на тридцять.
     */
    const rate = data?.[0]?.rate ?? null;

    return { rate, isPending };
};
