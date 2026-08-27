'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HandleSideEnum } from "@/screens/construction/type/editor/Canvas3DAdvanced";
import { HingeDefaultParameters } from "@/screens/construction/features/editor/panels/ParametersPanel";
import { BeamWithOutline } from "@/screens/construction/features/editor/component/outline/BeamWithOutline";

interface HingeMeshProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    hingeSide?: HandleSideEnum;
    hingeParams?: HingeDefaultParameters;
    selectedBeamName?: string | null;
    onBeamClick?: (name: string | null) => void;
}

const HINGE_NAME = 'Завіса';

export function HingeMesh({frameWidth, frameHeight, beamThickness, hingeSide, hingeParams, selectedBeamName, onBeamClick}: HingeMeshProps) {

    console.log('hingeParams', hingeParams)

    const { mergedGeo, centerPos } = useMemo(() => {
        if (!hingeSide || !hingeParams) return { mergedGeo: null, centerPos: [0, 0, 0] as [number, number, number] };

        const isLeft  = hingeSide === HandleSideEnum.LEFT;
        const isRight = hingeSide === HandleSideEnum.RIGHT;

        if (!isLeft && !isRight) return { mergedGeo: null, centerPos: [0, 0, 0] as [number, number, number] };

        const hinges = hingeParams.hinges ?? [
            { offsetFromStart: 56, slotWidth: 44.4 },
            { offsetFromEnd: 56, slotWidth: 44.4 },
        ];

        const halfH = frameHeight / 2;
        const halfW = frameWidth  / 2;
        const t     = beamThickness;

        const signX       = isRight ? 1 : -1;
        const beamCenterX = signX * (halfW - t / 2);

        const notchDepth = t * 0.35;
        const frontZ     = t / 2;

        const geometries: THREE.BufferGeometry[] = [];

        hinges.forEach((hinge) => {
            const slotWidth = hinge.slotWidth;

            const startY = hinge.offsetFromStart !== undefined
                ? hinge.offsetFromStart
                : frameHeight - (hinge.offsetFromEnd ?? 56) - slotWidth;

            const centerY      = startY + slotWidth / 2;
            const sceneCenterY = -halfH + centerY;

            const geo = new THREE.BoxGeometry(t * 0.75, slotWidth * 0.9, notchDepth);
            geo.translate(beamCenterX, sceneCenterY, frontZ);
            geometries.push(geo);
        });

        if (!geometries.length) return { mergedGeo: null, centerPos: [0, 0, 0] as [number, number, number] };

        const merged = mergeGeometries(geometries, false);
        geometries.forEach((g) => g.dispose());

        return {
            mergedGeo: merged,
            centerPos: [0, 0, 0] as [number, number, number],
        };
    }, [frameWidth, frameHeight, beamThickness, hingeSide, hingeParams]);

    if (!mergedGeo) return null;

    return (
        <BeamWithOutline
            name={HINGE_NAME}
            geometry={mergedGeo}
            position={centerPos}
            color={0xC0C0C0}
            metalness={0.90}
            roughness={0.12}
            isSelected={selectedBeamName === HINGE_NAME}
            onClick={() => onBeamClick?.(HINGE_NAME)}
            holePositions={[]}
            holeRadius={0}
            beamDepth={beamThickness * 0.35}
            holeBlindDepth={0}
        />
    );
}