import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ICurrencyRateForm } from '@/screens/currency-rate/type/ICurrencyRateForm';
import {CurrencyRateService} from "@/services/currency-rate/currency-rate.service";

export const useCurrencyRateUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['update-currency-rate'],
        mutationFn: ({ id, ...data }: ICurrencyRateForm & { id: number }) =>
            CurrencyRateService.updateCurrencyRate(id, data as ICurrencyRateForm),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-currency-rate'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-currency-rate'] });
        },
    });
};