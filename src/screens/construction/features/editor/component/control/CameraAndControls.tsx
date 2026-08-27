import * as THREE from 'three';
import React, {useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';

interface CameraAndControlsProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
}

export function CameraAndControls({frameWidth, frameHeight, beamThickness}: CameraAndControlsProps) {
    const {camera} = useThree<{ camera: THREE.PerspectiveCamera }>();
    const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

    useEffect(() => {
        const maxDim = Math.max(frameWidth, frameHeight, beamThickness);
        const fov = camera.fov * (Math.PI / 180);
        const dist = (maxDim / (2 * Math.tan(fov / 2))) * 2.2;

        camera.position.set(0, 0, dist);
        camera.near = dist / 100;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);

        if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, 0);
            orbitRef.current.update();
        }
    }, [frameWidth, frameHeight, beamThickness, camera]);

    return (
        <OrbitControls
            ref={orbitRef}
            zoomToCursor
            enablePan
            panSpeed={1.2}
            zoomSpeed={1.2}
            minDistance={beamThickness * 0.5}
            maxDistance={Math.max(frameWidth, frameHeight) * 5}
            mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
            }}
        />
    );
}