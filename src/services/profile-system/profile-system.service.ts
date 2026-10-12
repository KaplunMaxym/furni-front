import instance from "@/services/api/interceptors.api";
import {
    deleteUnlinkAccessory,
    getProfileSystem,
    getProfileSystemQueryUrl,
    getProfileSystemUrl, updateCncTemplate, updateDrillSide, updateLinkAccessory,
    updateLinkDetailMaterial, updateMillSide, updateProfileSystem,
    updateProfileSystemOperation
} from "@/config/api.config";
import {IQueryPagination} from "@/types/IQueryPagination";
import {IProfileSystemUpdate} from "@/screens/profile-system/types/profile-system/IProfileSystemUpdate";
import {
    IProfileSystemOperationUpdate, IUpdateDrill, IUpdateMill, IUpdateTemplate
} from "@/screens/profile-system/types/profile-system/IProfileSystemOperationUpdate";
import {ILinkMaterialForm} from "@/screens/profile-system/types/profile-system/ILinkMaterialForm";
import {IUnlinkMaterialForm} from "@/screens/profile-system/types/profile-system/IUnlinkMaterialForm";
import {ILinkAccessoryForm} from "@/screens/profile-system/types/profile-system/ILinkAccessoryForm";
import {IUnlinkAccessoryForm} from "@/screens/profile-system/types/profile-system/IUnlinkAccessoryForm";

export interface IProfileSystemQueryParams extends IQueryPagination {
    /** Збіг за назвою, кодом або кодом 1С. */
    search?: string;
}

export const ProfileSystemService = {
    getProfileSystemSimple: () =>
        instance({
            url: getProfileSystemUrl(),
            method: 'GET'
        }),
    getProfileSystemQuery: (params: IProfileSystemQueryParams) =>
        instance({
            url: getProfileSystemQueryUrl(),
            method: 'GET',
            params
        }),
    getProfileSystem: (id: number) =>
        instance({
            url: getProfileSystem(id),
            method: 'GET'
        }),
    updateProfileSystem: (id: number, data: IProfileSystemUpdate) =>
        instance({
            url: updateProfileSystem(id),
            method: 'PUT',
            data
        }),
    updateOperation: (id: number, dto: IProfileSystemOperationUpdate) =>
        instance({
            url: updateProfileSystemOperation(id),
            method: 'PUT',
            data: dto
        }),
    updateDrill: (profileSystemId: number, dto: IUpdateDrill) =>
        instance({
            url: updateDrillSide(profileSystemId),
            method: 'PUT',
            data: dto
        }),
    updateMill: (profileSystemId: number, dto: IUpdateMill)=>
        instance({
            url: updateMillSide(profileSystemId),
            method: 'PUT',
            data: dto
        }),
    updateTemplate: (id: number, dto: IUpdateTemplate)=>
        instance({
            url: updateCncTemplate(id),
            method: 'PUT',
            data: dto
        }),
    updateLinkDetailMaterial: (id: number, dto: ILinkMaterialForm) =>
        instance({
            url: updateLinkDetailMaterial(id),
            method: 'POST',
            data: dto
        }),
    deleteLinkDetailMaterial: (id: number, dto: IUnlinkMaterialForm) =>
        instance({
            url: updateLinkDetailMaterial(id),
            method: 'DELETE',
            data: dto
        }),
    updateLinkAccessory: (id: number, dto: ILinkAccessoryForm) =>
        instance({
            url: updateLinkAccessory(id),
            method: 'POST',
            data: dto
        }),
    deleteUnlinkAccessory: (id: number, dto: IUnlinkAccessoryForm) =>
        instance({
            url: deleteUnlinkAccessory(id),
            method: 'DELETE',
            data: dto
        })
}