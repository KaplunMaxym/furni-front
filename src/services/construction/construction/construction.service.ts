import {
    createConstruction,
    deleteConstruction,
    getConstruction,
    getConstructionByOrder, getOneConstruction,
    updateConstruction
} from "@/config/api.config";
import instance from "@/services/api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import {IConstructionForm, IConstructionFormUpdate} from "@/screens/construction/type/construction/IConstructionForm";

export interface IConstructionQueryParams extends IQueryPagination {
    /** Збіг за номером замовлення або номером конструкції. */
    search?: string;
    constructionStatusId?: number | string;
    profileSystemId?: number | string;
}

export const ConstructionService = {
    getAllConstruction: (params: IConstructionQueryParams) =>
        instance({
            url: getConstruction(),
            method: 'GET',
            params
        }),
    getConstruction: (id: number) =>
        instance({
            url: getOneConstruction(id),
            method: 'GET'
        }),
    getConstructionByOrder: (orderId: number) =>
        instance({
            url: getConstructionByOrder(orderId),
            method: 'GET'
        }),
    createConstruction: (data: IConstructionForm) =>
        instance({
            url: createConstruction(),
            method: 'POST',
            data
        }),
    updateConstruction: (id: number, data: IConstructionFormUpdate) =>
        instance({
            url: updateConstruction(id),
            method: 'PUT',
            data
        }),
    deleteConstruction: ({id}: { id: number }) =>
        instance({
            url: deleteConstruction(id),
            method: 'DELETE'
        }),
};
