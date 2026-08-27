export interface IProfileSystem {
    id: number;
    code: string;
    title: string;
    defaultParameters?: Record<string, unknown> | null;
    minWidth?: string | null;
    maxWidth?: string | null;
    minHeight?: string | null;
    maxHeight?: string | null;
}