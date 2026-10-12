import {useQuery} from "@tanstack/react-query";
import {IClient} from "@/screens/client/types/IClient";
import {ClientService} from "@/services/client/client.service";

interface UseClientOptions {
    /**
     * Чи виконувати запит.
     *
     * Потрібне через дилера: довідник клієнтів для нього закритий, і форма
     * замовлення, яка тягне його «про всяк випадок», упиралася б у 403 при
     * кожному відкритті. Вимикаємо запит там, де він свідомо не потрібен,
     * замість того щоб мовчки ковтати помилку.
     */
    enabled?: boolean;
}

export const useClient = ({ enabled = true }: UseClientOptions = {}) => {
    return useQuery({
        queryKey: ['all-client-simple'],
        queryFn: () => ClientService.getClientsSimple()
            .then(data => data.data.data as IClient[]),
        enabled,
    })
}
