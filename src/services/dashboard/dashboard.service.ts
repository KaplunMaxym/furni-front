import instance from '@/services/api/interceptors.api';
import { dashboardAttentionUrl, dashboardOverviewUrl } from '@/config/api.config';

export const DashboardService = {
    /** Зведення для головної. Доступне всім авторизованим. */
    getOverview: () =>
        instance({
            url: dashboardOverviewUrl(),
            method: 'GET',
        }),

    /** Стан даних. Бек віддає лише ROOT_ADMIN, інакше 403. */
    getAttention: () =>
        instance({
            url: dashboardAttentionUrl(),
            method: 'GET',
        }),
};
