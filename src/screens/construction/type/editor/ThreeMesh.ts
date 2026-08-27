import {HandleSideEnum, IConstruction} from "@/screens/construction/type/construction/IConstruction";
import {IOrder} from "@/screens/order/types/order/IOrder";

export interface ConstructionMesh {
    name: string;
    geometry: {
        attributes: {
            position: {
                array: Float32Array;
            };
        };
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    castShadow: boolean;
    receiveShadow: boolean;
    visible: boolean;
    material?: ConstructionMeshMaterial;
}

export interface ConstructionMeshMaterial {
    wireframe?: boolean;
    color?: {
        setHex: (hex: number) => void;
    };
    metalness?: number;
    roughness?: number;
    clone: () => ConstructionMeshMaterial;
}

export interface Canvas3DAdvancedProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    viewMode?: ViewMode;
    transformMode?: TransformMode;
    onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void;
    onInfoUpdate?: (info: string) => void;
    onBeamClick?: (beamName: string | null) => void;
}

export type ViewMode = 'solid' | 'wireframe' | 'vertices' | 'mixed';
export type TransformMode = 'translate' | 'rotate' | 'scale' | 'none';
export type Axis = 'x' | 'y' | 'z';

export interface GcodeData {
    gcode: string;
    partName: string;
    beamLength: number;
    beamThickness: number;
    sawThickness: number;
    fileName: string;
}

export interface ConstructionEditorProps {
    construction: IConstruction;
    onGoBack: () => void;
    order: IOrder
}

export interface ParametersPanelProps {
    frameWidth: number;
    setFrameWidth: (value: number) => void;
    frameHeight: number;
    setFrameHeight: (value: number) => void;
    beamThickness: number;
    setBeamThickness: (value: number) => void;
    hasHandle?: boolean;
    setHasHandle?: (value: boolean) => void;
    handleSide?: HandleSideEnum;
    setHandleSide?: (value: HandleSideEnum | undefined) => void;
    handleOffset?: number;
    setHandleOffset?: (value: number | undefined) => void;
    handlePosition?: number;
    setHandlePosition?: (value: number | undefined) => void;
    onUpdate: () => void | Promise<void>;
    isUpdating?: boolean;
}

export interface PartsListProps {
    meshes: ConstructionMesh[];
    selectedMesh: ConstructionMesh | null;
    onSelectMesh: (mesh: ConstructionMesh) => void;
}

export interface ViewControlsProps {
    viewMode: ViewMode;
    transformMode: TransformMode;
    onSetViewMode: (mode: ViewMode) => void;
    onSetTransformMode: (mode: TransformMode) => void;
}

export interface ScaleControlsProps {
    onScale: (factor: number, axis: Axis) => void;
    onMove: (amount: number, axis: Axis) => void;
}

export interface InfoPanelProps {
    text: string;
}