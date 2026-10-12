import instance from "../api/interceptors.api";
import {IQueryPagination} from "@/types/IQueryPagination";
import {
    createGlassFill,
    deleteGlassFill,
    getGlassFillUrl,
    getGlassSimpleFillUrl,
    updateGlassFill, upsertGlassPrice
} from "@/config/api.config";
import {IGlassFillForm} from "@/screens/glass-fill/types/IGlassFillForm";
import {IGlassPriceForm} from "@/screens/glass-fill/types/IGlassPriceForm";

export interface IGlassFillQueryParams extends IQueryPagination {
    /** Збіг за назвою скла або кодом 1С. */
    search?: string;
}

export const GlassFillService = {
    getGlassFill: (params: IGlassFillQueryParams) =>
        instance({
            url: getGlassFillUrl(),
            method: 'GET',
            params
        }),
    getGlassFillSimple: () =>
        instance({
            url: getGlassSimpleFillUrl(),
            method: 'GET'
        }),
    deleteGlassFill: ({id}: { id: number }) =>
        instance({
            url: deleteGlassFill(id),
            method: 'DELETE',
        }),
    createGlassFill: (data: IGlassFillForm) =>
        instance({
            url: createGlassFill(),
            method: 'POST',
            data
        }),
    updateGlassFill: (id: number, data: IGlassFillForm) =>
        instance({
            url: updateGlassFill(id),
            method: 'PUT',
            data
        }),
    upsertGlassPrice: (data: IGlassPriceForm) =>
        instance({
            url: upsertGlassPrice(),
            method: 'POST',
            data
        })
};
