import instance from '../api/interceptors.api';
import { IQueryPagination } from '@/types/IQueryPagination';
import {
    getProfileAccessoryUrl,
    getProfileAccessorySimpleUrl,
    createProfileAccessoryUrl,
    updateProfileAccessoryUrl,
    deleteProfileAccessoryUrl,
    upsertProfileAccessoryPriceUrl,
} from '@/config/api.config';
import { IProfileAccessoryForm } from '@/screens/profile-accessory/types/IProfileAccessoryForm';

export interface IProfileAccessoryPriceForm {
    profileAccessoryId: number;
    category: string;
    pricePerUnit: number;
}

export const ProfileAccessoryService = {
    getProfileAccessories: (params: IQueryPagination) =>
        instance({ url: getProfileAccessoryUrl(), method: 'GET', params }),

    getProfileAccessoriesSimple: () =>
        instance({ url: getProfileAccessorySimpleUrl(), method: 'GET' }),

    createProfileAccessory: (data: IProfileAccessoryForm) =>
        instance({ url: createProfileAccessoryUrl(), method: 'POST', data }),

    updateProfileAccessory: (id: number, data: IProfileAccessoryForm) =>
        instance({ url: updateProfileAccessoryUrl(id), method: 'PUT', data }),

    deleteProfileAccessory: ({ id }: { id: number }) =>
        instance({ url: deleteProfileAccessoryUrl(id), method: 'DELETE' }),

    upsertPrice: (data: IProfileAccessoryPriceForm) =>
        instance({ url: upsertProfileAccessoryPriceUrl(), method: 'POST', data }),
};