import { useQuery } from '@tanstack/react-query';

import { CutBatchService } from '@/services/integration-1c/cut-batch.service';
import { ICutBatchDetails } from '@/screens/cut-batch/types/ICutBatch';

/**
 * Партія разом із планом розкрою.
 *
 * Вантажиться лише коли партію відкрили: у плані — кожен пруток із кожним
 * шматком, і тягнути це для всієї сторінки означало б кілька мегабайт JSON,
 * з яких у таблиці не видно нічого.
 */
export const useCutBatchQuery = (id: number | null) =>
    useQuery({
        queryKey: ['cut-batch', id],
        queryFn: () =>
            CutBatchService.getBatch(id!).then(response => response.data.data as ICutBatchDetails),
        enabled: id !== null,
    });
