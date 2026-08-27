import * as THREE from 'three';
import { useMemo } from 'react';

interface BlindHoleProps {
    x: number;
    y: number;
    radius: number;
    depth: number;
    beamDepth: number;
}

export function BlindHole({ x, y, radius, depth, beamDepth }: BlindHoleProps) {
    const geo = useMemo(
        () => new THREE.CylinderGeometry(radius, radius, depth, 24, 1, false),
        [radius, depth],
    );

    const posZ = beamDepth / 2 - depth / 2;

    return (
        <mesh
            geometry={geo}
            position={[x, y, posZ]}
            rotation={[Math.PI / 2, 0, 0]}
            userData={{ isNotch: true }}
            renderOrder={1}
        >
            <meshStandardMaterial
                color={0x111827}
                metalness={0.1}
                roughness={0.9}
                depthWrite={true}
                polygonOffset={true}
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
            />
        </mesh>
    );
}