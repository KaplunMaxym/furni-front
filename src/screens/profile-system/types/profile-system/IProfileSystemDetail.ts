import {DetailType} from "@/screens/profile-system/types/OperationDetailsType";
import {IProfileMaterial} from "@/screens/profile-material/types/IProfileMaterial";
import {AccessoryBillingType, IProfileAccessory} from "@/screens/profile-accessory/types/IProfileAccessory";

interface IProfileSystemDetailMaterial {
    profileSystemDetailId: number;
    profileMaterialId: number;
    wasteThreshold: number;
    profileMaterial?: IProfileMaterial;
}

export interface IProfileSystemAccessory {
    profileSystemId: number;
    profileAccessoryId: number;
    detailType: DetailType;
    billingType: AccessoryBillingType;
    quantityPerUnit: number;
    extraCondition: Record<string, unknown> | null;
    isOptional: boolean;
    profileAccessory: IProfileAccessory;
}

export interface IProfileSystemDetail {
    id: number;
    profileSystemId: number;
    detailType: DetailType;
    code: string;
    name: string;
    sequence: number;
    quantity: number;
    requiresLabel: boolean;
    requiresCnc: boolean;
    createdAt: string;
    updatedAt: string;
    materials?: IProfileSystemDetailMaterial[];
}