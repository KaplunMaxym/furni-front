import { AccessoryUnitType } from './IProfileAccessory';

export interface IProfileAccessoryForm {
    articleCode: string;
    code1C: string;
    name: string;
    unit: AccessoryUnitType | '';
    colorId: number | '';
}