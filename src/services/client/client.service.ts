import instance from "../api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import {IClientForm} from "@/screens/client/types/IClientForm";
import {IDealerForm} from "@/screens/client/types/IDealerForm";
import {createClient, createDealer, deleteClient, getClientsSimpleUrl, getClientsUrl, updateClient} from "@/config/api.config";

export interface IClientQueryParams extends IQueryPagination {
    /** Збіг за ПІБ, кодом 1С, поштою або телефоном. */
    search?: string;
}

export const ClientService = {
    getClients: (params: IClientQueryParams) =>
        instance({
            url: getClientsUrl(),
            method: 'GET',
            params
        }),
    getClientsSimple: () =>
        instance({
            url: getClientsSimpleUrl(),
            method: 'GET'
        }),
    delClient: ({id}: { id: number }) =>
        instance({
            url: deleteClient(id),
            method: 'DELETE',
        }),
    createClient: (data: IClientForm) =>
        instance({
            url: createClient(),
            method: 'POST',
            data
        }),
    /** Клієнт і вхід до нього одним запитом — сервер робить це транзакцією. */
    createDealer: (data: IDealerForm) =>
        instance({
            url: createDealer(),
            method: 'POST',
            data
        }),
    updateClient: (id: number, data: IClientForm) =>
        instance({
            url: updateClient(id),
            method: 'PUT',
            data
        })
};
