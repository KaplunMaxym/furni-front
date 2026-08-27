import {
    IProfileSystemAccessory,
    IProfileSystemDetail
} from "@/screens/profile-system/types/profile-system/IProfileSystemDetail";
import {IProfileSystemOperation} from "@/screens/profile-system/types/profile-system/IProfileSystemOperation";
import {IProfileSystem} from "@/screens/profile-system/types/profile-system/IProfileSystem";

export interface IProfileSystemFull extends IProfileSystem {
    operations: IProfileSystemOperation[];
    details: IProfileSystemDetail[];
    accessories: IProfileSystemAccessory[];
}