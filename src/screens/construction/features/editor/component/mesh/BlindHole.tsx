import * as THREE from 'three';
import { useMemo } from 'react';

interface BlindHoleProps {
    x: number;
    y: number;
    radius: number;
    depth: number;
    beamDepth: number;
}

/** Метал кріплення — світліший за профіль, щоб головка читалась на будь-якому кольорі. */
const BOLT_COLOR = 0xb8bcc4;
/** Стінки гнізда й шестигранник — майже чорні, це тінь усередині отвору. */
const SOCKET_COLOR = 0x14161a;

/**
 * Отвір під кріплення — з болтом, а не чорна крапка.
 *
 * Раніше це був один темний циліндр урівень із поверхнею: на моделі він
 * читався як пляма бруду, а не як місце під гвинт. Головне — за плямою не
 * було видно ні того, що отвір глухий, ні з якого боку в нього закручують.
 *
 * Тепер це три частини, як у справжнього кріплення:
 *   1. гніздо — темний циліндр, утоплений у балку;
 *   2. головка — металевий диск трохи нижче поверхні, тобто впотай;
 *   3. шестигранник — темне заглиблення в головці.
 *
 * `isNotch` стоїть на кожному меші окремо, а не лише на групі: список
 * деталей обходить дітей балки через `child.userData.isNotch`, і болти
 * інакше приїхали б у нього трьома «деталями» на кожен отвір.
 */
export function BlindHole({ x, y, radius, depth, beamDepth }: BlindHoleProps) {
    const { socketGeo, headGeo, hexGeo } = useMemo(() => {
        /*
         * Головка трохи вужча за отвір і сидить на 15% глибини нижче краю:
         * так між нею і стінкою лишається темний обідок, який і читається
         * як «болт у заглибленні», а не наліпка на поверхні.
         */
        const headRadius = radius * 0.86;
        const headHeight = Math.min(depth * 0.35, radius * 0.7);

        return {
            socketGeo: new THREE.CylinderGeometry(radius, radius * 0.9, depth, 24, 1, false),
            headGeo: new THREE.CylinderGeometry(headRadius, headRadius, headHeight, 24, 1, false),
            hexGeo: new THREE.CylinderGeometry(
                headRadius * 0.5, headRadius * 0.5, headHeight * 0.7, 6, 1, false,
            ),
        };
    }, [radius, depth]);

    const headHeight = Math.min(depth * 0.35, radius * 0.7);

    // Центр гнізда — від поверхні балки вглиб на половину глибини
    const socketZ = beamDepth / 2 - depth / 2;
    // Головка втоплена від краю на 15% глибини отвору
    const headZ = beamDepth / 2 - depth * 0.15 - headHeight / 2;
    // Шестигранник — у верхній третині головки
    const hexZ = headZ + headHeight * 0.2;

    return (
        <group userData={{ isNotch: true }}>
            <mesh
                geometry={socketGeo}
                position={[x, y, socketZ]}
                rotation={[Math.PI / 2, 0, 0]}
                userData={{ isNotch: true }}
                renderOrder={1}
            >
                <meshStandardMaterial
                    color={SOCKET_COLOR}
                    metalness={0.2}
                    roughness={0.95}
                    depthWrite
                    polygonOffset
                    polygonOffsetFactor={-2}
                    polygonOffsetUnits={-2}
                />
            </mesh>

            <mesh
                geometry={headGeo}
                position={[x, y, headZ]}
                rotation={[Math.PI / 2, 0, 0]}
                userData={{ isNotch: true }}
                renderOrder={2}
            >
                {/* Високий `metalness` і низька шорсткість — щоб головка блищала */}
                <meshStandardMaterial
                    color={BOLT_COLOR}
                    metalness={0.9}
                    roughness={0.28}
                    envMapIntensity={1.1}
                    polygonOffset
                    polygonOffsetFactor={-4}
                    polygonOffsetUnits={-4}
                />
            </mesh>

            <mesh
                geometry={hexGeo}
                position={[x, y, hexZ]}
                rotation={[Math.PI / 2, 0, 0]}
                userData={{ isNotch: true }}
                renderOrder={3}
            >
                <meshStandardMaterial
                    color={SOCKET_COLOR}
                    metalness={0.4}
                    roughness={0.85}
                    polygonOffset
                    polygonOffsetFactor={-6}
                    polygonOffsetUnits={-6}
                />
            </mesh>
        </group>
    );
}
