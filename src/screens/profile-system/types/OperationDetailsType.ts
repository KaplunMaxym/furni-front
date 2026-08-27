export type DetailType = 'PROFILE' | 'HANDLE' | 'GLASS';
export type OperationType = 'CUT' | 'MILL' | 'DRILL' | 'HANDLE_MILL' | 'MILL_DRILL';
export type DrillSide = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
export type MillSideOption = "none" | "start" | "end" | "both";
export type TabId = "info" | "operations" | "details";

export interface DrillEdgeParams {
    startOffsetX1?: number;
    startOffsetX2?: number;
    startOffsetX3?: number;
    endOffsetX1?: number;
    endOffsetX2?: number;
    endOffsetX3?: number;
    offsetY?: number;
    offsetY1?: number;
    offsetY2?: number;
    offsetZ?: number;
    countStart?: number;
    countEnd?: number;
}

export interface DrillHandleParams {
    spacingX?: number;
    offsetY?: number;
}

export interface DrillSideParams {
    edge?: DrillEdgeParams;
    handle?: DrillHandleParams | null;
}

export interface MillSideParams {
    millLength?: number;
    millSides?: MillSideOption;
}

export interface CutParams {
    leftAngle?: number;
    rightAngle?: number;
    offsetZ?: number;
}

export type DrillParameters = Partial<Record<DrillSide, DrillSideParams>>;
export type MillParameters = Partial<Record<DrillSide, MillSideParams>>;

export interface DetailUpdateDto {
    name?: string;
    quantity?: number;
    sequence?: number;
    requiresLabel?: boolean;
    requiresCnc?: boolean;
}