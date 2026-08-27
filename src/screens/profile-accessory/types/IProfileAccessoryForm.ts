import { AccessoryUnitType } from './IProfileAccessory';

export interface IProfileAccessoryForm {
    articleCode: string;
    name: string;
    unit: AccessoryUnitType | '';
    colorId: number | '';
}