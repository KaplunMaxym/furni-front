import { useQuery } from '@tanstack/react-query';

import { Integration1CLogService } from '@/services/integration-1c/integration-1c-log.service';
import { IIntegrationLogDetails } from '@/screens/integration-log/types/IIntegrationLog';

/**
 * Один запис журналу разом із пакетом і відповіддю 1С.
 *
 * Вантажиться лише коли запис відкрили: у кожного пакета — ціле замовлення з
 * усіма позиціями, і тягнути це для всієї сторінки означало б кілька мегабайт
 * JSON, з яких у таблиці не видно нічого.
 */
export const useIntegrationLogQuery = (id: number | null) =>
    useQuery({
        queryKey: ['integration-log', id],
        queryFn: () =>
            Integration1CLogService.getLog(id!).then(
                response => response.data.data as IIntegrationLogDetails,
            ),
        enabled: id !== null,
    });
