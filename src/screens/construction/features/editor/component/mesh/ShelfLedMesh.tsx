import * as THREE from 'three';
import { useMemo } from 'react';

interface ShelfLedMeshProps {
    frameWidth: number;
    frameHeight: number;
    beamThickness: number;
}

/**
 * Світлодіодна канавка в передньому профілі полиці RD-NM064.
 *
 * Координати локальні для площини рамки (до повороту полиці в горизонталь):
 * передня рамка — нижній слот, її зовнішня лицьова площина лежить на y = -hh.
 * Після повороту групи локальний -Y стає напрямком «на глядача», тож канавка
 * дивиться назовні — так само, як на профілі: паз проточений по видимій грані,
 * а не з нижнього боку.
 */
export function ShelfLedMesh({ frameWidth, frameHeight, beamThickness }: ShelfLedMeshProps) {
    const bt      = beamThickness;
    const faceY   = -frameHeight / 2;          // зовнішня площина переднього профілю
    const ledLen  = frameWidth - bt * 1.2;

    // Темне дно паза — трохи ширше за стрічку, щоб читалась проточка, а не наліпка.
    const channelGeometry = useMemo(
        () => new THREE.BoxGeometry(ledLen + bt * 0.3, bt * 0.06, bt * 0.44),
        [ledLen, bt],
    );

    // Сама стрічка — світиться, стоїть у пазу.
    const stripGeometry = useMemo(
        () => new THREE.BoxGeometry(ledLen, bt * 0.07, bt * 0.28),
        [ledLen, bt],
    );

    // Гало назовні від канавки, щоб було видно світло, а не просто яскраву смугу.
    const haloGeometry = useMemo(
        () => new THREE.PlaneGeometry(ledLen + bt * 0.8, bt * 1.1),
        [ledLen, bt],
    );

    return (
        <group userData={{ isNotch: true }}>
            <mesh
                geometry={channelGeometry}
                position={[0, faceY + bt * 0.05, 0]}
                userData={{ isNotch: true }}
            >
                <meshStandardMaterial color={0x2a2a2e} roughness={0.85} metalness={0.2} />
            </mesh>

            <mesh
                name="Підсвітка"
                geometry={stripGeometry}
                position={[0, faceY + bt * 0.01, 0]}
                userData={{ isNotch: true }}
            >
                <meshStandardMaterial
                    color={0xfff4d6}
                    emissive={0xffe9b0}
                    emissiveIntensity={2.4}
                    roughness={0.4}
                    metalness={0}
                    toneMapped={false}
                />
            </mesh>

            <mesh
                geometry={haloGeometry}
                position={[0, faceY - bt * 0.04, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                userData={{ isNotch: true }}
            >
                <meshBasicMaterial
                    color={0xffe9b0}
                    transparent
                    opacity={0.18}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}
