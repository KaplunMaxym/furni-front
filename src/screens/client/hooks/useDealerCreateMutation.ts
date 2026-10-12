import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IDealerForm} from "@/screens/client/types/IDealerForm";
import {ClientService} from "@/services/client/client.service";

/**
 * Створення дилера.
 *
 * Скидаємо і списки клієнтів, і список користувачів: за один запит зʼявляються
 * обидва записи, і якби оновлювали лише клієнтів, у «Користувачах» новий вхід
 * не показувався б до перезавантаження сторінки.
 */
export const useDealerCreateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['create-dealer'],
        mutationFn: (data: IDealerForm) => ClientService.createDealer(data),
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['all-client'] });
            await queryClient.invalidateQueries({ queryKey: ['all-client-simple'] });
            await queryClient.invalidateQueries({ queryKey: ['all-user'] });
        },
    });
};
