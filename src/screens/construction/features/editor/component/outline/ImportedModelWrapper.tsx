import * as THREE from 'three';
import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { BEAM_NAMES } from '@/screens/construction/constants/beamConstants';
import { SelectiveOutlines } from './SelectiveOutlines';
import {ModelDimensions} from "@/screens/construction/type/editor/Canvas3DAdvanced";

interface ImportedModelWrapperProps {
    model: THREE.Group | null;
    originalDimensions: ModelDimensions | null;
    targetWidth: number;
    targetHeight: number;
    targetDepth: number;
    selectedPart: string | null;
    onPartClick: (partName: string) => void;
}

export function ImportedModelWrapper({model, originalDimensions, targetWidth, targetHeight, targetDepth, selectedPart, onPartClick}: ImportedModelWrapperProps) {
    const processedModel = useMemo(() => {
        if (!model || !originalDimensions) return null;

        const cloned = model.clone(true);

        const scaleX = targetWidth  / originalDimensions.width;
        const scaleY = targetHeight / originalDimensions.height;
        const scaleZ = targetDepth  / originalDimensions.depth;

        const initialPositions: Record<string, THREE.Vector3> = {};
        cloned.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                initialPositions[child.name] = child.position.clone();
            }
        });

        type BeamInfo = {
            bbox: THREE.Box3;
            center: THREE.Vector3;
            size: THREE.Vector3;
            mesh: THREE.Mesh;
            initialPos: THREE.Vector3;
        };
        const beamsInfo: Record<string, BeamInfo> = {};

        cloned.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const mesh = child as THREE.Mesh;

            if (!mesh.userData.originalGeometry) {
                mesh.userData.originalGeometry = mesh.geometry.clone();
            }
            mesh.geometry.dispose();
            mesh.geometry = mesh.userData.originalGeometry.clone();

            const geometry = mesh.geometry as THREE.BufferGeometry;
            const position = geometry.attributes.position as THREE.BufferAttribute;

            geometry.computeBoundingBox();
            const bbox    = geometry.boundingBox!;
            const geoWidth  = bbox.max.x - bbox.min.x;
            const geoHeight = bbox.max.y - bbox.min.y;
            const holeZoneX = geoWidth  * 0.25;
            const holeZoneY = geoHeight * 0.25;

            for (let i = 0; i < position.count; i++) {
                let x = position.getX(i);
                let y = position.getY(i);
                let z = position.getZ(i);

                if (mesh.name === BEAM_NAMES.TOP || mesh.name === BEAM_NAMES.BOTTOM) {
                    const isLeftZone  = (x - bbox.min.x) < holeZoneX;
                    const isRightZone = (bbox.max.x - x) < holeZoneX;
                    if (isLeftZone)       x = bbox.min.x * scaleX + (x - bbox.min.x);
                    else if (isRightZone) x = bbox.max.x * scaleX - (bbox.max.x - x);
                    else                  x *= scaleX;
                    z *= scaleZ;
                }

                if (mesh.name === BEAM_NAMES.LEFT || mesh.name === BEAM_NAMES.RIGHT) {
                    const isTopZone    = (bbox.max.y - y) < holeZoneY;
                    const isBottomZone = (y - bbox.min.y) < holeZoneY;
                    if (isTopZone)       y = bbox.max.y * scaleY - (bbox.max.y - y);
                    else if (isBottomZone) y = bbox.min.y * scaleY + (y - bbox.min.y);
                    else                 y *= scaleY;
                    z *= scaleZ;
                }

                position.setXYZ(i, x, y, z);
            }

            position.needsUpdate = true;
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();

            const newBbox  = geometry.boundingBox!.clone();
            const center   = new THREE.Vector3();
            const size     = new THREE.Vector3();
            newBbox.getCenter(center);
            newBbox.getSize(size);

            beamsInfo[mesh.name] = {
                bbox: newBbox, center, size, mesh,
                initialPos: initialPositions[mesh.name],
            };
        });

        cloned.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const mesh = child as THREE.Mesh;
            const info = beamsInfo[mesh.name];
            if (!info) return;

            const { center: { x: gcX, y: gcY, z: gcZ }, size, initialPos } = info;
            const beamW = size.x;
            const beamH = size.y;

            let newPosX = 0, newPosY = 0, newPosZ = 0;

            if (mesh.name === BEAM_NAMES.LEFT) {
                const delta = (-targetWidth / 2 + beamW / 2) - (-originalDimensions.width / 2 + beamW / 2);
                newPosX = initialPos.x + delta - gcX;
                newPosY = initialPos.y - gcY;
                newPosZ = initialPos.z - gcZ;
            } else if (mesh.name === BEAM_NAMES.RIGHT) {
                const delta = (targetWidth / 2 - beamW / 2) - (originalDimensions.width / 2 - beamW / 2);
                newPosX = initialPos.x + delta - gcX;
                newPosY = initialPos.y - gcY;
                newPosZ = initialPos.z - gcZ;
            } else if (mesh.name === BEAM_NAMES.TOP) {
                const delta = (targetHeight / 2 - beamH / 2) - (originalDimensions.height / 2 - beamH / 2);
                newPosX = initialPos.x - gcX;
                newPosY = initialPos.y + delta - gcY;
                newPosZ = initialPos.z - gcZ;
            } else if (mesh.name === BEAM_NAMES.BOTTOM) {
                const delta = (-targetHeight / 2 + beamH / 2) - (-originalDimensions.height / 2 + beamH / 2);
                newPosX = initialPos.x - gcX;
                newPosY = initialPos.y + delta - gcY;
                newPosZ = initialPos.z - gcZ;
            }

            mesh.position.set(newPosX, newPosY, newPosZ);
        });

        return cloned;
    }, [model, originalDimensions, targetWidth, targetHeight, targetDepth]);

    const handleMeshClick = (event: ThreeEvent<MouseEvent>) => {
        if (event.object instanceof THREE.Mesh) {
            event.stopPropagation();
            onPartClick(event.object.name || 'unknown');
        }
    };

    if (!processedModel) return null;

    return (
        <>
            <group onClick={handleMeshClick}>
                <primitive object={processedModel} />
            </group>
            {selectedPart && (
                <SelectiveOutlines model={processedModel} selectedPartName={selectedPart} />
            )}
        </>
    );
}