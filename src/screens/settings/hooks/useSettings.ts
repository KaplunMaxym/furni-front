import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SettingService } from '@/services/setting/setting.service';
import { ISetting, ISettingUpdate } from '@/screens/settings/types/ISetting';

export const useSettingsQuery = () =>
    useQuery({
        queryKey: ['settings'],
        queryFn: () =>
            SettingService.getSettings().then(response => response.data.data as ISetting[]),
    });

export const useSettingsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: ISettingUpdate) =>
            SettingService.updateSettings(dto).then(
                response => response.data.data as ISetting[],
            ),
        onSuccess: settings => {
            /*
             * Кладемо відповідь у кеш замість перезапиту: бек повертає
             * збережений стан цілком, і повторне читання лише показало б те
             * саме на півсекунди пізніше.
             */
            queryClient.setQueryData(['settings'], settings);
            toast.success('Налаштування збережено');
        },
        onError: (error: unknown) => {
            /*
             * Повідомлення бека цінніше за загальне «не вдалося»: воно вже
             * пояснює, що саме не так — «не менше 4», «доступні значення…».
             */
            const message = (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;

            toast.error(message ?? 'Не вдалося зберегти налаштування');
        },
    });
};
