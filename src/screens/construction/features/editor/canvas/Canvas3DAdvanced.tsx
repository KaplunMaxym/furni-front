'use client';

import * as THREE from 'three';
import type { BeamSlotLabels } from '@/screens/construction/type/editor/BeamSlots';
import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Canvas3DAdvancedProps } from '@/screens/construction/type/editor/ThreeMesh';
import {
    DrillDefaultParameters, HingeDefaultParameters,
    MillDefaultParameters,
} from '@/screens/construction/features/editor/panels/ParametersPanel';
import { FocusedHoleKey } from '@/screens/construction/type/editor/FocusedHole';
import { HandleSideEnum } from "@/screens/construction/type/construction/IConstruction";
import { ModelDimensions } from "@/screens/construction/type/editor/Canvas3DAdvanced";
import {ProjectionUpdater} from "@/screens/construction/features/editor/component/ProjectionUpdater";
import {SceneContent} from "@/screens/construction/features/editor/component/SceneContent";
import {loadGLBModel} from "@/screens/construction/features/editor/utils/modelUtils";
import {DimensionLines} from "@/screens/construction/features/editor/component/dimline/DimensionLines";
import { SHELF_ROTATION } from "@/screens/construction/constants/beamConstants";
import { useThemeStore } from "@/store/theme/useThemeStore";

/**
 * Фон сцени.
 *
 * Three.js малює в canvas, а не в DOM, тож CSS-змінні теми до нього не
 * доходять — колір доводиться передавати числом. Світлий узятий трохи
 * темнішим за фон сторінки: на чисто білому алюміній зливається з тлом,
 * бо сам він теж світло-сірий.
 */
const SCENE_BACKGROUND = { dark: 0x18181b, light: 0xe9e9ec } as const;

interface Canvas3DAdvancedWithModelProps extends Canvas3DAdvancedProps {
    beamLabels?: BeamSlotLabels;
    hasHinge?: boolean;
    isShelf?: boolean;
    operationParams?: Record<string, unknown>;
    selectedMeshName?: string | null;
    profileSystemFileUrl?: string;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    drillParams?: DrillDefaultParameters;
    hideDimensions?: boolean;
    /** Дивитись на виріб із тилу — режим перегляду дилером. */
    viewFromBack?: boolean;
    millParams?: MillDefaultParameters;
    focusedHole?: FocusedHoleKey;
    onHoleHover?: (key: FocusedHoleKey) => void;
    hingeSide?: HandleSideEnum;
    hingeParams?: HingeDefaultParameters;
    cutParams?: { leftAngle?: number; rightAngle?: number; offsetZ?: number };
}

export default function Canvas3DAdvanced({
    beamLabels, hasHinge, isShelf, operationParams,
                                             frameWidth, frameHeight, beamThickness,
                                             drillParams, millParams, cutParams,
                                             hideDimensions,
                                             viewFromBack,
                                             hasHandle, handleSide, handleOffset, handlePosition,
                                             viewMode = 'solid',
                                             transformMode = 'none',
                                             hingeSide,
                                             onMeshesUpdate, onInfoUpdate, onBeamClick,
                                             selectedMeshName,
                                             hingeParams,
                                             profileSystemFileUrl,
                                             focusedHole, onHoleHover
                                         }: Canvas3DAdvancedWithModelProps) {
    const groupRef = useRef<THREE.Group | null>(null);
    const theme = useThemeStore(state => state.theme);

    const [importedModel,      setImportedModel]      = useState<THREE.Group | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<ModelDimensions | null>(null);
    const [modelLoading,       setModelLoading]       = useState(false);
    const [modelError,         setModelError]         = useState<string | null>(null);

    useEffect(() => {
        if (!profileSystemFileUrl) {
            setImportedModel(null);
            setOriginalDimensions(null);
            setModelError(null);
            return;
        }

        const load = async () => {
            setModelLoading(true);
            setModelError(null);
            try {
                const result = await loadGLBModel(profileSystemFileUrl);
                if (result) {
                    setImportedModel(result.model);
                    setOriginalDimensions(result.dimensions);
                    setModelError(null);
                    console.log('✅ Model and dimensions saved:', result.dimensions);
                } else {
                    setImportedModel(null);
                    setOriginalDimensions(null);
                    setModelError('Не вдалося завантажити модель');
                }
            } catch (error) {
                console.error('Error loading model:', error);
                setImportedModel(null);
                setOriginalDimensions(null);
                setModelError(error instanceof Error ? error.message : 'Невідома помилка');
            } finally {
                setModelLoading(false);
            }
        };

        load();
    }, [profileSystemFileUrl]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas>
                <color attach="background" args={[SCENE_BACKGROUND[theme]]} />
                <ambientLight intensity={0.35} />
                <hemisphereLight args={[0xffffff, 0x404050, 0.55]} />
                <directionalLight position={[10, 10, 5]} intensity={0.9} castShadow />
                <directionalLight position={[-8, 4, 7]} intensity={0.4} />

                <ProjectionUpdater rotation={isShelf ? SHELF_ROTATION : undefined} />
                <SceneContent
                    beamLabels={beamLabels}
                    hasHinge={hasHinge}
                    isShelf={isShelf}
                    operationParams={operationParams}
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    beamThickness={beamThickness}
                    viewMode={viewMode}
                    drillParams={drillParams}
                    transformMode={transformMode}
                    onMeshesUpdate={onMeshesUpdate}
                    onInfoUpdate={onInfoUpdate}
                    onBeamClick={onBeamClick}
                    groupRef={groupRef}
                    hingeSide={hingeSide}
                    hingeParams={hingeParams}
                    selectedBeamName={selectedMeshName}
                    importedModel={importedModel}
                    originalDimensions={originalDimensions}
                    modelLoading={modelLoading}
                    modelError={modelError}
                    hasHandle={hasHandle}
                    handleSide={handleSide}
                    cutParams={cutParams}
                    handleOffset={handleOffset}
                    handlePosition={handlePosition}
                    hideDimensions={hideDimensions}
                    viewFromBack={viewFromBack}
                    millParams={millParams}
                />
            </Canvas>

            {!hideDimensions && (
                <DimensionLines
                    hasHinge={hasHinge}
                    operationParams={operationParams}
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    beamThickness={beamThickness}
                    hasHandle={hasHandle}
                    handleSide={handleSide}
                    handleOffset={handleOffset}
                    handlePosition={handlePosition}
                    drillParams={drillParams}
                    millParams={millParams}
                    focusedHole={focusedHole}
                    onHoleHover={onHoleHover}
                    hingeSide={hingeSide}
                    hingeParams={hingeParams}
                />
            )}
        </div>
    );
}