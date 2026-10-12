import instance from '@/services/api/interceptors.api';
import { integration1CLogUrl, integration1CLogsUrl } from '@/config/api.config';
import { IQueryPagination } from '@/types/IQueryPagination';
import { IntegrationLogStatus } from '@/screens/integration-log/types/IIntegrationLog';

export interface IIntegrationLogQuery extends IQueryPagination {
    /** Номер чи назва замовлення або текст помилки. */
    search?: string;
    status?: IntegrationLogStatus;
    orderId?: number;
    userId?: number;
    /** `YYYY-MM-DD`. */
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Журнал обміну з 1С — тільки читання.
 *
 * Ні створення, ні видалення: лог, який можна почистити з інтерфейсу, нічого
 * не доказує, а дивляться в нього саме тоді, коли треба знати, що насправді
 * пішло в 1С.
 */
export const Integration1CLogService = {
    getLogs: (params: IIntegrationLogQuery) =>
        instance({
            url: integration1CLogsUrl(),
            method: 'GET',
            params,
        }),

    /** Один запис разом із пакетом і відповіддю 1С. */
    getLog: (id: number) =>
        instance({
            url: integration1CLogUrl(id),
            method: 'GET',
        }),
};
