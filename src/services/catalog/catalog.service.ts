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
    getColors: (params: IQueryPagination) =>
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