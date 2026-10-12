import {ServiceUnitType} from "@/screens/profile-service/types/IProfileService";

export interface IProfileServiceForm {
    profileSystemId?: number | '';
    name: string;
    code1C: string;
    unit: ServiceUnitType | '';
    pricePerUnit: number | null;
    condition: string;
    isActive: boolean;
}