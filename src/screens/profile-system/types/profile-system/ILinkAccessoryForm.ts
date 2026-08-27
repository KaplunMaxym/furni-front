import {AccessoryBillingType} from "@/screens/profile-accessory/types/IProfileAccessory";

export interface ILinkAccessoryForm {
    profileAccessoryId: number;
    billingType: AccessoryBillingType;
    quantityPerUnit: number;
    detailType?: string | null;
    isOptional?: boolean;
}