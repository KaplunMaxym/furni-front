'use client';

import * as THREE from 'three';
import { useEffect, useState, useMemo } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ConstructionMesh, ViewMode } from '@/screens/construction/type/editor/ThreeMesh';
import {BEAM_COLORS, BEAM_NAMES, PART_PRIORITY} from '@/screens/construction/constants/beamConstants';
import {
    DrillDefaultParameters, HingeDefaultParameters,
    MillDefaultParameters,
} from '@/screens/construction/features/editor/panels/ParametersPanel';
import { threeMeshToConstructionMesh } from '../utils/modelUtils';
import {BeamGeometryResult, HandleSideEnum, ModelDimensions} from "@/screens/construction/type/editor/Canvas3DAdvanced";
import {ImportedModelWrapper} from "@/screens/construction/features/editor/component/outline/ImportedModelWrapper";
import {BeamWithOutline} from "@/screens/construction/features/editor/component/outline/BeamWithOutline";
import {HandleMesh} from "@/screens/construction/features/editor/component/mesh/HandleMesh";
import {GlassMesh} from "@/screens/construction/features/editor/component/mesh/GlassMesh";
import {HingeNotchesMesh} from "@/screens/construction/features/editor/component/mesh/HingeNotchesMesh";
import {HingeMesh} from "@/screens/construction/features/editor/component/mesh/HingeMesh";

interface FrameModelProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    viewMode?: ViewMode;
    onMeshesUpdate?: (meshes: ConstructionMesh[], ordered: ConstructionMesh[]) => void;
    onInfoUpdate?: (info: string) => void;
    cutParams?: { leftAngle?: number; rightAngle?: number };
    groupRef: React.MutableRefObject<THREE.Group | null>;
    onBeamClick?: (beamName: string | null) => void;
    selectedBeamName?: string | null;
    importedModel?: THREE.Group | null;
    originalDimensions?: ModelDimensions | null;
    modelLoading?: boolean;
    modelError?: string | null;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    hingeSide?: HandleSideEnum;
    handlePosition?: number;
    hingeParams?: HingeDefaultParameters;
    millParams?: MillDefaultParameters;
    drillParams?: DrillDefaultParameters;
}

function createHorizontalBeam45(
    width: number, thickness: number, depth: number, isTop: boolean,
    startCount: number, endCount: number,
    holeOffsetY?: number, startOffsets?: number[], endOffsets?: number[],
    handleHolePositions?: number[]
): BeamGeometryResult {
    const shape = new THREE.Shape();
    const t = thickness;

    if (isTop) {
        shape.moveTo(0, thickness); shape.lineTo(t, 0);
        shape.lineTo(width - t, 0); shape.lineTo(width, thickness);
        shape.lineTo(width, thickness); shape.lineTo(0, thickness);
    } else {
        shape.moveTo(0, 0); shape.lineTo(width, 0);
        shape.lineTo(width - t, thickness); shape.lineTo(t, thickness);
        shape.lineTo(0, 0);
    }

    return buildHorizontalGeometry(shape, width, thickness, depth, startCount, endCount,
        holeOffsetY, startOffsets, endOffsets, handleHolePositions);
}

function createHorizontalBeam90(
    width: number, thickness: number, depth: number,
    startCount: number, endCount: number,
    holeOffsetY?: number, startOffsets?: number[], endOffsets?: number[],
    handleHolePositions?: number[],
): BeamGeometryResult {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(width, 0);
    shape.lineTo(width, thickness); shape.lineTo(0, thickness); shape.lineTo(0, 0);

    return buildHorizontalGeometry(shape, width, thickness, depth, startCount, endCount,
        holeOffsetY, startOffsets, endOffsets, handleHolePositions);
}

function buildHorizontalGeometry(
    shape: THREE.Shape, width: number, thickness: number, depth: number,
    startCount: number, endCount: number,
    holeOffsetY?: number, startOffsets?: number[], endOffsets?: number[],
    handleHolePositions?: number[],
): BeamGeometryResult {
    const holeY      = holeOffsetY ?? thickness * 0.5;
    const edgeOffset = thickness * 1.5;
    const spacing    = thickness * 0.8;
    const raw: Array<[number, number]> = [];

    for (let i = 0; i < startCount; i++) raw.push([startOffsets?.[i] ?? edgeOffset + i * spacing, holeY]);
    for (let i = 0; i < endCount;   i++) raw.push([width - (endOffsets?.[i]   ?? edgeOffset + i * spacing), holeY]);
    handleHolePositions?.forEach(x => raw.push([x, holeY]));

    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geometry.center();

    return {
        geometry,
        holePositions: raw.map(([x, y]) => [x - width / 2, y - thickness / 2]),
    };
}

