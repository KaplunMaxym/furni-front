import * as THREE from 'three';

export const HandleSideEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM',
}

export type HandleSideEnum = typeof HandleSideEnum[keyof typeof HandleSideEnum];

export interface ModelDimensions {
    width: number;
    height: number;
    depth: number;
}

export type Pt = { x: number; y: number };

export type NotchLine = {
    pt: Pt;
    ptStart: Pt;
    ptEnd: Pt;
    label: string;
    isVertical: boolean;
    anchorEnd: boolean;
};

export type LinesState = {
    topLeft:         Pt;
    topRight:        Pt;
    botLeft:         Pt;
    botRight:        Pt;
    rtTopOuter:      Pt;
    handleCenter?:   Pt;
    handleStart?:    Pt;
    handleEnd?:      Pt;
    handlePosStart?: Pt;
    handlePosEnd?:   Pt;
    topHoles:        Pt[];
    bottomHoles:     Pt[];
    leftHoles:       Pt[];
    rightHoles:      Pt[];
    handleHoles:     Pt[];
    notchLines:      NotchLine[];
    size:            { width: number; height: number };
};

export interface BeamGeometryResult {
    geometry: THREE.BufferGeometry;
    holePositions: Array<[number, number]>;
}