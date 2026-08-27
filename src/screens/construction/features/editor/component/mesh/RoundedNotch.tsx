import * as THREE from 'three';
import { useMemo } from 'react';

interface RoundedNotchProps {
    pos: [number, number, number];
    size: [number, number, number];
}

export function RoundedNotch({ pos, size }: RoundedNotchProps) {
    const geo = useMemo(() => {
        const [w, h, d] = size;
        const radius    = Math.min(w, h) * 0.4;
        const shape     = new THREE.Shape();

        shape.moveTo(-w / 2 + radius, -h / 2);
        shape.lineTo( w / 2 - radius, -h / 2);
        shape.quadraticCurveTo( w / 2, -h / 2,  w / 2, -h / 2 + radius);
        shape.lineTo( w / 2,  h / 2 - radius);
        shape.quadraticCurveTo( w / 2,  h / 2,  w / 2 - radius,  h / 2);
        shape.lineTo(-w / 2 + radius,  h / 2);
        shape.quadraticCurveTo(-w / 2,  h / 2, -w / 2,  h / 2 - radius);
        shape.lineTo(-w / 2, -h / 2 + radius);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);

        const g = new THREE.ExtrudeGeometry(shape, {
            depth: d,
            bevelEnabled:    true,
            bevelThickness:  d * 0.05,
            bevelSize:       Math.min(w, h) * 0.01,
            bevelSegments:   3,
            curveSegments:   12,
        });
        g.translate(0, 0, -d);
        return g;
    }, [size]);

    return (
        <mesh position={pos} geometry={geo} userData={{ isNotch: true }} renderOrder={1}>
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