function createVerticalBeam45(
    height: number, thickness: number, depth: number, isLeft: boolean,
    startCount: number, endCount: number,
    holeOffsetY?: number, startOffsets?: number[], endOffsets?: number[],
    handleHolePositions?: number[],
): BeamGeometryResult {
    const shape = new THREE.Shape();
    const t = thickness;

    if (isLeft) {
        shape.moveTo(0, 0); shape.lineTo(thickness - t, 0);
        shape.lineTo(thickness, t); shape.lineTo(thickness, height - t);
        shape.lineTo(thickness - t, height); shape.lineTo(0, height); shape.lineTo(0, 0);
    } else {
        shape.moveTo(thickness, 0); shape.lineTo(t, 0);
        shape.lineTo(0, t); shape.lineTo(0, height - t);
        shape.lineTo(t, height); shape.lineTo(thickness, height); shape.lineTo(thickness, 0);
    }

    return buildVerticalGeometry(shape, height, thickness, depth, startCount, endCount,
        holeOffsetY, startOffsets, endOffsets, handleHolePositions);
}

function createVerticalBeam90(
    height: number, thickness: number, depth: number,
    startCount: number, endCount: number,
    holeOffsetY?: number, startOffsets?: number[], endOffsets?: number[],
    handleHolePositions?: number[],
): BeamGeometryResult {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(thickness, 0);
    shape.lineTo(thickness, height); shape.lineTo(0, height); shape.lineTo(0, 0);

    return buildVerticalGeometry(shape, height, thickness, depth, startCount, endCount,
        holeOffsetY, startOffsets, endOffsets, handleHolePositions);
}

function buildVerticalGeometry(
    shape: THREE.Shape, height: number, thickness: number, depth: number,
    startCount: number, endCount: number,
    holeOffsetY?: number, startOffsets?: number[], endOffsets?: number[],
    handleHolePositions?: number[],
): BeamGeometryResult {
    const holeX      = holeOffsetY ?? thickness * 0.5;
    const edgeOffset = thickness * 1.5;
    const spacing    = thickness * 0.8;
    const raw: Array<[number, number]> = [];

    for (let i = 0; i < endCount;   i++) raw.push([holeX, height - (endOffsets?.[i]   ?? edgeOffset + i * spacing)]);
    for (let i = 0; i < startCount; i++) raw.push([holeX, startOffsets?.[i] ?? edgeOffset + i * spacing]);
    handleHolePositions?.forEach(y => raw.push([holeX, y]));

    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geometry.center();

    return {
        geometry,
        holePositions: raw.map(([x, y]) => [x - thickness / 2, y - height / 2]),
    };
}

