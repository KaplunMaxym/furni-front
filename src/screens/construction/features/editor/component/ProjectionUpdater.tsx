import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { projectionRef } from '../utils/projectionRef';

export function ProjectionUpdater() {
    const { camera, size } = useThree();

    useFrame(() => {
        projectionRef.current = {
            project: (x: number, y: number, z = 0) => {
                const v = new THREE.Vector3(x, y, z).project(camera);
                return {
                    x: (v.x  * 0.5 + 0.5) * size.width,
                    y: (-v.y * 0.5 + 0.5) * size.height,
                };
            },
            size: { width: size.width, height: size.height },
        };
    });

    return null;
}