export const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    // TOP: 'TOP',
    // BOTTOM: 'BOTTOM'
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

export enum DetailType {
    PROFILE = 'PROFILE',
    GLASS = 'GLASS',
    HANDLE = 'HANDLE',
    HINGE = 'HINGE',
    OTHER = 'OTHER',
}

/**
 * Тип деталі людською мовою.
 *
 * В інтерфейсі показувалось саме значення енума — «PROFILE», «GLASS». Це назви
 * з бази, а не слова для майстра біля верстата; поруч у списку кольорів ті самі
 * типи вже підписані українською (`COLOR_TYPE_LABELS`).
 */
export const DETAIL_TYPE_LABELS: Record<DetailType, string> = {
    PROFILE: 'Профіль',
    GLASS: 'Скло',
    HANDLE: 'Ручка',
    HINGE: 'Завіса',
    OTHER: 'Інше',
};

export enum OperationType {
    CUT = 'CUT',
    DRILL = 'DRILL',
    MILL = 'MILL',
    HINGE_MILL = 'HINGE_MILL',
    HANDLE_MILL = 'HANDLE_MILL',
    HANDLE_DRILL = 'HANDLE_DRILL',
    MILL_DRILL = 'MILL_DRILL',
    GROOVE_MILL = 'GROOVE_MILL',
    SLOT_MILL = 'SLOT_MILL',
    WIRE_MILL = 'WIRE_MILL',
    BACK_GROOVE = 'BACK_GROOVE',
    ASSEMBLY = 'ASSEMBLY',
    OTHER = 'OTHER',
}

export interface IProfileSystemOperation {
    id: number;
    title: string;
    operationType: OperationType;
    detailType: DetailType;
    defaultParameters: string;
}

export interface IProfileSystem {
    id: number;
    code: string;
    title: string;
    fileUrl: string;
    operations?: IProfileSystemOperation[];
    operation?: IProfileSystemOperation[];
}

export interface IConstructionStatus {
    id: number;
    code: string;
    title: string;
}

export interface IGlassFill {
    id: number;
    type: string;
    thickness: number;
}

export interface IOrderConstruction {
    id: number;
    orderNumber: string;
}

export interface IConstructionDetails {
    id: number;
    name: string;
    length: number;
    type: DetailType;
    width: number;
    height: number;
    sequence: number;
    operations: IProfileSystemOperation[];
    requiresLabel: boolean;
    handleSide: HandleSideEnum;
    constructionId: number;
    detailNo: string;
}

export interface IConstruction {
    id: number;
    orderId: number;
    order: IOrderConstruction;
    constructionNo: string;
    profileSystemId: number;
    profileSystem: IProfileSystem;
    drillParams: string;
    hingeParams: string;
    operationParams?: Record<string, unknown> | string | null;
    millParams: string;
    cutParams: string;
    constructionStatusId: number;
    constructionStatus: IConstructionStatus;
    width: number;
    height: number;
    sawThickness: number;
    beamThickness: number;
    glassFillId?: number | null;
    glassFill?: IGlassFill | null;
    hasHandle: boolean;
    details: IConstructionDetails[];
    handleSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
    hingeSide?: HandleSideEnum | null;
    wireSide?: HandleSideEnum | null;
    hasGlassEdge: boolean | null;
    colorId?: number | null;
    handleColorId?: number | null;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}