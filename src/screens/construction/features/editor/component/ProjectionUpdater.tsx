import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { projectionRef } from '../utils/projectionRef';

interface ProjectionUpdaterProps {
    rotation?: [number, number, number];
}

export function ProjectionUpdater({ rotation }: ProjectionUpdaterProps = {}) {
    const { camera, size } = useThree();

    useFrame(() => {
        projectionRef.current = {
            project: (x: number, y: number, z = 0) => {
                const v = new THREE.Vector3(x, y, z);
                if (rotation) v.applyEuler(new THREE.Euler(...rotation));
                v.project(camera);
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