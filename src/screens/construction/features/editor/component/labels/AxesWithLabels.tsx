import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface AxesWithLabelsProps {
    size?: number;
}

const AXIS_LABELS = [
    { dir: new THREE.Vector3(1, 0, 0), color: '#ff0000', pos: [1.1, 0, 0] as [number, number, number], label: 'X' },
    { dir: new THREE.Vector3(0, 1, 0), color: '#00ff00', pos: [0, 1.1, 0] as [number, number, number], label: 'Y' },
    { dir: new THREE.Vector3(0, 0, 1), color: '#0000ff', pos: [0, 0, 1.1] as [number, number, number], label: 'Z' },
];

export function AxesWithLabels({ size = 100 }: AxesWithLabelsProps) {
    return (
        <group>
            {AXIS_LABELS.map(({ dir, color, pos, label }) => (
                <group key={label}>
                    <arrowHelper
                        args={[dir, new THREE.Vector3(0, 0, 0), size, parseInt(color.replace('#', '0x')), size * 0.2, size * 0.1]}
                    />
                    <Html position={pos.map(v => v * size) as [number, number, number]} center>
                        <div style={{
                            color,
                            fontSize: '24px',
                            fontWeight: 'bold',
                            fontFamily: 'Arial',
                            userSelect: 'none',
                            pointerEvents: 'none',
                        }}>
                            {label}
                        </div>
                    </Html>
                </group>
            ))}
        </group>
    );
}