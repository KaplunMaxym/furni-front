'use client';

import React, { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import {
    DrillDefaultParameters, HingeDefaultParameters,
    MillDefaultParameters,
} from '@/screens/construction/features/editor/panels/ParametersPanel';
import { Canvas3DAdvancedProps, ViewMode } from '@/screens/construction/type/editor/ThreeMesh';
import { FrameModel } from './FrameModel';
import {ModelDimensions} from "@/screens/construction/type/editor/Canvas3DAdvanced";
import { HandleSideEnum } from "@/screens/construction/type/construction/IConstruction";
import {CameraAndControls} from "@/screens/construction/features/editor/component/control/CameraAndControls";

interface SceneContentProps extends Canvas3DAdvancedProps {
    groupRef: React.MutableRefObject<THREE.Group | null>;
    cutParams?: { leftAngle?: number };
    selectedBeamName?: string | null;
    importedModel?: THREE.Group | null;
    originalDimensions?: ModelDimensions | null;
    modelLoading?: boolean;
    modelError?: string | null;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    hideDimensions?: boolean;
    hingeSide?: HandleSideEnum;
    hingeParams?: HingeDefaultParameters;
    millParams?: MillDefaultParameters;
    drillParams?: DrillDefaultParameters;
}

export function SceneContent({
                                 frameWidth, frameHeight, beamThickness,
                                 cutParams, viewMode, transformMode,
                                 onMeshesUpdate, onInfoUpdate, onBeamClick,
                                 groupRef, selectedBeamName,
                                 hingeParams,
                                 hingeSide,
                                 importedModel, originalDimensions, modelLoading, modelError,
                                 hasHandle, handleSide, handleOffset, handlePosition,
                                 hideDimensions, millParams, drillParams,
                             }: SceneContentProps) {
    const transformRef = useRef<React.ComponentRef<typeof TransformControls>>(null);

    useEffect(() => {
        const transform = transformRef.current;
        if (!transform || !groupRef.current) return;
        transform.attach(groupRef.current);
        return () => { transform.detach(); };
    }, []);

    return (
        <>
            <CameraAndControls frameWidth={frameWidth} frameHeight={frameHeight} beamThickness={beamThickness} />

            <group ref={groupRef}>
                <FrameModel
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    beamThickness={beamThickness}
                    viewMode={viewMode}
                    millParams={millParams}
                    onMeshesUpdate={onMeshesUpdate}
                    onInfoUpdate={onInfoUpdate}
                    groupRef={groupRef}
                    hingeParams={hingeParams}
                    drillParams={drillParams}
                    hingeSide={hingeSide}
                    onBeamClick={onBeamClick}
                    selectedBeamName={selectedBeamName}
                    importedModel={importedModel}
                    originalDimensions={originalDimensions}
                    modelLoading={modelLoading}
                    modelError={modelError}
                    hasHandle={hasHandle}
                    handleSide={handleSide}
                    cutParams={cutParams}
                    handleOffset={handleOffset}
                    handlePosition={handlePosition}
                />
            </group>

            {transformMode !== 'none' && (
                <TransformControls ref={transformRef} mode={transformMode} />
            )}
        </>
    );
}