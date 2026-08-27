import {ServiceUnitType} from "@/screens/profile-service/types/IProfileService";

export interface IProfileServiceForm {
    profileSystemId?: number | '';
    name: string;
    unit: ServiceUnitType | '';
    pricePerUnit: number | null;
    condition: string;
    isActive: boolean;
}