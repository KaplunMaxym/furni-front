import instance from '../api/interceptors.api';
import {IQueryPagination} from '@/types/IQueryPagination';
import {
    getProfileServiceUrl,
    getProfileServiceSimpleUrl,
    createProfileService,
    updateProfileService,
    deleteProfileService,
} from '@/config/api.config';
import {IProfileServiceForm} from '@/screens/profile-service/types/IProfileServiceForm';

export interface IProfileServiceQuery extends IQueryPagination {
    /** Збіг за назвою або кодом 1С. */
    search?: string;
    profileSystemId?: number;
}

export const ProfileServiceService = {
    getProfileServices: (params: IProfileServiceQuery) =>
        instance({
            url: getProfileServiceUrl(),
            method: 'GET',
            params,
        }),
    getProfileServicesSimple: () =>
        instance({
            url: getProfileServiceSimpleUrl(),
            method: 'GET',
        }),
    createProfileService: (data: IProfileServiceForm) =>
        instance({
            url: createProfileService(),
            method: 'POST',
            data,
        }),
    updateProfileService: (id: number, data: IProfileServiceForm) =>
        instance({
            url: updateProfileService(id),
            method: 'PUT',
            data,
        }),
    deleteProfileService: ({id}: { id: number }) =>
        instance({
            url: deleteProfileService(id),
            method: 'DELETE',
        }),
};