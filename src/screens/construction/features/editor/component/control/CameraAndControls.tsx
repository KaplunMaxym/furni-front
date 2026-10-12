import * as THREE from 'three';
import React, {useRef, useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';

interface CameraAndControlsProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
    /** Полиця лежить горизонтально — дивимось на неї згори збоку. */
    isShelf?: boolean;
    /**
     * Дивитись на виріб із тилу.
     *
     * Потрібно для перегляду дилером: спереду фасад — це рівна площина скла,
     * по якій нічого не зрозуміло, а ззаду видно раму, петлі й те, як виріб
     * насправді складено.
     */
    fromBack?: boolean;
}

export function CameraAndControls({frameWidth, frameHeight, beamThickness, isShelf, fromBack}: CameraAndControlsProps) {
    const {camera} = useThree<{ camera: THREE.PerspectiveCamera }>();
    const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

    useEffect(() => {
        const maxDim = Math.max(frameWidth, frameHeight, beamThickness);
        const fov = camera.fov * (Math.PI / 180);
        const dist = (maxDim / (2 * Math.tan(fov / 2))) * 2.2;

        // Знак по Z і є «спереду чи ззаду»: камера просто переходить
        // на протилежний бік від тієї самої точки погляду
        const side = fromBack ? -1 : 1;

        // Полицю видно тільки під кутом: строго спереду вона вироджується в лінію.
        if (isShelf) camera.position.set(0, dist * 0.55, dist * 0.8 * side);
        else         camera.position.set(0, 0, dist * side);
        camera.near = dist / 100;
        camera.far = dist * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);

        if (orbitRef.current) {
            orbitRef.current.target.set(0, 0, 0);
            orbitRef.current.update();
        }
    }, [frameWidth, frameHeight, beamThickness, isShelf, fromBack, camera]);

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