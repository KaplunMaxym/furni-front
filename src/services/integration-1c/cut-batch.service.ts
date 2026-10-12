import instance from '@/services/api/interceptors.api';
import { cutBatchUrl, cutBatchesUrl } from '@/config/api.config';
import { IQueryPagination } from '@/types/IQueryPagination';

export interface ICutBatchQuery extends IQueryPagination {
    /** Номер партії з 1С або номер/назва замовлення в ній. */
    search?: string;
    orderId?: number;
    /** `YYYY-MM-DD`. */
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Партії різу — тільки читання.
 *
 * Створює їх 1С запитом обміну, і кнопки «порахувати заново» тут немає
 * навмисно: за тим самим номером партії цех уже отримав карту розкрою й,
 * можливо, порізав метал. Новий розкрій — це нова партія з 1С.
 */
export const CutBatchService = {
    getBatches: (params: ICutBatchQuery) =>
        instance({
            url: cutBatchesUrl(),
            method: 'GET',
            params,
        }),

    /** Партія разом із планом розкрою. */
    getBatch: (id: number) =>
        instance({
            url: cutBatchUrl(id),
            method: 'GET',
        }),
};
