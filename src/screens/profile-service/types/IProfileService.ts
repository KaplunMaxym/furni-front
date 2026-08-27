import {IProfileSystem} from "@/screens/construction/type/construction/IConstruction";

export const SERVICE_UNITS = ['bar_3m', 'pcs', 'm2', 'per_facade', 'per_meter'] as const;
export type ServiceUnitType = typeof SERVICE_UNITS[number];

export const SERVICE_UNIT_LABELS: Record<ServiceUnitType, string> = {
    bar_3m: 'Штанга 3м',
    pcs: 'Штук',
    m2: 'м²',
    per_facade: 'За фасад',
    per_meter: 'За метр',
};

export interface IProfileService {
    id: number;
    profileSystemId: number;
    name: string;
    unit: string;
    pricePerUnit: number;
    condition: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    profileSystem: IProfileSystem;
}