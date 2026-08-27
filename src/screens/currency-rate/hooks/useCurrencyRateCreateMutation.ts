import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CurrencyRateService } from '@/services/currency-rate/currency-rate.service';
import {ICurrencyRateForm} from "@/screens/currency-rate/type/ICurrencyRateForm";

export const useCurrencyRateCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['create-currency-rate'],
        mutationFn: (data: ICurrencyRateForm) =>
            CurrencyRateService.createCurrencyRate(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-currency-rate'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-currency-rate'] });
        },
    });
};