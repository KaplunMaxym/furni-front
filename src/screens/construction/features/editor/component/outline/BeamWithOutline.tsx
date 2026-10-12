import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { BlindHole } from '../mesh/BlindHole';

interface BeamWithOutlineProps {
    name: string;
    geometry: THREE.BufferGeometry;
    position: [number, number, number];
    color: number;
    metalness?: number;
    roughness?: number;
    isSelected: boolean;
    onClick: () => void;
    holePositions?: Array<[number, number]>;
    holeRadius?: number;
    beamDepth?: number;
    holeBlindDepth?: number;
}

export function BeamWithOutline({name, geometry, position, color, metalness = 0.85, roughness = 0.35, isSelected, onClick, holePositions, holeRadius, beamDepth, holeBlindDepth}: BeamWithOutlineProps) {
    const meshRef    = useRef<THREE.Mesh>(null);
    const outlineRef = useRef<THREE.LineSegments | null>(null);

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

        const edges   = new THREE.EdgesGeometry(geometry, 25);
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
        <group position={position}>
            <mesh
                ref={meshRef}
                name={name}
                geometry={geometry}
                castShadow
                receiveShadow
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} envMapIntensity={0.9} />
            </mesh>

            {holePositions && holeRadius && beamDepth && holeBlindDepth &&
                holePositions.map(([x, y], i) => (
                    <BlindHole
                        key={i}
                        x={x}
                        y={y}
                        radius={holeRadius}
                        depth={holeBlindDepth}
                        beamDepth={beamDepth}
                    />
                ))
            }
        </group>
    );
}