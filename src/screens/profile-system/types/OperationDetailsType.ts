export type DetailType = 'PROFILE' | 'HANDLE' | 'GLASS' | 'HINGE';
export type OperationType =
    | 'CUT' | 'MILL' | 'DRILL' | 'HANDLE_MILL' | 'HANDLE_DRILL' | 'MILL_DRILL' | 'HINGE_MILL'
    | 'GROOVE_MILL'
    | 'SLOT_MILL'
    | 'WIRE_MILL'
    | 'BACK_GROOVE'
    | 'ASSEMBLY' | 'OTHER';

export type DetailCode = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK';

export type DrillSide = DetailCode;

export type Orientation = 'HORIZONTAL' | 'VERTICAL';
export type LengthSource = 'WIDTH' | 'HEIGHT';
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
    /** Довжина фрезерування з боку початку деталі. */
    millLengthStart?: number;
    /** Довжина фрезерування з боку кінця деталі. */
    millLengthEnd?: number;
    /** Застарілий спільний ключ; лишається для систем, де кінці однакові. */
    millLength?: number;
    millSides?: MillSideOption;
    /** Геометрія профілю; набір ключів залежить від системи. */
    startX?: number;
    centerX?: number;
    sideX?: number;
    /** Зсув дальнього кінця фрезерування. PIN-TYPE: 0.1 для TOP/BOTTOM. */
    mirrorOffsetX?: number;
    /** Скільки зняти з довжини деталі для цієї операції. */
    lengthCorrection?: number;
}

export interface CutParams {
    leftAngle?: number;
    rightAngle?: number;
    offsetZ?: number;
}

export interface ShelfPairParams {
    startX?: number;
    width?: number;
    endOffsetX?: number;
    offsetX?: number;
}

export interface ShelfWireParams {
    inset?: number;
    fromEnd?: boolean;
}

export interface ShelfBackGrooveParams {
    midOffset?: number;
    startOffset?: number;
}

export interface ShelfDrillParams {
    startOffsetX?: number;
    endOffsetX?: number;
    startY1?: number;
    startY2?: number;
    endY1?: number;
    endY2?: number;
}

export type ShelfPairParameters       = Partial<Record<DetailCode, ShelfPairParams>>;
export type ShelfWireParameters       = Partial<Record<DetailCode, ShelfWireParams>>;
export type ShelfBackGrooveParameters = Partial<Record<DetailCode, ShelfBackGrooveParams>>;
export type ShelfDrillParameters      = Partial<Record<DetailCode, ShelfDrillParams>>;

export type DrillParameters = Partial<Record<DetailCode, DrillSideParams>>;
export type MillParameters = Partial<Record<DetailCode, MillSideParams>>;

export interface DetailUpdateDto {
    name?: string;
    quantity?: number;
    sequence?: number;
    requiresLabel?: boolean;
    requiresCnc?: boolean;
}