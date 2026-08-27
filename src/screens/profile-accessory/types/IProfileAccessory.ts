import { PriceCategoryType } from '@/screens/glass-fill/types/IGlassPrice';

export type AccessoryBillingType = 'PER_FACADE_BASE' | 'PER_FACADE_OPTIONAL';
export type DetailType = 'PROFILE' | 'HANDLE' | 'HINGE' | null;

export const ACCESSORY_UNITS = ['SET', 'PCS', 'M', 'M2'] as const;
export type AccessoryUnitType = typeof ACCESSORY_UNITS[number];

export const ACCESSORY_UNIT_LABELS: Record<AccessoryUnitType, string> = {
    SET: 'Комплект',
    PCS: 'Штука',
    M:   'Метр',
    M2:  'м²',
};

export interface IProfileAccessoryPrice {
    id: number;
    profileAccessoryId: number;
    category: PriceCategoryType;
    pricePerUnit: number;
}

export interface IProfileAccessory {
    id: number;
    articleCode: string;
    name: string;
    unit: AccessoryUnitType;
    colorId: number | null;
    color: { id: number; name: string; code: string | null } | null;
    prices: IProfileAccessoryPrice[];
    systemLinks: {
        profileSystem: {
            id: number;
            code: string;
            title: string;
        };
    }[];
}