'use client';

import * as THREE from 'three';
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

interface Canvas3DAdvancedWithModelProps extends Canvas3DAdvancedProps {
    selectedMeshName?: string | null;
    profileSystemFileUrl?: string;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    drillParams?: DrillDefaultParameters;
    hideDimensions?: boolean;
    millParams?: MillDefaultParameters;
    focusedHole?: FocusedHoleKey;
    onHoleHover?: (key: FocusedHoleKey) => void;
    hingeSide?: HandleSideEnum;
    hingeParams?: HingeDefaultParameters;
    cutParams?: { leftAngle?: number; rightAngle?: number; offsetZ?: number };
}

export default function Canvas3DAdvanced({
                                             frameWidth, frameHeight, beamThickness,
                                             drillParams, millParams, cutParams,
                                             hideDimensions,
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
                <color attach="background" args={[0x23272f]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <ProjectionUpdater />
                <SceneContent
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
                    millParams={millParams}
                />
            </Canvas>

            {!hideDimensions && (
                <DimensionLines
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