import instance from "@/services/api/interceptors.api";
import {
    createColorUrl, deleteColorUrl,
    getColorsForHandleUrl,
    getColorsForProfileUrl,
    getColorsSimpleUrl,
    getColorsUrl, updateColorUrl
} from "@/config/api.config";
import {IQueryPagination} from "@/types/IQueryPagination";
import {IColorForm} from "@/screens/catalog/types/IColorForm";
import {ColorType} from "@/screens/catalog/types/IColor";

export interface IColorQueryParams extends IQueryPagination {
    /** Збіг за назвою або hex-кодом. */
    search?: string;
    /** Має серед своїх призначень цей тип. */
    type?: ColorType;
}

export const CatalogService = {
    getColorSimple: () =>
        instance({
            url: getColorsSimpleUrl(),
            method: 'GET'
        }),
    getColorProfileSimple: () =>
        instance({
            url: getColorsForProfileUrl(),
            method: 'GET'
        }),
    getColorHandleSimple: () =>
        instance({
            url: getColorsForHandleUrl(),
            method: 'GET'
        }),
    getColors: (params: IColorQueryParams) =>
        instance({
            url: getColorsUrl(),
            method: 'GET',
            params
        }),
    createColor: (data: IColorForm) =>
        instance({
            url: createColorUrl(),
            method: 'POST',
            data
        }),
    updateColor: (id: number, data: IColorForm) =>
        instance({
            url: updateColorUrl(id),
            method: 'PUT',
            data
        }),
    deleteColor: ({ id }: { id: number }) =>
        instance({
            url: deleteColorUrl(id),
            method: 'DELETE'
        }),
}