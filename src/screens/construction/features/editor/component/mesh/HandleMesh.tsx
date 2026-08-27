import * as THREE from 'three';
import { useRef, useEffect, useMemo } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {HandleSideEnum} from "@/screens/construction/type/editor/Canvas3DAdvanced";

interface HandleMeshProps {
    beamThickness: number;
    frameWidth: number;
    frameHeight: number;
    hasHandle?: boolean;
    handleSide?: HandleSideEnum;
    handleOffset?: number;
    handlePosition?: number;
    isSelected: boolean;
    onClick: () => void;
}

export function HandleMesh({beamThickness, frameWidth, frameHeight, hasHandle, handleSide, handleOffset, handlePosition, isSelected, onClick}: HandleMeshProps) {
    const meshRef    = useRef<THREE.Mesh>(null);
    const outlineRef = useRef<THREE.LineSegments | null>(null);

    const { geo, pos } = useMemo(() => {
        const t = beamThickness;

        const handleWidth  = handleOffset || 160;
        const side         = handleSide ?? HandleSideEnum.RIGHT;
        const isVertical   = side === HandleSideEnum.LEFT || side === HandleSideEnum.RIGHT;

        const backPlateThick = t * 0.05;
        const legDepth       = t * 0.55;
        const legThick       = t * 0.08;
        const profileHeight  = t * 0.90;
        const gap            = t * 0.015;
        const dir            = (side === HandleSideEnum.RIGHT || side === HandleSideEnum.TOP) ? 1 : -1;

        let posX: number, posY: number;

        if (isVertical) {
            const beamEdgeX = side === HandleSideEnum.RIGHT ? frameWidth / 2 : -frameWidth / 2;
            posX = side === HandleSideEnum.RIGHT
                ? beamEdgeX + gap + backPlateThick / 2
                : beamEdgeX - gap - backPlateThick / 2;
            const bottomEdge = -frameHeight / 2;
            posY = handlePosition != null ? bottomEdge + handlePosition : 0;
        } else {
            const beamEdgeY = side === HandleSideEnum.TOP ? frameHeight / 2 : -frameHeight / 2;
            posY = side === HandleSideEnum.TOP
                ? beamEdgeY + gap + backPlateThick / 2
                : beamEdgeY - gap - backPlateThick / 2;
            const leftEdge = -frameWidth / 2;
            posX = handlePosition != null ? leftEdge + handlePosition : 0;
        }

        let gBack: THREE.BoxGeometry, gLeg1: THREE.BoxGeometry, gLeg2: THREE.BoxGeometry;

        if (isVertical) {
            gBack = new THREE.BoxGeometry(backPlateThick, handleWidth, profileHeight);
            gLeg1 = new THREE.BoxGeometry(legDepth, handleWidth, legThick);
            gLeg1.translate(dir * (backPlateThick / 2 + legDepth / 2), 0,  profileHeight / 2 - legThick / 2);
            gLeg2 = new THREE.BoxGeometry(legDepth, handleWidth, legThick);
            gLeg2.translate(dir * (backPlateThick / 2 + legDepth / 2), 0, -(profileHeight / 2 - legThick / 2));
        } else {
            gBack = new THREE.BoxGeometry(handleWidth, backPlateThick, profileHeight);
            gLeg1 = new THREE.BoxGeometry(handleWidth, legDepth, legThick);
            gLeg1.translate(0, dir * (backPlateThick / 2 + legDepth / 2),  profileHeight / 2 - legThick / 2);
            gLeg2 = new THREE.BoxGeometry(handleWidth, legDepth, legThick);
            gLeg2.translate(0, dir * (backPlateThick / 2 + legDepth / 2), -(profileHeight / 2 - legThick / 2));
        }

        const merged = mergeGeometries([gBack, gLeg1, gLeg2], false);
        gBack.dispose(); gLeg1.dispose(); gLeg2.dispose();

        return { geo: merged, pos: [posX, posY, 0] as [number, number, number] };
    }, [beamThickness, frameWidth, frameHeight, handleSide, handlePosition, handleOffset]);

    useEffect(() => {
        if (outlineRef.current) {
            outlineRef.current.parent?.remove(outlineRef.current);
            outlineRef.current.geometry.dispose();
            (outlineRef.current.material as THREE.Material).dispose();
            outlineRef.current = null;
        }
        if (!meshRef.current || !isSelected || !geo) return;

        const edges   = new THREE.EdgesGeometry(geo);
        const outline = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 }),
        );
        meshRef.current.add(outline);
        outlineRef.current = outline;

        return () => {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
        };
    }, [isSelected, geo]);

    if (!hasHandle || !geo) return null;

    return (
        <mesh
            ref={meshRef}
            name="Ручка"
            geometry={geo}
            position={pos}
            castShadow
            receiveShadow
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            <meshStandardMaterial color={0xC0C0C0} metalness={0.80} roughness={0.12} />
        </mesh>
    );
}