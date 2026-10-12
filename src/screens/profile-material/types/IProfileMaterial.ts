import { PriceCategoryType } from '@/screens/glass-fill/types/IGlassPrice';

export interface IProfileMaterialPrice {
    id: number;
    profileMaterialId: number;
    category: PriceCategoryType;
    pricePerBeam: number;
}

export interface IProfileMaterialSystemDetail {
    profileSystemDetail: {
        id: number;
        name: string;
        profileSystem: {
            id: number;
            title: string;
        };
    };
}

export interface IProfileMaterial {
    id: number;
    articleCode: string;
    name: string;
    beamLength: number;
    /** Код номенклатури в 1С. Рядок із ведучими нулями. */
    code1C: string | null;
    colorId: number | null;
    color: { id: number; name: string; code: string | null } | null;
    prices: IProfileMaterialPrice[];
    systemDetails: IProfileMaterialSystemDetail[];
}