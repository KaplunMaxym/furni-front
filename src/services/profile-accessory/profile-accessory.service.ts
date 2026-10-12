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

export interface IProfileAccessoryQuery extends IQueryPagination {
    /** Збіг за назвою, артикулом або кодом 1С. */
    search?: string;
    colorId?: number;
    profileSystemId?: number;
}

export const ProfileAccessoryService = {
    getProfileAccessories: (params: IProfileAccessoryQuery) =>
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