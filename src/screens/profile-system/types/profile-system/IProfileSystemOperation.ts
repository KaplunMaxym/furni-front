import {DetailType, OperationType} from "@/screens/profile-system/types/OperationDetailsType";
import {ICncProgramTemplate} from "@/screens/profile-system/types/cnc/ICncProgramTemplate";

export interface IProfileSystemOperation {
    id: number;
    profileSystemId: number;
    detailType: DetailType;
    operationType: OperationType;
    title?: string | null;
    defaultParameters?: Record<string, string> | null;
    sequence: number;
    isActive: boolean;
    requiresCnc: boolean;
    createdAt: string;
    updatedAt: string;
    cncProgramTemplates: ICncProgramTemplate[];
}