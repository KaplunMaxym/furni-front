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

/**
 * Умови нарахування послуги.
 *
 * Значення мають збігатися з `checkServiceCondition` на беку — саме ці рядки
 * він і розбирає. Порожня умова там потрапляє в `default` і теж означає
 * «завжди», тому в таблиці показуємо це прямо, а не прочерком.
 */
export const SERVICE_CONDITIONS = [
    'always',
    'hasHandle',
    'hasHinge',
    'hasGlass',
    'hasGlassEdge',
] as const;
export type ServiceConditionType = typeof SERVICE_CONDITIONS[number];

export const SERVICE_CONDITION_LABELS: Record<ServiceConditionType, string> = {
    always: 'Завжди',
    hasHandle: 'Якщо є ручка',
    hasHinge: 'Якщо є завіси',
    hasGlass: 'Якщо є скло',
    // Той самий перемикач у конструкції зветься «Шліфування торців скла»
    hasGlassEdge: 'Якщо є шліфування торців скла',
};

/**
 * `unit` і `condition` у базі — вільні рядки, не enum. Тому підпис шукаємо в
 * словнику, а якщо не знайшли — показуємо як є: краще незрозумілий рядок,
 * ніж порожня комірка, за якою не видно, що там взагалі щось лежить.
 */
export const serviceUnitLabel = (unit: string): string =>
    SERVICE_UNIT_LABELS[unit as ServiceUnitType] ?? unit;

export const serviceConditionLabel = (condition: string | null): string =>
    condition
        ? SERVICE_CONDITION_LABELS[condition as ServiceConditionType] ?? condition
        : SERVICE_CONDITION_LABELS.always;

export interface IProfileService {
    id: number;
    profileSystemId: number;
    name: string;
    unit: string;
    pricePerUnit: number;
    /** Код номенклатури в 1С. Рядок із ведучими нулями. */
    code1C: string | null;
    condition: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    profileSystem: IProfileSystem;
}
