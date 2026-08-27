import * as THREE from 'three';
import { useRef, useEffect, useMemo } from 'react';

interface GlassMeshProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    isSelected: boolean;
    onClick: () => void;
}

export function GlassMesh({ frameWidth, frameHeight, beamThickness, isSelected, onClick }: GlassMeshProps) {
    const meshRef    = useRef<THREE.Mesh>(null);
    const outlineRef = useRef<THREE.LineSegments | null>(null);

    const glassWidth  = frameWidth  - beamThickness;
    const glassHeight = frameHeight - beamThickness;
    const glassDepth  = beamThickness * 0.1;

    const geometry = useMemo(
        () => new THREE.BoxGeometry(glassWidth, glassHeight, glassDepth),
        [glassWidth, glassHeight, glassDepth],
    );

    useEffect(() => {
        if (!meshRef.current || !isSelected) {
            if (outlineRef.current) {
                outlineRef.current.parent?.remove(outlineRef.current);
                outlineRef.current.geometry.dispose();
                (outlineRef.current.material as THREE.Material).dispose();
                outlineRef.current = null;
            }
            return;
        }

        const edges   = new THREE.EdgesGeometry(geometry);
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
    }, [isSelected, geometry]);

    return (
        <mesh
            ref={meshRef}
            name="Скло"
            geometry={geometry}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            <meshStandardMaterial
                color={0xccccff}
                metalness={0.1}
                roughness={0.1}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}