import instance from "@/services/api/interceptors.api";
import {
    createConstructionStatus,
    deleteConstructionStatus,
    getConstructionStatus,
    updateConstructionStatus,
} from "@/config/api.config";
import { IConstructionStatusForm } from "@/screens/construction/type/construction-status/IConstructionStatusForm";

export const ConstructionStatusService = {
    getAllConstructionStatus: () =>
        instance({
            url: getConstructionStatus(),
            method: 'GET'
        }),
    createConstructionStatus: (data: IConstructionStatusForm) =>
        instance({
            url: createConstructionStatus(),
            method: 'POST',
            data
        }),
    updateConstructionStatus: ({ id, ...data }: IConstructionStatusForm & { id: number }) =>
        instance({
            url: updateConstructionStatus(id),
            method: 'PUT',
            data
        }),
    deleteConstructionStatus: ({ id }: { id: number }) =>
        instance({
            url: deleteConstructionStatus(id),
            method: 'DELETE'
        }),
}
