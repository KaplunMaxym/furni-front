import instance from '@/services/api/interceptors.api';
import {
    integration1CHistoryUrl,
    integration1CPreviewUrl,
} from '@/config/api.config';

/**
 * Довідкові запити по обміну з 1С.
 *
 * Відправки тут немає: замовлення забирає сама 1С запитом
 * `GET /integration-1c/exchange/orders`. Що саме вона забрала — видно в
 * журналі обміну.
 */
export const Integration1CService = {
    /** Що піде в 1С. Нічого не відправляє. */
    preview: (orderId: number) =>
        instance({
            url: integration1CPreviewUrl(orderId),
            method: 'GET',
        }),

    /** Історія відправок замовлення. */
    history: (orderId: number) =>
        instance({
            url: integration1CHistoryUrl(orderId),
            method: 'GET',
        }),

};
