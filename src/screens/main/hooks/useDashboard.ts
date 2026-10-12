import { useQuery } from '@tanstack/react-query';

import { DashboardService } from '@/services/dashboard/dashboard.service';
import { useAuthStore } from '@/store/auth/authReducer';
import { RoleEnum } from '@/config/RoleEnum';
import { IDashboardAttention, IDashboardOverview } from '@/screens/main/types/IDashboard';

/** Головні цифри. Дані не миттєві, тож пів хвилини кешу цілком достатньо. */
export const useDashboardOverview = () => {
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: () => DashboardService.getOverview(),
        staleTime: 30_000,
    });

    return {
        overview: (data?.data?.data ?? null) as IDashboardOverview | null,
        isLoading,
        isFetching,
        isError,
        refetch,
    };
};

/**
 * Стан даних — тільки для адміна.
 *
 * Запит вмикаємо за роллю не заради безпеки (її тримає бек), а щоб решта
 * користувачів не ловила 403 на кожному відкритті головної.
 */
export const useDashboardAttention = () => {
    const role = useAuthStore(state => state.role);
    const isAdmin = role === RoleEnum.ROOT_ADMIN;

    const { data } = useQuery({
        queryKey: ['dashboard-attention'],
        queryFn: () => DashboardService.getAttention(),
        enabled: isAdmin,
        staleTime: 30_000,
    });

    return {
        attention: (data?.data?.data ?? null) as IDashboardAttention | null,
    };
};
