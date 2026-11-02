import instance from '@/services/api/interceptors.api';
import { settingsUrl, updateSettingsUrl } from '@/config/api.config';
import { ISettingUpdate } from '@/screens/settings/types/ISetting';

/**
 * Глобальні налаштування системи.
 *
 * Зберігаються цілою сторінкою, а не по полю: ліміт імені програми й правило
 * скорочення мають сенс лише разом, і два окремі запити лишали б систему на
 * мить із новим лімітом і старим правилом.
 */
export const SettingService = {
    getSettings: () =>
        instance({
            url: settingsUrl(),
            method: 'GET',
        }),

    updateSettings: (dto: ISettingUpdate) =>
        instance({
            url: updateSettingsUrl(),
            method: 'PATCH',
            data: dto,
        }),
};
