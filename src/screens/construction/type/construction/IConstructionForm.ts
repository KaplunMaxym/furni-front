import {
    CutDefaultParameters,
    DrillDefaultParameters, HingeDefaultParameters,
    MillDefaultParameters
} from "@/screens/construction/features/editor/panels/ParametersPanel";

export const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

export interface IConstructionForm {
    orderId: number;
    profileSystemId: number;
    constructionStatusId: number | undefined;
    width: number;
    height: number;
    // sawThickness: number;
    beamThickness: number;
    hasGlassEdge?: boolean | null;
    glassFillId?: number | null;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum | null;
    hingeSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
    colorId?: number | null;
    handleColorId?: number | null;
}

export interface IConstructionFormUpdate {
    orderId?: number;
    profileSystemId?: number;
    constructionStatusId?: number;
    width?: number;
    height?: number;
    hasGlassEdge?: boolean | null;
    // sawThickness?: number;
    beamThickness?: number;
    glassFillId?: number | null;
    hasHandle?: boolean;
    hingeSide?: HandleSideEnum | null;
    handleSide?: HandleSideEnum | null;
    handleOffset?: number | null;
    handlePosition?: number | null;
    drillParams?: DrillDefaultParameters;
    millParams?: MillDefaultParameters;
    cutParams?: CutDefaultParameters;
    hingeParams?: HingeDefaultParameters;
}