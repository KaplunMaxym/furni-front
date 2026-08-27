export interface ICncProgramTemplate {
    id: number;
    profileSystemOperationId: number;
    detailTemplateId?: number | null;
    name?: string | null;
    templateContent: string;
    createdAt: string;
    updatedAt: string;
}