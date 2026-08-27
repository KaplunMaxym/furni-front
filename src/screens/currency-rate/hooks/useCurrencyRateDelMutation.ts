import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CurrencyRateService } from '@/services/currency-rate/currency-rate.service';

export const useCurrencyRateDelMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['delete-currency-rate'],
        mutationFn: ({ id }: { id: number }) =>
            CurrencyRateService.deleteCurrencyRate({ id }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-currency-rate'] });
        },
        onError: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-currency-rate'] });
        },
    });
};