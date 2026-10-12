import instance from '../api/interceptors.api';
import { IQueryPagination } from '@/types/IQueryPagination';
import {
    getProfileMaterialUrl,
    getProfileMaterialSimpleUrl,
    createProfileMaterialUrl,
    updateProfileMaterialUrl,
    deleteProfileMaterialUrl,
    upsertProfileMaterialPriceUrl,
} from '@/config/api.config';
import { IProfileMaterialForm } from '@/screens/profile-material/types/IProfileMaterialForm';

export interface IProfileMaterialPriceForm {
    profileMaterialId: number;
    category: string;
    pricePerBeam: number;
}

export interface IProfileMaterialQuery extends IQueryPagination {
    /** Збіг за назвою, артикулом або кодом 1С. */
    search?: string;
    colorId?: number;
    profileSystemId?: number;
}

export const ProfileMaterialService = {
    getProfileMaterials: (params: IProfileMaterialQuery) =>
        instance({ url: getProfileMaterialUrl(), method: 'GET', params }),

    getProfileMaterialsSimple: () =>
        instance({ url: getProfileMaterialSimpleUrl(), method: 'GET' }),

    createProfileMaterial: (data: IProfileMaterialForm) =>
        instance({ url: createProfileMaterialUrl(), method: 'POST', data }),

    updateProfileMaterial: (id: number, data: IProfileMaterialForm) =>
        instance({ url: updateProfileMaterialUrl(id), method: 'PUT', data }),

    deleteProfileMaterial: ({ id }: { id: number }) =>
        instance({ url: deleteProfileMaterialUrl(id), method: 'DELETE' }),

    upsertPrice: (data: IProfileMaterialPriceForm) =>
        instance({ url: upsertProfileMaterialPriceUrl(), method: 'POST', data }),
};