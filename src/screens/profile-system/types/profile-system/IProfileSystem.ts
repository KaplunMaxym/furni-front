export interface IProfileSystem {
    id: number;
    code: string;
    code1C?: string | null;
    title: string;
    defaultParameters?: Record<string, unknown> | null;
    minWidth?: string | null;
    maxWidth?: string | null;
    minHeight?: string | null;
    maxHeight?: string | null;
}