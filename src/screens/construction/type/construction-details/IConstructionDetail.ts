import {DetailType, OperationType} from "@/screens/construction/type/construction/IConstruction";

export interface ConstructionDetail {
    id: number;
    constructionId: number;
    detailNo: string;
    type: DetailType;
    width: number;
    height: number;
    name: string;
    code?: string | null;
    sequence: number;
    length?: number;
    isCompleted: boolean;
    completedAt?: Date;
    isDownloadLabel: boolean;
    completedDownloadAt?: Date;
    area: number,
    handleOffset: number,
    requiresLabel: boolean,
    operations: Array<{
        id: number;
        detailId: number;
        type: OperationType;
        title: string;
        isCompleted: boolean;
        completedAt?: Date;
        cncPrograms: {
            id: number;
            operationId: number;
            version: number;
            code: string;
            completedAt?: Date;
        }
    }>;
}