function createHandleProfileBeam(
    height: number,
    thickness: number,
    depth: number,
    protrusionOnLeft: boolean,
    startCount: number,
    endCount: number,
    holeOffsetY?: number,
    startOffsets?: number[],
    endOffsets?: number[],
    handleHolePositions?: number[],
): BeamGeometryResult {
    const t  = thickness;
    const pr = t * 0.5;
    const totalW = t + pr;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(totalW, 0);
    shape.lineTo(totalW, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    const holeX = protrusionOnLeft ? pr + t * 0.5 : t * 0.5;
    const effectiveHoleX = holeOffsetY ?? holeX;

    const edgeOffset = t * 1.5;
    const spacing    = t * 0.8;
    const raw: Array<[number, number]> = [];

    for (let i = 0; i < endCount;   i++) raw.push([effectiveHoleX, height - (endOffsets?.[i]   ?? edgeOffset + i * spacing)]);
    for (let i = 0; i < startCount; i++) raw.push([effectiveHoleX, startOffsets?.[i] ?? edgeOffset + i * spacing]);
    handleHolePositions?.forEach(y => raw.push([effectiveHoleX, y]));

    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geometry.center();

    return {
        geometry,
        holePositions: raw.map(([x, y]) => [x - totalW / 2, y - height / 2]),
    };
}

interface HandleProfileMeshProps {
    beamThickness: number;
    frameWidth: number;
    frameHeight: number;
    side: 'LEFT' | 'RIGHT';
}

function HandleProfileMesh({ beamThickness, frameWidth, frameHeight, side }: HandleProfileMeshProps) {
    const t = beamThickness;
    const hw = frameWidth / 2;

    const backPlateThick = t * 0.05;
    const legDepth       = t * 0.55;
    const legThick       = t * 0.08;
    const profileH       = t * 0.90;
    const gap            = t * 0.015;
    const height         = frameHeight - t * 4;
    const dir = side === 'RIGHT' ? -1 : 1;

    const geo = useMemo(() => {
        const gBack = new THREE.BoxGeometry(backPlateThick, height, profileH);
        const gLeg1 = new THREE.BoxGeometry(legDepth, height, legThick);
        gLeg1.translate(dir * (backPlateThick / 2 + legDepth / 2), 0,  profileH / 2 - legThick / 2);
        const gLeg2 = new THREE.BoxGeometry(legDepth, height, legThick);
        gLeg2.translate(dir * (backPlateThick / 2 + legDepth / 2), 0, -(profileH / 2 - legThick / 2));
        const merged = mergeGeometries([gBack, gLeg1, gLeg2], false);
        gBack.dispose(); gLeg1.dispose(); gLeg2.dispose();
        return merged;
    }, [beamThickness, frameWidth, frameHeight, side]);

    const posX = side === 'RIGHT'
        ? hw + gap + backPlateThick / 2
        : -hw - gap - backPlateThick / 2;

    const posZ = t / 2 + profileH / 2 - t * 0.1;

    if (!geo) return null;

    return (
        <mesh name="HandleProfileBlock" geometry={geo} position={[posX, 0, posZ]} castShadow receiveShadow userData={{ isNotch: true }}>
            <meshStandardMaterial color={0xC0C0C0} metalness={0.80} roughness={0.12} />
        </mesh>
    );
}

function extractOffsets(
    edge: Record<string, number | undefined> | undefined,
    prefix: 'startOffsetX' | 'endOffsetX',
    count: number,
): number[] {
    if (!edge) return [];
    return Array.from({ length: count }, (_, i) => edge[`${prefix}${i + 1}`] as number).filter(v => v != null);
}

export function FrameModel({
                               frameWidth, frameHeight, beamThickness,
                               viewMode = 'solid',
                               onMeshesUpdate, onInfoUpdate,
                               cutParams, groupRef,
                               onBeamClick, selectedBeamName,
                               importedModel, originalDimensions, modelLoading, modelError,
                               hingeSide, hingeParams,
                               hasHandle, handleSide, handleOffset, handlePosition,
                               millParams, drillParams,
                           }: FrameModelProps) {
    const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);
    const [selectedModelPart, setSelectedModelPart] = useState<string | null>(null);

    useEffect(() => {
        if (!groupRef.current) return;

        const meshArray: THREE.Mesh[] = [];
        groupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isNotch) meshArray.push(child);
        });

        const ordered = [...meshArray].sort((a, b) => (PART_PRIORITY[a.name] ?? 99) - (PART_PRIORITY[b.name] ?? 99));
        setMeshes(meshArray);

        if (onMeshesUpdate) {
            onMeshesUpdate(
                meshArray.map(threeMeshToConstructionMesh),
                ordered.map(threeMeshToConstructionMesh),
            );
        }
    }, [frameWidth, frameHeight, beamThickness, importedModel]);

    useEffect(() => {
        meshes.forEach((mesh) => {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mesh.visible   = true;
            mat.wireframe  = viewMode === 'wireframe';
        });
    }, [viewMode, meshes]);

    const handleBeamClick = (beamName: string) => {
        setSelectedModelPart(null);
        onBeamClick?.(beamName);
    };

    if (importedModel && !modelError && originalDimensions) {
        return (
            <ImportedModelWrapper
                model={importedModel}
                originalDimensions={originalDimensions}
                targetWidth={frameWidth}
                targetHeight={frameHeight}
                targetDepth={beamThickness}
                selectedPart={selectedModelPart}
                onPartClick={(name) => { setSelectedModelPart(name); onBeamClick?.(null); }}
            />
        );
    }

    const is90       = (cutParams?.leftAngle ?? 45) === 90;
    const blindDepth = beamThickness * 0.5;
    const holeRadius = beamThickness * 0.15;

    const topEdge    = drillParams?.TOP?.edge;
    const bottomEdge = drillParams?.BOTTOM?.edge;
    const leftEdge   = drillParams?.LEFT?.edge;
    const rightEdge  = drillParams?.RIGHT?.edge;

    const getHandleHolePositions = (): number[] | undefined => {
        if (!hasHandle || !handleSide || !handleOffset || handlePosition == null) return undefined;
        const hp = drillParams?.[handleSide as 'LEFT'|'RIGHT'|'TOP'|'BOTTOM']?.handle;
        if (!hp) return undefined;
        const fd = 6, fr = fd / 2;
        const x1 = (handlePosition - handleOffset / 2) + fr + ((handleOffset - fd - hp.spacingX) / 2);
        const x2 = (handlePosition + handleOffset / 2) - fr - ((handleOffset - fd - hp.spacingX) / 2);
        return [x1, x2];
    };

    const handleHoles = getHandleHolePositions();

    const isHingeProfile = millParams?.ignoreHandleSide === true;

    // ── Визначаємо, яка вертикальна балка є «балкою-ручкою» ──────────────────
    // Якщо завіси зліва (hingeSide === 'LEFT') → балка-ручка справа (RIGHT)
    // Якщо завіси справа (hingeSide === 'RIGHT') → балка-ручка зліва (LEFT)
    const handleProfileSide: 'LEFT' | 'RIGHT' | null =
        isHingeProfile && hingeSide === 'LEFT'  ? 'RIGHT' :
            isHingeProfile && hingeSide === 'RIGHT' ? 'LEFT'  : null;

    // ── Будівник балок ────────────────────────────────────────────────────────

    const buildBeam = (
        side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT',
        edge: typeof topEdge,
    ): BeamGeometryResult => {
        const sc = edge?.countStart != null ? Number(edge.countStart) : 0;
        const ec = edge?.countEnd   != null ? Number(edge.countEnd)   : 0;
        const so = extractOffsets(edge, 'startOffsetX', sc);
        const eo = extractOffsets(edge, 'endOffsetX',   ec);
        const hp = drillParams?.[side]?.handle;
        const hh = (handleSide === side && hp) ? handleHoles : undefined;

        // ── Горизонтальні балки ───────────────────────────────────────────────
        if (side === 'TOP') {
            return is90
                ? createHorizontalBeam90(frameWidth, beamThickness, beamThickness, sc, ec, edge?.offsetY, so, eo, hh)
                : createHorizontalBeam45(frameWidth, beamThickness, beamThickness, true, ec, sc, edge?.offsetY, eo, so, hh);
        }

        if (side === 'BOTTOM') {
            return is90
                ? createHorizontalBeam90(frameWidth, beamThickness, beamThickness, sc, ec, edge?.offsetY, so, eo, hh)
                : createHorizontalBeam45(frameWidth, beamThickness, beamThickness, false, sc, ec, edge?.offsetY, so, eo, hh);
        }

        // ── Вертикальні балки ─────────────────────────────────────────────────

        // Стандартна вертикальна балка (блок-ручка рендериться окремим мешем)
        return is90
            ? createVerticalBeam90(frameHeight, beamThickness, beamThickness, sc, ec, edge?.offsetY, so, eo, hh)
            : createVerticalBeam45(frameHeight, beamThickness, beamThickness, side === 'LEFT', sc, ec, edge?.offsetY, so, eo, hh);
    };

    const topR    = buildBeam('TOP',    topEdge);
    const bottomR = buildBeam('BOTTOM', bottomEdge);
    const leftR   = buildBeam('LEFT',   leftEdge);
    const rightR  = buildBeam('RIGHT',  rightEdge);

    const hw = frameWidth  / 2;
    const hh_ = frameHeight / 2;
    const bt  = beamThickness;

    // Позиціонування балки-ручки (totalW = bt * 1.5):
    // Геометрія будується [0..totalW], після geometry.center() центр = 0,
    // тобто геометрія лежить у [-totalW/2 .. +totalW/2].
    //
    // protrusionOnLeft=true (права балка):
    //   виступ знаходиться у [-totalW/2 .. -totalW/2+pr]  (ліворуч від центру)
    //   основна частина    у [-totalW/2+pr .. +totalW/2]
    //   зовнішній (правий) край = +totalW/2
    //   хочемо зовнішній край на +hw → posX = hw - totalW/2
    //
    // protrusionOnLeft=false (ліва балка):
    //   виступ знаходиться у [+totalW/2-pr .. +totalW/2]  (праворуч від центру)
    //   основна частина    у [-totalW/2 .. +totalW/2-pr]
    //   зовнішній (лівий)  край = -totalW/2
    //   хочемо зовнішній край на -hw → posX = -hw + totalW/2

    // Звичайні позиції — балки стандартного розміру
    const leftX  = -hw + bt / 2;
    const rightX =  hw - bt / 2;

    console.log('ignoreHandleSide', millParams?.ignoreHandleSide);
    console.log('handleProfileSide', handleProfileSide);

    return (
        <>
            <BeamWithOutline
                name={BEAM_NAMES.TOP}
                geometry={topR.geometry}
                position={[0, hh_ - bt / 2, 0]}
                color={BEAM_COLORS[BEAM_NAMES.TOP]}
                isSelected={selectedBeamName === BEAM_NAMES.TOP}
                onClick={() => onBeamClick?.(BEAM_NAMES.TOP)}
                holePositions={topR.holePositions}
                holeRadius={holeRadius}
                beamDepth={bt}
                holeBlindDepth={blindDepth}
            />
            <BeamWithOutline
                name={BEAM_NAMES.BOTTOM}
                geometry={bottomR.geometry}
                position={[0, -hh_ + bt / 2, 0]}
                color={BEAM_COLORS[BEAM_NAMES.BOTTOM]}
                isSelected={selectedBeamName === BEAM_NAMES.BOTTOM}
                onClick={() => onBeamClick?.(BEAM_NAMES.BOTTOM)}
                holePositions={bottomR.holePositions}
                holeRadius={holeRadius}
                beamDepth={bt}
                holeBlindDepth={blindDepth}
            />
            <BeamWithOutline
                name={BEAM_NAMES.LEFT}
                geometry={leftR.geometry}
                position={[leftX, 0, 0]}
                color={BEAM_COLORS[BEAM_NAMES.LEFT]}
                isSelected={selectedBeamName === BEAM_NAMES.LEFT}
                onClick={() => onBeamClick?.(BEAM_NAMES.LEFT)}
                holePositions={leftR.holePositions}
                holeRadius={holeRadius}
                beamDepth={bt}
                holeBlindDepth={blindDepth}
            />
            <BeamWithOutline
                name={BEAM_NAMES.RIGHT}
                geometry={rightR.geometry}
                position={[rightX, 0, 0]}
                color={BEAM_COLORS[BEAM_NAMES.RIGHT]}
                isSelected={selectedBeamName === BEAM_NAMES.RIGHT}
                onClick={() => onBeamClick?.(BEAM_NAMES.RIGHT)}
                holePositions={rightR.holePositions}
                holeRadius={holeRadius}
                beamDepth={bt}
                holeBlindDepth={blindDepth}
            />

            {/* Профіль-ручка на всю висоту (профільна система завіс) */}
            {isHingeProfile && handleProfileSide && (
                <HandleProfileMesh
                    beamThickness={bt}
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    side={handleProfileSide}
                />
            )}

            {!isHingeProfile && (
                <HandleMesh
                    beamThickness={bt}
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    hasHandle={hasHandle}
                    handleSide={handleSide}
                    handleOffset={handleOffset}
                    handlePosition={handlePosition}
                    isSelected={selectedBeamName === 'Ручка'}
                    onClick={() => handleBeamClick('Ручка')}
                />
            )}

            {isHingeProfile && (
                <HingeMesh
                    frameWidth={frameWidth}
                    frameHeight={frameHeight}
                    beamThickness={bt}
                    hingeSide={hingeSide}
                    hingeParams={hingeParams}
                    selectedBeamName={selectedBeamName}
                    onBeamClick={onBeamClick}
                />
            )}

            <GlassMesh
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                beamThickness={bt}
                isSelected={selectedBeamName === 'Скло'}
                onClick={() => handleBeamClick('Скло')}
            />

            <HingeNotchesMesh
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                beamThickness={bt}
                handleSide={handleSide}
                hasHandle={hasHandle}
                millParams={millParams}
            />
        </>
    );
}