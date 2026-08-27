export interface IProfileSystemOperationUpdate {
    title?: string;
    sequence?: number;
    isActive?: boolean;
    requiresCnc?: boolean;
    defaultParameters?: Record<string, unknown>;
}

export interface IUpdateDrill {
    side: string;
    edge?: Record<string, unknown>;
    handle?: Record<string, unknown> | null;
}

export interface IUpdateMill {
    side: string;
    millLength?: number;
    millSides?: string;
}

export interface IUpdateTemplate {
    name?: string;
    templateContent?: string
}