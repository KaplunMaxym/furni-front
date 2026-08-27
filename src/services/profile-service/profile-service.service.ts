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

export const ProfileServiceService = {
    getProfileServices: (params: IQueryPagination) =>
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